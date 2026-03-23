/**
 * 다중 이평선 정배열 분석
 * - 매수후보유 (Buy & Hold)
 * - 200일선 단순 교차
 * - 앗추 필터 (20일 중 16일 이상 200일선 위)
 * - 완전 정배열 (price > MA50 > MA100 > MA200)
 * - 부분 정배열 (price > MA200 AND MA50 > MA200)
 * - MA순서만 (MA50 > MA100 > MA200)
 *
 * 실행: node 02_fe_react/data/scripts/analyze_ma_alignment.mjs [--json] [--top100] [--sector=기술]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_DIR = path.join(__dirname, "../../public/csv_stock");
const TICKERS_FILE = path.join(__dirname, "../tickers_stock/sp500.json");

// === 상수 ===
const RISK_FREE_RATE = 0.03;
const DAILY_RF = RISK_FREE_RATE / 252;
const TRADING_DAYS_PER_YEAR = 252;
const MIN_DATA_ROWS = 450; // MA200 + 최소 1년

// === CSV 파싱 ===
function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  const dateIdx = header.indexOf("Date");
  const adjIdx = header.indexOf("Adjusted_close");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const date = cols[dateIdx];
    const adjClose = parseFloat(cols[adjIdx]);
    if (!date || isNaN(adjClose) || adjClose <= 0) continue;
    rows.push({ date, adjClose });
  }
  return rows;
}

// === O(n) Rolling MA ===
function calcRollingMA(rows, period) {
  const result = new Array(rows.length).fill(null);
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
    sum += rows[i].adjClose;
    if (i >= period) {
      sum -= rows[i - period].adjClose;
    }
    if (i >= period - 1) {
      result[i] = sum / period;
    }
  }
  return result;
}

// === 일간 수익률 ===
function calcDailyReturns(rows) {
  const returns = [NaN];
  for (let i = 1; i < rows.length; i++) {
    returns.push(rows[i].adjClose / rows[i - 1].adjClose - 1);
  }
  return returns;
}

// === 전략 시그널 생성기 ===

function strategyBuyHold(rows, mas) {
  const startIdx = 199;
  const signal = new Array(rows.length).fill(false);
  for (let i = startIdx; i < rows.length; i++) signal[i] = true;
  return { signal, startIdx, name: "매수후보유" };
}

function strategyMA200Cross(rows, mas) {
  const startIdx = 199;
  const signal = new Array(rows.length).fill(false);
  for (let i = startIdx; i < rows.length; i++) {
    if (mas.ma200[i] !== null) {
      signal[i] = rows[i].adjClose > mas.ma200[i];
    }
  }
  return { signal, startIdx, name: "200일선 교차" };
}

function strategyAtchu1620(rows, mas) {
  const startIdx = 199;
  const WINDOW = 20;
  const MIN_DAYS = 16;
  const signal = new Array(rows.length).fill(false);
  let aboveCount = 0;
  for (let i = startIdx; i < rows.length; i++) {
    if (mas.ma200[i] !== null && rows[i].adjClose > mas.ma200[i])
      aboveCount++;
    if (i - startIdx >= WINDOW) {
      const oldIdx = i - WINDOW;
      if (mas.ma200[oldIdx] !== null && rows[oldIdx].adjClose > mas.ma200[oldIdx])
        aboveCount--;
    }
    if (i - startIdx >= WINDOW - 1) {
      signal[i] = aboveCount >= MIN_DAYS;
    }
  }
  return { signal, startIdx: startIdx + WINDOW - 1, name: "앗추 16/20" };
}

function strategyFullAlignment(rows, mas) {
  const startIdx = 199;
  const signal = new Array(rows.length).fill(false);
  for (let i = startIdx; i < rows.length; i++) {
    const ma50 = mas.ma50[i];
    const ma100 = mas.ma100[i];
    const ma200 = mas.ma200[i];
    if (ma50 !== null && ma100 !== null && ma200 !== null) {
      signal[i] =
        rows[i].adjClose > ma50 && ma50 > ma100 && ma100 > ma200;
    }
  }
  return { signal, startIdx, name: "완전 정배열" };
}

function strategyPartialAlignment(rows, mas) {
  const startIdx = 199;
  const signal = new Array(rows.length).fill(false);
  for (let i = startIdx; i < rows.length; i++) {
    const ma50 = mas.ma50[i];
    const ma200 = mas.ma200[i];
    if (ma50 !== null && ma200 !== null) {
      signal[i] = rows[i].adjClose > ma200 && ma50 > ma200;
    }
  }
  return { signal, startIdx, name: "부분 정배열" };
}

function strategyMAOrderOnly(rows, mas) {
  const startIdx = 199;
  const signal = new Array(rows.length).fill(false);
  for (let i = startIdx; i < rows.length; i++) {
    const ma50 = mas.ma50[i];
    const ma100 = mas.ma100[i];
    const ma200 = mas.ma200[i];
    if (ma50 !== null && ma100 !== null && ma200 !== null) {
      signal[i] = ma50 > ma100 && ma100 > ma200;
    }
  }
  return { signal, startIdx, name: "MA순서만" };
}

// === 공통 시뮬레이션 엔진 ===
function simulateFromSignal(rows, signal, startIdx, dailyReturns) {
  const firstPrice = rows[startIdx].adjClose;
  const firstDate = new Date(rows[startIdx].date);
  const lastDate = new Date(rows[rows.length - 1].date);
  const years = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);

  if (years < 1) return null;

  let equity = 1;
  let entryPrice = null;
  let holding = false;
  let tradeCount = 0;
  let daysInMarket = 0;
  let totalDays = 0;
  const equityCurve = [];
  const stratReturns = [];

  for (let i = startIdx; i < rows.length; i++) {
    const price = rows[i].adjClose;
    totalDays++;

    if (!holding && signal[i]) {
      holding = true;
      entryPrice = price;
      tradeCount++;
    } else if (holding && !signal[i]) {
      equity *= price / entryPrice;
      holding = false;
      entryPrice = null;
      tradeCount++;
    }

    if (holding) {
      daysInMarket++;
      stratReturns.push(dailyReturns[i] || 0);
    } else {
      stratReturns.push(0);
    }

    const current = holding ? equity * (price / entryPrice) : equity;
    equityCurve.push(current);
  }

  // 미청산 포지션
  if (holding && entryPrice > 0) {
    equity *= rows[rows.length - 1].adjClose / entryPrice;
  }

  const finalEquity = equityCurve[equityCurve.length - 1];
  const cagr = (Math.pow(finalEquity, 1 / years) - 1) * 100;

  // MDD
  let peak = -Infinity;
  let maxDD = 0;
  for (const val of equityCurve) {
    if (val > peak) peak = val;
    const dd = (val - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  const mdd = maxDD * 100;

  // 샤프비율
  const avgReturn =
    stratReturns.reduce((a, b) => a + b, 0) / stratReturns.length;
  const variance =
    stratReturns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) /
    stratReturns.length;
  const stdDev = Math.sqrt(variance);
  const sharpe =
    stdDev > 0
      ? ((avgReturn - DAILY_RF) / stdDev) * Math.sqrt(TRADING_DAYS_PER_YEAR)
      : 0;

  const timeInMarket = (daysInMarket / totalDays) * 100;

  return { cagr, mdd, sharpe, timeInMarket, tradeCount, years };
}

// === Welch's t-test ===
function welchTTest(group1, group2) {
  const n1 = group1.length;
  const n2 = group2.length;
  if (n1 < 2 || n2 < 2) return null;

  const mean1 = group1.reduce((a, b) => a + b, 0) / n1;
  const mean2 = group2.reduce((a, b) => a + b, 0) / n2;
  const var1 = group1.reduce((s, x) => s + (x - mean1) ** 2, 0) / (n1 - 1);
  const var2 = group2.reduce((s, x) => s + (x - mean2) ** 2, 0) / (n2 - 1);

  const se = Math.sqrt(var1 / n1 + var2 / n2);
  if (se === 0) return null;

  const tStat = (mean1 - mean2) / se;

  const num = (var1 / n1 + var2 / n2) ** 2;
  const denom =
    (var1 / n1) ** 2 / (n1 - 1) + (var2 / n2) ** 2 / (n2 - 1);
  const df = num / denom;

  const pValue = approxTwoTailP(tStat);

  return { tStat, df, pValue, mean1, mean2, n1, n2 };
}

function approxTwoTailP(t) {
  const x = Math.abs(t);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const z = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    ((((a5 * z + a4) * z + a3) * z + a2) * z + a1) *
      z *
      Math.exp((-x * x) / 2);
  const cdf = 0.5 * (1.0 + y);
  return 2 * (1 - cdf);
}

// === 통계 유틸 ===
const avg = (vals) => vals.reduce((a, b) => a + b, 0) / vals.length;
const median = (vals) => {
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

// === 출력 함수 ===
const STRAT_NAMES = [
  "매수후보유",
  "200일선 교차",
  "앗추 16/20",
  "완전 정배열",
  "부분 정배열",
  "MA순서만",
];

function printStats(arr, label) {
  if (arr.length === 0) return;

  console.log(`\n${"=".repeat(90)}`);
  console.log(`  ${label} (${arr.length}종목)`);
  console.log(`${"=".repeat(90)}`);

  // CAGR
  console.log(`\n  CAGR (%)`);
  console.log(`  ${"─".repeat(80)}`);
  console.log(
    `  ${"전략".padEnd(18)} ${"평균".padStart(8)} ${"중앙값".padStart(8)} ${"최소".padStart(8)} ${"최대".padStart(8)}`
  );
  for (const name of STRAT_NAMES) {
    const vals = arr.map((r) => r[name].cagr);
    console.log(
      `  ${name.padEnd(16)} ${avg(vals).toFixed(1).padStart(8)} ${median(vals).toFixed(1).padStart(8)} ${Math.min(...vals).toFixed(1).padStart(8)} ${Math.max(...vals).toFixed(1).padStart(8)}`
    );
  }

  // MDD
  console.log(`\n  MDD (%)`);
  console.log(`  ${"─".repeat(80)}`);
  console.log(
    `  ${"전략".padEnd(18)} ${"평균".padStart(8)} ${"중앙값".padStart(8)} ${"최악".padStart(8)}`
  );
  for (const name of STRAT_NAMES) {
    const vals = arr.map((r) => r[name].mdd);
    console.log(
      `  ${name.padEnd(16)} ${avg(vals).toFixed(1).padStart(8)} ${median(vals).toFixed(1).padStart(8)} ${Math.min(...vals).toFixed(1).padStart(8)}`
    );
  }

  // 샤프비율
  console.log(`\n  샤프비율 (연환산, RF=3%)`);
  console.log(`  ${"─".repeat(80)}`);
  console.log(
    `  ${"전략".padEnd(18)} ${"평균".padStart(8)} ${"중앙값".padStart(8)}`
  );
  for (const name of STRAT_NAMES) {
    const vals = arr.map((r) => r[name].sharpe);
    console.log(
      `  ${name.padEnd(16)} ${avg(vals).toFixed(2).padStart(8)} ${median(vals).toFixed(2).padStart(8)}`
    );
  }

  // 투자 기간 비율 + 거래 횟수
  console.log(`\n  투자 기간 비율 (%) / 평균 거래 횟수`);
  console.log(`  ${"─".repeat(80)}`);
  console.log(
    `  ${"전략".padEnd(18)} ${"시간비율".padStart(10)} ${"거래횟수".padStart(10)}`
  );
  for (const name of STRAT_NAMES) {
    const timeVals = arr.map((r) => r[name].timeInMarket);
    const tradeVals = arr.map((r) => r[name].tradeCount);
    console.log(
      `  ${name.padEnd(16)} ${avg(timeVals).toFixed(1).padStart(10)} ${avg(tradeVals).toFixed(0).padStart(10)}`
    );
  }

  // 승률 (BH 대비)
  console.log(`\n  승률 (매수후보유 CAGR 대비)`);
  console.log(`  ${"─".repeat(80)}`);
  for (const name of STRAT_NAMES) {
    if (name === "매수후보유") continue;
    const beats = arr.filter(
      (r) => r[name].cagr > r["매수후보유"].cagr
    ).length;
    console.log(
      `  ${name.padEnd(16)} ${beats}/${arr.length} (${((beats / arr.length) * 100).toFixed(1)}%)`
    );
  }
}

function printSectorStats(arr) {
  console.log(`\n${"=".repeat(90)}`);
  console.log(`  섹터별 완전 정배열 vs 매수후보유`);
  console.log(`${"=".repeat(90)}`);
  console.log(
    `\n  ${"섹터".padEnd(12)} ${"종목".padStart(4)} | ${"BH CAGR".padStart(9)} ${"정배열CAGR".padStart(10)} ${"차이".padStart(7)} ${"승률".padStart(10)} | ${"BH MDD".padStart(8)} ${"정배열MDD".padStart(9)}`
  );
  console.log(`  ${"─".repeat(85)}`);

  const sectors = [...new Set(arr.map((r) => r.sector))];
  for (const sector of sectors) {
    const s = arr.filter((r) => r.sector === sector);
    const avgBH = avg(s.map((r) => r["매수후보유"].cagr));
    const avgFA = avg(s.map((r) => r["완전 정배열"].cagr));
    const diff = avgFA - avgBH;
    const beats = s.filter(
      (r) => r["완전 정배열"].cagr > r["매수후보유"].cagr
    ).length;
    const avgBHMDD = avg(s.map((r) => r["매수후보유"].mdd));
    const avgFAMDD = avg(s.map((r) => r["완전 정배열"].mdd));
    console.log(
      `  ${sector.padEnd(10)} ${String(s.length).padStart(4)} | ${avgBH.toFixed(1).padStart(9)} ${avgFA.toFixed(1).padStart(10)} ${(diff >= 0 ? "+" : "") + diff.toFixed(1).padStart(6)} ${beats}/${s.length} (${((beats / s.length) * 100).toFixed(0)}%)`.padEnd(70) +
        ` | ${avgBHMDD.toFixed(1).padStart(8)} ${avgFAMDD.toFixed(1).padStart(9)}`
    );
  }
}

function printTTestResult(result) {
  console.log(`\n${"=".repeat(90)}`);
  console.log(`  통계적 유의성 검정 (Welch's t-test)`);
  console.log(
    `  H0: 정배열 기간 평균 일간 수익률 = 비정배열 기간 평균 일간 수익률`
  );
  console.log(`${"=".repeat(90)}`);

  if (!result) {
    console.log(`  데이터 부족으로 검정 불가`);
    return;
  }

  console.log(
    `  정배열 기간: n=${result.n1.toLocaleString()}, 평균 일간 수익률=${(result.mean1 * 100).toFixed(4)}%`
  );
  console.log(
    `  비정배열 기간: n=${result.n2.toLocaleString()}, 평균 일간 수익률=${(result.mean2 * 100).toFixed(4)}%`
  );
  console.log(
    `  차이: ${((result.mean1 - result.mean2) * 100).toFixed(4)}%p/일 → 연환산 ~${((result.mean1 - result.mean2) * 252 * 100).toFixed(1)}%p`
  );
  console.log(`  t-통계량: ${result.tStat.toFixed(4)}`);
  console.log(`  자유도: ${result.df.toFixed(0)}`);
  console.log(
    `  p-value: ${result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4)}`
  );
  console.log(
    `  결론: ${result.pValue < 0.05 ? "유의미 (p < 0.05) — 정배열 기간의 수익률이 통계적으로 유의하게 다름" : "유의미하지 않음 (p >= 0.05)"}`
  );
}

// === 메인 ===
function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes("--json");
  const sectorFilter = args
    .find((a) => a.startsWith("--sector="))
    ?.split("=")[1];
  const top100Only = args.includes("--top100");

  // 종목 메타 로드
  const sp500 = JSON.parse(fs.readFileSync(TICKERS_FILE, "utf-8"));
  const tickerMeta = new Map();
  sp500.items.forEach((item) => tickerMeta.set(item.ticker, item));

  const strategies = [
    strategyBuyHold,
    strategyMA200Cross,
    strategyAtchu1620,
    strategyFullAlignment,
    strategyPartialAlignment,
    strategyMAOrderOnly,
  ];

  const results = [];
  const alignedReturns = [];
  const unalignedReturns = [];

  const files = fs.readdirSync(CSV_DIR).filter((f) => f.endsWith("_all.csv"));
  let processed = 0;

  for (const file of files) {
    const ticker = file.replace(".US_all.csv", "");
    const meta = tickerMeta.get(ticker);
    if (!meta) continue;
    if (sectorFilter && meta.type !== sectorFilter) continue;

    const rows = parseCSV(path.join(CSV_DIR, file));
    if (rows.length < MIN_DATA_ROWS) continue;

    // MA 사전 계산
    const mas = {
      ma50: calcRollingMA(rows, 50),
      ma100: calcRollingMA(rows, 100),
      ma200: calcRollingMA(rows, 200),
    };

    const dailyReturns = calcDailyReturns(rows);

    // t-test용 데이터 수집
    const startIdx = 199;
    for (let i = startIdx + 1; i < rows.length; i++) {
      const ret = dailyReturns[i];
      if (isNaN(ret)) continue;
      if (
        mas.ma50[i] === null ||
        mas.ma100[i] === null ||
        mas.ma200[i] === null
      )
        continue;

      const isAligned =
        rows[i].adjClose > mas.ma50[i] &&
        mas.ma50[i] > mas.ma100[i] &&
        mas.ma100[i] > mas.ma200[i];
      if (isAligned) alignedReturns.push(ret);
      else unalignedReturns.push(ret);
    }

    // 전략별 시뮬레이션
    const tickerResult = { ticker, rank: meta.rank || 999, sector: meta.type };

    for (const stratFn of strategies) {
      const { signal, startIdx: sIdx, name } = stratFn(rows, mas);
      const perf = simulateFromSignal(rows, signal, sIdx, dailyReturns);
      if (!perf) {
        tickerResult[name] = null;
        continue;
      }
      tickerResult[name] = {
        cagr: perf.cagr,
        mdd: perf.mdd,
        sharpe: perf.sharpe,
        timeInMarket: perf.timeInMarket,
        tradeCount: perf.tradeCount,
      };
    }

    // 모든 전략 결과가 있는 종목만
    const allValid = STRAT_NAMES.every((name) => tickerResult[name] !== null);
    if (allValid) {
      results.push(tickerResult);
    }

    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`\r  처리 중... ${processed}/${files.length}`);
    }
  }
  console.log(`\r  처리 완료: ${results.length}종목 (총 ${files.length} 파일)`);

  console.log(
    `\n  ⚠ 주의: 현재 S&P 500 구성종목만 포함 (생존자 편향). 절대 수치는 과대추정될 수 있음.`
  );

  // t-test
  const tTestResult = welchTTest(alignedReturns, unalignedReturns);

  // 통계 출력
  const all = results.sort((a, b) => a.rank - b.rank);
  const top100 = results.filter((r) => r.rank <= 100);

  if (top100Only) {
    printStats(top100, "S&P 500 상위 100 (시가총액)");
  } else {
    printStats(all, "S&P 500 전체");
    printStats(top100, "S&P 500 상위 100 (시가총액)");
    printSectorStats(all);
  }

  printTTestResult(tTestResult);

  // JSON 출력
  if (outputJson) {
    const outputPath = path.join(
      __dirname,
      "../../data/analysis_ma_alignment.json"
    );
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ results, tTestResult }, null, 2)
    );
    console.log(`\nJSON 저장: ${outputPath}`);
  }
}

main();
