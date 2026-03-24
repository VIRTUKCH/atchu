#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "haa");
const OUT_FILE = path.join(SUMMARY_DIR, "haa_signal.json");

/* ── Universes ── */
const CANARY = ["TIP"];
const OFFENSIVE = ["SPY", "EFA", "EEM", "VNQ", "DBC", "GLD", "TLT"];
const DEFENSIVE = ["IEF", "BIL"];

const NAME_KO = {
  SPY: "S&P 500", EFA: "선진국 (EAFE)", EEM: "신흥국 (MSCI)",
  VNQ: "부동산", DBC: "원자재 종합", GLD: "금", TLT: "장기 국채",
  TIP: "물가연동 국채", IEF: "중기 국채", BIL: "초단기 국채"
};

const ALL_TICKERS = [...new Set([...CANARY, ...OFFENSIVE, ...DEFENSIVE])];

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

  // Group by year-month, take last trading day of each month
  const monthMap = new Map();
  for (const row of records) {
    const date = String(row.Date);
    const ym = date.slice(0, 7);
    const close = parseNumber(row.Adjusted_close ?? row.Close);
    if (close === null) continue;
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
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
  const year = lastDayPrevMonth.getFullYear();
  const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/* ── Step 3: HAA momentum — equal-weight average of 1,3,6,12 month returns ── */
const calcMomentumAvg = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 0 || idx < 12) return null;

  const p0 = monthEnds[idx].close;
  const p1 = monthEnds[idx - 1]?.close;
  const p3 = monthEnds[idx - 3]?.close;
  const p6 = monthEnds[idx - 6]?.close;
  const p12 = monthEnds[idx - 12]?.close;

  if ([p0, p1, p3, p6, p12].some((v) => v === null || v === undefined || v === 0)) return null;

  const mom = ((p0 / p1 - 1) + (p0 / p3 - 1) + (p0 / p6 - 1) + (p0 / p12 - 1)) / 4;
  return mom * 100; // percentage
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
const minLatest = allYms.sort()[0];

if (allYms.some((ym) => ym < effectiveRefYm)) {
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

// Compute momentum for all tickers
const metrics = new Map();

for (const [ticker, monthEnds] of tickerData) {
  const momentum = calcMomentumAvg(monthEnds, effectiveRefYm);

  if (momentum === null) {
    console.warn(`[WARN] Could not compute metrics for ${ticker}`);
    continue;
  }

  metrics.set(ticker, { momentum: round2(momentum) });
}

// Rebalance date
const refMonthEnds = tickerData.get("SPY") || [...tickerData.values()][0];
const refEntry = refMonthEnds?.find((m) => m.ym === effectiveRefYm);
const rebalanceDate = refEntry?.date || `${effectiveRefYm}-28`;

/* ── Step 4: Canary judgment — TIP single canary ── */
const canaryResults = CANARY.map((ticker) => {
  const m = metrics.get(ticker);
  return {
    ticker,
    nameKo: NAME_KO[ticker] || ticker,
    momentum: m?.momentum ?? null
  };
});

const canaryPositive = canaryResults.length > 0 && canaryResults[0].momentum !== null && canaryResults[0].momentum > 0;
const mode = canaryPositive ? "offensive" : "defensive";

/* ── Step 5: Portfolio allocation ── */

const buildOffensiveAllocations = () => {
  const ranked = OFFENSIVE
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.momentum - a.momentum);

  const top4 = ranked.slice(0, 4).map((item) => {
    const shouldReplace = item.momentum < 0;
    return {
      ticker: shouldReplace ? "BIL" : item.ticker,
      nameKo: shouldReplace ? NAME_KO["BIL"] : (NAME_KO[item.ticker] || item.ticker),
      weight: 25,
      momentum: shouldReplace ? (metrics.get("BIL")?.momentum ?? null) : item.momentum,
      replacedByBil: shouldReplace,
      originalTicker: shouldReplace ? item.ticker : undefined
    };
  });

  return top4;
};

const buildDefensiveAllocations = () => {
  const iefMom = metrics.get("IEF")?.momentum ?? null;
  const shouldReplace = iefMom === null || iefMom < 0;
  return [{
    ticker: shouldReplace ? "BIL" : "IEF",
    nameKo: shouldReplace ? NAME_KO["BIL"] : NAME_KO["IEF"],
    weight: 100,
    momentum: shouldReplace ? (metrics.get("BIL")?.momentum ?? null) : iefMom,
    replacedByBil: shouldReplace,
    originalTicker: shouldReplace ? "IEF" : undefined
  }];
};

let haaPortfolio;

if (mode === "offensive") {
  haaPortfolio = { mode: "offensive", allocations: buildOffensiveAllocations() };
} else {
  haaPortfolio = { mode: "defensive", allocations: buildDefensiveAllocations() };
}

/* ── Step 6: Rankings ── */
const offensiveRanking = OFFENSIVE
  .filter((t) => metrics.has(t))
  .map((t) => {
    const m = metrics.get(t);
    const isSelected = mode === "offensive" && haaPortfolio.allocations.some((a) => a.ticker === t || a.originalTicker === t);
    const isReplaced = mode === "offensive" && haaPortfolio.allocations.some((a) => a.originalTicker === t);
    return {
      ticker: t,
      nameKo: NAME_KO[t] || t,
      momentum: m.momentum,
      selected: isSelected,
      replacedByBil: isReplaced
    };
  })
  .sort((a, b) => b.momentum - a.momentum);

const iefMom = metrics.get("IEF")?.momentum ?? null;
const defensiveInfo = {
  ticker: "IEF",
  nameKo: NAME_KO["IEF"],
  momentum: iefMom,
  replacedByBil: iefMom === null || iefMom < 0
};

/* ── Backtest ── */

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

const getDate = (ym) => {
  const spyData = tickerData.get("SPY") || [...tickerData.values()][0];
  return spyData?.find((m) => m.ym === ym)?.date ?? `${ym}-28`;
};

// 1) Find common start
const allTickerKeys = [...tickerData.keys()];
let commonStartYm = null;

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

// 2) Collect backtest months
const backtestMonths = commonStartYm
  ? sortedAllYms.filter((ym) => ym >= commonStartYm && ym <= effectiveRefYm)
  : [];

// 3) Walk through each month
const monthlyRecords = [];

for (const ym of backtestMonths) {
  // Canary check: TIP momentum
  const tipMe = tickerData.get("TIP");
  if (!tipMe) continue;
  const tipMom = calcMomentumAvg(tipMe, ym);
  if (tipMom === null) continue;

  const monthMode = tipMom > 0 ? "offensive" : "defensive";

  // Compute momentum for all tickers at this month
  const monthMom = new Map();
  for (const [ticker, me] of tickerData) {
    const mom = calcMomentumAvg(me, ym);
    if (mom !== null) monthMom.set(ticker, mom);
  }

  let haaAlloc;

  if (monthMode === "offensive") {
    // Top 4 from OFFENSIVE by momentum, 25% each, BIL substitution for negative
    const ranked = OFFENSIVE
      .filter((t) => monthMom.has(t))
      .map((t) => ({ ticker: t, momentum: monthMom.get(t) }))
      .sort((a, b) => b.momentum - a.momentum);

    haaAlloc = ranked.slice(0, 4).map((item) => ({
      ticker: item.momentum < 0 ? "BIL" : item.ticker,
      weight: 25
    }));
  } else {
    // Defensive: IEF 100%, or BIL if IEF momentum < 0
    const iefMomVal = monthMom.get("IEF") ?? null;
    haaAlloc = [{
      ticker: (iefMomVal === null || iefMomVal < 0) ? "BIL" : "IEF",
      weight: 100
    }];
  }

  monthlyRecords.push({
    date: getDate(ym),
    ym,
    mode: monthMode,
    haa: haaAlloc
  });
}

// 4) Compute equity curves
let eqHaa = 1.0;
let eqSpy = 1.0;
let eqSpyMa = 1.0;
let eq6040 = 1.0;

const bond6040Ticker = tickerData.has("AGG") ? "AGG" : (tickerData.has("IEF") ? "IEF" : null);

const equityCurve = [];
const monthlyReturns = { haa: [], spy: [], spyMa: [], sixtyForty: [] };
const yearlyReturns = { haa: new Map(), spy: new Map(), sixtyForty: new Map() };

if (monthlyRecords.length > 0) {
  equityCurve.push({
    date: monthlyRecords[0].date,
    haa: round3(eqHaa),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040)
  });
}

for (let i = 0; i < monthlyRecords.length - 1; i++) {
  const cur = monthlyRecords[i];
  const next = monthlyRecords[i + 1];

  // Portfolio return
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

  const haaRet = calcPortReturn(cur.haa);

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

  eqHaa *= (1 + haaRet);
  eqSpy *= (1 + spyRet);
  eqSpyMa *= (1 + spyMaRet);
  eq6040 *= (1 + sixtyFortyRet);

  monthlyReturns.haa.push(haaRet);
  monthlyReturns.spy.push(spyRet);
  monthlyReturns.spyMa.push(spyMaRet);
  monthlyReturns.sixtyForty.push(sixtyFortyRet);

  // Track yearly returns
  const year = next.ym.slice(0, 4);
  for (const key of ["haa", "spy", "sixtyForty"]) {
    const retVal = key === "haa" ? haaRet : key === "spy" ? spyRet : sixtyFortyRet;
    if (!yearlyReturns[key].has(year)) yearlyReturns[key].set(year, 1.0);
    yearlyReturns[key].set(year, yearlyReturns[key].get(year) * (1 + retVal));
  }

  equityCurve.push({
    date: next.date,
    haa: round3(eqHaa),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040)
  });
}

/* ── 부분월(오늘) 포인트 ── */
const latestSpy = readLatestClose("SPY");
if (latestSpy && equityCurve.length > 0 && monthlyRecords.length > 0) {
  const lastEq = equityCurve[equityCurve.length - 1];
  const lastRecord = monthlyRecords[monthlyRecords.length - 1];
  if (latestSpy.date > lastRecord.date) {
    let partialRet = 0;
    if (lastRecord.mode === "offensive") {
      for (const { ticker, weight } of lastRecord.haa) {
        const c0 = getClose(ticker, lastRecord.ym);
        const latest = readLatestClose(ticker);
        if (c0 && latest && c0 > 0) partialRet += (weight / 100) * (latest.close / c0 - 1);
      }
    } else {
      for (const { ticker, weight } of lastRecord.haa) {
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
      haa: round3(lastEq.haa * (1 + partialRet)),
      spy: round3(lastEq.spy * (1 + spyPartial)),
      sixtyForty: round3(lastEq.sixtyForty * (1 + 0.6 * spyPartial + 0.4 * bondPartial)),
    });
  }
}

// 5) Compute summary metrics
const calcMetrics = (returns, finalEquity) => {
  const n = returns.length;
  if (n === 0) return { cagr: null, mdd: null, sharpe: null, maxAnnualLoss: null };

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

const calcMaxAnnualLoss = (yearMap) => {
  let worst = 0;
  for (const [, cumReturn] of yearMap) {
    const annualReturn = (cumReturn - 1) * 100;
    if (annualReturn < worst) worst = annualReturn;
  }
  return round2(worst);
};

const haaMetrics = calcMetrics(monthlyReturns.haa, eqHaa);
const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
const spyMaMetrics = calcMetrics(monthlyReturns.spyMa, eqSpyMa);
const sixtyFortyMetrics = calcMetrics(monthlyReturns.sixtyForty, eq6040);

haaMetrics.maxAnnualLoss = calcMaxAnnualLoss(yearlyReturns.haa);

const totalMonths = monthlyRecords.length;
const defensiveMonths = monthlyRecords.filter((r) => r.mode === "defensive").length;
const defensiveRatio = totalMonths > 0 ? round2(defensiveMonths / totalMonths) : 0;

const backtestStartDate = monthlyRecords.length > 0 ? monthlyRecords[0].date : null;
const backtestEndDate = monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1].date : null;

/* ── History: last 36 months ── */
const historyLast36 = monthlyRecords.slice(-36).map((r) => ({
  date: r.date,
  mode: r.mode,
  haa: r.haa
}));

/* ── Output ── */
const payload = {
  generatedAt: new Date().toISOString(),
  signal: {
    mode,
    rebalanceDate,
    canaryPositive
  },
  canary: canaryResults,
  offensiveRanking,
  defensiveInfo,
  portfolios: {
    haa: haaPortfolio
  }
};

if (backtestStartDate && monthlyRecords.length > 1) {
  payload.backtest = {
    startDate: backtestStartDate,
    endDate: backtestEndDate,
    haa: { cagr: haaMetrics.cagr, mdd: haaMetrics.mdd, sharpe: haaMetrics.sharpe, sortino: haaMetrics.sortino, maxAnnualLoss: haaMetrics.maxAnnualLoss },
    benchmarkSpy: { cagr: spyMetrics.cagr, mdd: spyMetrics.mdd, sharpe: spyMetrics.sharpe, sortino: spyMetrics.sortino },
    benchmarkSpyMa: { cagr: spyMaMetrics.cagr, mdd: spyMaMetrics.mdd, sharpe: spyMaMetrics.sharpe, sortino: spyMaMetrics.sortino },
    benchmark6040: { cagr: sixtyFortyMetrics.cagr, mdd: sixtyFortyMetrics.mdd, sharpe: sixtyFortyMetrics.sharpe, sortino: sixtyFortyMetrics.sortino },
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
console.log(`  Canary (TIP) positive: ${canaryPositive}`);
console.log(`  Rebalance date: ${rebalanceDate}`);

if (backtestStartDate && monthlyRecords.length > 1) {
  console.log(`  Backtest period: ${backtestStartDate} → ${backtestEndDate} (${monthlyRecords.length} months)`);
  console.log(`  HAA  CAGR: ${haaMetrics.cagr}%  MDD: ${haaMetrics.mdd}%  Sharpe: ${haaMetrics.sharpe}`);
  console.log(`  SPY  CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%`);
}
