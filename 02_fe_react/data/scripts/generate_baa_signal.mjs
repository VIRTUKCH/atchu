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
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "baa");
const OUT_FILE = path.join(SUMMARY_DIR, "baa_signal.json");

/* ── 티커 풀 로드 (tickers_quant/baa.json) ── */
const pool = loadTickerPool("baa", ROOT_DIR);
const { canary: CANARY, offensive_g12: OFFENSIVE_G12, offensive_g4: OFFENSIVE_G4, defensive: DEFENSIVE } = pool.groups;
const NAME_KO = pool.nameMap;
const ALL_TICKERS = pool.allTickers;

/* ── Step 2: Determine reference month ── */

/* ── Step 3: 13612W momentum ── */
const calcMomentum13612W = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 0) return null;
  if (idx < 12) return null; // Need at least 12 months before reference

  const p0 = monthEnds[idx].close;
  const p1 = monthEnds[idx - 1]?.close;
  const p3 = monthEnds[idx - 3]?.close;
  const p6 = monthEnds[idx - 6]?.close;
  const p12 = monthEnds[idx - 12]?.close;

  if ([p0, p1, p3, p6, p12].some((v) => v === null || v === undefined || v === 0)) return null;

  const mom = 12 * (p0 / p1 - 1) + 4 * (p0 / p3 - 1) + 2 * (p0 / p6 - 1) + 1 * (p0 / p12 - 1);
  return mom * 100; // percentage
};

/* ── Step 4: Relative momentum (SMA 13-month) ── */
const calcRelMomentum = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 0 || idx < 12) return null; // Need 13 closes (idx 0..12 = 13 values)

  const p0 = monthEnds[idx].close;
  const window = monthEnds.slice(idx - 12, idx + 1); // 13 months
  if (window.length < 13) return null;

  const sum = window.reduce((s, m) => s + m.close, 0);
  const sma13 = sum / 13;
  if (sma13 === 0) return null;

  return p0 / sma13;
};

/* ── Main ── */
const refYm = getReferenceMonth();
console.log(`Reference month: ${refYm}`);

// Load all month-end data
const tickerData = new Map();
let processedCount = 0;

for (const ticker of ALL_TICKERS) {
  const monthEnds = readMonthEnds(ticker, CSV_DIR);
  if (!monthEnds) continue;

  if (monthEnds.length < 13) {
    console.warn(`[WARN] Not enough monthly data for ${ticker} (${monthEnds.length} months, need >= 13)`);
    continue;
  }

  tickerData.set(ticker, monthEnds);
  processedCount++;
}

// Find the reference month. If not all tickers have it, fall back to latest common month.
let effectiveRefYm = refYm;
const allYms = [...tickerData.values()].map((me) => me[me.length - 1].ym);
const minLatest = allYms.sort()[0]; // earliest "latest month" across all tickers

if (allYms.some((ym) => ym < effectiveRefYm)) {
  // Some tickers don't have the reference month — use the latest common month
  effectiveRefYm = minLatest < effectiveRefYm ? minLatest : effectiveRefYm;
  console.log(`Adjusted reference month to ${effectiveRefYm} (not all tickers had ${refYm})`);
}

// Verify all tickers have the effective reference month
for (const [ticker, monthEnds] of tickerData) {
  const hasRef = monthEnds.some((m) => m.ym === effectiveRefYm);
  if (!hasRef) {
    console.warn(`[WARN] ${ticker} missing data for ${effectiveRefYm}, skipping`);
    tickerData.delete(ticker);
  }
}

// Compute momentum and relMomentum for all tickers
const metrics = new Map();

for (const [ticker, monthEnds] of tickerData) {
  const momentum13612w = calcMomentum13612W(monthEnds, effectiveRefYm);
  const relMomentum = calcRelMomentum(monthEnds, effectiveRefYm);

  if (momentum13612w === null || relMomentum === null) {
    console.warn(`[WARN] Could not compute metrics for ${ticker}`);
    continue;
  }

  metrics.set(ticker, {
    momentum13612w: round2(momentum13612w),
    relMomentum: round3(relMomentum)
  });
}

// Rebalance date = last trading day of reference month
const refMonthEnds = tickerData.get("SPY") || [...tickerData.values()][0];
const refEntry = refMonthEnds?.find((m) => m.ym === effectiveRefYm);
const rebalanceDate = refEntry?.date || `${effectiveRefYm}-28`;

/* ── Step 5: Canary judgment ── */
const canaryResults = CANARY.map((ticker) => {
  const m = metrics.get(ticker);
  return {
    ticker,
    nameKo: NAME_KO[ticker] || ticker,
    momentum13612w: m?.momentum13612w ?? null
  };
});

const canaryPositiveCount = canaryResults.filter((c) => c.momentum13612w !== null && c.momentum13612w > 0).length;
const mode = canaryPositiveCount === 4 ? "offensive" : "defensive";

/* ── Step 6: Portfolio allocation ── */
const bilRelMomentum = metrics.get("BIL")?.relMomentum ?? 0;

const buildDefensiveAllocations = () => {
  const ranked = DEFENSIVE
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.relMomentum - a.relMomentum);

  const top3 = ranked.slice(0, 3).map((item) => {
    const shouldReplace = item.relMomentum < bilRelMomentum;
    return {
      ticker: shouldReplace ? "BIL" : item.ticker,
      nameKo: shouldReplace ? NAME_KO["BIL"] : (NAME_KO[item.ticker] || item.ticker),
      weight: round2(33.33),
      momentum13612w: shouldReplace ? (metrics.get("BIL")?.momentum13612w ?? null) : item.momentum13612w,
      relMomentum: shouldReplace ? bilRelMomentum : item.relMomentum,
      replacedByBil: shouldReplace,
      originalTicker: shouldReplace ? item.ticker : undefined
    };
  });

  return top3;
};

let aggressivePortfolio;
let balancedPortfolio;

if (mode === "offensive") {
  // Aggressive: G4 top 1 by relMomentum
  const g4Ranked = OFFENSIVE_G4
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.relMomentum - a.relMomentum);

  aggressivePortfolio = {
    mode: "offensive",
    allocations: g4Ranked.length > 0
      ? [{
          ticker: g4Ranked[0].ticker,
          nameKo: NAME_KO[g4Ranked[0].ticker] || g4Ranked[0].ticker,
          weight: 100,
          momentum13612w: g4Ranked[0].momentum13612w,
          relMomentum: g4Ranked[0].relMomentum,
          replacedByBil: false
        }]
      : []
  };

  // Balanced: G12 top 6 by relMomentum, 16.67% each
  const g12Ranked = OFFENSIVE_G12
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.relMomentum - a.relMomentum);

  balancedPortfolio = {
    mode: "offensive",
    allocations: g12Ranked.slice(0, 6).map((item) => ({
      ticker: item.ticker,
      nameKo: NAME_KO[item.ticker] || item.ticker,
      weight: round2(16.67),
      momentum13612w: item.momentum13612w,
      relMomentum: item.relMomentum,
      replacedByBil: false
    }))
  };
} else {
  // Defensive mode: both use defensive universe
  const defAllocations = buildDefensiveAllocations();
  aggressivePortfolio = { mode: "defensive", allocations: defAllocations };
  balancedPortfolio = { mode: "defensive", allocations: defAllocations };
}

/* ── Step 7: Rankings ── */
const offensiveRanking = OFFENSIVE_G12
  .filter((t) => metrics.has(t))
  .map((t) => {
    const m = metrics.get(t);
    return {
      ticker: t,
      nameKo: NAME_KO[t] || t,
      momentum13612w: m.momentum13612w,
      relMomentum: m.relMomentum,
      selectedG4: mode === "offensive" && aggressivePortfolio.allocations.some((a) => a.ticker === t),
      selectedG12: mode === "offensive" && balancedPortfolio.allocations.some((a) => a.ticker === t)
    };
  })
  .sort((a, b) => b.relMomentum - a.relMomentum);

const offensiveRankingG4 = OFFENSIVE_G4
  .filter((t) => metrics.has(t))
  .map((t) => {
    const m = metrics.get(t);
    return {
      ticker: t,
      nameKo: NAME_KO[t] || t,
      momentum13612w: m.momentum13612w,
      relMomentum: m.relMomentum,
      selected: mode === "offensive" && aggressivePortfolio.allocations.some((a) => a.ticker === t)
    };
  })
  .sort((a, b) => b.relMomentum - a.relMomentum);

const defensiveRanking = DEFENSIVE
  .filter((t) => metrics.has(t))
  .map((t) => {
    const m = metrics.get(t);
    const isSelected = mode === "defensive" && aggressivePortfolio.allocations.some((a) => a.ticker === t || a.originalTicker === t);
    const replacedEntry = mode === "defensive" && aggressivePortfolio.allocations.find((a) => a.originalTicker === t);
    return {
      ticker: t,
      nameKo: NAME_KO[t] || t,
      relMomentum: m.relMomentum,
      selected: isSelected,
      replacedByBil: replacedEntry ? true : false
    };
  })
  .sort((a, b) => b.relMomentum - a.relMomentum);

/* ── Backtest ── */

// Helper: get a ticker's month-end close for a given YM
const getClose = (ticker, ym) => {
  const me = tickerData.get(ticker);
  return me?.find((m) => m.ym === ym)?.close ?? null;
};

// Helper: SPY 10-month SMA at a given YM
const calcSpySma10 = (ym) => {
  const spyData = tickerData.get("SPY");
  if (!spyData) return null;
  const idx = spyData.findIndex((m) => m.ym === ym);
  if (idx < 9) return null;
  const window = spyData.slice(idx - 9, idx + 1);
  return window.reduce((s, m) => s + m.close, 0) / 10;
};

// Helper: get the actual trading date for a given YM from SPY (or first available ticker)
const getDate = (ym) => {
  const spyData = tickerData.get("SPY") || [...tickerData.values()][0];
  return spyData?.find((m) => m.ym === ym)?.date ?? `${ym}-28`;
};

// 1) Find common start: earliest month where ALL tickers have at least 13 months of prior data
const allTickerKeys = [...tickerData.keys()];
let commonStartYm = null;

// Collect all unique YMs from all tickers, sorted
const allUniqueYms = new Set();
for (const [, monthEnds] of tickerData) {
  for (const m of monthEnds) allUniqueYms.add(m.ym);
}
const sortedAllYms = [...allUniqueYms].sort();

for (const ym of sortedAllYms) {
  let allHaveEnoughData = true;
  for (const ticker of allTickerKeys) {
    const me = tickerData.get(ticker);
    const idx = me.findIndex((m) => m.ym === ym);
    if (idx < 12) {
      allHaveEnoughData = false;
      break;
    }
  }
  if (allHaveEnoughData) {
    commonStartYm = ym;
    break;
  }
}

if (!commonStartYm) {
  console.warn("[WARN] Cannot find a common start month for backtest — skipping backtest");
}

// 2) Collect all months from commonStart to effectiveRefYm
const backtestMonths = commonStartYm
  ? sortedAllYms.filter((ym) => ym >= commonStartYm && ym <= effectiveRefYm)
  : [];

// 3) Walk through each month
const monthlyRecords = []; // { date, ym, mode, aggressive: [{ticker, weight}], balanced: [{ticker, weight}] }

for (const ym of backtestMonths) {
  // Canary check: compute 13612W for all 4 canary tickers
  const canaryMomentums = CANARY.map((t) => {
    const me = tickerData.get(t);
    if (!me) return null;
    return calcMomentum13612W(me, ym);
  });

  // Skip months where canary data is incomplete
  if (canaryMomentums.some((m) => m === null)) continue;

  const canaryAllPositive = canaryMomentums.every((m) => m > 0);
  const monthMode = canaryAllPositive ? "offensive" : "defensive";

  // Compute relMomentum for all tickers at this month
  const monthRelMom = new Map();
  for (const [ticker, me] of tickerData) {
    const rm = calcRelMomentum(me, ym);
    if (rm !== null) monthRelMom.set(ticker, rm);
  }

  const bilRel = monthRelMom.get("BIL") ?? 0;

  let aggAlloc, balAlloc;

  if (monthMode === "offensive") {
    // Aggressive: G4 top 1 by relMomentum
    const g4Ranked = OFFENSIVE_G4
      .filter((t) => monthRelMom.has(t))
      .map((t) => ({ ticker: t, relMomentum: monthRelMom.get(t) }))
      .sort((a, b) => b.relMomentum - a.relMomentum);

    aggAlloc = g4Ranked.length > 0
      ? [{ ticker: g4Ranked[0].ticker, weight: 100 }]
      : [];

    // Balanced: G12 top 6, 16.67% each
    const g12Ranked = OFFENSIVE_G12
      .filter((t) => monthRelMom.has(t))
      .map((t) => ({ ticker: t, relMomentum: monthRelMom.get(t) }))
      .sort((a, b) => b.relMomentum - a.relMomentum);

    balAlloc = g12Ranked.slice(0, 6).map((item) => ({
      ticker: item.ticker,
      weight: round2(16.67)
    }));
  } else {
    // Defensive: top 3 from DEFENSIVE universe, BIL substitution
    const defRanked = DEFENSIVE
      .filter((t) => monthRelMom.has(t))
      .map((t) => ({ ticker: t, relMomentum: monthRelMom.get(t) }))
      .sort((a, b) => b.relMomentum - a.relMomentum);

    const defTop3 = defRanked.slice(0, 3).map((item) => ({
      ticker: item.relMomentum < bilRel ? "BIL" : item.ticker,
      weight: round2(33.33)
    }));

    aggAlloc = defTop3;
    balAlloc = defTop3;
  }

  monthlyRecords.push({
    date: getDate(ym),
    ym,
    mode: monthMode,
    aggressive: aggAlloc,
    balanced: balAlloc
  });
}

// 4) Compute equity curves
let eqAgg = 1.0;
let eqBal = 1.0;
let eqSpy = 1.0;
let eqSpyMa = 1.0;
let eq6040 = 1.0;

// Determine which bond ticker to use for 60/40 benchmark
const bond6040Ticker = tickerData.has("AGG") ? "AGG" : (tickerData.has("IEF") ? "IEF" : null);

const equityCurve = [];
const monthlyReturns = { aggressive: [], balanced: [], spy: [], spyMa: [], sixtyForty: [] };
const yearlyReturns = { aggressive: new Map(), balanced: new Map(), spy: new Map(), sixtyForty: new Map() };

// First entry
if (monthlyRecords.length > 0) {
  equityCurve.push({
    date: monthlyRecords[0].date,
    aggressive: round3(eqAgg),
    balanced: round3(eqBal),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040)
  });
}

for (let i = 0; i < monthlyRecords.length - 1; i++) {
  const cur = monthlyRecords[i];
  const next = monthlyRecords[i + 1];

  // Portfolio returns
  const calcPortReturn = (alloc) => {
    let ret = 0;
    for (const { ticker, weight } of alloc) {
      const c0 = getClose(ticker, cur.ym);
      const c1 = getClose(ticker, next.ym);
      if (c0 && c1 && c0 > 0) {
        ret += (weight / 100) * (c1 / c0 - 1);
      }
    }
    return ret;
  };

  const aggRet = calcPortReturn(cur.aggressive);
  const balRet = calcPortReturn(cur.balanced);

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

  eqAgg *= (1 + aggRet);
  eqBal *= (1 + balRet);
  eqSpy *= (1 + spyRet);
  eqSpyMa *= (1 + spyMaRet);
  eq6040 *= (1 + sixtyFortyRet);

  monthlyReturns.aggressive.push(aggRet);
  monthlyReturns.balanced.push(balRet);
  monthlyReturns.spy.push(spyRet);
  monthlyReturns.spyMa.push(spyMaRet);
  monthlyReturns.sixtyForty.push(sixtyFortyRet);

  // Track yearly returns for max annual loss
  const year = next.ym.slice(0, 4);
  for (const key of ["aggressive", "balanced", "spy", "sixtyForty"]) {
    const retVal = key === "aggressive" ? aggRet : key === "balanced" ? balRet : key === "spy" ? spyRet : sixtyFortyRet;
    if (!yearlyReturns[key].has(year)) yearlyReturns[key].set(year, 1.0);
    yearlyReturns[key].set(year, yearlyReturns[key].get(year) * (1 + retVal));
  }

  equityCurve.push({
    date: next.date,
    aggressive: round3(eqAgg),
    balanced: round3(eqBal),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040)
  });
}

/* ── 부분월(오늘) 포인트 ── */
const latestSpy = readLatestClose("SPY", CSV_DIR);
if (latestSpy && equityCurve.length > 0 && monthlyRecords.length > 0) {
  const lastEq = equityCurve[equityCurve.length - 1];
  const lastRecord = monthlyRecords[monthlyRecords.length - 1];
  if (latestSpy.date > lastRecord.date) {
    // aggressive 부분월
    let aggPartialRet = 0;
    for (const { ticker, weight } of (lastRecord.aggressive || [])) {
      const c0 = getClose(ticker, lastRecord.ym);
      const latest = readLatestClose(ticker, CSV_DIR);
      if (c0 && latest && c0 > 0) aggPartialRet += (weight / 100) * (latest.close / c0 - 1);
    }
    // balanced 부분월
    let balPartialRet = 0;
    for (const { ticker, weight } of (lastRecord.balanced || [])) {
      const c0 = getClose(ticker, lastRecord.ym);
      const latest = readLatestClose(ticker, CSV_DIR);
      if (c0 && latest && c0 > 0) balPartialRet += (weight / 100) * (latest.close / c0 - 1);
    }
    // SPY
    const spyRef = getClose("SPY", lastRecord.ym);
    const spyPartial = (spyRef && spyRef > 0) ? (latestSpy.close / spyRef - 1) : 0;
    // 60/40
    let bondPartial = 0;
    if (bond6040Ticker) {
      const bLatest = readLatestClose(bond6040Ticker, CSV_DIR);
      const bRef = getClose(bond6040Ticker, lastRecord.ym);
      if (bRef && bLatest && bRef > 0) bondPartial = bLatest.close / bRef - 1;
    }
    equityCurve.push({
      date: latestSpy.date,
      aggressive: round3(lastEq.aggressive * (1 + aggPartialRet)),
      balanced: round3(lastEq.balanced * (1 + balPartialRet)),
      spy: round3(lastEq.spy * (1 + spyPartial)),
      sixtyForty: round3(lastEq.sixtyForty * (1 + 0.6 * spyPartial + 0.4 * bondPartial)),
    });
  }
}

// 5) Compute summary metrics
const calcMetrics = (returns, finalEquity) => {
  const n = returns.length;
  if (n === 0) return { cagr: null, mdd: null, sharpe: null, maxAnnualLoss: null };

  // CAGR
  const cagr = (Math.pow(finalEquity, 12 / n) - 1) * 100;

  // MDD
  let peak = 1.0;
  let maxDD = 0;
  let eq = 1.0;
  for (const r of returns) {
    eq *= (1 + r);
    if (eq > peak) peak = eq;
    const dd = (eq - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  const mdd = maxDD * 100; // negative percentage

  // Sharpe
  const mean = returns.reduce((s, r) => s + r, 0) / n;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(12) : null;

  const downsideSq = returns.reduce((s, r) => s + Math.min(r, 0) ** 2, 0);
  const downsideDev = Math.sqrt(downsideSq / n);
  const sortino = downsideDev > 0 ? (mean / downsideDev) * Math.sqrt(12) : null;

  return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe), sortino: round3(sortino) };
};

const calcMaxAnnualLoss = (yearMap) => {
  let worst = 0;
  for (const [, cumReturn] of yearMap) {
    const annualReturn = (cumReturn - 1) * 100;
    if (annualReturn < worst) worst = annualReturn;
  }
  return round2(worst);
};

const aggMetrics = calcMetrics(monthlyReturns.aggressive, eqAgg);
const balMetrics = calcMetrics(monthlyReturns.balanced, eqBal);
const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
const spyMaMetrics = calcMetrics(monthlyReturns.spyMa, eqSpyMa);
const sixtyFortyMetrics = calcMetrics(monthlyReturns.sixtyForty, eq6040);

aggMetrics.maxAnnualLoss = calcMaxAnnualLoss(yearlyReturns.aggressive);
balMetrics.maxAnnualLoss = calcMaxAnnualLoss(yearlyReturns.balanced);

const totalMonths = monthlyRecords.length;
const defensiveMonths = monthlyRecords.filter((r) => r.mode === "defensive").length;
const defensiveRatio = totalMonths > 0 ? round2(defensiveMonths / totalMonths) : 0;

const backtestStartDate = monthlyRecords.length > 0 ? monthlyRecords[0].date : null;
const backtestEndDate = monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1].date : null;

/* ── History: last 36 months ── */
const historyLast36 = monthlyRecords.slice(-36).map((r) => ({
  date: r.date,
  mode: r.mode,
  aggressive: r.aggressive,
  balanced: r.balanced
}));

/* ── Output ── */
const payload = {
  generatedAt: new Date().toISOString(),
  signal: {
    mode,
    rebalanceDate,
    canaryPositiveCount
  },
  canary: canaryResults,
  offensiveRanking,
  offensiveRankingG4,
  defensiveRanking,
  portfolios: {
    aggressive: aggressivePortfolio,
    balanced: balancedPortfolio
  }
};

if (backtestStartDate && monthlyRecords.length > 1) {
  payload.backtest = {
    startDate: backtestStartDate,
    endDate: backtestEndDate,
    aggressive: { cagr: aggMetrics.cagr, mdd: aggMetrics.mdd, sharpe: aggMetrics.sharpe, sortino: aggMetrics.sortino, maxAnnualLoss: aggMetrics.maxAnnualLoss },
    balanced: { cagr: balMetrics.cagr, mdd: balMetrics.mdd, sharpe: balMetrics.sharpe, sortino: balMetrics.sortino, maxAnnualLoss: balMetrics.maxAnnualLoss },
    benchmarkSpy: { cagr: spyMetrics.cagr, mdd: spyMetrics.mdd, sharpe: spyMetrics.sharpe, sortino: spyMetrics.sortino },
    benchmarkSpyMa: { cagr: spyMaMetrics.cagr, mdd: spyMaMetrics.mdd, sharpe: spyMaMetrics.sharpe, sortino: spyMaMetrics.sortino },
    benchmark6040: { cagr: sixtyFortyMetrics.cagr, mdd: sixtyFortyMetrics.mdd, sharpe: sixtyFortyMetrics.sharpe, sortino: sixtyFortyMetrics.sortino },
    defensiveRatio,
    equityCurve
  };
  payload.history = historyLast36;

  // 오늘 기준 기간별 수익률 (일별 가격 사용)
  const lastRecord = monthlyRecords[monthlyRecords.length - 1];
  const aggAlloc = (lastRecord.aggressive || []).map(({ ticker, weight }) => ({ ticker, weight: weight / 100 }));
  const balAlloc = (lastRecord.balanced || []).map(({ ticker, weight }) => ({ ticker, weight: weight / 100 }));
  payload.periodReturns = {
    aggressive: calcPeriodReturns(equityCurve, "aggressive", aggAlloc, CSV_DIR, lastRecord.date),
    balanced: calcPeriodReturns(equityCurve, "balanced", balAlloc, CSV_DIR, lastRecord.date),
  };
}

fs.mkdirSync(SUMMARY_DIR, { recursive: true });
const body = `${JSON.stringify(payload, null, 2)}\n`;
fs.writeFileSync(OUT_FILE, body, "utf8");

console.log(`Generated ${OUT_FILE}`);
console.log(`  Tickers processed: ${processedCount}`);
console.log(`  Signal mode: ${mode}`);
console.log(`  Canary positive: ${canaryPositiveCount}/4`);
console.log(`  Rebalance date: ${rebalanceDate}`);

if (backtestStartDate && monthlyRecords.length > 1) {
  console.log(`  Backtest period: ${backtestStartDate} → ${backtestEndDate} (${monthlyRecords.length} months)`);
  console.log(`  BAA-A CAGR: ${aggMetrics.cagr}%  MDD: ${aggMetrics.mdd}%  Sharpe: ${aggMetrics.sharpe}`);
  console.log(`  BAA-B CAGR: ${balMetrics.cagr}%  MDD: ${balMetrics.mdd}%  Sharpe: ${balMetrics.sharpe}`);
  console.log(`  SPY   CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%`);
}
