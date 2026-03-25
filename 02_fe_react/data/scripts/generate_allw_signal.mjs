#!/usr/bin/env node
/**
 * All Weather (Risk Parity) 전략 신호 생성
 *
 * ALLW ETF(Bridgewater All Weather)의 CSV를 읽어 성과 지표를 계산한다.
 * 정적 배분 전략이므로 모멘텀/신호 계산 없이, 단순 수익률·MDD·Sharpe만 산출.
 * 비교 벤치마크: SPY (S&P 500 Buy & Hold)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readMonthEnds, readLatestClose,
  round2, round3, parseNumber, calcPeriodReturns,
} from "./lib/quant_utils.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "allw");
const OUT_FILE = path.join(SUMMARY_DIR, "allw_signal.json");

/** SPY 10개월 이동평균 */
const calcSpySma10 = (spyData, ym) => {
  if (!spyData) return null;
  const idx = spyData.findIndex((m) => m.ym === ym);
  if (idx < 9) return null;
  const window = spyData.slice(idx - 9, idx + 1);
  return window.reduce((s, m) => s + m.close, 0) / 10;
};

/* ── 성과 지표 ── */
function calcPerformance(monthlyReturns) {
  if (!monthlyReturns || monthlyReturns.length < 2) return null;

  const n = monthlyReturns.length;

  // CAGR (6개월 이상이면 연환산)
  let equity = 1;
  for (const r of monthlyReturns) equity *= 1 + r;
  const cagr = n >= 6 ? round2((Math.pow(equity, 12 / n) - 1) * 100) : null;

  // MDD
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

  // Sharpe (6개월 이상이면 계산)
  let sharpe = null;
  let sortino = null;
  if (n >= 6) {
    const mean = monthlyReturns.reduce((s, r) => s + r, 0) / n;
    const variance = monthlyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    sharpe = std > 0 ? round3((mean / std) * Math.sqrt(12)) : null;
    const downsideSq = monthlyReturns.reduce((s, r) => s + Math.min(r, 0) ** 2, 0);
    const downsideDev = Math.sqrt(downsideSq / n);
    sortino = downsideDev > 0 ? round3((mean / downsideDev) * Math.sqrt(12)) : null;
  }

  const totalReturn = round2((equity - 1) * 100);

  return { cagr, mdd, sharpe, sortino, totalReturn };
}

/* ── Main ── */
function main() {
  console.log("[ALLW] Starting All Weather signal generation...");

  const refYm = (() => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
    const year = lastDayPrevMonth.getFullYear();
    const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  })();
  console.log(`[ALLW] Reference month: ${refYm}`);

  // ALLW 월말 데이터
  const allwMonthEnds = readMonthEnds("ALLW", CSV_DIR);
  if (!allwMonthEnds || allwMonthEnds.length < 2) {
    console.warn("[ALLW] Not enough ALLW data. Creating minimal output.");
    fs.mkdirSync(SUMMARY_DIR, { recursive: true });
    fs.writeFileSync(
      OUT_FILE,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          strategy: {
            name: "All Weather",
            author: "Ray Dalio (Bridgewater)",
            type: "정적 배분 (리스크 패리티)",
            rebalancing: "분기 1회",
            etf: "ALLW",
          },
          allocation: [
            { asset: "미국 주식", etf: "SPY/VTI", weight: 30, role: "성장" },
            { asset: "장기 국채", etf: "TLT", weight: 40, role: "디플레/침체 방어" },
            { asset: "중기 국채", etf: "IEF", weight: 15, role: "안정성" },
            { asset: "금", etf: "GLD", weight: 7.5, role: "인플레 헤지" },
            { asset: "원자재", etf: "DBC", weight: 7.5, role: "인플레 헤지" },
          ],
          performance: { allw: null, spy: null },
          equityCurve: [],
          latestClose: null,
          dataMonths: 0,
        },
        null,
        2
      )
    );
    console.log("[ALLW] Minimal output written (no ALLW data yet).");
    return;
  }

  // SPY 벤치마크
  const spyMonthEnds = readMonthEnds("SPY", CSV_DIR);

  // 공통 기간 결정
  const allwStart = allwMonthEnds[0].ym;
  const allwEnd = allwMonthEnds[allwMonthEnds.length - 1].ym;
  const refEnd = refYm < allwEnd ? refYm : allwEnd;

  const allwFiltered = allwMonthEnds.filter((m) => m.ym <= refEnd);
  const spyFiltered = spyMonthEnds
    ? spyMonthEnds.filter((m) => m.ym >= allwStart && m.ym <= refEnd)
    : [];

  // 월별 수익률
  const allwReturns = [];
  for (let i = 1; i < allwFiltered.length; i++) {
    allwReturns.push(allwFiltered[i].close / allwFiltered[i - 1].close - 1);
  }

  const spyMap = new Map(spyFiltered.map((m) => [m.ym, m.close]));
  const spyReturns = [];
  const spyMaReturns = [];
  for (let i = 1; i < allwFiltered.length; i++) {
    const prev = spyMap.get(allwFiltered[i - 1].ym);
    const cur = spyMap.get(allwFiltered[i].ym);
    const spyRet = prev && cur ? cur / prev - 1 : 0;
    spyReturns.push(spyRet);

    // SPY + 10M SMA 필터
    const sma10 = calcSpySma10(spyFiltered, allwFiltered[i - 1].ym);
    const spyMaRet = (sma10 !== null && prev > sma10) ? spyRet : 0;
    spyMaReturns.push(spyMaRet);
  }

  // Equity curve
  let eqAllw = 1;
  let eqSpy = 1;
  const equityCurve = [{ date: allwFiltered[0].ym, allw: 1.0, spy: 1.0 }];
  for (let i = 0; i < allwReturns.length; i++) {
    eqAllw *= 1 + allwReturns[i];
    eqSpy *= 1 + spyReturns[i];
    equityCurve.push({
      date: allwFiltered[i + 1].ym,
      allw: round3(eqAllw),
      spy: round3(eqSpy),
    });
  }

  /* ── 부분월(오늘) 포인트 ── */
  const latestAllw = readLatestClose("ALLW", CSV_DIR);
  const latestSpy = readLatestClose("SPY", CSV_DIR);
  if (latestAllw && latestSpy && equityCurve.length > 0 && allwFiltered.length > 0) {
    const lastEq = equityCurve[equityCurve.length - 1];
    const lastAllw = allwFiltered[allwFiltered.length - 1];
    if (latestAllw.date > lastAllw.date) {
      const allwPartial = lastAllw.close > 0 ? (latestAllw.close / lastAllw.close - 1) : 0;
      const lastSpyClose = spyMap.get(lastAllw.ym);
      const spyPartial = (lastSpyClose && lastSpyClose > 0) ? (latestSpy.close / lastSpyClose - 1) : 0;
      equityCurve.push({
        date: latestAllw.date,
        allw: round3(lastEq.allw * (1 + allwPartial)),
        spy: round3(lastEq.spy * (1 + spyPartial)),
      });
    }
  }

  // 성과 지표
  const allwPerf = calcPerformance(allwReturns);
  const spyPerf = calcPerformance(spyReturns);
  const spyMaPerf = calcPerformance(spyMaReturns);

  // 최근 종가
  const lastEntry = allwFiltered[allwFiltered.length - 1];
  const prevEntry = allwFiltered.length >= 2 ? allwFiltered[allwFiltered.length - 2] : null;
  const monthReturn = prevEntry
    ? round2((lastEntry.close / prevEntry.close - 1) * 100)
    : null;

  const output = {
    generatedAt: new Date().toISOString(),
    strategy: {
      name: "All Weather",
      author: "Ray Dalio (Bridgewater)",
      type: "정적 배분 (리스크 패리티)",
      rebalancing: "분기 1회",
      etf: "ALLW",
    },
    allocation: [
      { asset: "미국 주식", etf: "SPY/VTI", weight: 30, role: "성장" },
      { asset: "장기 국채", etf: "TLT", weight: 40, role: "디플레/침체 방어" },
      { asset: "중기 국채", etf: "IEF", weight: 15, role: "안정성" },
      { asset: "금", etf: "GLD", weight: 7.5, role: "인플레 헤지" },
      { asset: "원자재", etf: "DBC", weight: 7.5, role: "인플레 헤지" },
    ],
    performance: {
      allw: allwPerf,
      spy: spyPerf,
      spyMa: spyMaPerf,
    },
    equityCurve,
    latestClose: {
      date: lastEntry.date,
      price: round2(lastEntry.close),
      monthReturn,
    },
    dataMonths: allwFiltered.length,
  };

  // 오늘 기준 기간별 수익률
  if (equityCurve.length >= 2) {
    const lastAllwEntry = allwFiltered[allwFiltered.length - 1];
    output.periodReturns = {
      allw: calcPeriodReturns(equityCurve, "allw", [{ ticker: "ALLW", weight: 1 }], CSV_DIR, lastAllwEntry.date),
    };
  }

  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `[ALLW] Signal written → ${OUT_FILE} (${allwFiltered.length} months, totalReturn: ${allwPerf?.totalReturn ?? "N/A"}%)`
  );
}

main();
