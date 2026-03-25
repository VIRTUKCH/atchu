/**
 * 퀀트 전략 공통 유틸리티.
 * 9개 시그널 생성 스크립트에서 공유하는 CSV 읽기, 티커 풀 로딩, 기간별 수익률 계산.
 */
import fs from "node:fs";
import path from "node:path";

/* ── 공통 유틸 ── */

export const round2 = (v) =>
  v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 100) / 100;

export const round3 = (v) =>
  v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 1000) / 1000;

export const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/* ── 티커 풀 로더 ── */

/**
 * tickers_quant/{strategy}.json 에서 티커 풀을 읽어 반환.
 * @param {string} strategy - JSON 파일명 (확장자 제외). 예: "baa", "haa", "dm"
 * @param {string} rootDir - data 디렉터리 경로
 * @returns {{ type: string, groups: object, items: Array, allTickers: string[], nameMap: Record<string,string> }}
 */
export function loadTickerPool(strategy, rootDir) {
  const jsonPath = path.join(rootDir, "tickers_quant", `${strategy}.json`);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Ticker pool not found: ${jsonPath}`);
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const items = data.items || [];
  const allTickers = [...new Set(items.map((i) => i.ticker))];
  const nameMap = Object.fromEntries(items.map((i) => [i.ticker, i.name_ko]));
  return { type: data.type, groups: data.groups || {}, items, allTickers, nameMap };
}

/* ── CSV 읽기 ── */

/** CSV 파일 전체를 파싱하여 { date, close }[] 배열로 반환 (오름차순 정렬) */
export function readDailyPrices(ticker, csvDir) {
  const csvPath = path.join(csvDir, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) return null;

  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 3) return null;

  const headers = lines[0].split(",").map((h) => h.trim());
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const row = {};
    headers.forEach((h, j) => { row[h] = parts[j]; });
    if (!row.Date) continue;
    const close = parseNumber(row.Adjusted_close ?? row.Close);
    if (close === null) continue;
    records.push({ date: String(row.Date), close });
  }
  records.sort((a, b) => a.date.localeCompare(b.date));
  return records.length > 0 ? records : null;
}

/** CSV 마지막 행에서 최신 거래일 종가 읽기 */
export function readLatestClose(ticker, csvDir) {
  const csvPath = path.join(csvDir, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) return null;
  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map((h) => h.trim());
  const parts = lines[lines.length - 1].split(",");
  const row = {};
  headers.forEach((h, i) => { row[h] = parts[i]; });
  const close = parseNumber(row.Adjusted_close ?? row.Close);
  return close !== null ? { date: String(row.Date), close } : null;
}

/** CSV에서 월별 마지막 거래일 종가 추출 → { ym, date, close }[] */
export function readMonthEnds(ticker, csvDir) {
  const csvPath = path.join(csvDir, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) {
    console.warn(`[WARN] CSV not found: ${csvPath}`);
    return null;
  }

  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 3) {
    console.warn(`[WARN] CSV too short: ${ticker}`);
    return null;
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const row = {};
    headers.forEach((h, j) => { row[h] = parts[j]; });
    if (!row.Date) continue;
    records.push(row);
  }
  records.sort((a, b) => String(a.Date).localeCompare(String(b.Date)));

  const monthMap = new Map();
  for (const row of records) {
    const date = String(row.Date);
    const ym = date.slice(0, 7);
    const close = parseNumber(row.Adjusted_close ?? row.Close);
    if (close === null) continue;
    monthMap.set(ym, { date, close });
  }

  return [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, data]) => ({ ym, date: data.date, close: data.close }));
}

/* ── 기준 월 계산 ── */

/** 현재 날짜 기준 참조 월 (직전 완료 월) 반환. "YYYY-MM" 형식. */
export function getReferenceMonth() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth - 1);
  const y = lastDayPrevMonth.getFullYear();
  const m = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/* ── 기간별 수익률 (오늘 기준, 일별 가격) ── */

/**
 * 월별 equity curve + 현재 포트폴리오를 사용하여
 * 오늘 기준 1M/3M/6M/1Y/3Y/5Y 수익률을 계산한다.
 *
 * @param {Array<{date:string, [curveKey]:number}>} equityCurve - 월별 누적 수익률 배열
 * @param {string} curveKey - equity curve 내 사용할 키 (예: "aggressive", "balanced")
 * @param {Array<{ticker:string, weight:number}>} currentAlloc - 현재 포트폴리오 배분 (비중 합 = 1)
 * @param {string} csvDir - CSV 디렉터리 경로
 * @param {string} lastRebalDate - 마지막 리밸런싱 날짜 ("YYYY-MM-DD")
 * @returns {{ "1M": number|null, "3M": number|null, "6M": number|null, "1Y": number|null, "3Y": number|null, "5Y": number|null }}
 */
export function calcPeriodReturns(equityCurve, curveKey, currentAlloc, csvDir, lastRebalDate) {
  if (!equityCurve || equityCurve.length < 2 || !currentAlloc || currentAlloc.length === 0) {
    return { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };
  }

  // 1. 각 티커의 일별 가격 로드
  const dailyPricesMap = new Map();
  for (const { ticker } of currentAlloc) {
    const daily = readDailyPrices(ticker, csvDir);
    if (daily) dailyPricesMap.set(ticker, daily);
  }

  // 2. 마지막 equity curve 값 (마지막 리밸런싱 시점)
  const lastEq = equityCurve[equityCurve.length - 1];
  const lastEqVal = lastEq[curveKey];
  if (lastEqVal == null) {
    return { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };
  }

  // 3. 특정 날짜의 포트폴리오 수익률 계산 (리밸런싱 이후 부분)
  function getPortValueOnDate(targetDate) {
    let portReturn = 0;
    for (const { ticker, weight } of currentAlloc) {
      const daily = dailyPricesMap.get(ticker);
      if (!daily) return null;

      // 리밸런싱 날짜의 가격
      const rebalEntry = findClosestPrice(daily, lastRebalDate);
      // 타겟 날짜의 가격
      const targetEntry = findClosestPrice(daily, targetDate);
      if (!rebalEntry || !targetEntry) return null;

      const tickerReturn = targetEntry.close / rebalEntry.close - 1;
      portReturn += weight * tickerReturn;
    }
    return lastEqVal * (1 + portReturn);
  }

  // 4. 오늘의 포트폴리오 가치
  const latestDate = getLatestDateFromPrices(dailyPricesMap);
  if (!latestDate) {
    return { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };
  }
  const todayValue = getPortValueOnDate(latestDate);
  if (todayValue == null) {
    return { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };
  }

  // 5. 각 기간의 과거 날짜에서의 equity 값 찾기
  const periods = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12, "3Y": 36, "5Y": 60 };
  const result = {};

  for (const [label, months] of Object.entries(periods)) {
    const pastDate = subtractMonths(latestDate, months);
    // 월별 equity curve에서 해당 날짜에 가장 가까운 값 찾기
    const pastValue = findEquityValueAtDate(equityCurve, curveKey, pastDate);
    if (pastValue != null && pastValue > 0) {
      result[label] = round2((todayValue / pastValue - 1) * 100);
    } else {
      result[label] = null;
    }
  }

  return result;
}

/* ── 내부 헬퍼 ── */

/** 일별 가격 배열에서 targetDate 이하의 가장 가까운 거래일 가격을 찾는다 */
function findClosestPrice(dailyPrices, targetDate) {
  let best = null;
  for (const entry of dailyPrices) {
    if (entry.date <= targetDate) best = entry;
    else break; // 정렬되어 있으므로 넘어가면 중단
  }
  return best;
}

/** dailyPricesMap 에서 가장 최신 날짜를 찾는다 */
function getLatestDateFromPrices(dailyPricesMap) {
  let latest = null;
  for (const daily of dailyPricesMap.values()) {
    if (daily.length > 0) {
      const lastDate = daily[daily.length - 1].date;
      if (!latest || lastDate > latest) latest = lastDate;
    }
  }
  return latest;
}

/** 월별 equity curve에서 targetDate에 가장 가까운(이하) 값을 찾는다 */
function findEquityValueAtDate(equityCurve, curveKey, targetDate) {
  let best = null;
  for (const entry of equityCurve) {
    if (entry.date <= targetDate) {
      best = entry[curveKey];
    } else {
      break;
    }
  }
  return best;
}

/** "YYYY-MM-DD" 에서 N개월을 뺀 날짜를 반환 */
function subtractMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() - months);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
