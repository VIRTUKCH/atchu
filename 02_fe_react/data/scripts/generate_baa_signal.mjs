#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "baa");
const OUT_FILE = path.join(SUMMARY_DIR, "baa_signal.json");

/* ── Universes ── */
const CANARY = ["SPY", "EEM", "EFA", "AGG"];
const OFFENSIVE_G12 = ["SPY", "QQQ", "IWM", "VGK", "EWJ", "VWO", "VNQ", "DBC", "GLD", "TLT", "HYG", "LQD"];
const OFFENSIVE_G4 = ["SPY", "QQQ", "EFA", "AGG"];
const DEFENSIVE = ["TIP", "DBC", "BIL", "IEF", "TLT", "LQD", "AGG"];

const NAME_KO = {
  SPY: "S&P 500", QQQ: "나스닥 100", IWM: "러셀 2000",
  VGK: "유럽", EWJ: "일본", VWO: "신흥국 (FTSE)", EEM: "신흥국 (MSCI)",
  EFA: "선진국 (EAFE)", VNQ: "부동산", DBC: "원자재 종합",
  GLD: "금", TLT: "장기 국채", HYG: "하이일드 채권", LQD: "투자등급 회사채",
  TIP: "물가연동 국채", BIL: "초단기 국채", IEF: "중기 국채",
  AGG: "미국 종합채권"
};

const ALL_TICKERS = [...new Set([...CANARY, ...OFFENSIVE_G12, ...OFFENSIVE_G4, ...DEFENSIVE])];

/* ── Helpers ── */
const round2 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 100) / 100);
const round3 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 1000) / 1000);

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

  // Group by year-month, take last trading day of each month
  const monthMap = new Map();
  for (const row of records) {
    const date = String(row.Date);
    const ym = date.slice(0, 7); // "YYYY-MM"
    const close = parseNumber(row.Adjusted_close ?? row.Close);
    if (close === null) continue;
    // Always overwrite — records are sorted ascending, so last entry wins
    monthMap.set(ym, { date, close });
  }

  const monthEnds = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, data]) => ({ ym, date: data.date, close: data.close }));

  return monthEnds;
};

/* ── Step 2: Determine reference month ── */
const getReferenceMonth = () => {
  const now = new Date();
  // Go to first day of current month, then subtract one day → last day of previous month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
  const year = lastDayPrevMonth.getFullYear();
  const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

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
  const monthEnds = readMonthEnds(ticker);
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
let eq6040 = 1.0;

// Determine which bond ticker to use for 60/40 benchmark
const bond6040Ticker = tickerData.has("AGG") ? "AGG" : (tickerData.has("IEF") ? "IEF" : null);

const equityCurve = [];
const monthlyReturns = { aggressive: [], balanced: [], spy: [], sixtyForty: [] };
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
  eq6040 *= (1 + sixtyFortyRet);

  monthlyReturns.aggressive.push(aggRet);
  monthlyReturns.balanced.push(balRet);
  monthlyReturns.spy.push(spyRet);
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

  return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe) };
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
    aggressive: { cagr: aggMetrics.cagr, mdd: aggMetrics.mdd, sharpe: aggMetrics.sharpe, maxAnnualLoss: aggMetrics.maxAnnualLoss },
    balanced: { cagr: balMetrics.cagr, mdd: balMetrics.mdd, sharpe: balMetrics.sharpe, maxAnnualLoss: balMetrics.maxAnnualLoss },
    benchmarkSpy: { cagr: spyMetrics.cagr, mdd: spyMetrics.mdd, sharpe: spyMetrics.sharpe },
    benchmark6040: { cagr: sixtyFortyMetrics.cagr, mdd: sixtyFortyMetrics.mdd, sharpe: sixtyFortyMetrics.sharpe },
    defensiveRatio,
    equityCurve
  };
  payload.history = historyLast36;
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
