#!/usr/bin/env bash
set -euo pipefail

# 개별주(S&P 500) 파이프라인 — pipeline.sh에서 호출됨.
# 단독 실행도 가능: bash pipeline_stock.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 개별주 전용 경로 설정 (init_runtime 전에 export)
export TICKERS_DIR="${SCRIPT_DIR}/../tickers_stock"
export OUT_DIR="${SCRIPT_DIR}/../csv_stock"
export LOCK_FILE="${SCRIPT_DIR}/../.pipeline_stock.lock"

# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/common.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/tickers.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/download.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/lib/snapshot.sh"

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
log "[개별주] Target tickers: ${total_count}"
notify "[${RUN_ID}] [개별주] START | total=${total_count} | max_jobs=${MAX_JOBS}"

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
log "[개별주] Download/compare complete"

summarize_updates
log "[개별주] Summary: processed=${total_count}, updated=${updated_count}"
notify "[${RUN_ID}] [개별주] SUMMARY | total=${total_count} | updated=${updated_count}"
if [[ "${updated_count}" -gt 0 ]]; then
  log "[개별주] Updated tickers: ${updated_tickers}"
fi

# 스냅샷 생성
run_stock_snapshot_generation() {
  resolve_node_cmd
  log "[개별주] Generating stock snapshot JSON"
  notify "[${RUN_ID}] [개별주] SNAPSHOT START"
  if "${node_cmd}" "${ROOT_DIR}/scripts/generate_stock_snapshot.mjs"; then
    log "[개별주] Stock snapshot generation completed"
    notify "[${RUN_ID}] [개별주] SNAPSHOT DONE"
  else
    log "[개별주] Error: stock snapshot generation failed"
    notify "[${RUN_ID}] [개별주] SNAPSHOT FAIL"
    return 1
  fi
}

# 추세 알림 파일 생성
generate_stock_trend_notifications_file() {
  resolve_node_cmd

  local result_file
  result_file="$(mktemp "${TMP_DIR:-/tmp}/.stock_trend_notify.XXXXXX.json")"

  ROOT_DIR="${ROOT_DIR}" TICKERS_DIR="${TICKERS_DIR}" CSV_DIR="${OUT_DIR}" "${node_cmd}" > "${result_file}" <<'NODE'
const fs = require("fs");
const path = require("path");

const rootDir = process.env.ROOT_DIR;
const tickersDir = process.env.TICKERS_DIR;
const csvDir = process.env.CSV_DIR;
const rules = [
  {
    key: "200-16/20",
    label: "앗추 필터 (200일)",
    shortLabel: "앗추 필터 (200일)",
    period: 200
  }
];

function readTickerMeta() {
  const files = fs.readdirSync(tickersDir).filter((f) => f.endsWith(".json"));
  const meta = new Map();
  for (const file of files) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(tickersDir, file), "utf8"));
      const items = Array.isArray(json) ? json : (json && Array.isArray(json.items) ? json.items : []);
      for (const row of items) {
        if (row && row.ticker) {
          const t = String(row.ticker).toUpperCase();
          if (!meta.has(t)) {
            meta.set(t, { label: row.name_ko || row.name || row.type || "" });
          }
        }
      }
    } catch (_) {}
  }
  return meta;
}

const tickerMeta = readTickerMeta();

function mapTickerToSymbol(ticker) {
  return ticker.includes(".") ? ticker : `${ticker}.US`;
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  if (lines.length < 3) return null;
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const dateIdx = idx.Date ?? idx.date;
  const closeIdx = idx.Adjusted_close ?? idx.Adj_Close ?? idx.Close ?? idx.close;
  if (dateIdx == null || closeIdx == null) return null;
  const rows = lines.slice(1).map((line) => {
    const p = line.split(",");
    const date = p[dateIdx];
    const close = Number(p[closeIdx]);
    return { date, close: Number.isFinite(close) ? close : null };
  }).filter((r) => r.date && r.close !== null);
  return rows.length >= 220 ? rows : null;
}

function avg(rows, endIdx, period) {
  if (endIdx - period + 1 < 0) return null;
  let sum = 0;
  for (let i = endIdx - period + 1; i <= endIdx; i += 1) {
    const v = rows[i]?.close;
    if (!Number.isFinite(v)) return null;
    sum += v;
  }
  return sum / period;
}

function holdState(rows, endIdx, period) {
  if (endIdx - 19 < 0) return null;
  let valid = 0;
  let above = 0;
  for (let i = endIdx - 19; i <= endIdx; i += 1) {
    const c = rows[i]?.close;
    const m = avg(rows, i, period);
    if (!Number.isFinite(c) || !Number.isFinite(m)) continue;
    valid += 1;
    if (c >= m) above += 1;
  }
  return valid >= 20 ? above >= 16 : null;
}

function cmp(prev, curr) {
  if (prev === null || curr === null || prev === curr) return null;
  return curr ? "up" : "down";
}

const upMap = Object.fromEntries(rules.map((r) => [r.key, new Map()]));
const downMap = Object.fromEntries(rules.map((r) => [r.key, new Map()]));

function stateByRule(rows, idx, rule) {
  return holdState(rows, idx, rule.period);
}

for (const ticker of tickerMeta.keys()) {
  const symbol = mapTickerToSymbol(ticker);
  const rows = parseCsv(path.join(csvDir, `${symbol}_all.csv`));
  if (!rows || rows.length < 221) continue;
  const startIdx = Math.max(1, rows.length - 5);
  for (let i = startIdx; i < rows.length; i += 1) {
    for (const rule of rules) {
      const prevState = stateByRule(rows, i - 1, rule);
      const currState = stateByRule(rows, i, rule);
      const diff = cmp(prevState, currState);
      if (diff === "up") {
        upMap[rule.key].set(ticker, rows[i].date);
      } else if (diff === "down") {
        downMap[rule.key].set(ticker, rows[i].date);
      }
    }
  }
}

function mapToDateEntries(map) {
  if (!map || map.size === 0) return [];
  const dateMap = new Map();
  for (const [ticker, date] of map.entries()) {
    if (!dateMap.has(date)) dateMap.set(date, []);
    dateMap.get(date).push(ticker);
  }
  return Array.from(dateMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, tickers]) => ({
      date,
      tickers: tickers.slice().sort((a, b) => a.localeCompare(b))
    }));
}

function resolveRecentTradingDates() {
  const benchmarkTickers = ["SPY", "QQQ", "AAPL"];
  for (const ticker of benchmarkTickers) {
    const rows = parseCsv(path.join(csvDir, `${mapTickerToSymbol(ticker)}_all.csv`));
    if (rows && rows.length >= 5) {
      return rows.slice(-5).map((row) => row.date);
    }
  }
  return [];
}

const ruleItems = rules.map((rule) => {
  const entries = mapToDateEntries(upMap[rule.key]);
  const exits = mapToDateEntries(downMap[rule.key]);
  return { key: rule.key, label: rule.label, shortLabel: rule.shortLabel, entries, exits };
});

const hasAnyChanges = ruleItems.some((rule) => rule.entries.length > 0 || rule.exits.length > 0);
const events = [];
for (const rule of ruleItems) {
  for (const item of rule.entries) {
    for (const ticker of item.tickers) {
      events.push({ date: item.date, ticker, direction: "up", ruleKey: rule.key, ruleShortLabel: rule.shortLabel });
    }
  }
  for (const item of rule.exits) {
    for (const ticker of item.tickers) {
      events.push({ date: item.date, ticker, direction: "down", ruleKey: rule.key, ruleShortLabel: rule.shortLabel });
    }
  }
}

function tickerDesc(ticker) {
  const m = tickerMeta.get(ticker);
  return m && m.label ? ` (${m.label})` : "";
}

function shortDate(dateStr) {
  const d = new Date(dateStr);
  return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
}

const recentDates = resolveRecentTradingDates();
const discordDates = new Set(recentDates);

const bodyLines = [];
bodyLines.push("# [개별주] 추세 변화 알림 (최근 5거래일)");
if (!hasAnyChanges) {
  bodyLines.push("");
  bodyLines.push("- 변화 없음");
} else {
  const allEntries = [];
  const allExits = [];
  for (const rule of ruleItems) {
    for (const entry of rule.entries) {
      for (const ticker of entry.tickers) {
        allEntries.push({ ticker, date: entry.date });
      }
    }
    for (const exit of rule.exits) {
      for (const ticker of exit.tickers) {
        allExits.push({ ticker, date: exit.date });
      }
    }
  }
  const discordEntries = allEntries.filter(e => discordDates.has(e.date));
  const discordExits = allExits.filter(e => discordDates.has(e.date));
  if (discordEntries.length > 0) {
    bodyLines.push("");
    bodyLines.push("## 추세 진입 감지 (앗추 필터 200일)");
    for (const e of discordEntries.sort((a, b) => b.date.localeCompare(a.date) || a.ticker.localeCompare(b.ticker))) {
      bodyLines.push(`- ${e.ticker}${tickerDesc(e.ticker)} — ${shortDate(e.date)}`);
    }
  }
  if (discordExits.length > 0) {
    bodyLines.push("");
    bodyLines.push("## 추세 이탈 감지 (앗추 필터 200일)");
    for (const e of discordExits.sort((a, b) => b.date.localeCompare(a.date) || a.ticker.localeCompare(b.ticker))) {
      bodyLines.push(`- ${e.ticker}${tickerDesc(e.ticker)} — ${shortDate(e.date)}`);
    }
  }
  if (discordEntries.length === 0 && discordExits.length === 0) {
    bodyLines.push("");
    bodyLines.push("- 최근 5거래일 변화 없음");
  }
}
bodyLines.push("");
bodyLines.push("자세히 보기: https://atchu-fe.vercel.app/_stocks");
bodyLines.push("");
bodyLines.push("※ 참고용 지표이며 투자 조언이 아닙니다.");

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  title: "[개별주] 추세 변화 알림 (최근 5거래일)",
  recentTradingDates: resolveRecentTradingDates(),
  hasAnyChanges,
  rules: ruleItems,
  events: events.sort((a, b) => {
    if (a.date === b.date) return a.ticker.localeCompare(b.ticker);
    return b.date.localeCompare(a.date);
  }),
  markdownBody: bodyLines.join("\n")
};

console.log(JSON.stringify(payload, null, 2));
NODE

  local market_date trend_json_dir trend_json_file trend_json_latest_file
  market_date="$(TZ="${MARKET_TZ:-America/New_York}" date '+%Y-%m-%d')"
  trend_json_dir="${ROOT_DIR}/summary/stock_trend"
  mkdir -p "${trend_json_dir}"
  trend_json_file="${trend_json_dir}/${market_date}_stock_trend_notifications.json"
  trend_json_latest_file="${trend_json_dir}/stock_trend_notifications.json"

  cp -f "${result_file}" "${trend_json_file}"
  cp -f "${result_file}" "${trend_json_latest_file}"

  local has_any_changes report_body
  has_any_changes="$(jq -r '.hasAnyChanges // false' "${result_file}")"
  report_body="$(jq -r '.markdownBody // empty' "${result_file}")"
  rm -f "${result_file}" || true

  log "[개별주] Trend notification files generated: ${trend_json_file}"

  # Discord 개발자 채널: 레버리지·인버스(notify.sh에서 저장) + 개별주 통합 전송
  local etf_admin_json etf_admin_body has_etf_changes combined_body
  etf_admin_json="${ROOT_DIR}/summary/trend/trend_notifications.json"
  etf_admin_body=""
  has_etf_changes="false"
  if [[ -f "${etf_admin_json}" ]]; then
    has_etf_changes="$(jq -r '.hasAdminChanges // false' "${etf_admin_json}")"
    if [[ "${has_etf_changes}" == "true" ]]; then
      # adminMarkdownBody에서 섹션만 추출 (헤더 제거 후 섹션 재조립)
      local raw_etf_body
      raw_etf_body="$(jq -r '.adminMarkdownBody // empty' "${etf_admin_json}")"
      # "## 추세 진입" → "## 레버리지·인버스 추세 진입", "## 추세 이탈" → "## 레버리지·인버스 추세 이탈"
      # 첫 번째 줄(# [관리자] ...) 제거, 섹션 헤더만 rename
      etf_admin_body="$(echo "${raw_etf_body}" | tail -n +2 \
        | sed 's/^## 추세 진입$/## 레버리지·인버스 추세 진입/' \
        | sed 's/^## 추세 이탈$/## 레버리지·인버스 추세 이탈/')"
    fi
  fi

  # 개별주 섹션: "## 추세 진입 감지 ..." → "## 개별주 추세 진입", "## 추세 이탈 감지 ..." → "## 개별주 추세 이탈"
  # 하단 링크·면책문구 제거 후 재구성
  local stock_sections stock_body_raw
  stock_body_raw=""
  if [[ "${has_any_changes}" == "true" && -n "${report_body}" ]]; then
    stock_body_raw="$(echo "${report_body}" \
      | grep -v '^# \[개별주\]' \
      | grep -v '^자세히 보기:' \
      | grep -v '^※' \
      | grep -v '^$' \
      | sed 's/^## 추세 진입 감지.*$/## 개별주 추세 진입/' \
      | sed 's/^## 추세 이탈 감지.*$/## 개별주 추세 이탈/')"
  fi

  # 통합 메시지 조립
  if [[ "${has_etf_changes}" == "true" || "${has_any_changes}" == "true" ]]; then
    combined_body="# [관리자] 추세 변화 알림 (최근 5거래일)"
    if [[ -n "${etf_admin_body}" ]]; then
      combined_body="${combined_body}"$'\n'"${etf_admin_body}"
    fi
    if [[ -n "${stock_body_raw}" ]]; then
      combined_body="${combined_body}"$'\n\n'"${stock_body_raw}"
    fi
    combined_body="${combined_body}"$'\n\n'"자세히 보기: https://atchu-fe.vercel.app/_stocks"$'\n\n'"※ 참고용 지표이며 투자 조언이 아닙니다."

    local chunk line max_len=1800
    chunk=""
    while IFS= read -r line || [[ -n "${line}" ]]; do
      if [[ $(( ${#chunk} + ${#line} + 1 )) -gt ${max_len} && -n "${chunk}" ]]; then
        send_dev_trend_webhook "${chunk}" || true
        chunk="${line}"
      else
        if [[ -z "${chunk}" ]]; then
          chunk="${line}"
        else
          chunk="${chunk}"$'\n'"${line}"
        fi
      fi
    done <<< "${combined_body}"
    if [[ -n "${chunk}" ]]; then
      send_dev_trend_webhook "${chunk}" || true
    fi
    log "[개별주] Combined dev trend notification sent (ETF: ${has_etf_changes}, 개별주: ${has_any_changes})"
  else
    log "[개별주] No trend changes to notify (ETF + 개별주 모두 변화 없음)"
  fi
}

# CSV를 public/csv_stock/에 복사 (정적 에셋용)
copy_csv_to_public() {
  local public_dir="${FRONT_DIR}/public/csv_stock"
  mkdir -p "${public_dir}"
  local count=0
  shopt -s nullglob
  for csv_file in "${OUT_DIR}"/*_all.csv; do
    cp -f "${csv_file}" "${public_dir}/"
    count=$((count + 1))
  done
  shopt -u nullglob
  log "[개별주] Copied ${count} CSV files to public/csv_stock/"
  notify "[${RUN_ID}] [개별주] CSV→PUBLIC | count=${count}"
}

run_stock_snapshot_generation
generate_stock_trend_notifications_file
copy_csv_to_public

log "[개별주] Pipeline complete"
notify "[${RUN_ID}] [개별주] ALL DONE"
