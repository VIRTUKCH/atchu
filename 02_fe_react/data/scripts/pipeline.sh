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

# BAA 전략 신호 생성
log "Generating BAA signal"
notify "[${RUN_ID}] BAA SIGNAL START"
resolve_node_cmd
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_baa_signal.mjs"; then
  log "BAA signal generation completed"
  notify "[${RUN_ID}] BAA SIGNAL DONE"
else
  log "Warning: BAA signal generation failed, continuing"
  notify "[${RUN_ID}] BAA SIGNAL FAIL (continuing)"
fi

# HAA 전략 신호 생성
log "Generating HAA signal"
notify "[${RUN_ID}] HAA SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_haa_signal.mjs"; then
  log "HAA signal generation completed"
  notify "[${RUN_ID}] HAA SIGNAL DONE"
else
  log "Warning: HAA signal generation failed, continuing"
  notify "[${RUN_ID}] HAA SIGNAL FAIL (continuing)"
fi

# Faber 섹터 모멘텀 전략 신호 생성
log "Generating Faber sector signal"
notify "[${RUN_ID}] FABER SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_faber_signal.mjs"; then
  log "Faber signal generation completed"
  notify "[${RUN_ID}] FABER SIGNAL DONE"
else
  log "Warning: Faber signal generation failed, continuing"
  notify "[${RUN_ID}] FABER SIGNAL FAIL (continuing)"
fi

# All Weather (ALLW) 전략 신호 생성
log "Generating All Weather signal"
notify "[${RUN_ID}] ALLW SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_allw_signal.mjs"; then
  log "All Weather signal generation completed"
  notify "[${RUN_ID}] ALLW SIGNAL DONE"
else
  log "Warning: All Weather signal generation failed, continuing"
  notify "[${RUN_ID}] ALLW SIGNAL FAIL (continuing)"
fi

# QVM 멀티팩터 전략 신호 생성
log "Generating QVM multi-factor signal"
notify "[${RUN_ID}] QVM SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_qvm_signal.mjs"; then
  log "QVM signal generation completed"
  notify "[${RUN_ID}] QVM SIGNAL DONE"
else
  log "Warning: QVM signal generation failed, continuing"
  notify "[${RUN_ID}] QVM SIGNAL FAIL (continuing)"
fi

# QVM DIY (EW + MOM) 전략 신호 생성
log "Generating QVM DIY signal"
notify "[${RUN_ID}] QVM_DIY SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_qvm_diy_signal.mjs"; then
  log "QVM DIY signal generation completed"
  notify "[${RUN_ID}] QVM_DIY SIGNAL DONE"
else
  log "Warning: QVM DIY signal generation failed, continuing"
  notify "[${RUN_ID}] QVM_DIY SIGNAL FAIL (continuing)"
fi

# 트렌드 팔로잉 전략 신호 생성
log "Generating Trend Following signal"
notify "[${RUN_ID}] TREND SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_trend_signal.mjs"; then
  log "Trend Following signal generation completed"
  notify "[${RUN_ID}] TREND SIGNAL DONE"
else
  log "Warning: Trend Following signal generation failed, continuing"
  notify "[${RUN_ID}] TREND SIGNAL FAIL (continuing)"
fi

# 듀얼 모멘텀 4변형 신호 생성
log "Generating Dual Momentum signal"
notify "[${RUN_ID}] DM SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_dm_signal.mjs"; then
  log "Dual Momentum signal generation completed"
  notify "[${RUN_ID}] DM SIGNAL DONE"
else
  log "Warning: Dual Momentum signal generation failed, continuing"
  notify "[${RUN_ID}] DM SIGNAL FAIL (continuing)"
fi

# 경기순환 섹터 로테이션 신호 생성
log "Generating Business Cycle signal"
notify "[${RUN_ID}] BUSINESS_CYCLE SIGNAL START"
if "${node_cmd}" "${ROOT_DIR}/scripts/generate_business_cycle_signal.mjs"; then
  log "Business Cycle signal generation completed"
  notify "[${RUN_ID}] BUSINESS_CYCLE SIGNAL DONE"
else
  log "Warning: Business Cycle signal generation failed, continuing"
  notify "[${RUN_ID}] BUSINESS_CYCLE SIGNAL FAIL (continuing)"
fi

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
