#!/usr/bin/env node
/**
 * 랜딩 페이지용 사전 계산 데이터 생성.
 * - LandingRealChart (섹션 3): SPY 2020년 이후 차트 + simpleCrossings (단순 200일선 교차)
 *   → 섹션 3은 "200일선이 기준이다"를 보여주므로 필터 없는 단순 교차 신호 사용
 * - LandingFilterSection (섹션 5): crossings (16/20 앗추 필터) 사용 (별도 필드)
 * - LandingStockExplore: 4개 ETF CAGR
 * - backtestComparison: 200일선 vs 앗추 필터 백테스트 비교 (CAGR, 매매 횟수)
 *
 * 파이프라인에서 vite build 전에 실행되어야 함.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const OUT_DIR = path.join(ROOT_DIR, "summary");
const OUT_FILE = path.join(OUT_DIR, "landing_data.json");

const CHART_TICKER = "SPY";
const CHART_DATE_CUTOFF = "2020-01-01";
const CAGR_TICKERS = ["XLE", "INDA", "EWY", "GLD"];
const BACKTEST_TICKERS = ["SPY", "QQQ", "XLE", "GLD"];
const MA_PERIOD = 200;

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const round2 = (value) =>
  value === null || value === undefined ? null : Math.round(value * 100) / 100;

const readCsv = (ticker) => {
  const filePath = path.join(CSV_DIR, `${ticker}.US_all.csv`);
  if (!fs.existsSync(filePath)) {
    console.warn(`CSV not found: ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath, "utf8");
};

const parseRecords = (csvText) => {
  const lines = String(csvText || "").trim().split("\n");
  if (lines.length < 3) return null;
  const headers = lines[0].split(",").map((h) => h.trim());
  const records = lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      headers.forEach((h, i) => { row[h] = parts[i]; });
      return row;
    })
    .filter((row) => row.Date);
  if (records.length < 2) return null;
  records.sort((a, b) => String(a.Date).localeCompare(String(b.Date)));
  return records;
};

const averageOf = (series, period, index) => {
  if (index + 1 < period) return null;
  const slice = series.slice(index - period + 1, index + 1);
  if (slice.some((v) => v === null)) return null;
  return slice.reduce((sum, v) => sum + v, 0) / period;
};

const isHoldFilterQualified = (adjustedSeries, period, index, windowDays = 20, minDays = 16) => {
  if (index < windowDays - 1) return false;
  let aboveCount = 0;
  for (let j = index - windowDays + 1; j <= index; j++) {
    const price = adjustedSeries[j];
    const ma = averageOf(adjustedSeries, period, j);
    if (price !== null && ma !== null && price > ma) aboveCount++;
  }
  return aboveCount >= minDays;
};

// --- SPY 차트 데이터 + 단순 200일선 교차(simpleCrossings) + 16/20 필터(crossings) ---
const buildChartData = (csvText) => {
  const records = parseRecords(csvText);
  if (!records) return { items: [], crossings: [] };

  const adjustedSeries = records.map((row) => parseNumber(row.Adjusted_close ?? row.Close));
  const lastIndex = records.length - 1;

  // 차트 items: 2020-01-01 이후만
  const items = [];
  for (let i = 0; i <= lastIndex; i++) {
    if (records[i].Date < CHART_DATE_CUTOFF) continue;
    items.push({
      d: records[i].Date,
      c: round2(adjustedSeries[i]),
      m: round2(averageOf(adjustedSeries, MA_PERIOD, i))
    });
  }

  // 200일선 단순 교차 (섹션 5 시각화용)
  const simpleCrossings = [];
  for (let i = 1; i <= lastIndex; i++) {
    const prevPrice = adjustedSeries[i - 1];
    const currPrice = adjustedSeries[i];
    const prevMa = averageOf(adjustedSeries, MA_PERIOD, i - 1);
    const currMa = averageOf(adjustedSeries, MA_PERIOD, i);
    if (prevPrice === null || currPrice === null || prevMa === null || currMa === null) continue;
    const crossedUp = prevPrice < prevMa && currPrice >= currMa;
    const crossedDown = prevPrice > prevMa && currPrice <= currMa;
    if (!crossedUp && !crossedDown) continue;
    simpleCrossings.push({
      d: records[i].Date,
      dir: crossedUp ? "up" : "down",
      c: round2(currPrice)
    });
  }

  // 200-20of16 crossing: 전체 기간 (거래 페어링에 필요)
  const crossings = [];
  let prevQualified = null;
  for (let i = 0; i <= lastIndex; i++) {
    if (i < 19) continue;
    const isQualified = isHoldFilterQualified(adjustedSeries, MA_PERIOD, i);
    if (prevQualified === null) {
      prevQualified = isQualified;
      if (isQualified) {
        crossings.push({
          d: records[i].Date,
          dir: "up",
          c: round2(parseNumber(records[i].Adjusted_close ?? records[i].Close))
        });
      }
      continue;
    }
    if (isQualified === prevQualified) continue;
    crossings.push({
      d: records[i].Date,
      dir: isQualified ? "up" : "down",
      c: round2(parseNumber(records[i].Adjusted_close ?? records[i].Close))
    });
    prevQualified = isQualified;
  }

  return { items, crossings, simpleCrossings };
};

// --- ETF CAGR (200-20of16) ---
const computeCagr = (csvText) => {
  const records = parseRecords(csvText);
  if (!records) return null;

  const adjustedSeries = records.map((row) => parseNumber(row.Adjusted_close ?? row.Close));
  const lastIndex = records.length - 1;
  const close = adjustedSeries[lastIndex];

  const firstDate = new Date(records[0].Date);
  const lastDate = new Date(records[lastIndex].Date);
  const yearsOfData =
    Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())
      ? null
      : Math.max(0, (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25));

  // hold_20of16 crossing
  const crossingItems = [];
  let prevQualified = null;
  for (let i = 0; i <= lastIndex; i++) {
    if (i < 19) continue;
    const isQualified = isHoldFilterQualified(adjustedSeries, MA_PERIOD, i);
    if (prevQualified === null) {
      prevQualified = isQualified;
      if (isQualified) {
        crossingItems.push({ direction: "up", close: adjustedSeries[i] });
      }
      continue;
    }
    if (isQualified === prevQualified) continue;
    crossingItems.push({
      direction: isQualified ? "up" : "down",
      close: adjustedSeries[i]
    });
    prevQualified = isQualified;
  }

  // equity 계산
  let equity = 1;
  let holding = false;
  let entryPrice = null;
  let hasClosedPosition = false;
  crossingItems.forEach((item) => {
    const price = item.close;
    if (price === null) return;
    if (item.direction === "up") {
      if (!holding) { holding = true; entryPrice = price; }
      return;
    }
    if (holding && entryPrice !== null && item.direction === "down") {
      equity *= price / entryPrice;
      hasClosedPosition = true;
      holding = false;
      entryPrice = null;
    }
  });
  if (holding && entryPrice !== null && close !== null && entryPrice > 0) {
    equity *= close / entryPrice;
    hasClosedPosition = true;
  }

  const expectedReturn = hasClosedPosition ? (equity - 1) * 100 : null;
  if (!yearsOfData || yearsOfData <= 0 || expectedReturn === null) return null;
  return round2((Math.pow(1 + expectedReturn / 100, 1 / yearsOfData) - 1) * 100);
};

// --- 백테스트 비교: 200일선 단순 교차 vs 앗추 필터 ---
const computeBacktestComparison = (csvText) => {
  const records = parseRecords(csvText);
  if (!records) return null;

  const adjustedSeries = records.map((row) => parseNumber(row.Adjusted_close ?? row.Close));
  const lastIndex = records.length - 1;
  const latestClose = adjustedSeries[lastIndex];

  const firstDate = new Date(records[0].Date);
  const lastDate = new Date(records[lastIndex].Date);
  const yearsOfData =
    Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())
      ? null
      : Math.max(0, (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25));
  if (!yearsOfData || yearsOfData <= 0) return null;

  // -- 전략 1: 200일선 단순 교차 (generate_summary_snapshot.mjs와 동일 로직) --
  const simpleCrossings = [];
  for (let i = 1; i <= lastIndex; i++) {
    const prevPrice = adjustedSeries[i - 1];
    const currPrice = adjustedSeries[i];
    const prevMa = averageOf(adjustedSeries, MA_PERIOD, i - 1);
    const currMa = averageOf(adjustedSeries, MA_PERIOD, i);
    if (prevPrice === null || currPrice === null || prevMa === null || currMa === null) continue;
    const crossedUp = prevPrice < prevMa && currPrice >= currMa;
    const crossedDown = prevPrice > prevMa && currPrice <= currMa;
    if (!crossedUp && !crossedDown) continue;
    simpleCrossings.push({ direction: crossedUp ? "up" : "down", close: currPrice, date: records[i].Date });
  }

  // -- 전략 2: 앗추 필터 (16/20) --
  const filterCrossings = [];
  let prevQual = null;
  for (let i = 0; i <= lastIndex; i++) {
    if (i < 19) continue;
    const isQual = isHoldFilterQualified(adjustedSeries, MA_PERIOD, i);
    if (prevQual === null) {
      prevQual = isQual;
      if (isQual) filterCrossings.push({ direction: "up", close: adjustedSeries[i], date: records[i].Date });
      continue;
    }
    if (isQual === prevQual) continue;
    filterCrossings.push({ direction: isQual ? "up" : "down", close: adjustedSeries[i], date: records[i].Date });
    prevQual = isQual;
  }

  // 공통 equity + trade + MDD 계산
  const runStrategy = (crossings) => {
    // 일별 equity 커브로 MDD 계산하기 위해 신호를 날짜 맵으로 변환
    const signalByDate = new Map();
    crossings.forEach((item) => { signalByDate.set(item.date || "", item); });

    let equity = 1, holding = false, entryPrice = null;
    let peak = 1, mdd = 0;

    for (let i = 0; i <= lastIndex; i++) {
      const price = adjustedSeries[i];
      const date = records[i]?.Date || "";
      if (price === null) continue;

      const signal = signalByDate.get(date);
      if (signal) {
        if (signal.direction === "up" && !holding) {
          holding = true;
          entryPrice = price;
        } else if (signal.direction === "down" && holding && entryPrice !== null) {
          equity *= price / entryPrice;
          holding = false;
          entryPrice = null;
        }
      }

      // 현재 equity (보유 중이면 미실현 포함)
      const currentEquity = holding && entryPrice !== null && entryPrice > 0
        ? equity * (price / entryPrice)
        : equity;

      if (currentEquity > peak) peak = currentEquity;
      const drawdown = (currentEquity - peak) / peak;
      if (drawdown < mdd) mdd = drawdown;
    }

    // 미청산 포지션 반영
    if (holding && entryPrice !== null && latestClose !== null && entryPrice > 0) {
      equity *= latestClose / entryPrice;
    }
    const hasPositions = crossings.length > 0;
    const totalReturn = hasPositions ? (equity - 1) * 100 : null;
    const cagr = totalReturn !== null
      ? round2((Math.pow(1 + totalReturn / 100, 1 / yearsOfData) - 1) * 100)
      : null;
    const signalsPerYear = round2(crossings.length / yearsOfData);
    return { cagr, mdd: round2(mdd * 100), totalSignals: crossings.length, signalsPerYear };
  };

  const simple = runStrategy(simpleCrossings);
  const filter = runStrategy(filterCrossings);
  const tradeReduction = simple.signalsPerYear > 0
    ? Math.round((1 - filter.signalsPerYear / simple.signalsPerYear) * 100)
    : null;

  return {
    years: round2(yearsOfData),
    dataStart: records[0].Date,
    dataEnd: records[lastIndex].Date,
    ma200: simple,
    atchuFilter: filter,
    tradeReductionPercent: tradeReduction
  };
};

// --- Main ---
const spyCsv = readCsv(CHART_TICKER);
if (!spyCsv) {
  console.error(`Failed to read ${CHART_TICKER} CSV`);
  process.exit(1);
}

const { items, crossings, simpleCrossings } = buildChartData(spyCsv);
console.log(`SPY chart items: ${items.length}, crossings: ${crossings.length}, simpleCrossings: ${simpleCrossings.length}`);

const cagr = {};
for (const ticker of CAGR_TICKERS) {
  const csv = readCsv(ticker);
  if (!csv) { cagr[ticker] = null; continue; }
  cagr[ticker] = computeCagr(csv);
  console.log(`${ticker} CAGR: ${cagr[ticker]}`);
}

// --- 백테스트 비교 ---
const backtestComparison = {};
for (const ticker of BACKTEST_TICKERS) {
  const csv = ticker === CHART_TICKER ? spyCsv : readCsv(ticker);
  if (!csv) { backtestComparison[ticker] = null; continue; }
  backtestComparison[ticker] = computeBacktestComparison(csv);
  const r = backtestComparison[ticker];
  if (r) {
    console.log(`${ticker} backtest: MA200 CAGR=${r.ma200.cagr}% ${r.ma200.signalsPerYear}/yr | Filter CAGR=${r.atchuFilter.cagr}% ${r.atchuFilter.signalsPerYear}/yr | −${r.tradeReductionPercent}% trades`);
  }
}

const payload = {
  v: 2,
  generated_at: new Date().toISOString(),
  chart: { items },
  crossings,
  simpleCrossings,
  cagr,
  backtestComparison
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const body = JSON.stringify(payload);
fs.writeFileSync(OUT_FILE, body + "\n", "utf8");

const sizeKB = (Buffer.byteLength(body, "utf8") / 1024).toFixed(1);
console.log(`generated ${OUT_FILE} (${sizeKB} KB)`);
