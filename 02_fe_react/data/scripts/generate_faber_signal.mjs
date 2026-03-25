#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadTickerPool, readMonthEnds, readLatestClose,
  round2, round3, parseNumber, getReferenceMonth, calcPeriodReturns,
} from "./lib/quant_utils.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "faber");
const OUT_FILE = path.join(SUMMARY_DIR, "faber_signal.json");

/* ── Universe ── */
const pool = loadTickerPool("faber", ROOT_DIR);
const SECTORS = pool.groups.sectors;
const TREND_TICKER = pool.groups.trend_ticker[0]; // "SPY"
const NAME_KO = pool.nameMap;
const ALL_TICKERS = [...SECTORS, TREND_TICKER];

/* ── Step 1: 3-month ROC ── */
const calcRoc3m = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 3) return null;
  const p0 = monthEnds[idx].close;
  const p3 = monthEnds[idx - 3].close;
  if (!p0 || !p3 || p3 === 0) return null;
  return (p0 / p3 - 1) * 100;
};

/* ── Step 2: 10-month SMA ── */
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
  const monthEnds = readMonthEnds(ticker, CSV_DIR);
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

// Helper: SPY 10-month SMA at a given YM
const calcSpySma10 = (ym) => {
  const spyData = tickerData.get("SPY");
  if (!spyData) return null;
  const idx = spyData.findIndex((m) => m.ym === ym);
  if (idx < 9) return null;
  const window = spyData.slice(idx - 9, idx + 1);
  return window.reduce((s, m) => s + m.close, 0) / 10;
};
const getDate = (ym) => {
  const spyData = tickerData.get("SPY") || [...tickerData.values()][0];
  return spyData?.find((m) => m.ym === ym)?.date ?? `${ym}-28`;
};

/* ── Step 3: Current signal ── */
const spyMonthEnds = tickerData.get("SPY");
const spyClose = getClose("SPY", effectiveRefYm);
const spySma10m = round2(calcSma10m(spyMonthEnds, effectiveRefYm));
const spyAboveSma = spyClose > spySma10m;
const mode = spyAboveSma ? "invested" : "cash";

const rebalanceDate = getDate(effectiveRefYm);

/* ── Step 4: Sector rankings ── */
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

/* ── Step 5: Portfolio ── */
const portfolio = mode === "invested"
  ? sectors.filter((s) => s.selected).map((s) => ({
      ticker: s.ticker,
      nameKo: s.nameKo,
      weight: round2(33.33),
      roc3m: s.roc3m,
    }))
  : [];

/* ── Step 6: Backtest ── */
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
let eqSpyMa = 1.0;
let eq6040 = 1.0;

const bond6040Ticker = tickerData.has("AGG") ? "AGG" : (tickerData.has("IEF") ? "IEF" : null);
// Load bond data if available (AGG might not be in ALL_TICKERS)
if (bond6040Ticker && !tickerData.has(bond6040Ticker)) {
  const bondMe = readMonthEnds(bond6040Ticker, CSV_DIR);
  if (bondMe) tickerData.set(bond6040Ticker, bondMe);
}

const equityCurve = [];
const monthlyReturns = { faberSector: [], spy: [], spyMa: [], sixtyForty: [] };

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

  // SPY + 10-month SMA filter
  const spySma10 = calcSpySma10(cur.ym);
  const spyCloseAtCur = getClose("SPY", cur.ym);
  const spyMaRet = (spySma10 && spyCloseAtCur > spySma10) ? spyRet : 0;

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
  eqSpyMa *= (1 + spyMaRet);
  eq6040 *= (1 + sixtyFortyRet);

  monthlyReturns.faberSector.push(faberRet);
  monthlyReturns.spy.push(spyRet);
  monthlyReturns.spyMa.push(spyMaRet);
  monthlyReturns.sixtyForty.push(sixtyFortyRet);

  equityCurve.push({
    date: next.date,
    faberSector: round3(eqFaber),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040),
  });
}

/* ── 부분월(오늘) 포인트 ── */
const latestSpy = readLatestClose("SPY", CSV_DIR);
if (latestSpy && equityCurve.length > 0 && monthlyRecords.length > 0) {
  const lastEq = equityCurve[equityCurve.length - 1];
  const lastRecord = monthlyRecords[monthlyRecords.length - 1];
  if (latestSpy.date > lastRecord.date) {
    let partialRet = 0;
    if (lastRecord.mode === "invested") {
      for (const { ticker, weight } of lastRecord.portfolio) {
        const c0 = getClose(ticker, lastRecord.ym);
        const latest = readLatestClose(ticker, CSV_DIR);
        if (c0 && latest && c0 > 0) partialRet += (weight / 100) * (latest.close / c0 - 1);
      }
    }
    const spyRef = getClose("SPY", lastRecord.ym);
    const spyPartial = (spyRef && spyRef > 0) ? (latestSpy.close / spyRef - 1) : 0;
    let bondPartial = 0;
    if (bond6040Ticker) {
      const bLatest = readLatestClose(bond6040Ticker, CSV_DIR);
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

  const downsideSq = returns.reduce((s, r) => s + Math.min(r, 0) ** 2, 0);
  const downsideDev = Math.sqrt(downsideSq / n);
  const sortino = downsideDev > 0 ? (mean / downsideDev) * Math.sqrt(12) : null;

  return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe), sortino: round3(sortino) };
};

const faberMetrics = calcMetrics(monthlyReturns.faberSector, eqFaber);
const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
const spyMaMetrics = calcMetrics(monthlyReturns.spyMa, eqSpyMa);
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
    benchmarkSpyMa: spyMaMetrics,
    benchmark6040: sixtyFortyMetrics,
    cashRatio,
    equityCurve,
  };
  payload.history = historyLast36;
}

/* ── periodReturns ── */
const lastRecord = monthlyRecords[monthlyRecords.length - 1];
if (lastRecord) {
  const alloc = (lastRecord.portfolio || []).map(({ ticker, weight }) => ({ ticker, weight: weight / 100 }));
  payload.periodReturns = {
    faberSector: calcPeriodReturns(equityCurve, "faberSector", alloc, CSV_DIR, lastRecord.date),
  };
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
