#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "faber");
const OUT_FILE = path.join(SUMMARY_DIR, "faber_signal.json");

/* ── Universe ── */
// 10개 섹터: XLC(통신, 2018~) 제외 — 원 논문(French-Fama 10 Industry)에도 현대 통신 섹터 없음
// XLC 제외로 백테스트 기간이 2005~로 확장 (병목: VNQ 2004-09)
const SECTORS = ["XLB", "XLE", "XLF", "XLI", "XLK", "XLP", "VNQ", "XLU", "XLV", "XLY"];
const TREND_TICKER = "SPY";
const ALL_TICKERS = [...SECTORS, TREND_TICKER];

const NAME_KO = {
  XLB: "소재", XLE: "에너지", XLF: "금융",
  XLI: "산업재", XLK: "기술", XLP: "필수소비재", VNQ: "부동산",
  XLU: "유틸리티", XLV: "헬스케어", XLY: "임의소비재", SPY: "S&P 500",
};

/* ── Helpers ── */
const round2 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 100) / 100);
const round3 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 1000) / 1000);
const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** CSV 마지막 행에서 최신 거래일 종가 읽기 */
const readLatestClose = (ticker) => {
  const csvPath = path.join(CSV_DIR, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) return null;
  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map((h) => h.trim());
  const parts = lines[lines.length - 1].split(",");
  const row = {};
  headers.forEach((h, i) => { row[h] = parts[i]; });
  const close = parseNumber(row.Adjusted_close ?? row.Close);
  return close !== null ? { date: String(row.Date), close } : null;
};

/* ── Step 1: Read CSV → month-end adjusted close ── */
const readMonthEnds = (ticker) => {
  const csvPath = path.join(CSV_DIR, `${ticker}.US_all.csv`);
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
  const records = lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      headers.forEach((h, i) => { row[h] = parts[i]; });
      return row;
    })
    .filter((row) => row.Date)
    .sort((a, b) => String(a.Date).localeCompare(String(b.Date)));

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
};

/* ── Step 2: Reference month (last completed month) ── */
const getReferenceMonth = () => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
  const year = lastDayPrevMonth.getFullYear();
  const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/* ── Step 3: 3-month ROC ── */
const calcRoc3m = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 3) return null;
  const p0 = monthEnds[idx].close;
  const p3 = monthEnds[idx - 3].close;
  if (!p0 || !p3 || p3 === 0) return null;
  return (p0 / p3 - 1) * 100;
};

/* ── Step 4: 10-month SMA ── */
const calcSma10m = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 9) return null; // Need 10 months (idx 0..9)
  const window = monthEnds.slice(idx - 9, idx + 1); // 10 entries
  if (window.length < 10) return null;
  return window.reduce((s, m) => s + m.close, 0) / 10;
};

/* ── Main ── */
const refYm = getReferenceMonth();
console.log(`Reference month: ${refYm}`);

// Load month-end data
const tickerData = new Map();
let processedCount = 0;

for (const ticker of ALL_TICKERS) {
  const monthEnds = readMonthEnds(ticker);
  if (!monthEnds) continue;
  if (monthEnds.length < 11) {
    console.warn(`[WARN] Not enough monthly data for ${ticker} (${monthEnds.length} months, need >= 11)`);
    continue;
  }
  tickerData.set(ticker, monthEnds);
  processedCount++;
}

// Effective reference month
let effectiveRefYm = refYm;
const allYms = [...tickerData.values()].map((me) => me[me.length - 1].ym);
const minLatest = allYms.sort()[0];

if (allYms.some((ym) => ym < effectiveRefYm)) {
  effectiveRefYm = minLatest < effectiveRefYm ? minLatest : effectiveRefYm;
  console.log(`Adjusted reference month to ${effectiveRefYm}`);
}

for (const [ticker, monthEnds] of tickerData) {
  if (!monthEnds.some((m) => m.ym === effectiveRefYm)) {
    console.warn(`[WARN] ${ticker} missing data for ${effectiveRefYm}, skipping`);
    tickerData.delete(ticker);
  }
}

const getClose = (ticker, ym) => tickerData.get(ticker)?.find((m) => m.ym === ym)?.close ?? null;
const getDate = (ym) => {
  const spyData = tickerData.get("SPY") || [...tickerData.values()][0];
  return spyData?.find((m) => m.ym === ym)?.date ?? `${ym}-28`;
};

/* ── Step 5: Current signal ── */
const spyMonthEnds = tickerData.get("SPY");
const spyClose = getClose("SPY", effectiveRefYm);
const spySma10m = round2(calcSma10m(spyMonthEnds, effectiveRefYm));
const spyAboveSma = spyClose > spySma10m;
const mode = spyAboveSma ? "invested" : "cash";

const rebalanceDate = getDate(effectiveRefYm);

/* ── Step 6: Sector rankings ── */
const sectorMetrics = SECTORS
  .filter((t) => tickerData.has(t))
  .map((t) => {
    const roc3m = round2(calcRoc3m(tickerData.get(t), effectiveRefYm));
    return { ticker: t, nameKo: NAME_KO[t] || t, roc3m };
  })
  .filter((s) => s.roc3m !== null)
  .sort((a, b) => b.roc3m - a.roc3m);

const sectors = sectorMetrics.map((s, i) => ({
  ...s,
  rank: i + 1,
  selected: mode === "invested" && i < 3,
}));

/* ── Step 7: Portfolio ── */
const portfolio = mode === "invested"
  ? sectors.filter((s) => s.selected).map((s) => ({
      ticker: s.ticker,
      nameKo: s.nameKo,
      weight: round2(33.33),
      roc3m: s.roc3m,
    }))
  : [];

/* ── Step 8: Backtest ── */
// Find common start: earliest month where all tickers have at least 10 months of prior data
const allUniqueYms = new Set();
for (const [, monthEnds] of tickerData) {
  for (const m of monthEnds) allUniqueYms.add(m.ym);
}
const sortedAllYms = [...allUniqueYms].sort();

let commonStartYm = null;
for (const ym of sortedAllYms) {
  let allReady = true;
  for (const ticker of ALL_TICKERS) {
    const me = tickerData.get(ticker);
    if (!me) { allReady = false; break; }
    const idx = me.findIndex((m) => m.ym === ym);
    if (idx < 9) { allReady = false; break; } // Need 10 months for SMA + 3 for ROC
  }
  if (allReady) { commonStartYm = ym; break; }
}

if (!commonStartYm) {
  console.warn("[WARN] Cannot find common start month for backtest");
}

const backtestMonths = commonStartYm
  ? sortedAllYms.filter((ym) => ym >= commonStartYm && ym <= effectiveRefYm)
  : [];

// Walk each month
const monthlyRecords = [];

for (const ym of backtestMonths) {
  const spyMe = tickerData.get("SPY");
  const spyC = spyMe?.find((m) => m.ym === ym)?.close;
  const sma = calcSma10m(spyMe, ym);
  if (spyC == null || sma == null) continue;

  const monthMode = spyC > sma ? "invested" : "cash";

  // Rank sectors by 3M ROC
  const ranked = SECTORS
    .filter((t) => tickerData.has(t))
    .map((t) => ({ ticker: t, roc3m: calcRoc3m(tickerData.get(t), ym) }))
    .filter((s) => s.roc3m !== null)
    .sort((a, b) => b.roc3m - a.roc3m);

  const alloc = monthMode === "invested"
    ? ranked.slice(0, 3).map((s) => ({ ticker: s.ticker, weight: round2(33.33) }))
    : [];

  monthlyRecords.push({
    date: getDate(ym),
    ym,
    mode: monthMode,
    portfolio: alloc,
    spyClose: round2(spyC),
    spySma10m: round2(sma),
  });
}

// Equity curve
let eqFaber = 1.0;
let eqSpy = 1.0;
let eq6040 = 1.0;

const bond6040Ticker = tickerData.has("AGG") ? "AGG" : (tickerData.has("IEF") ? "IEF" : null);
// Load bond data if available (AGG might not be in ALL_TICKERS)
if (bond6040Ticker && !tickerData.has(bond6040Ticker)) {
  const bondMe = readMonthEnds(bond6040Ticker);
  if (bondMe) tickerData.set(bond6040Ticker, bondMe);
}

const equityCurve = [];
const monthlyReturns = { faberSector: [], spy: [], sixtyForty: [] };

if (monthlyRecords.length > 0) {
  equityCurve.push({
    date: monthlyRecords[0].date,
    faberSector: round3(eqFaber),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040),
  });
}

for (let i = 0; i < monthlyRecords.length - 1; i++) {
  const cur = monthlyRecords[i];
  const next = monthlyRecords[i + 1];

  // Faber portfolio return
  let faberRet = 0;
  if (cur.mode === "invested") {
    for (const { ticker, weight } of cur.portfolio) {
      const c0 = getClose(ticker, cur.ym);
      const c1 = getClose(ticker, next.ym);
      if (c0 && c1 && c0 > 0) {
        faberRet += (weight / 100) * (c1 / c0 - 1);
      }
    }
  }
  // cash mode → 0% return

  // SPY B&H
  const spyC0 = getClose("SPY", cur.ym);
  const spyC1 = getClose("SPY", next.ym);
  const spyRet = (spyC0 && spyC1 && spyC0 > 0) ? (spyC1 / spyC0 - 1) : 0;

  // 60/40
  let bondRet = 0;
  if (bond6040Ticker) {
    const bC0 = getClose(bond6040Ticker, cur.ym);
    const bC1 = getClose(bond6040Ticker, next.ym);
    if (bC0 && bC1 && bC0 > 0) bondRet = bC1 / bC0 - 1;
  }
  const sixtyFortyRet = 0.6 * spyRet + 0.4 * bondRet;

  eqFaber *= (1 + faberRet);
  eqSpy *= (1 + spyRet);
  eq6040 *= (1 + sixtyFortyRet);

  monthlyReturns.faberSector.push(faberRet);
  monthlyReturns.spy.push(spyRet);
  monthlyReturns.sixtyForty.push(sixtyFortyRet);

  equityCurve.push({
    date: next.date,
    faberSector: round3(eqFaber),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040),
  });
}

/* ── 부분월(오늘) 포인트 ── */
const latestSpy = readLatestClose("SPY");
if (latestSpy && equityCurve.length > 0 && monthlyRecords.length > 0) {
  const lastEq = equityCurve[equityCurve.length - 1];
  const lastRecord = monthlyRecords[monthlyRecords.length - 1];
  if (latestSpy.date > lastRecord.date) {
    let partialRet = 0;
    if (lastRecord.mode === "invested") {
      for (const { ticker, weight } of lastRecord.portfolio) {
        const c0 = getClose(ticker, lastRecord.ym);
        const latest = readLatestClose(ticker);
        if (c0 && latest && c0 > 0) partialRet += (weight / 100) * (latest.close / c0 - 1);
      }
    }
    const spyRef = getClose("SPY", lastRecord.ym);
    const spyPartial = (spyRef && spyRef > 0) ? (latestSpy.close / spyRef - 1) : 0;
    let bondPartial = 0;
    if (bond6040Ticker) {
      const bLatest = readLatestClose(bond6040Ticker);
      const bRef = getClose(bond6040Ticker, lastRecord.ym);
      if (bRef && bLatest && bRef > 0) bondPartial = bLatest.close / bRef - 1;
    }
    equityCurve.push({
      date: latestSpy.date,
      faberSector: round3(lastEq.faberSector * (1 + partialRet)),
      spy: round3(lastEq.spy * (1 + spyPartial)),
      sixtyForty: round3(lastEq.sixtyForty * (1 + 0.6 * spyPartial + 0.4 * bondPartial)),
    });
  }
}

// Metrics
const calcMetrics = (returns, finalEquity) => {
  const n = returns.length;
  if (n === 0) return { cagr: null, mdd: null, sharpe: null };

  const cagr = (Math.pow(finalEquity, 12 / n) - 1) * 100;

  let peak = 1.0;
  let maxDD = 0;
  let eq = 1.0;
  for (const r of returns) {
    eq *= (1 + r);
    if (eq > peak) peak = eq;
    const dd = (eq - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  const mdd = maxDD * 100;

  const mean = returns.reduce((s, r) => s + r, 0) / n;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(12) : null;

  return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe) };
};

const faberMetrics = calcMetrics(monthlyReturns.faberSector, eqFaber);
const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
const sixtyFortyMetrics = calcMetrics(monthlyReturns.sixtyForty, eq6040);

const totalMonths = monthlyRecords.length;
const cashMonths = monthlyRecords.filter((r) => r.mode === "cash").length;
const cashRatio = totalMonths > 0 ? round2(cashMonths / totalMonths) : 0;

const backtestStartDate = monthlyRecords.length > 0 ? monthlyRecords[0].date : null;
const backtestEndDate = monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1].date : null;

/* ── History: last 36 months ── */
const historyLast36 = monthlyRecords.slice(-36).map((r) => ({
  date: r.date,
  mode: r.mode,
  portfolio: r.portfolio,
  spyClose: r.spyClose,
  spySma10m: r.spySma10m,
}));

/* ── Output ── */
const payload = {
  generatedAt: new Date().toISOString(),
  signal: {
    mode,
    rebalanceDate,
    spyClose: round2(spyClose),
    spySma10m,
    spyAboveSma,
  },
  sectors,
  portfolio,
};

if (backtestStartDate && monthlyRecords.length > 1) {
  payload.backtest = {
    startDate: backtestStartDate,
    endDate: backtestEndDate,
    faberSector: faberMetrics,
    benchmarkSpy: spyMetrics,
    benchmark6040: sixtyFortyMetrics,
    cashRatio,
    equityCurve,
  };
  payload.history = historyLast36;
}

fs.mkdirSync(SUMMARY_DIR, { recursive: true });
const body = `${JSON.stringify(payload, null, 2)}\n`;
fs.writeFileSync(OUT_FILE, body, "utf8");

console.log(`Generated ${OUT_FILE}`);
console.log(`  Tickers processed: ${processedCount}`);
console.log(`  Signal mode: ${mode}`);
console.log(`  SPY close: ${round2(spyClose)} / SMA10M: ${spySma10m} → ${spyAboveSma ? "ABOVE" : "BELOW"}`);
console.log(`  Top 3: ${sectors.slice(0, 3).map((s) => `${s.ticker}(${s.roc3m}%)`).join(", ")}`);
console.log(`  Rebalance date: ${rebalanceDate}`);

if (backtestStartDate && monthlyRecords.length > 1) {
  console.log(`  Backtest: ${backtestStartDate} → ${backtestEndDate} (${monthlyRecords.length} months)`);
  console.log(`  Faber CAGR: ${faberMetrics.cagr}%  MDD: ${faberMetrics.mdd}%  Sharpe: ${faberMetrics.sharpe}`);
  console.log(`  SPY   CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%`);
  console.log(`  Cash ratio: ${Math.round(cashRatio * 100)}%`);
}
