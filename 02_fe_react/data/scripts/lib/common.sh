#!/usr/bin/env bash

# 공통 설정(경로/로그/락/환경변수)과 Discord 웹훅 유틸.
init_runtime() {
  local script_dir="$1"

  MARKET_TZ="${MARKET_TZ:-America/New_York}"
  MARKET_TZ_LABEL="${MARKET_TZ_LABEL:-ET}"
  ROOT_DIR="${ROOT_DIR:-$(cd "${script_dir}/.." && pwd)}"
  FRONT_DIR="${FRONT_DIR:-$(cd "${ROOT_DIR}/.." && pwd)}"
  TICKERS_DIR="${TICKERS_DIR:-${ROOT_DIR}/tickers}"
  OUT_DIR="${OUT_DIR:-${ROOT_DIR}/csv}"
  LOG_DIR="${LOG_DIR:-${ROOT_DIR}/logs}"
  LOCK_FILE="${LOCK_FILE:-${ROOT_DIR}/.pipeline.lock}"
  ENV_FILE="${ENV_FILE:-${FRONT_DIR}/.env}"
  MAX_JOBS="${MAX_JOBS:-6}"
  RUN_ID="$(TZ="${MARKET_TZ}" date '+%Y%m%d-%H%M%S')-$$"
  WEBHOOK_ENABLED=0
  LAST_PROGRESS_TS=""

  export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"
}

log() {
  printf "[%s %s] %s\n" "$(TZ="${MARKET_TZ}" date '+%Y/%m/%d %H:%M:%S')" "${MARKET_TZ_LABEL}" "$*"
}

send_webhook() {
  local message="$1"
  if [[ "${WEBHOOK_ENABLED}" -ne 1 ]]; then
    return 0
  fi
  local webhook_url="${DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL:-}"
  if [[ -z "${webhook_url}" ]]; then
    return 0
  fi
  # Discord 관리자 알림에서는 내부 RUN_ID(YYYYMMDD-...) 접두어를 숨긴다.
  message="$(printf "%s" "${message}" | sed -E 's/^\[[0-9]{8}-[0-9]{6}-[0-9]+\][[:space:]]*//')"
  local stamped
  stamped="[$(TZ="${MARKET_TZ}" date '+%Y/%m/%d %H:%M:%S')] ${message}"
  local payload
  payload="$(jq -n --arg content "${stamped}" '{content: $content}')"
  curl -fsS -H "Content-Type: application/json" -X POST \
    -d "${payload}" "${webhook_url}" >/dev/null 2>&1 || true
}

notify() {
  local message="$1"
  send_webhook "${message}"
}

send_daily_summary_webhook() {
  local message="$1"
  local webhook_url="${DISCORD_ATCHU_DAILY_SUMMARY_WEBHOOK_URL:-}"
  if [[ -z "${webhook_url}" ]]; then
    return 0
  fi
  local payload
  payload="$(jq -n --arg content "${message}" '{content: $content}')"
  curl -fsS -H "Content-Type: application/json" -X POST \
    -d "${payload}" "${webhook_url}" >/dev/null 2>&1 || return 1
}

send_trend_notification_webhook() {
  local message="$1"
  local webhook_url="${DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL:-}"
  if [[ -z "${webhook_url}" ]]; then
    return 0
  fi
  local payload
  payload="$(jq -n --arg content "${message}" '{content: $content}')"
  curl -fsS -H "Content-Type: application/json" -X POST \
    -d "${payload}" "${webhook_url}" >/dev/null 2>&1 || return 1
}

setup_logging() {
  mkdir -p "${LOG_DIR}"
  local market_log_date
  market_log_date="$(TZ="${MARKET_TZ}" date '+%Y-%m-%d')"
  LOG_FILE="${LOG_DIR}/cron_${market_log_date}.log"
  exec > >(tee -a "${LOG_FILE}") 2>&1
  log "Log file: ${LOG_FILE}"
}

acquire_lock() {
  exec 9>"${LOCK_FILE}"
  if ! flock -n 9; then
    log "Another run is already in progress. Skipping this run."
    exit 0
  fi
}

load_env_file() {
  if [[ -f "${ENV_FILE}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
    set +a
  fi
}

enable_webhook_if_configured() {
  if [[ -n "${DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL:-}" ]]; then
    WEBHOOK_ENABLED=1
  fi
}

validate_prerequisites() {
  # 실행 전 필수 값/도구를 확인하고 출력 디렉터리를 준비한다.
  if [[ -z "${EODHD_API_TOKEN:-}" ]]; then
    log "Missing EODHD_API_TOKEN. Check ${ENV_FILE}" >&2
    exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    log "jq is required. Install jq and retry." >&2
    exit 1
  fi

  mkdir -p "${OUT_DIR}"
}
