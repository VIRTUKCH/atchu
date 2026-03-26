#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/common.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/tickers.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/download.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/snapshot.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/notify.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/deploy.sh"

init_runtime "${SCRIPT_DIR}"
setup_logging
acquire_lock
load_env_file
enable_webhook_if_configured
validate_prerequisites

changed_any=0
total_count=0
updated_count=0
updated_tickers=""
RESULT_DIR=""
TMP_DIR=""

read_tickers
total_count="${#tickers[@]}"
cleanup_orphans
RESULT_DIR="$(mktemp -d "${OUT_DIR}/.result.XXXXXX")"
TMP_DIR="$(mktemp -d "${OUT_DIR}/.tmp.XXXXXX")"
trap 'cleanup $?' EXIT INT TERM
log "Target tickers: ${total_count}"
notify "[${RUN_ID}] START | total=${total_count} | max_jobs=${MAX_JOBS}"

for ticker in "${tickers[@]}"; do
  wait_for_slot
  process_ticker "${ticker}" "${RESULT_DIR}/${ticker}.status" &
done

while :; do
  done_count="$(find "${RESULT_DIR}" -type f -name '*.status' | wc -l)"
  running_count="$(jobs -rp | wc -l)"
  log_progress_once_per_sec
  if [[ "${done_count}" -ge "${total_count}" && "${running_count}" -eq 0 ]]; then
    break
  fi
  sleep 1
done
log "Download/compare complete: evaluating next steps"

# 환율(USDKRW) CSV 다운로드
log "Downloading USDKRW forex data"
notify "[${RUN_ID}] FOREX DOWNLOAD START"
forex_symbol="KRW.FOREX"
forex_out="${OUT_DIR}/${forex_symbol}_all.csv"
forex_url="https://eodhd.com/api/eod/${forex_symbol}?api_token=${EODHD_API_TOKEN}&fmt=csv"
forex_tmp="$(mktemp "${TMP_DIR}/.${forex_symbol}.XXXXXX")"
if curl -fsSL --retry 3 --retry-delay 1 --connect-timeout 10 "$forex_url" -o "$forex_tmp"; then
  if [[ -s "$forex_tmp" ]] && head -n 1 "$forex_tmp" | grep -qi "date"; then
    if [[ -f "$forex_out" ]] && cmp -s "$forex_tmp" "$forex_out"; then
      rm -f "$forex_tmp"
      log "USDKRW forex data unchanged"
    else
      mv "$forex_tmp" "$forex_out"
      log "USDKRW forex data updated"
    fi
  else
    log "Warning: USDKRW forex CSV invalid"
    rm -f "$forex_tmp"
  fi
else
  log "Warning: USDKRW forex download failed"
  rm -f "$forex_tmp"
fi
notify "[${RUN_ID}] FOREX DOWNLOAD DONE"

summarize_updates
log "Summary: processed=${total_count}, updated=${updated_count}"
notify "[${RUN_ID}] SUMMARY | total=${total_count} | updated=${updated_count}"
if [[ "${updated_count}" -gt 0 ]]; then
  log "Updated tickers: ${updated_tickers}"
  notify "[${RUN_ID}] UPDATED TICKERS | ${updated_tickers}"
fi

snapshot_file="${ROOT_DIR}/summary/snapshot/summary_snapshots.json"
if [[ "${changed_any}" -eq 1 ]]; then
  log "CSV changes detected: running full post-process"
  notify "[${RUN_ID}] POSTPROCESS | mode=full | reason=csv_changed"
else
  log "No CSV changes: running full post-process anyway (forced)"
  notify "[${RUN_ID}] POSTPROCESS | mode=full | reason=forced_no_change"
fi

if [[ ! -f "${snapshot_file}" ]]; then
  log "Snapshot file missing. Rebuilding: ${snapshot_file}"
  notify "[${RUN_ID}] SNAPSHOT REBUILD | reason=missing_snapshot_file"
fi

run_snapshot_generation
run_landing_data_generation
generate_trend_notifications_file

# 퀀트 전략 신호 병렬 생성 (4코어 기준 2그룹)
resolve_node_cmd
log "Generating quant signals (parallel)"
notify "[${RUN_ID}] QUANT SIGNALS START (parallel)"

# 병렬 실행 헬퍼: 실패해도 파이프라인을 중단하지 않는다
run_signal() {
  local name="$1" script="$2"
  if "${node_cmd}" "${ROOT_DIR}/scripts/${script}"; then
    log "${name} signal completed"
  else
    log "Warning: ${name} signal failed, continuing"
  fi
}

# 그룹 A: trend(10초, 가장 무거움) + baa + haa + faber (가벼움)
run_signal "Trend Following" "generate_trend_signal.mjs" &
run_signal "BAA"             "generate_baa_signal.mjs" &
run_signal "HAA"             "generate_haa_signal.mjs" &
run_signal "Faber"           "generate_faber_signal.mjs" &
wait

# 그룹 B: allw + qvm + qvm_diy + dm + business_cycle (모두 가벼움)
run_signal "All Weather"     "generate_allw_signal.mjs" &
run_signal "QVM"             "generate_qvm_signal.mjs" &
run_signal "QVM DIY"         "generate_qvm_diy_signal.mjs" &
run_signal "Dual Momentum"   "generate_dm_signal.mjs" &
run_signal "Business Cycle"  "generate_business_cycle_signal.mjs" &
wait

log "All quant signals completed"
notify "[${RUN_ID}] QUANT SIGNALS DONE"

# 개별주(S&P 500) 파이프라인 실행
log "Starting stock pipeline"
notify "[${RUN_ID}] STOCK PIPELINE START"
if bash "${SCRIPT_DIR}/pipeline_stock.sh"; then
  log "Stock pipeline completed"
  notify "[${RUN_ID}] STOCK PIPELINE DONE"
else
  log "Warning: Stock pipeline failed, continuing with build"
  notify "[${RUN_ID}] STOCK PIPELINE FAIL (continuing)"
fi

run_front_build
deploy_to_vercel
send_all_notifications
notify "[${RUN_ID}] ALL DONE | 관리자: https://atchu-fe.vercel.app/_dev | 개별주: https://atchu-fe.vercel.app/_stocks"
