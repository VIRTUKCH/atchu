#!/usr/bin/env bash

# EODHD CSV 다운로드, 검증, 병렬 처리, 임시 파일 정리.
map_ticker() {
  local raw="$1"
  if [[ "$raw" == *.* ]]; then
    echo "$raw"
  else
    echo "${raw}.US"
  fi
}

process_ticker() {
  local ticker="$1"
  local result_file="$2"
  local symbol out tmp
  symbol="$(map_ticker "$ticker")"
  out="${OUT_DIR}/${symbol}_all.csv"
  tmp="$(mktemp "${TMP_DIR}/.${symbol}.XXXXXX")"

  # === 증분 모드: 파일이 존재하면 최근 10일만 요청 ===
  if [[ -f "$out" ]]; then
    local last_date from_date
    last_date=$(tail -1 "$out" | cut -d, -f1)
    if [[ "$last_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      from_date=$(date -d "${last_date} - 10 days" +%Y-%m-%d 2>/dev/null || true)
    fi

    if [[ -n "${from_date:-}" ]]; then
      local url_incr
      url_incr="https://eodhd.com/api/eod/${symbol}?api_token=${EODHD_API_TOKEN}&fmt=csv&from=${from_date}"
      if curl -fsSL --retry 3 --retry-delay 1 --connect-timeout 10 \
           --compressed --keepalive-time 60 -H "Connection: keep-alive" \
           "$url_incr" -o "$tmp"; then
        if [[ -s "$tmp" ]] && head -n 1 "$tmp" | grep -qi "date"; then
          local new_rows
          new_rows=$(awk -F, -v last="$last_date" 'NR>1 && $1>last' "$tmp")
          rm -f "$tmp"
          if [[ -z "$new_rows" ]]; then
            printf "unchanged\n" >"${result_file}"
          else
            echo "$new_rows" >>"$out"
            log "Incremental: ${symbol} updated"
            printf "updated\n" >"${result_file}"
          fi
          return
        fi
      fi
      log "Warning: ${symbol} incremental failed, falling back to full download" >&2
      rm -f "$tmp"
      tmp="$(mktemp "${TMP_DIR}/.${symbol}.XXXXXX")"
    fi
  fi

  # === 전체 다운로드 모드 (최초 실행 또는 증분 실패 폴백) ===
  local url_full
  url_full="https://eodhd.com/api/eod/${symbol}?api_token=${EODHD_API_TOKEN}&fmt=csv"
  if curl -fsSL --retry 3 --retry-delay 1 --connect-timeout 10 \
       --compressed --keepalive-time 60 -H "Connection: keep-alive" \
       "$url_full" -o "$tmp"; then
    if [[ -s "$tmp" ]] && head -n 1 "$tmp" | grep -qi "date"; then
      if [[ -f "$out" ]] && cmp -s "$tmp" "$out"; then
        rm -f "$tmp"
        printf "unchanged\n" >"${result_file}"
      else
        mv "$tmp" "$out"
        log "Full download: ${symbol} updated"
        printf "updated\n" >"${result_file}"
      fi
    else
      log "Warning: ${symbol} CSV format is invalid. Keeping existing file." >&2
      rm -f "$tmp"
      printf "invalid\n" >"${result_file}"
    fi
  else
    log "Warning: ${symbol} download failed. Keeping existing file." >&2
    rm -f "$tmp"
    printf "failed\n" >"${result_file}"
  fi
}

log_progress_once_per_sec() {
  local now_ts done_count running_count not_started_count updated_so_far unchanged_so_far progress_pct
  now_ts="$(date +%s)"
  if [[ "${now_ts}" == "${LAST_PROGRESS_TS}" ]]; then
    return
  fi
  done_count="$(find "${RESULT_DIR}" -type f -name '*.status' | wc -l)"
  running_count="$(jobs -rp | wc -l)"
  updated_so_far="$(
    (find "${RESULT_DIR}" -type f -name '*.status' -exec grep -l '^updated$' {} + 2>/dev/null || true) | wc -l
  )"
  unchanged_so_far="$(
    (find "${RESULT_DIR}" -type f -name '*.status' -exec grep -l '^unchanged$' {} + 2>/dev/null || true) | wc -l
  )"
  not_started_count=$((total_count - done_count - running_count))
  if [[ "${not_started_count}" -lt 0 ]]; then
    not_started_count=0
  fi
  progress_pct="$(awk -v done="${done_count}" -v total="${total_count}" 'BEGIN { if (total <= 0) print "0.0"; else printf "%.1f", (done/total)*100 }')"
  log "Percent: ${progress_pct}%"
  log "Total: ${total_count} | Finished: ${done_count} | Processing: ${running_count} | Waiting: ${not_started_count}"
  log "Total: ${total_count} | Modified: ${updated_so_far} | NotModified: ${unchanged_so_far}"
  LAST_PROGRESS_TS="${now_ts}"
}

wait_for_slot() {
  while [[ "$(jobs -rp | wc -l)" -ge "${MAX_JOBS}" ]]; do
    log_progress_once_per_sec
    sleep 0.1
  done
}

cleanup() {
  # 비정상 종료 시 백그라운드 작업을 정리하고 임시 디렉터리를 삭제한다.
  local exit_code="$1"
  local cleaned=0
  if [[ "${exit_code}" -ne 0 ]]; then
    log "Interrupt detected: cleaning background jobs and temporary files"
    notify "[${RUN_ID}] FAILED(exit=${exit_code}) - interrupted"
    jobs -pr | xargs -r kill >/dev/null 2>&1 || true
  else
    notify "[${RUN_ID}] FINISHED(exit=0)"
  fi
  if [[ -n "${RESULT_DIR}" && -d "${RESULT_DIR}" ]]; then
    rm -rf "${RESULT_DIR}" || true
    cleaned=1
  fi
  if [[ -n "${TMP_DIR}" && -d "${TMP_DIR}" ]]; then
    rm -rf "${TMP_DIR}" || true
    cleaned=1
  fi
  if [[ "${cleaned}" -eq 1 ]]; then
    log "Temporary files cleaned"
  fi
}

cleanup_orphans() {
  local orphan_cleaned=0
  shopt -s nullglob
  local d
  for d in "${OUT_DIR}"/.result.* "${OUT_DIR}"/.tmp.*; do
    if [[ -d "${d}" ]]; then
      rm -rf "${d}" || true
      orphan_cleaned=1
    fi
  done
  shopt -u nullglob
  if [[ "${orphan_cleaned}" -eq 1 ]]; then
    log "Orphan temp directories from previous runs cleaned"
  fi
}
