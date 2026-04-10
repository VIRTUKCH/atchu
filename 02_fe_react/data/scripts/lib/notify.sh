#!/usr/bin/env bash

# 추세 변화 감지 및 파일 생성 (빌드 전 실행).
generate_trend_notifications_file() {
  resolve_node_cmd

  local result_file
  result_file="$(mktemp "${TMP_DIR:-/tmp}/.trend_notify.XXXXXX.json")"

  ROOT_DIR="${ROOT_DIR}" TICKERS_DIR="${TICKERS_DIR}" "${node_cmd}" > "${result_file}" <<'NODE'
const fs = require("fs");
const path = require("path");

const rootDir = process.env.ROOT_DIR;
const tickersDir = process.env.TICKERS_DIR;
const csvDir = path.join(rootDir, "csv");
const rules = [
  {
    key: "200-16/20",
    label: "앗추 필터 (200일)",
    shortLabel: "앗추 필터 (200일)",
    period: 200
  }
];

function readTickerMeta(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const meta = new Map();
  for (const file of files) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      const items = Array.isArray(json) ? json : (json && Array.isArray(json.items) ? json.items : []);
      for (const row of items) {
        if (row && row.ticker) {
          const t = String(row.ticker).toUpperCase();
          if (!meta.has(t)) {
            meta.set(t, { label: row.name_ko || row.type || row.asset_type || "" });
          }
        }
      }
    } catch (_) {}
  }
  return meta;
}

// 공개 티커 (레버리지·인버스 제외)
const tickerMeta = readTickerMeta(tickersDir);
// 관리자 전용 티커 (레버리지·인버스 — private 디렉터리)
const privateTickersDir = path.join(tickersDir, "private");
const adminTickerMeta = fs.existsSync(privateTickersDir) ? readTickerMeta(privateTickersDir) : new Map();
// 처리 루프용: 공개 + 관리자 전체
const allTickerMeta = new Map([...tickerMeta, ...adminTickerMeta]);

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
    return {
      date,
      close: Number.isFinite(close) ? close : null
    };
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

for (const ticker of allTickerMeta.keys()) {
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
  const benchmarkTickers = ["SPY", "QQQ", "DIA"];
  for (const ticker of benchmarkTickers) {
    const rows = parseCsv(path.join(csvDir, `${mapTickerToSymbol(ticker)}_all.csv`));
    if (rows && rows.length >= 5) {
      return rows.slice(-5).map((row) => row.date);
    }
  }
  return [];
}

// 공개/관리자 분리 헬퍼
function filterByMeta(dateEntries, meta) {
  return dateEntries
    .map((e) => ({ ...e, tickers: e.tickers.filter((t) => meta.has(t)) }))
    .filter((e) => e.tickers.length > 0);
}

const ruleItems = rules.map((rule) => {
  const allDateEntries = mapToDateEntries(upMap[rule.key]);
  const allDateExits = mapToDateEntries(downMap[rule.key]);
  return {
    key: rule.key,
    label: rule.label,
    shortLabel: rule.shortLabel,
    entries: filterByMeta(allDateEntries, tickerMeta),       // 공개용
    exits: filterByMeta(allDateExits, tickerMeta),           // 공개용
    adminEntries: filterByMeta(allDateEntries, adminTickerMeta), // 관리자용
    adminExits: filterByMeta(allDateExits, adminTickerMeta)  // 관리자용
  };
});

const hasAnyChanges = ruleItems.some((rule) => rule.entries.length > 0 || rule.exits.length > 0);
const hasAdminChanges = ruleItems.some((rule) => rule.adminEntries.length > 0 || rule.adminExits.length > 0);
const events = [];
for (const rule of ruleItems) {
  for (const item of rule.entries) {
    for (const ticker of item.tickers) {
      events.push({
        date: item.date,
        ticker,
        direction: "up",
        ruleKey: rule.key,
        ruleShortLabel: rule.shortLabel
      });
    }
  }
  for (const item of rule.exits) {
    for (const ticker of item.tickers) {
      events.push({
        date: item.date,
        ticker,
        direction: "down",
        ruleKey: rule.key,
        ruleShortLabel: rule.shortLabel
      });
    }
  }
}

function tickerDesc(ticker) {
  const m = allTickerMeta.get(ticker);
  return m && m.label ? ` (${m.label})` : "";
}

function shortDate(dateStr) {
  const d = new Date(dateStr);
  return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
}

const recentDates = resolveRecentTradingDates();
const discordDates = new Set(recentDates);

const bodyLines = [];
bodyLines.push("# 추세 변화 알림 (최근 5거래일)");
if (!hasAnyChanges) {
  bodyLines.push("");
  bodyLines.push("- 변화 없음");
} else {
  const allEntries = [];
  const allExits = [];
  for (const rule of ruleItems) {
    const period = rule.key.split("-")[0];
    for (const entry of rule.entries) {
      for (const ticker of entry.tickers) {
        allEntries.push({ ticker, date: entry.date, period, ruleShortLabel: rule.shortLabel });
      }
    }
    for (const exit of rule.exits) {
      for (const ticker of exit.tickers) {
        allExits.push({ ticker, date: exit.date, period, ruleShortLabel: rule.shortLabel });
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
bodyLines.push("자세히 보기: https://atchu.co.kr/market_overview");
bodyLines.push("");
bodyLines.push("※ 참고용 지표이며 투자 조언이 아닙니다. 투자 결정과 책임은 본인에게 있습니다.");

// 관리자용 알림 본문 생성 (레버리지·인버스)
const adminBodyLines = [];
if (hasAdminChanges) {
  adminBodyLines.push("# [관리자] 레버리지·인버스 추세 변화 (최근 5거래일)");
  const adminAllEntries = [];
  const adminAllExits = [];
  for (const rule of ruleItems) {
    for (const entry of rule.adminEntries) {
      for (const ticker of entry.tickers) {
        adminAllEntries.push({ ticker, date: entry.date });
      }
    }
    for (const exit of rule.adminExits) {
      for (const ticker of exit.tickers) {
        adminAllExits.push({ ticker, date: exit.date });
      }
    }
  }
  const adminDiscordEntries = adminAllEntries.filter((e) => discordDates.has(e.date));
  const adminDiscordExits = adminAllExits.filter((e) => discordDates.has(e.date));
  if (adminDiscordEntries.length > 0) {
    adminBodyLines.push("");
    adminBodyLines.push("## 추세 진입");
    for (const e of adminDiscordEntries.sort((a, b) => b.date.localeCompare(a.date) || a.ticker.localeCompare(b.ticker))) {
      adminBodyLines.push(`- ${e.ticker}${tickerDesc(e.ticker)} — ${shortDate(e.date)}`);
    }
  }
  if (adminDiscordExits.length > 0) {
    adminBodyLines.push("");
    adminBodyLines.push("## 추세 이탈");
    for (const e of adminDiscordExits.sort((a, b) => b.date.localeCompare(a.date) || a.ticker.localeCompare(b.ticker))) {
      adminBodyLines.push(`- ${e.ticker}${tickerDesc(e.ticker)} — ${shortDate(e.date)}`);
    }
  }
}

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  title: "추세 변화 알림 (최근 5거래일)",
  recentTradingDates: resolveRecentTradingDates(),
  hasAnyChanges,
  hasAdminChanges,
  rules: ruleItems,
  events: events.sort((a, b) => {
    if (a.date === b.date) {
      if (a.ticker === b.ticker) return a.ruleKey.localeCompare(b.ruleKey);
      return a.ticker.localeCompare(b.ticker);
    }
    return b.date.localeCompare(a.date);
  }),
  markdownBody: bodyLines.join("\n"),
  adminMarkdownBody: adminBodyLines.join("\n")
};

console.log(JSON.stringify(payload, null, 2));
NODE

  local market_date trend_report_dir trend_json_dir trend_report_file trend_latest_file
  local trend_json_file trend_json_latest_file
  market_date="$(TZ="${MARKET_TZ:-America/New_York}" date '+%Y-%m-%d')"
  trend_report_dir="${ROOT_DIR}/summary/trend_md"
  trend_json_dir="${ROOT_DIR}/summary/trend"
  mkdir -p "${trend_report_dir}"
  mkdir -p "${trend_json_dir}"
  trend_report_file="${trend_report_dir}/${market_date}_trend_notifications.md"
  trend_latest_file="${trend_report_dir}/trend_notifications.md"
  trend_json_file="${trend_json_dir}/${market_date}_trend_notifications.json"
  trend_json_latest_file="${trend_json_dir}/trend_notifications.json"

  cp -f "${result_file}" "${trend_json_file}"
  cp -f "${result_file}" "${trend_json_latest_file}"

  local report_body has_any_changes
  report_body="$(jq -r '.markdownBody // empty' "${result_file}")"
  has_any_changes="$(jq -r '.hasAnyChanges // false' "${result_file}")"
  rm -f "${result_file}" || true

  if [[ -z "${report_body}" ]]; then
    report_body="# 추세 진입 및 이탈 (최근 3거래일)"$'\n\n'"- 변화 없음"
    has_any_changes="false"
  fi
  {
    echo "# Trend Notifications (${market_date})"
    echo
    printf "%s\n" "${report_body}"
  } > "${trend_report_file}"
  cp -f "${trend_report_file}" "${trend_latest_file}"
  log "Trend notification files generated: ${trend_report_file}, ${trend_json_file}"
}

# Discord 알림 발송 (generate_trend_notifications_file 이후, 배포 후 실행).
send_trend_change_notifications() {
  local trend_json_latest_file
  trend_json_latest_file="${ROOT_DIR}/summary/trend/trend_notifications.json"

  if [[ ! -f "${trend_json_latest_file}" ]]; then
    log "Trend notification skipped: file not found (${trend_json_latest_file})"
    return 0
  fi

  local has_any_changes report_body
  has_any_changes="$(jq -r '.hasAnyChanges // false' "${trend_json_latest_file}")"
  report_body="$(jq -r '.markdownBody // empty' "${trend_json_latest_file}")"

  if [[ -z "${DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL:-}" ]]; then
    log "Trend notification webhook skipped: DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL not set"
    return 0
  fi

  local notify_label
  notify_label="$( [[ "${has_any_changes}" == "true" ]] && echo "TREND NOTIFY SENT" || echo "TREND NOTIFY SENT (no changes)" )"
  if send_trend_notification_webhook "${report_body}"; then
    log "Trend notification webhook sent (has_any_changes=${has_any_changes})"
    notify "[${RUN_ID}] ${notify_label}"
  else
    log "Trend notification webhook failed"
    notify "[${RUN_ID}] TREND NOTIFY FAIL | reason=webhook_post_error"
    return 1
  fi

  # 개발자 채널: 레버리지·인버스 신호는 pipeline_stock.sh에서 개별주와 합쳐서 전송
  log "Dev trend (leverage/inverse) deferred to pipeline_stock.sh for combined delivery"
}

send_daily_snapshot_summary() {
  local snapshot_file="$1"
  local market_date="$2"

  if [[ ! -f "${snapshot_file}" ]]; then
    log "Daily summary webhook skipped: snapshot file missing (${snapshot_file})"
    return 0
  fi

  local snapshot_dir previous_snapshot_file
  snapshot_dir="${ROOT_DIR}/summary/snapshot"
  previous_snapshot_file="$(
    ls -1 "${snapshot_dir}"/*_summary_snapshots.json 2>/dev/null \
      | sed -E 's#.*\/([0-9]{4}-[0-9]{2}-[0-9]{2})_summary_snapshots\.json#\1\t&#' \
      | awk -F'\t' -v d="${market_date}" '$1 < d {print $0}' \
      | sort -r \
      | head -n1 \
      | cut -f2
  )"

  declare -A CURR_RET PREV_RET CURR_D200 CURR_S200

  while IFS=$'\t' read -r ticker chg d200 s200; do
    [[ -z "${ticker}" ]] && continue
    CURR_RET["${ticker}"]="${chg}"
    CURR_D200["${ticker}"]="${d200}"
    CURR_S200["${ticker}"]="${s200}"
  done < <(
    jq -r '
      .tickers
      | to_entries[]
      | . as $e
      | ($e.value.trendHolding.items // []) as $h
      | [
          ($e.key | sub("\\.US$"; "") | ascii_upcase),
          ($e.value.snapshot.percentChangeFromPreviousClose // ""),
          ((($h[]? | select(.label=="200일선") | .days) // "")),
          ((($h[]? | select(.label=="200일선") | .direction) // ""))
        ]
      | @tsv
    ' "${snapshot_file}"
  )

  if [[ -n "${previous_snapshot_file}" && -f "${previous_snapshot_file}" ]]; then
    while IFS=$'\t' read -r ticker chg; do
      [[ -z "${ticker}" ]] && continue
      PREV_RET["${ticker}"]="${chg}"
    done < <(
      jq -r '
        .tickers
        | to_entries[]
        | [(.key | sub("\\.US$"; "") | ascii_upcase), (.value.snapshot.percentChangeFromPreviousClose // "")]
        | @tsv
      ' "${previous_snapshot_file}"
    )
  fi

  local -a type_files type_order
  declare -A TYPE_TICKERS
  shopt -s nullglob
  type_files=("${TICKERS_DIR}"/*.json)
  shopt -u nullglob
  local f type ticker
  for f in "${type_files[@]}"; do
    type="$(jq -r '.type // empty' "${f}" 2>/dev/null)"
    [[ -z "${type}" ]] && continue
    if [[ -z "${TYPE_TICKERS[${type}]:-}" ]]; then
      type_order+=("${type}")
    fi
    while IFS= read -r ticker; do
      [[ -z "${ticker}" ]] && continue
      ticker="$(echo "${ticker}" | tr '[:lower:]' '[:upper:]')"
      if [[ " ${TYPE_TICKERS[${type}]:-} " != *" ${ticker} "* ]]; then
        TYPE_TICKERS["${type}"]="${TYPE_TICKERS[${type}]:-} ${ticker}"
      fi
    done < <(jq -r '.items[]?.ticker // empty' "${f}" 2>/dev/null)
  done

  format_pct() {
    local v="$1"
    if [[ -z "${v}" ]]; then
      printf "-"
    else
      awk -v n="${v}" 'BEGIN { if (n >= 0) printf "+%.2f%%", n; else printf "%.2f%%", n }'
    fi
  }

  calc_avg() {
    awk '
      NF {
        for (i=1; i<=NF; i++) { s += $i; c += 1; }
      }
      END {
        if (c == 0) print "";
        else printf "%.4f", s/c;
      }
    '
  }

  calc_median() {
    sort -n | awk '
      { a[++n]=$1 }
      END {
        if (n==0) { print ""; exit }
        if (n%2==1) { printf "%.4f", a[(n+1)/2] }
        else { printf "%.4f", (a[n/2]+a[n/2+1])/2 }
      }
    '
  }

  local report_dir report_file
  report_dir="${ROOT_DIR}/summary/daily_md"
  mkdir -p "${report_dir}"
  report_file="${report_dir}/${market_date}_daily_summary.md"
  local latest_report_file
  latest_report_file="${report_dir}/daily_summary.md"

  {
    echo "# 일간 주식 리포트 (${market_date})"
    echo
    echo "## 대표 3대 지수 변동폭"
    echo "| 지수 | 전일 대비 등락율 |"
    echo "|---|---:|"
    echo "| SPY | $(format_pct "${CURR_RET[SPY]:-}") |"
    echo "| QQQ | $(format_pct "${CURR_RET[QQQ]:-}") |"
    echo "| DIA | $(format_pct "${CURR_RET[DIA]:-}") |"
    echo
    echo "## 타입 랭킹"
    echo "| 타입 | 전일 대비 등락율(평균) |"
    echo "|---|---:|"

    local ranking_lines="" t tickers_raw list_vals prev_vals avg_val med_val prev_avg up_cnt down_cnt delta
    for t in "${type_order[@]}"; do
      tickers_raw="${TYPE_TICKERS[${t}]:-}"
      list_vals=""
      prev_vals=""
      up_cnt=0
      down_cnt=0
      for ticker in ${tickers_raw}; do
        if [[ -n "${CURR_RET[${ticker}]:-}" ]]; then
          list_vals="${list_vals} ${CURR_RET[${ticker}]}"
          awk -v n="${CURR_RET[${ticker}]}" 'BEGIN { exit !(n > 0) }' && up_cnt=$((up_cnt+1)) || true
          awk -v n="${CURR_RET[${ticker}]}" 'BEGIN { exit !(n < 0) }' && down_cnt=$((down_cnt+1)) || true
        fi
        if [[ -n "${PREV_RET[${ticker}]:-}" ]]; then
          prev_vals="${prev_vals} ${PREV_RET[${ticker}]}"
        fi
      done
      avg_val="$(echo "${list_vals}" | calc_avg)"
      med_val="$(echo "${list_vals}" | tr ' ' '\n' | sed '/^$/d' | calc_median)"
      prev_avg="$(echo "${prev_vals}" | calc_avg)"
      if [[ -n "${avg_val}" && -n "${prev_avg}" ]]; then
        delta="$(awk -v c="${avg_val}" -v p="${prev_avg}" 'BEGIN{ printf "%.4f", c-p }')"
      else
        delta=""
      fi
      if [[ -n "${avg_val}" ]]; then
        ranking_lines+="${avg_val}|${t}|${med_val}|${up_cnt}|${down_cnt}|${delta}"$'\n'
      fi
    done

    if [[ -n "${ranking_lines}" ]]; then
      while IFS='|' read -r avg type_name med up down dlt; do
        [[ -z "${type_name}" ]] && continue
        echo "| ${type_name} | $(format_pct "${avg}") |"
      done < <(printf "%s" "${ranking_lines}" | sort -t'|' -k1,1nr)
    else
      echo "| - | - |"
    fi
  } > "${report_file}"
  cp -f "${report_file}" "${latest_report_file}"

  # 시장 온도 계산 (전체 상승/하락 집계)
  local total_up=0 total_down=0 total_tickers market_pct
  while IFS='|' read -r _avg _type _med _up _down _dlt; do
    [[ -z "${_type}" ]] && continue
    total_up=$((total_up + _up))
    total_down=$((total_down + _down))
  done < <(printf "%s" "${ranking_lines}")
  total_tickers=$((total_up + total_down))
  if [[ "${total_tickers}" -gt 0 ]]; then
    market_pct="$(awk -v u="${total_up}" -v t="${total_tickers}" 'BEGIN{ printf "%d", (u/t)*100 }')"
  else
    market_pct="0"
  fi

  # Discord 메시지: 시장 온도 + 강세/약세 분리 + 사이트 링크
  local discord_body bull_lines bear_lines
  bull_lines="$(printf "%s" "${ranking_lines}" | sort -t'|' -k1,1nr | awk -F'|' '$1+0 > 0')"
  bear_lines="$(printf "%s" "${ranking_lines}" | sort -t'|' -k1,1n | awk -F'|' '$1+0 < 0')"

  discord_body="$(
    {
      echo "# 일간 시장 리포트 (${market_date})"
      echo
      echo "시장 온도: ${total_tickers}개 종목 중 ${total_up}개 상승 (${market_pct}%)"
      echo "▸ SPY $(format_pct "${CURR_RET[SPY]:-}") | QQQ $(format_pct "${CURR_RET[QQQ]:-}") | DIA $(format_pct "${CURR_RET[DIA]:-}")"

      if [[ -n "${bull_lines}" ]]; then
        echo
        echo "## 오늘의 강세"
        rank=0
        while IFS='|' read -r avg type_name med up down dlt; do
          [[ -z "${type_name}" ]] && continue
          rank=$((rank+1))
          echo "${rank}. ${type_name} $(format_pct "${avg}") (${up} 상승 / ${down} 하락)"
        done <<< "${bull_lines}"
      fi

      if [[ -n "${bear_lines}" ]]; then
        echo
        echo "## 오늘의 약세"
        rank=0
        while IFS='|' read -r avg type_name med up down dlt; do
          [[ -z "${type_name}" ]] && continue
          rank=$((rank+1))
          echo "${rank}. ${type_name} $(format_pct "${avg}") (${up} 상승 / ${down} 하락)"
        done <<< "${bear_lines}"
      fi

      echo
      echo "자세히 보기: https://atchu.co.kr/market_overview"
      echo
      echo "※ 참고용 지표이며 투자 조언이 아닙니다. 투자 결정과 책임은 본인에게 있습니다."
    }
  )"

  local chunk line max_len
  max_len=1800
  chunk=""
  while IFS= read -r line || [[ -n "${line}" ]]; do
    if [[ $(( ${#chunk} + ${#line} + 1 )) -gt ${max_len} && -n "${chunk}" ]]; then
      send_daily_summary_webhook "${chunk}" || true
      chunk="${line}"
    else
      if [[ -z "${chunk}" ]]; then
        chunk="${line}"
      else
        chunk="${chunk}"$'\n'"${line}"
      fi
    fi
  done <<< "${discord_body}"
  if [[ -n "${chunk}" ]]; then
    send_daily_summary_webhook "${chunk}" || true
  fi
  if [[ -z "${DISCORD_ATCHU_DAILY_SUMMARY_WEBHOOK_URL:-}" ]]; then
    log "Daily summary webhook skipped: DISCORD_ATCHU_DAILY_SUMMARY_WEBHOOK_URL not set"
  fi

  log "Daily summary markdown generated: ${report_file}"
  notify "[${RUN_ID}] DAILY SUMMARY SENT | date=${market_date}"
}

send_all_notifications() {
  local market_date snapshot_dir
  market_date="$(TZ="${MARKET_TZ:-America/New_York}" date '+%Y-%m-%d')"
  snapshot_dir="${ROOT_DIR}/summary/snapshot"
  log "Discord 알림 발송 시작"
  notify "[${RUN_ID}] NOTIFICATIONS START"
  local snapshot_file="${snapshot_dir}/${market_date}_summary_snapshots.json"
  if [[ ! -f "${snapshot_file}" ]]; then
    snapshot_file="${snapshot_dir}/summary_snapshots.json"
  fi
  send_daily_snapshot_summary "${snapshot_file}" "${market_date}" || true
  send_trend_change_notifications || true
  log "Discord 알림 발송 완료"
  notify "[${RUN_ID}] NOTIFICATIONS DONE"
}
