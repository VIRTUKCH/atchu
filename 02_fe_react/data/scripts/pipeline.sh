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
notify "[${RUN_ID}] ALL DONE | 관리자: https://atchu-fe.vercel.app/_dev"
