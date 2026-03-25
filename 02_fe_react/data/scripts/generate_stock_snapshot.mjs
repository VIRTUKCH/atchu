#!/usr/bin/env node
/**
 * 개별주(S&P 500) 스냅샷 JSON 생성.
 * generate_summary_snapshot.mjs와 동일한 분석 로직, CSV/출력 경로만 다름.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv_stock");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "stock_snapshot");
const OUT_FILE = path.join(SUMMARY_DIR, "stock_snapshots.json");
const CROSSING_STRATEGIES = [
  { key: 200, period: 200, mode: "cross" },
  { key: "200-20of16", period: 200, mode: "hold_20of16" },
  { key: "golden_cross", mode: "golden_cross" }
];
const PERIODS = [50, 200];

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const round2 = (value) => (value === null ? null : Math.round(value * 100) / 100);

const normalizeTicker = (ticker) => String(ticker || "").trim().toUpperCase();

const averageOf = (series, period, index) => {
  if (index + 1 < period) {
    return null;
  }
  const slice = series.slice(index - period + 1, index + 1);
  if (slice.some((value) => value === null)) {
    return null;
  }
  const total = slice.reduce((sum, value) => sum + value, 0);
  return total / period;
};

/**
 * MA 사전계산 배열을 반환한다.
 * averageOf()와 동일한 결과를 O(n)으로 생성.
 * - series에 null이 포함된 window는 null을 반환 (averageOf와 동일 동작).
 */
const precomputeMA = (series, period) => {
  const len = series.length;
  const result = new Array(len).fill(null);
  let sum = 0;
  let nullCount = 0;

  for (let i = 0; i < len; i++) {
    // 새 값 추가
    if (series[i] === null || series[i] === undefined) {
      nullCount++;
    } else {
      sum += series[i];
    }
    // 윈도우 밖으로 나간 값 제거
    if (i >= period) {
      const old = series[i - period];
      if (old === null || old === undefined) {
        nullCount--;
      } else {
        sum -= old;
      }
    }
    // period개가 모였고 null이 없을 때만 평균 기록
    if (i >= period - 1 && nullCount === 0) {
      result[i] = sum / period;
    }
  }
  return result;
};

const buildFromCsv = (csvText) => {
  const lines = String(csvText || "").trim().split("\n");
  if (lines.length < 3) {
    return null;
  }
  const headers = lines[0].split(",").map((item) => item.trim());
  const records = lines
    .slice(1)
    .map((line) => line.split(","))
    .map((parts) => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = parts[index];
      });
      return row;
    })
    .filter((row) => row.Date);
  if (records.length < 2) {
    return null;
  }
  records.sort((a, b) => String(a.Date).localeCompare(String(b.Date)));
  const lastIndex = records.length - 1;
  const latest = records[lastIndex];
  const adjustedSeries = records.map((row) => parseNumber(row.Adjusted_close ?? row.Close));
  const ma50Array = precomputeMA(adjustedSeries, 50);
  const ma200Array = precomputeMA(adjustedSeries, 200);
  const latestAdjustedClose = adjustedSeries[lastIndex];
  const previousAdjustedClose = adjustedSeries[lastIndex - 1];
  const close = latestAdjustedClose;
  const previousClose = previousAdjustedClose;
  const movingAverage50 = ma50Array[lastIndex];
  const movingAverage200 = ma200Array[lastIndex];
  const percentDiff = (ma) => (ma && close !== null ? ((close - ma) / ma) * 100 : null);

  // 골든크로스/데드크로스 상태: MA50 > MA200 = golden, MA200 > MA50 = dead
  const maAlignment = (() => {
    if (movingAverage50 === null || movingAverage200 === null) {
      return null;
    }
    return movingAverage50 > movingAverage200 ? "golden" : "dead";
  })();
  // 골든크로스/데드크로스 연속 유지 일수
  const maAlignmentDays = (() => {
    if (maAlignment === null) return null;
    let days = 0;
    for (let i = lastIndex; i >= 199; i -= 1) {
      const m50 = ma50Array[i];
      const m200 = ma200Array[i];
      if (m50 === null || m200 === null) break;
      const state = m50 > m200 ? "golden" : "dead";
      if (state === maAlignment) {
        days += 1;
      } else {
        break;
      }
    }
    return days;
  })();

  const percentChangeFromLookback = (days) => {
    const lookbackIndex = lastIndex - days;
    if (lookbackIndex < 0 || latestAdjustedClose === null) {
      return null;
    }
    const base = adjustedSeries[lookbackIndex];
    if (base === null || base === 0) {
      return null;
    }
    return ((latestAdjustedClose - base) / base) * 100;
  };

  const aboveDays200 = (() => {
    if (lastIndex < 19) return 0;
    let count = 0;
    for (let j = lastIndex - 19; j <= lastIndex; j += 1) {
      const price = adjustedSeries[j];
      const ma = ma200Array[j];
      if (price !== null && ma !== null && price > ma) count += 1;
    }
    return count;
  })();

  const maArrayMap = { 50: ma50Array, 200: ma200Array };
  const holdingItems = PERIODS.map((period) => {
    const maArray = maArrayMap[period];
    const lastMa = maArray[lastIndex];
    if (lastMa === null) {
      return { label: `${period}일선`, days: null, direction: null };
    }
    const lastPrice = adjustedSeries[lastIndex];
    const lastState = lastPrice >= lastMa;
    let days = 0;
    for (let i = lastIndex; i >= 0; i -= 1) {
      const ma = maArray[i];
      const price = adjustedSeries[i];
      if (ma === null || price === null) {
        break;
      }
      if ((price >= ma) === lastState) {
        days += 1;
      } else {
        break;
      }
    }
    return { label: `${period}일선`, days, direction: lastState ? "up" : "down" };
  });

  const crossingItems = [];
  CROSSING_STRATEGIES.filter((strategy) => strategy.mode === "cross").forEach((strategy) => {
    const maArray = maArrayMap[strategy.period];
    for (let i = 1; i <= lastIndex; i += 1) {
      const prevMa = maArray[i - 1];
      const currMa = maArray[i];
      const prevPrice = adjustedSeries[i - 1];
      const currPrice = adjustedSeries[i];
      if (prevMa === null || currMa === null || prevPrice === null || currPrice === null) {
        continue;
      }
      const crossedUp = prevPrice < prevMa && currPrice >= currMa;
      const crossedDown = prevPrice > prevMa && currPrice <= currMa;
      if (!crossedUp && !crossedDown) {
        continue;
      }
      crossingItems.push({
        period: strategy.key,
        date: records[i]?.Date || null,
        direction: crossedUp ? "up" : "down",
        close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
      });
    }
  });

  const isHoldFilterQualified = (maArray, index, windowDays = 20, minDays = 16) => {
    if (index < windowDays - 1) {
      return false;
    }
    let aboveCount = 0;
    for (let j = index - windowDays + 1; j <= index; j += 1) {
      const price = adjustedSeries[j];
      const ma = maArray[j];
      if (price !== null && ma !== null && price > ma) {
        aboveCount += 1;
      }
    }
    return aboveCount >= minDays;
  };

  CROSSING_STRATEGIES.filter((strategy) => strategy.mode === "hold_20of16").forEach((strategy) => {
    const maArray = maArrayMap[strategy.period];
    let prevQualified = null;
    for (let i = 0; i <= lastIndex; i += 1) {
      if (i < 19) {
        continue;
      }
      const isQualified = isHoldFilterQualified(maArray, i, 20, 16);
      if (prevQualified === null) {
        prevQualified = isQualified;
        if (isQualified) {
          crossingItems.push({
            period: strategy.key,
            date: records[i]?.Date || null,
            direction: "up",
            close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
          });
        }
        continue;
      }
      if (isQualified === prevQualified) {
        continue;
      }
      crossingItems.push({
        period: strategy.key,
        date: records[i]?.Date || null,
        direction: isQualified ? "up" : "down",
        close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
      });
      prevQualified = isQualified;
    }
  });

  // 골든크로스 전략: MA50 > MA200 일 때 매수, MA200 > MA50 일 때 매도
  CROSSING_STRATEGIES.filter((strategy) => strategy.mode === "golden_cross").forEach((strategy) => {
    const startIdx = 199;
    let prevGolden = null;
    for (let i = startIdx; i <= lastIndex; i += 1) {
      const ma50 = ma50Array[i];
      const ma200 = ma200Array[i];
      if (ma50 === null || ma200 === null) continue;
      const isGolden = ma50 > ma200;
      if (prevGolden === null) {
        prevGolden = isGolden;
        if (isGolden) {
          crossingItems.push({
            period: strategy.key,
            date: records[i]?.Date || null,
            direction: "up",
            close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
          });
        }
        continue;
      }
      if (isGolden === prevGolden) continue;
      crossingItems.push({
        period: strategy.key,
        date: records[i]?.Date || null,
        direction: isGolden ? "up" : "down",
        close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
      });
      prevGolden = isGolden;
    }
  });

  const firstDate = new Date(records[0]?.Date || "");
  const lastDate = new Date(records[lastIndex]?.Date || "");
  const yearsOfData =
    Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())
      ? null
      : Math.max(0, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const computeStrategyMetrics = (strategyKey) => {
    const signalMap = new Map();
    crossingItems
      .filter((item) => item.period === strategyKey && item.date)
      .forEach((item) => signalMap.set(item.date, item));
    if (signalMap.size === 0) {
      return { expectedReturn: null, mddPercent: null };
    }
    let equity = 1;
    let holding = false;
    let entryPrice = null;
    let peak = 1;
    let maxDrawdown = 0;
    let hasPosition = false;
    for (let i = 0; i <= lastIndex; i += 1) {
      const price = adjustedSeries[i];
      const date = records[i]?.Date;
      if (price === null || !date) continue;
      const signal = signalMap.get(date);
      if (signal) {
        if (signal.direction === "up" && !holding) {
          holding = true;
          entryPrice = price;
        } else if (signal.direction === "down" && holding && entryPrice !== null) {
          equity *= price / entryPrice;
          holding = false;
          entryPrice = null;
          hasPosition = true;
        }
      }
      let currentEquity = equity;
      if (holding && entryPrice !== null && entryPrice > 0) {
        currentEquity = equity * (price / entryPrice);
      }
      if (currentEquity > peak) peak = currentEquity;
      const dd = (currentEquity / peak - 1) * 100;
      if (dd < maxDrawdown) maxDrawdown = dd;
    }
    if (holding && entryPrice !== null && close !== null && entryPrice > 0) {
      equity *= close / entryPrice;
      hasPosition = true;
    }
    return {
      expectedReturn: hasPosition ? (equity - 1) * 100 : null,
      mddPercent: hasPosition ? maxDrawdown : null
    };
  };

  const annualizedMap = {};
  const mddMap = {};
  CROSSING_STRATEGIES.forEach((strategy) => {
    const metrics = computeStrategyMetrics(strategy.key);
    annualizedMap[strategy.key] = round2(
      yearsOfData && yearsOfData > 0 && metrics.expectedReturn !== null
        ? (Math.pow(1 + metrics.expectedReturn / 100, 1 / yearsOfData) - 1) * 100
        : null
    );
    mddMap[strategy.key] = round2(metrics.mddPercent);
  });

  return {
    snapshot: {
      open: round2(parseNumber(latest.Open)),
      close: round2(close),
      previousClose: round2(previousClose),
      percentChangeFromPreviousClose: round2(
        close !== null && previousClose !== null
          ? ((close - previousClose) / previousClose) * 100
          : null
      ),
      percentChange5d: round2(percentChangeFromLookback(5)),
      percentChange63d: round2(percentChangeFromLookback(63)),
      percentChange252d: round2(percentChangeFromLookback(252)),
      percentChange1260d: round2(percentChangeFromLookback(1260)),
      high: round2(parseNumber(latest.High)),
      low: round2(parseNumber(latest.Low)),
      volume: parseNumber(latest.Volume),
      dataDateMarket: latest.Date || null,
      movingAverage50: round2(movingAverage50),
      movingAverage200: round2(movingAverage200),
      percentDiff50: round2(percentDiff(movingAverage50)),
      percentDiff200: round2(percentDiff(movingAverage200)),
      maAlignment,
      maAlignmentDays,
      aboveDays200,
      isAtchuQualified200: aboveDays200 >= 16,
      dataStartDate: records[0]?.Date || null
    },
    trendHolding: { items: holdingItems },
    crossingHistory: { annualizedMap, mddMap }
  };
};

const files = fs.existsSync(CSV_DIR)
  ? fs.readdirSync(CSV_DIR).filter((file) => file.endsWith("_all.csv")).sort()
  : [];

const tickers = {};
files.forEach((file) => {
  const symbol = normalizeTicker(file.replace("_all.csv", ""));
  const base = normalizeTicker(symbol.split(".")[0]);
  const fullPath = path.join(CSV_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const analytics = buildFromCsv(raw);
  if (!analytics) {
    return;
  }
  if (!tickers[base]) {
    tickers[base] = analytics;
  }
});

const payload = {
  version: 1,
  generated_at: new Date().toISOString(),
  tickers
};

fs.mkdirSync(SUMMARY_DIR, { recursive: true });
const body = `${JSON.stringify(payload)}\n`;
fs.writeFileSync(OUT_FILE, body, "utf8");

console.log(`generated ${OUT_FILE} (${Object.keys(tickers).length} tickers)`);
