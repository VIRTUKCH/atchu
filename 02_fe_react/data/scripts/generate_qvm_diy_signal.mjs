#!/usr/bin/env node
/**
 * QVM DIY 전략 신호 생성 — QVM-EW + QVM-MOM
 *
 * QUAL, VLUE, MTUM 3개 팩터 ETF를 직접 조합하는 두 변형:
 *   QVM-EW:  33.3% 균등 배분 (필터 없음, 항상 투자)
 *   QVM-MOM: 12-1M 모멘텀 순위 50/30/20 + 10개월 SMA 추세 필터 (탈락 시 BIL 대체)
 *
 * 벤치마크: SPY (S&P 500 Buy & Hold)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "qvm");
const OUT_FILE = path.join(SUMMARY_DIR, "qvm_diy_signal.json");

const FACTOR_TICKERS = [
  { ticker: "QUAL", nameKo: "우량주" },
  { ticker: "VLUE", nameKo: "가치주" },
  { ticker: "MTUM", nameKo: "모멘텀" },
];
const MOM_WEIGHTS = [50, 30, 20]; // 1위/2위/3위 비중
const EW_WEIGHT = 33.3;

/* ── Helpers ── */
const round2 = (v) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : Math.round(v * 100) / 100;
const round3 = (v) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : Math.round(v * 1000) / 1000;

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/* ── CSV → 월말 종가 ── */
function readMonthEnds(ticker) {
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
}

/* ── 기준월 결정 (전월) ── */
function getReferenceMonth() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
  const year = lastDayPrevMonth.getFullYear();
  const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/* ── 성과 지표 ── */
function calcPerformance(monthlyReturns) {
  if (!monthlyReturns || monthlyReturns.length < 2) return null;

  const n = monthlyReturns.length;
  let equity = 1;
  for (const r of monthlyReturns) equity *= 1 + r;
  const cagr = n >= 6 ? round2((Math.pow(equity, 12 / n) - 1) * 100) : null;

  let peak = 1;
  let maxDd = 0;
  let eq = 1;
  for (const r of monthlyReturns) {
    eq *= 1 + r;
    if (eq > peak) peak = eq;
    const dd = (eq - peak) / peak;
    if (dd < maxDd) maxDd = dd;
  }
  const mdd = round2(maxDd * 100);

  let sharpe = null;
  if (n >= 6) {
    const mean = monthlyReturns.reduce((s, r) => s + r, 0) / n;
    const variance = monthlyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    sharpe = std > 0 ? round3((mean / std) * Math.sqrt(12)) : null;
  }

  const totalReturn = round2((equity - 1) * 100);
  return { cagr, mdd, sharpe, totalReturn };
}

/* ── 12-1M 모멘텀 (최근 1개월 제외) ── */
function calcMomentum12m1(monthEnds, refIdx) {
  if (refIdx < 12) return null;
  const cur = monthEnds[refIdx - 1].close;
  const prev = monthEnds[refIdx - 12].close;
  if (!cur || !prev || prev === 0) return null;
  return cur / prev - 1;
}

/* ── 10개월 SMA ── */
function calc10mSma(monthEnds, refIdx) {
  if (refIdx < 9) return null;
  let sum = 0;
  for (let i = refIdx - 9; i <= refIdx; i++) sum += monthEnds[i].close;
  return sum / 10;
}

/* ── Main ── */
function main() {
  console.log("[QVM-DIY] Starting QVM DIY signal generation...");

  const refYm = getReferenceMonth();
  console.log(`[QVM-DIY] Reference month: ${refYm}`);

  // 팩터 ETF 월말 데이터 읽기
  const factorData = {};
  for (const f of FACTOR_TICKERS) {
    const data = readMonthEnds(f.ticker);
    if (!data || data.length < 13) {
      console.warn(`[QVM-DIY] Not enough data for ${f.ticker}. Aborting.`);
      writeMinimalOutput();
      return;
    }
    factorData[f.ticker] = data;
  }

  // BIL (T-Bill) 월말 데이터
  const bilData = readMonthEnds("BIL");
  if (!bilData || bilData.length < 2) {
    console.warn("[QVM-DIY] Not enough BIL data. Aborting.");
    writeMinimalOutput();
    return;
  }

  // SPY 벤치마크
  const spyData = readMonthEnds("SPY");
  if (!spyData || spyData.length < 2) {
    console.warn("[QVM-DIY] Not enough SPY data. Aborting.");
    writeMinimalOutput();
    return;
  }

  // 공통 기간 결정: 모든 팩터 ETF가 존재하고, 12개월 룩백 가능한 시점부터
  const allStarts = FACTOR_TICKERS.map((f) => factorData[f.ticker][0].ym);
  const commonStart = allStarts.sort().pop(); // 가장 늦은 시작
  const allEnds = FACTOR_TICKERS.map((f) => factorData[f.ticker].at(-1).ym);
  let commonEnd = allEnds.sort()[0]; // 가장 빠른 끝
  if (refYm < commonEnd) commonEnd = refYm;

  // 팩터별 필터링된 월말 데이터 (ym 인덱스 맵)
  const factorFiltered = {};
  for (const f of FACTOR_TICKERS) {
    factorFiltered[f.ticker] = factorData[f.ticker].filter((m) => m.ym <= commonEnd);
  }
  const bilMap = new Map(bilData.filter((m) => m.ym <= commonEnd).map((m) => [m.ym, m.close]));
  const spyFiltered = spyData.filter((m) => m.ym <= commonEnd);
  const spyMap = new Map(spyFiltered.map((m) => [m.ym, m.close]));

  // 기준 ETF (QUAL)의 인덱스로 월 순회 — 모멘텀 계산에 12개월 필요
  const baseMonths = factorFiltered[FACTOR_TICKERS[0].ticker];
  const startIdx = 12; // 12개월 룩백 필요
  if (startIdx >= baseMonths.length) {
    console.warn("[QVM-DIY] Not enough months for momentum calculation.");
    writeMinimalOutput();
    return;
  }

  // 팩터별 ym→idx 맵
  const factorYmIdx = {};
  for (const f of FACTOR_TICKERS) {
    factorYmIdx[f.ticker] = new Map(
      factorFiltered[f.ticker].map((m, i) => [m.ym, i])
    );
  }

  // 백테스트 루프
  const ewReturns = [];
  const momReturns = [];
  const spyReturns = [];
  const equityCurve = [];
  const history = [];
  let eqEw = 1, eqMom = 1, eqSpy = 1;

  const startYm = baseMonths[startIdx].ym;
  equityCurve.push({ date: startYm, qvmEw: 1.0, qvmMom: 1.0, spy: 1.0 });

  let latestEwAlloc = null;
  let latestMomAlloc = null;
  let latestMomRanking = null;

  for (let i = startIdx; i < baseMonths.length - 1; i++) {
    const curYm = baseMonths[i].ym;
    const nextYm = baseMonths[i + 1].ym;

    // 각 팩터의 현재월 종가, 다음월 종가, 12-1M 모멘텀, 10M SMA
    const factorInfo = FACTOR_TICKERS.map((f) => {
      const idx = factorYmIdx[f.ticker].get(curYm);
      const nextIdx = factorYmIdx[f.ticker].get(nextYm);
      if (idx == null || nextIdx == null) return null;

      const months = factorFiltered[f.ticker];
      const curClose = months[idx].close;
      const nextClose = months[nextIdx].close;
      const mom12m1 = calcMomentum12m1(months, idx);
      const sma10 = calc10mSma(months, idx);
      const aboveSma = sma10 != null ? curClose >= sma10 : true;
      const monthReturn = nextClose / curClose - 1;

      return {
        ticker: f.ticker,
        nameKo: f.nameKo,
        curClose,
        nextClose,
        monthReturn,
        mom12m1,
        sma10,
        aboveSma,
      };
    });

    if (factorInfo.some((f) => f == null)) continue;

    // BIL 월수익률
    const bilCur = bilMap.get(curYm);
    const bilNext = bilMap.get(nextYm);
    const bilReturn = bilCur && bilNext ? bilNext / bilCur - 1 : 0;

    // SPY 월수익률
    const spyCur = spyMap.get(curYm);
    const spyNext = spyMap.get(nextYm);
    const spyReturn = spyCur && spyNext ? spyNext / spyCur - 1 : 0;

    // ── QVM-EW: 균등 배분 ──
    const ewReturn = factorInfo.reduce((sum, f) => sum + f.monthReturn * (EW_WEIGHT / 100), 0);
    ewReturns.push(ewReturn);

    const ewAlloc = factorInfo.map((f) => ({
      ticker: f.ticker,
      nameKo: f.nameKo,
      weight: EW_WEIGHT,
    }));

    // ── QVM-MOM: 모멘텀 순위 + SMA 필터 ──
    const ranked = [...factorInfo]
      .filter((f) => f.mom12m1 != null)
      .sort((a, b) => b.mom12m1 - a.mom12m1);

    let momReturn = 0;
    const momAlloc = [];
    const momRanking = [];

    for (let r = 0; r < ranked.length; r++) {
      const f = ranked[r];
      const weight = MOM_WEIGHTS[r] || 0;
      momRanking.push({
        ticker: f.ticker,
        nameKo: f.nameKo,
        return12m1: round2(f.mom12m1 * 100),
        rank: r + 1,
        aboveSma: f.aboveSma,
      });

      if (f.aboveSma) {
        momReturn += f.monthReturn * (weight / 100);
        momAlloc.push({
          ticker: f.ticker,
          nameKo: f.nameKo,
          weight,
          aboveSma: true,
        });
      } else {
        // SMA 아래 → BIL 대체
        momReturn += bilReturn * (weight / 100);
        momAlloc.push({
          ticker: "BIL",
          nameKo: `단기국채 (${f.ticker} 대체)`,
          weight,
          aboveSma: false,
          replacedTicker: f.ticker,
        });
      }
    }
    momReturns.push(momReturn);
    spyReturns.push(spyReturn);

    // Equity curve
    eqEw *= 1 + ewReturn;
    eqMom *= 1 + momReturn;
    eqSpy *= 1 + spyReturn;
    equityCurve.push({
      date: nextYm,
      qvmEw: round3(eqEw),
      qvmMom: round3(eqMom),
      spy: round3(eqSpy),
    });

    // History (최근 24개월만 저장)
    history.push({
      date: curYm,
      qvmEw: ewAlloc,
      qvmMom: momAlloc,
      momRanking,
    });

    latestEwAlloc = ewAlloc;
    latestMomAlloc = momAlloc;
    latestMomRanking = momRanking;
  }

  // history 최근 24개월만
  const recentHistory = history.slice(-24);

  // 성과 지표
  const ewPerf = calcPerformance(ewReturns);
  const momPerf = calcPerformance(momReturns);
  const spyPerf = calcPerformance(spyReturns);

  // BIL 비중 (QVM-MOM)
  const bilWeight = latestMomAlloc
    ? latestMomAlloc.filter((a) => a.ticker === "BIL").reduce((s, a) => s + a.weight, 0)
    : 0;

  const output = {
    generatedAt: new Date().toISOString(),
    signal: {
      rebalanceDate: baseMonths.at(-1)?.date || baseMonths.at(-1)?.ym,
      momRanking: latestMomRanking || [],
    },
    portfolios: {
      qvmEw: {
        allocations: latestEwAlloc || [],
      },
      qvmMom: {
        allocations: latestMomAlloc || [],
        bilWeight,
      },
    },
    backtest: {
      startDate: equityCurve[0]?.date,
      qvmEw: ewPerf,
      qvmMom: momPerf,
      spy: spyPerf,
      equityCurve,
    },
    history: recentHistory,
  };

  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));

  console.log(`[QVM-DIY] Signal written → ${OUT_FILE}`);
  console.log(`[QVM-DIY] EW:  CAGR ${ewPerf?.cagr}%, MDD ${ewPerf?.mdd}%, Sharpe ${ewPerf?.sharpe}`);
  console.log(`[QVM-DIY] MOM: CAGR ${momPerf?.cagr}%, MDD ${momPerf?.mdd}%, Sharpe ${momPerf?.sharpe}`);
  console.log(`[QVM-DIY] SPY: CAGR ${spyPerf?.cagr}%, MDD ${spyPerf?.mdd}%, Sharpe ${spyPerf?.sharpe}`);
  console.log(`[QVM-DIY] Months: ${ewReturns.length}, MOM BIL weight: ${bilWeight}%`);
}

function writeMinimalOutput() {
  const output = {
    generatedAt: new Date().toISOString(),
    signal: { rebalanceDate: null, momRanking: [] },
    portfolios: {
      qvmEw: { allocations: [] },
      qvmMom: { allocations: [], bilWeight: 0 },
    },
    backtest: {
      startDate: null,
      qvmEw: null,
      qvmMom: null,
      spy: null,
      equityCurve: [],
    },
    history: [],
  };
  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log("[QVM-DIY] Minimal output written.");
}

main();
