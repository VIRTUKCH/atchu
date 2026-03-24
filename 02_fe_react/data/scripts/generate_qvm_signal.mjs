#!/usr/bin/env node
/**
 * 멀티팩터 QVM 전략 신호 생성
 *
 * QVML ETF(Invesco S&P 500 QVM Multi-Factor)의 CSV를 읽어 성과 지표를 계산한다.
 * 정적 팩터 통합 전략이므로 모멘텀/신호 계산 없이, 단순 수익률·MDD·Sharpe만 산출.
 * 비교 벤치마크: SPY (S&P 500 Buy & Hold)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "qvm");
const OUT_FILE = path.join(SUMMARY_DIR, "qvm_signal.json");

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
  if (n >= 6) {
    const mean = monthlyReturns.reduce((s, r) => s + r, 0) / n;
    const variance = monthlyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    sharpe = std > 0 ? round3((mean / std) * Math.sqrt(12)) : null;
  }

  const totalReturn = round2((equity - 1) * 100);

  return { cagr, mdd, sharpe, totalReturn };
}

/* ── Main ── */
function main() {
  console.log("[QVM] Starting QVM multi-factor signal generation...");

  const refYm = getReferenceMonth();
  console.log(`[QVM] Reference month: ${refYm}`);

  // QVML 월말 데이터
  const qvmlMonthEnds = readMonthEnds("QVML");
  if (!qvmlMonthEnds || qvmlMonthEnds.length < 2) {
    console.warn("[QVM] Not enough QVML data. Creating minimal output.");
    fs.mkdirSync(SUMMARY_DIR, { recursive: true });
    fs.writeFileSync(
      OUT_FILE,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          strategy: {
            name: "멀티팩터 QVM",
            author: "S&P Dow Jones Indices",
            type: "팩터 통합 선별 (Quality + Value + Momentum)",
            rebalancing: "분기 1회 (3/6/9/12월)",
            etf: "QVML",
            expenseRatio: 0.11,
            holdings: 450,
            methodology: "S&P 500 중 Q+V+M 복합 z-score 상위 90% 선별, 시총×점수 가중",
          },
          factorDefinitions: {
            quality: {
              metrics: ["ROE", "Accruals Ratio (역)", "Financial Leverage (역)"],
              description: "좋은 회사: 높은 수익성, 낮은 분식 위험, 낮은 부채",
            },
            value: {
              metrics: ["Book-to-Price", "Earnings-to-Price", "Sales-to-Price"],
              description: "싼 회사: 장부가·이익·매출 대비 주가가 낮은 기업",
            },
            momentum: {
              metrics: ["12-1 Month Risk-Adjusted Return"],
              description: "오르는 회사: 최근 12개월 상승세 (1개월 제외)",
            },
          },
          performance: { qvml: null, spy: null },
          equityCurve: [],
          latestClose: null,
          dataMonths: 0,
        },
        null,
        2
      )
    );
    console.log("[QVM] Minimal output written (no QVML data yet).");
    return;
  }

  // SPY 벤치마크
  const spyMonthEnds = readMonthEnds("SPY");

  // 공통 기간 결정
  const qvmlStart = qvmlMonthEnds[0].ym;
  const qvmlEnd = qvmlMonthEnds[qvmlMonthEnds.length - 1].ym;
  const refEnd = refYm < qvmlEnd ? refYm : qvmlEnd;

  const qvmlFiltered = qvmlMonthEnds.filter((m) => m.ym <= refEnd);
  const spyFiltered = spyMonthEnds
    ? spyMonthEnds.filter((m) => m.ym >= qvmlStart && m.ym <= refEnd)
    : [];

  // 월별 수익률
  const qvmlReturns = [];
  for (let i = 1; i < qvmlFiltered.length; i++) {
    qvmlReturns.push(qvmlFiltered[i].close / qvmlFiltered[i - 1].close - 1);
  }

  const spyMap = new Map(spyFiltered.map((m) => [m.ym, m.close]));
  const spyReturns = [];
  for (let i = 1; i < qvmlFiltered.length; i++) {
    const prev = spyMap.get(qvmlFiltered[i - 1].ym);
    const cur = spyMap.get(qvmlFiltered[i].ym);
    if (prev && cur) spyReturns.push(cur / prev - 1);
    else spyReturns.push(0);
  }

  // Equity curve
  let eqQvml = 1;
  let eqSpy = 1;
  const equityCurve = [{ date: qvmlFiltered[0].ym, qvml: 1.0, spy: 1.0 }];
  for (let i = 0; i < qvmlReturns.length; i++) {
    eqQvml *= 1 + qvmlReturns[i];
    eqSpy *= 1 + spyReturns[i];
    equityCurve.push({
      date: qvmlFiltered[i + 1].ym,
      qvml: round3(eqQvml),
      spy: round3(eqSpy),
    });
  }

  /* ── 부분월(오늘) 포인트 ── */
  const latestQvml = readLatestClose("QVML");
  const latestSpy = readLatestClose("SPY");
  if (latestQvml && latestSpy && equityCurve.length > 0 && qvmlFiltered.length > 0) {
    const lastEq = equityCurve[equityCurve.length - 1];
    const lastQvml = qvmlFiltered[qvmlFiltered.length - 1];
    if (latestQvml.date > lastQvml.date) {
      const qvmlPartial = lastQvml.close > 0 ? (latestQvml.close / lastQvml.close - 1) : 0;
      const lastSpyClose = spyMap.get(lastQvml.ym);
      const spyPartial = (lastSpyClose && lastSpyClose > 0) ? (latestSpy.close / lastSpyClose - 1) : 0;
      equityCurve.push({
        date: latestQvml.date,
        qvml: round3(lastEq.qvml * (1 + qvmlPartial)),
        spy: round3(lastEq.spy * (1 + spyPartial)),
      });
    }
  }

  // 성과 지표
  const qvmlPerf = calcPerformance(qvmlReturns);
  const spyPerf = calcPerformance(spyReturns);

  // 최근 종가
  const lastEntry = qvmlFiltered[qvmlFiltered.length - 1];
  const prevEntry = qvmlFiltered.length >= 2 ? qvmlFiltered[qvmlFiltered.length - 2] : null;
  const monthReturn = prevEntry
    ? round2((lastEntry.close / prevEntry.close - 1) * 100)
    : null;

  const output = {
    generatedAt: new Date().toISOString(),
    strategy: {
      name: "멀티팩터 QVM",
      author: "S&P Dow Jones Indices",
      type: "팩터 통합 선별 (Quality + Value + Momentum)",
      rebalancing: "분기 1회 (3/6/9/12월)",
      etf: "QVML",
      expenseRatio: 0.11,
      holdings: 450,
      methodology: "S&P 500 중 Q+V+M 복합 z-score 상위 90% 선별, 시총×점수 가중",
    },
    factorDefinitions: {
      quality: {
        metrics: ["ROE", "Accruals Ratio (역)", "Financial Leverage (역)"],
        description: "좋은 회사: 높은 수익성, 낮은 분식 위험, 낮은 부채",
      },
      value: {
        metrics: ["Book-to-Price", "Earnings-to-Price", "Sales-to-Price"],
        description: "싼 회사: 장부가·이익·매출 대비 주가가 낮은 기업",
      },
      momentum: {
        metrics: ["12-1 Month Risk-Adjusted Return"],
        description: "오르는 회사: 최근 12개월 상승세 (1개월 제외)",
      },
    },
    performance: {
      qvml: qvmlPerf,
      spy: spyPerf,
    },
    equityCurve,
    latestClose: {
      date: lastEntry.date,
      price: round2(lastEntry.close),
      monthReturn,
    },
    dataMonths: qvmlFiltered.length,
  };

  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `[QVM] Signal written → ${OUT_FILE} (${qvmlFiltered.length} months, totalReturn: ${qvmlPerf?.totalReturn ?? "N/A"}%)`
  );
}

main();
