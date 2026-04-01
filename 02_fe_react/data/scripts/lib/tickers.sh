#!/usr/bin/env bash

# 티커 JSON 소스들을 읽어 중복 없는 티커 배열을 만든다.
# 소스: data/tickers/*.json (공개 ETF)
#       data/tickers/private/*.json (비공개 — 레버리지·인버스 ETF)
#       data/tickers_quant/*.json (퀀트 전략 풀)
read_tickers() {
  ticker_sources=()
  shopt -s nullglob
  if [[ -d "${TICKERS_DIR}" ]]; then
    ticker_sources+=("${TICKERS_DIR}"/*.json)
    # 비공개 레버리지·인버스 ETF (leverage.json, inverse.json, stock_leverage.json, stock_inverse.json)
    local private_dir="${TICKERS_DIR}/private"
    if [[ -d "${private_dir}" ]]; then
      ticker_sources+=("${private_dir}"/*.json)
    fi
  fi
  if [[ -d "${TICKERS_QUANT_DIR}" ]]; then
    ticker_sources+=("${TICKERS_QUANT_DIR}"/*.json)
  fi
  shopt -u nullglob

  if [[ "${#ticker_sources[@]}" -eq 0 ]]; then
    log "Ticker source not found. (${TICKERS_DIR}/*.json)" >&2
    exit 1
  fi

  log "Ticker source files: ${ticker_sources[*]}"
  mapfile -t tickers < <(
    jq -r '
      if type == "array" then
        .[]? | .ticker // empty
      elif type == "object" and (.items | type == "array") then
        .items[]? | .ticker // empty
      else
        empty
      end
    ' "${ticker_sources[@]}" \
      | sort -u \
      | sed '/^null$/d;/^$/d'
  )
}
