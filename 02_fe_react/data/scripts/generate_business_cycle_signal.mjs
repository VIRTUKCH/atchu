#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "business-cycle");
const OUT_FILE = path.join(SUMMARY_DIR, "business_cycle_signal.json");

/* ── Universe ── */
// 국면 판단 지표
const INDICATOR_TICKERS = ["SPY", "IEF", "SHY"];
// 섹터 ETF (핵심 8개)
const SECTORS = ["XLK", "XLF", "XLV", "XLY", "XLP", "XLE", "XLI", "XLU"];
const ALL_TICKERS = [...new Set([...INDICATOR_TICKERS, ...SECTORS, "AGG"])];

const NAME_KO = {
  SPY: "S&P 500", IEF: "중기 국채 (7-10Y)", SHY: "단기 국채 (1-3Y)",
  XLK: "기술", XLF: "금융", XLV: "헬스케어", XLY: "경기소비재",
  XLP: "필수소비재", XLE: "에너지", XLI: "산업재", XLU: "유틸리티",
  AGG: "미국 종합채권",
};

/* ── 4국면 → 섹터 매핑 ── */
const PHASE_SECTORS = {
  early:     ["XLF", "XLI"],           // 회복기: 금융, 산업재
  mid:       ["XLK", "XLY"],           // 호황기: 기술, 경기소비재
  late:      ["XLE", "XLV", "XLP"],    // 둔화기: 에너지, 헬스케어, 필수소비재
  recession: ["XLU", "XLV", "XLP"],    // 침체기: 유틸리티, 헬스케어, 필수소비재
};

const PHASE_LABELS = {
  early: "회복기", mid: "호황기", late: "둔화기", recession: "침체기",
};

const PHASE_CONDITIONS = {
  early: "주식↑ + 금리↓", mid: "주식↑ + 금리↑",
  late: "주식↓ + 금리↑", recession: "주식↓ + 금리↓",
};

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

/* ── Step 3: 국면 판단 함수들 ── */

/** SPY 6개월 수익률 (%) */
const calcReturn6m = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 6) return null;
  const p0 = monthEnds[idx].close;
  const p6 = monthEnds[idx - 6].close;
  if (!p0 || !p6 || p6 === 0) return null;
  return (p0 / p6 - 1) * 100;
};

/**
 * IEF/SHY 비율의 6개월 변화율 (%)
 * 비율 상승 = 장기채 아웃퍼폼 = 금리 하락기
 * 비율 하락 = 단기채 아웃퍼폼 = 금리 상승기
 */
const calcRateDirection = (iefMonthEnds, shyMonthEnds, refYm) => {
  const iefIdx = iefMonthEnds.findIndex((m) => m.ym === refYm);
  const shyIdx = shyMonthEnds.findIndex((m) => m.ym === refYm);
  if (iefIdx < 6 || shyIdx < 6) return null;

  const iefNow = iefMonthEnds[iefIdx].close;
  const iefPrev = iefMonthEnds[iefIdx - 6].close;
  const shyNow = shyMonthEnds[shyIdx].close;
  const shyPrev = shyMonthEnds[shyIdx - 6].close;

  if (!iefNow || !iefPrev || !shyNow || !shyPrev || shyNow === 0 || shyPrev === 0) return null;

  const ratioNow = iefNow / shyNow;
  const ratioPrev = iefPrev / shyPrev;
  return (ratioNow / ratioPrev - 1) * 100;
};

/**
 * 국면 결정
 * 주식↑ + 금리↓(IEF/SHY비율↑) → early (회복기)
 * 주식↑ + 금리↑(IEF/SHY비율↓) → mid (호황기)
 * 주식↓ + 금리↑(IEF/SHY비율↓) → late (둔화기)
 * 주식↓ + 금리↓(IEF/SHY비율↑) → recession (침체기)
 */
const determinePhase = (spyMomentum, rateDirection) => {
  if (spyMomentum === null || rateDirection === null) return null;
  const stockUp = spyMomentum > 0;
  const rateDown = rateDirection > 0; // IEF/SHY 비율 상승 = 금리 하락

  if (stockUp && rateDown) return "early";
  if (stockUp && !rateDown) return "mid";
  if (!stockUp && !rateDown) return "late";
  return "recession";
};

/** 국면에 따른 포트폴리오 (균등 배분) */
const buildPortfolio = (phase) => {
  const sectors = PHASE_SECTORS[phase];
  if (!sectors) return [];
  const weight = round2(100 / sectors.length);
  return sectors.map((ticker) => ({
    ticker,
    nameKo: NAME_KO[ticker],
    weight,
  }));
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
  if (monthEnds.length < 7) {
    console.warn(`[WARN] Not enough monthly data for ${ticker} (${monthEnds.length} months, need >= 7)`);
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

/* ── Step 4: Current signal ── */
const spyMonthEnds = tickerData.get("SPY");
const iefMonthEnds = tickerData.get("IEF");
const shyMonthEnds = tickerData.get("SHY");

const spyMomentum6m = round2(calcReturn6m(spyMonthEnds, effectiveRefYm));
const rateDirection6m = round2(calcRateDirection(iefMonthEnds, shyMonthEnds, effectiveRefYm));
const phase = determinePhase(spyMomentum6m, rateDirection6m);

const rebalanceDate = getDate(effectiveRefYm);
const portfolio = buildPortfolio(phase);

console.log(`  SPY 6M momentum: ${spyMomentum6m}%`);
console.log(`  Rate direction (IEF/SHY 6M): ${rateDirection6m}%`);
console.log(`  Phase: ${phase} (${PHASE_LABELS[phase]})`);

/* ── Step 5: Sector universe info ── */
const sectorUniverse = SECTORS.map((t) => {
  // 어느 국면에 속하는 섹터인지
  const belongsTo = Object.entries(PHASE_SECTORS)
    .filter(([, tickers]) => tickers.includes(t))
    .map(([p]) => p);
  return {
    ticker: t,
    nameKo: NAME_KO[t],
    phases: belongsTo,
    currentPhaseMatch: phase ? PHASE_SECTORS[phase]?.includes(t) : false,
  };
});

/* ── Step 6: Backtest ── */
// commonStartYm: 모든 티커가 6개월 이전 데이터를 가진 최초 월
const allUniqueYms = new Set();
for (const [, monthEnds] of tickerData) {
  for (const m of monthEnds) allUniqueYms.add(m.ym);
}
const sortedAllYms = [...allUniqueYms].sort();

let commonStartYm = null;
for (const ym of sortedAllYms) {
  let allReady = true;
  // 국면 판단에 6개월, 섹터 수익률에 최소 1개월 이전 필요
  for (const ticker of [...INDICATOR_TICKERS, ...SECTORS]) {
    const me = tickerData.get(ticker);
    if (!me) { allReady = false; break; }
    const idx = me.findIndex((m) => m.ym === ym);
    if (idx < 6) { allReady = false; break; }
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
  const iefMe = tickerData.get("IEF");
  const shyMe = tickerData.get("SHY");

  const spyMom = calcReturn6m(spyMe, ym);
  const rateDir = calcRateDirection(iefMe, shyMe, ym);
  const monthPhase = determinePhase(spyMom, rateDir);

  if (monthPhase === null) continue;

  const alloc = buildPortfolio(monthPhase);

  monthlyRecords.push({
    date: getDate(ym),
    ym,
    phase: monthPhase,
    phaseLabel: PHASE_LABELS[monthPhase],
    spyMomentum6m: round2(spyMom),
    rateDirection6m: round2(rateDir),
    portfolio: alloc,
  });
}

// Equity curve
let eqStrategy = 1.0;
let eqSpy = 1.0;
let eq6040 = 1.0;

const bond6040Ticker = tickerData.has("AGG") ? "AGG" : (tickerData.has("IEF") ? "IEF" : null);

const equityCurve = [];
const monthlyReturns = { businessCycle: [], spy: [], sixtyForty: [] };

if (monthlyRecords.length > 0) {
  equityCurve.push({
    date: monthlyRecords[0].date,
    businessCycle: round3(eqStrategy),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040),
  });
}

for (let i = 0; i < monthlyRecords.length - 1; i++) {
  const cur = monthlyRecords[i];
  const next = monthlyRecords[i + 1];

  // Strategy return
  let strategyRet = 0;
  for (const { ticker, weight } of cur.portfolio) {
    const c0 = getClose(ticker, cur.ym);
    const c1 = getClose(ticker, next.ym);
    if (c0 && c1 && c0 > 0) {
      strategyRet += (weight / 100) * (c1 / c0 - 1);
    }
  }

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

  eqStrategy *= (1 + strategyRet);
  eqSpy *= (1 + spyRet);
  eq6040 *= (1 + sixtyFortyRet);

  monthlyReturns.businessCycle.push(strategyRet);
  monthlyReturns.spy.push(spyRet);
  monthlyReturns.sixtyForty.push(sixtyFortyRet);

  equityCurve.push({
    date: next.date,
    businessCycle: round3(eqStrategy),
    spy: round3(eqSpy),
    sixtyForty: round3(eq6040),
  });
}

// Metrics
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

  // Max annual loss
  let worstYear = 0;
  for (let i = 0; i < n; i += 12) {
    const yearSlice = returns.slice(i, Math.min(i + 12, n));
    const yearReturn = yearSlice.reduce((acc, r) => acc * (1 + r), 1) - 1;
    if (yearReturn < worstYear) worstYear = yearReturn;
  }
  const maxAnnualLoss = worstYear * 100;

  return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe), maxAnnualLoss: round2(maxAnnualLoss) };
};

const strategyMetrics = calcMetrics(monthlyReturns.businessCycle, eqStrategy);
const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
const sixtyFortyMetrics = calcMetrics(monthlyReturns.sixtyForty, eq6040);

// Phase distribution
const phaseCount = { early: 0, mid: 0, late: 0, recession: 0 };
for (const r of monthlyRecords) phaseCount[r.phase]++;
const totalMonths = monthlyRecords.length;
const phaseDistribution = {};
for (const [p, count] of Object.entries(phaseCount)) {
  phaseDistribution[p] = totalMonths > 0 ? round2(count / totalMonths) : 0;
}

const backtestStartDate = monthlyRecords.length > 0 ? monthlyRecords[0].date : null;
const backtestEndDate = monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1].date : null;

/* ── History: last 36 months ── */
const historyLast36 = monthlyRecords.slice(-36).map((r) => ({
  date: r.date,
  phase: r.phase,
  phaseLabel: r.phaseLabel,
  spyMomentum6m: r.spyMomentum6m,
  rateDirection6m: r.rateDirection6m,
  portfolio: r.portfolio,
}));

/* ── Output ── */
const payload = {
  generatedAt: new Date().toISOString(),
  signal: {
    phase,
    phaseLabel: PHASE_LABELS[phase],
    rebalanceDate,
  },
  phaseIndicators: {
    spyMomentum6m,
    rateDirection6m,
    spyMomentumSign: spyMomentum6m > 0 ? "positive" : "negative",
    rateDirectionSign: rateDirection6m > 0 ? "negative" : "positive", // 금리 방향: 비율↑=금리↓
  },
  phaseMapping: Object.fromEntries(
    Object.entries(PHASE_SECTORS).map(([p, tickers]) => [
      p,
      {
        label: PHASE_LABELS[p],
        condition: PHASE_CONDITIONS[p],
        sectors: tickers.map((t) => ({ ticker: t, nameKo: NAME_KO[t] })),
      },
    ])
  ),
  sectorUniverse,
  portfolio: {
    phase,
    phaseLabel: PHASE_LABELS[phase],
    allocations: portfolio,
  },
};

if (backtestStartDate && monthlyRecords.length > 1) {
  payload.backtest = {
    startDate: backtestStartDate,
    endDate: backtestEndDate,
    businessCycle: strategyMetrics,
    benchmarkSpy: spyMetrics,
    benchmark6040: sixtyFortyMetrics,
    phaseDistribution,
    equityCurve,
  };
  payload.history = historyLast36;
}

fs.mkdirSync(SUMMARY_DIR, { recursive: true });
const body = `${JSON.stringify(payload, null, 2)}\n`;
fs.writeFileSync(OUT_FILE, body, "utf8");

console.log(`\nGenerated ${OUT_FILE}`);
console.log(`  Tickers processed: ${processedCount}`);
console.log(`  Phase: ${phase} (${PHASE_LABELS[phase]})`);
console.log(`  SPY 6M: ${spyMomentum6m}%  |  Rate dir (IEF/SHY): ${rateDirection6m}%`);
console.log(`  Portfolio: ${portfolio.map((a) => `${a.ticker}(${a.weight}%)`).join(", ")}`);
console.log(`  Rebalance date: ${rebalanceDate}`);

if (backtestStartDate && monthlyRecords.length > 1) {
  console.log(`\n  Backtest: ${backtestStartDate} → ${backtestEndDate} (${monthlyRecords.length} months)`);
  console.log(`  Strategy CAGR: ${strategyMetrics.cagr}%  MDD: ${strategyMetrics.mdd}%  Sharpe: ${strategyMetrics.sharpe}`);
  console.log(`  SPY      CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%  Sharpe: ${spyMetrics.sharpe}`);
  console.log(`  60/40    CAGR: ${sixtyFortyMetrics.cagr}%  MDD: ${sixtyFortyMetrics.mdd}%`);
  console.log(`  Phase distribution: ${Object.entries(phaseDistribution).map(([p, r]) => `${PHASE_LABELS[p]}=${Math.round(r * 100)}%`).join(", ")}`);
}
