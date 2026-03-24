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
// 국면 판단: SPY 13612W 모멘텀만 사용
const INDICATOR_TICKERS = ["SPY"];
// 섹터 ETF (핵심 8개)
const SECTORS = ["XLK", "XLF", "XLV", "XLY", "XLP", "XLE", "XLI", "XLU"];
const ALL_TICKERS = [...new Set([...INDICATOR_TICKERS, ...SECTORS, "AGG"])];

const NAME_KO = {
  SPY: "S&P 500",
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
  mid:       "모멘텀 양수 & 상승 중",
  late:      "모멘텀 양수 & 하락 중",
  early:     "모멘텀 음수 & 상승 중",
  recession: "모멘텀 음수 & 하락 중",
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

/* ── Step 3: 국면 판단 — SPY 13612W 모멘텀 ── */

/**
 * BAA 가중 모멘텀 13612W
 * mom = 12×(1M수익) + 4×(3M수익) + 2×(6M수익) + 1×(12M수익)
 * 12개월 이전 데이터 필요
 */
const calc13612W = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 12) return null;
  const p0 = monthEnds[idx].close;
  const p1 = monthEnds[idx - 1].close;
  const p3 = monthEnds[idx - 3].close;
  const p6 = monthEnds[idx - 6].close;
  const p12 = monthEnds[idx - 12].close;
  if (!p0 || !p1 || !p3 || !p6 || !p12) return null;
  if (p1 === 0 || p3 === 0 || p6 === 0 || p12 === 0) return null;
  return 12 * (p0 / p1 - 1) + 4 * (p0 / p3 - 1) + 2 * (p0 / p6 - 1) + 1 * (p0 / p12 - 1);
};

/**
 * 국면 결정: 13612W 레벨(양/음) × 방향(상승/하락)
 *
 *                mom 상승 중(↑)         mom 하락 중(↓)
 * mom > 0       호황기 (Mid)           둔화기 (Late)
 * mom < 0       회복기 (Early)         침체기 (Recession)
 *
 * 회복기: 모멘텀 아직 음수지만 바닥 찍고 올라오는 중
 * 호황기: 모멘텀 양수이고 계속 상승
 * 둔화기: 모멘텀 양수지만 꺾이기 시작
 * 침체기: 모멘텀 음수이고 계속 하락
 */
const determinePhase = (momCurrent, momPrev) => {
  if (momCurrent === null || momPrev === null) return null;
  const positive = momCurrent > 0;
  const rising = momCurrent > momPrev;

  if (positive && rising) return "mid";
  if (positive && !rising) return "late";
  if (!positive && rising) return "early";
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
  if (monthEnds.length < 13) {
    console.warn(`[WARN] Not enough monthly data for ${ticker} (${monthEnds.length} months, need >= 13)`);
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

// 현재월 + 전월 13612W 계산
const momCurrent = round2(calc13612W(spyMonthEnds, effectiveRefYm));
// 전월 기준 계산: effectiveRefYm에서 1개월 전
const prevYmIdx = spyMonthEnds.findIndex((m) => m.ym === effectiveRefYm) - 1;
const prevYm = prevYmIdx >= 0 ? spyMonthEnds[prevYmIdx].ym : null;
const momPrev = prevYm ? round2(calc13612W(spyMonthEnds, prevYm)) : null;

const phase = determinePhase(momCurrent, momPrev);
const rebalanceDate = getDate(effectiveRefYm);
const portfolio = buildPortfolio(phase);

const direction = momCurrent !== null && momPrev !== null
  ? (momCurrent > momPrev ? "rising" : "falling")
  : null;

console.log(`  SPY 13612W: ${momCurrent} (prev: ${momPrev}) → ${direction}`);
console.log(`  Phase: ${phase} (${PHASE_LABELS[phase]})`);

/* ── Step 5: Sector universe info ── */
const sectorUniverse = SECTORS.map((t) => {
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
// commonStartYm: SPY 13612W에 13개월, 섹터에 12개월 이전 데이터 필요
const allUniqueYms = new Set();
for (const [, monthEnds] of tickerData) {
  for (const m of monthEnds) allUniqueYms.add(m.ym);
}
const sortedAllYms = [...allUniqueYms].sort();

let commonStartYm = null;
for (const ym of sortedAllYms) {
  let allReady = true;
  for (const ticker of [...INDICATOR_TICKERS, ...SECTORS]) {
    const me = tickerData.get(ticker);
    if (!me) { allReady = false; break; }
    const idx = me.findIndex((m) => m.ym === ym);
    // 13612W에 12개월 이전 + 전월 방향 판단에 1개월 더 = 13개월
    if (idx < 13) { allReady = false; break; }
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
  const mom = calc13612W(spyMe, ym);

  // 전월 13612W
  const ymIdx = spyMe.findIndex((m) => m.ym === ym);
  const prevYmBt = ymIdx > 0 ? spyMe[ymIdx - 1].ym : null;
  const momPrevBt = prevYmBt ? calc13612W(spyMe, prevYmBt) : null;

  const monthPhase = determinePhase(mom, momPrevBt);
  if (monthPhase === null) continue;

  const alloc = buildPortfolio(monthPhase);

  monthlyRecords.push({
    date: getDate(ym),
    ym,
    phase: monthPhase,
    phaseLabel: PHASE_LABELS[monthPhase],
    momentum13612w: round2(mom),
    momentum13612wPrev: round2(momPrevBt),
    direction: mom > momPrevBt ? "rising" : "falling",
    portfolio: alloc,
  });
}

// Equity curve
let eqStrategy = 1.0;
let eqSpy = 1.0;
let eq6040 = 1.0;

const bond6040Ticker = tickerData.has("AGG") ? "AGG" : null;

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

/* ── 부분월(오늘) 포인트 ── */
const latestSpy = readLatestClose("SPY");
if (latestSpy && equityCurve.length > 0 && monthlyRecords.length > 0) {
  const lastEq = equityCurve[equityCurve.length - 1];
  const lastRecord = monthlyRecords[monthlyRecords.length - 1];
  if (latestSpy.date > lastRecord.date) {
    let partialRet = 0;
    for (const { ticker, weight } of lastRecord.portfolio) {
      const c0 = getClose(ticker, lastRecord.ym);
      const latest = readLatestClose(ticker);
      if (c0 && latest && c0 > 0) partialRet += (weight / 100) * (latest.close / c0 - 1);
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
      businessCycle: round3(lastEq.businessCycle * (1 + partialRet)),
      spy: round3(lastEq.spy * (1 + spyPartial)),
      sixtyForty: round3(lastEq.sixtyForty * (1 + 0.6 * spyPartial + 0.4 * bondPartial)),
    });
  }
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
  momentum13612w: r.momentum13612w,
  momentum13612wPrev: r.momentum13612wPrev,
  direction: r.direction,
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
    momentum13612w: momCurrent,
    momentum13612wPrev: momPrev,
    direction,
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
console.log(`  SPY 13612W: ${momCurrent} (prev: ${momPrev}) → ${direction}`);
console.log(`  Portfolio: ${portfolio.map((a) => `${a.ticker}(${a.weight}%)`).join(", ")}`);
console.log(`  Rebalance date: ${rebalanceDate}`);

if (backtestStartDate && monthlyRecords.length > 1) {
  console.log(`\n  Backtest: ${backtestStartDate} → ${backtestEndDate} (${monthlyRecords.length} months)`);
  console.log(`  Strategy CAGR: ${strategyMetrics.cagr}%  MDD: ${strategyMetrics.mdd}%  Sharpe: ${strategyMetrics.sharpe}`);
  console.log(`  SPY      CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%  Sharpe: ${spyMetrics.sharpe}`);
  console.log(`  60/40    CAGR: ${sixtyFortyMetrics.cagr}%  MDD: ${sixtyFortyMetrics.mdd}%`);
  console.log(`  Phase distribution: ${Object.entries(phaseDistribution).map(([p, r]) => `${PHASE_LABELS[p]}=${Math.round(r * 100)}%`).join(", ")}`);
}
