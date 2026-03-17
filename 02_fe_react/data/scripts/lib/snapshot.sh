#!/usr/bin/env bash

# 다운로드 결과 집계, node/npm 경로 탐색, 스냅샷 JSON 생성.
summarize_updates() {
  updated_count="$(
    find "${RESULT_DIR}" -type f -name '*.status' -exec cat {} + 2>/dev/null \
      | awk '$0=="updated"{c++} END{print c+0}'
  )"
  updated_tickers="$(
    (find "${RESULT_DIR}" -type f -name '*.status' -exec grep -l '^updated$' {} + 2>/dev/null || true) \
      | sed 's#.*/##; s#\.status$##' \
      | sort \
      | paste -sd', ' -
  )"
  if [[ "${updated_count}" -gt 0 ]]; then
    changed_any=1
  fi
}

resolve_node_cmd() {
  node_cmd="$(command -v node || true)"
  if [[ -z "${node_cmd}" && -f "${HOME}/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "${HOME}/.nvm/nvm.sh"
    node_cmd="$(command -v node || true)"
  fi
  if [[ -z "${node_cmd}" ]]; then
    log "Error: node not found. Check PATH or nvm setup." >&2
    exit 1
  fi
}

resolve_npm_cmd() {
  npm_cmd="$(command -v npm || true)"
  if [[ -z "${npm_cmd}" && -f "${HOME}/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "${HOME}/.nvm/nvm.sh"
    npm_cmd="$(command -v npm || true)"
  fi
  if [[ -z "${npm_cmd}" ]]; then
    log "Error: npm not found. Check PATH or nvm setup." >&2
    exit 1
  fi
}

run_landing_data_generation() {
  resolve_node_cmd
  log "Generating landing data JSON: data/scripts/generate_landing_data.mjs"
  notify "[${RUN_ID}] LANDING DATA START"
  if "${node_cmd}" "${ROOT_DIR}/scripts/generate_landing_data.mjs"; then
    log "Landing data JSON generation completed"
    notify "[${RUN_ID}] LANDING DATA DONE"
  else
    log "Error: landing data JSON generation failed"
    notify "[${RUN_ID}] LANDING DATA FAIL"
    return 1
  fi
}

run_snapshot_generation() {
  resolve_node_cmd
  log "Generating snapshot JSON: data/scripts/generate_summary_snapshot.mjs"
  notify "[${RUN_ID}] SNAPSHOT START"
  if "${node_cmd}" "${ROOT_DIR}/scripts/generate_summary_snapshot.mjs"; then
    log "Snapshot JSON generation completed"
    local market_date snapshot_dir windows
    market_date="$(TZ="${MARKET_TZ:-America/New_York}" date '+%Y-%m-%d')"
    snapshot_dir="${ROOT_DIR}/summary/snapshot"
    windows="1d"
    if [[ -f "${snapshot_dir}/${market_date}_weekly_summary_snapshots.json" ]]; then
      windows="${windows},1w"
    fi
    if [[ -f "${snapshot_dir}/${market_date}_monthly_summary_snapshots.json" ]]; then
      windows="${windows},1m"
    fi
    if [[ -f "${snapshot_dir}/${market_date}_3m_summary_snapshots.json" ]]; then
      windows="${windows},3m"
    fi
    if [[ -f "${snapshot_dir}/${market_date}_1y_summary_snapshots.json" ]]; then
      windows="${windows},1y"
    fi
    if [[ -f "${snapshot_dir}/${market_date}_5y_summary_snapshots.json" ]]; then
      windows="${windows},5y"
    fi
    log "Snapshot files generated: date=${market_date}, windows=${windows}"
    notify "[${RUN_ID}] SNAPSHOT FILES | date=${market_date} | windows=${windows}"
    notify "[${RUN_ID}] SNAPSHOT DONE"
  else
    log "Error: snapshot JSON generation failed"
    notify "[${RUN_ID}] SNAPSHOT FAIL"
    return 1
  fi
}
