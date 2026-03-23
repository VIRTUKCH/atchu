#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "snapshot");
const OUT_FILE = path.join(SUMMARY_DIR, "summary_snapshots.json");
const CROSSING_STRATEGIES = [
  { key: 200, period: 200, mode: "cross" },
  { key: "200-20of16", period: 200, mode: "hold_20of16" },
  { key: "full_align", mode: "full_alignment" },
  { key: "atchu_full_align", mode: "atchu_full_alignment" }
];
const PERIODS = [50, 100, 200];

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
  const latestAdjustedClose = adjustedSeries[lastIndex];
  const previousAdjustedClose = adjustedSeries[lastIndex - 1];
  const close = latestAdjustedClose;
  const previousClose = previousAdjustedClose;
  const movingAverage50 = averageOf(adjustedSeries, 50, lastIndex);
  const movingAverage100 = averageOf(adjustedSeries, 100, lastIndex);
  const movingAverage200 = averageOf(adjustedSeries, 200, lastIndex);
  const percentDiff = (ma) => (ma && close !== null ? ((close - ma) / ma) * 100 : null);

  const maAlignment = (() => {
    if (close === null || movingAverage50 === null || movingAverage100 === null || movingAverage200 === null) {
      return null;
    }
    if (close > movingAverage50 && movingAverage50 > movingAverage100 && movingAverage100 > movingAverage200) {
      return "full";
    }
    if (movingAverage200 > movingAverage100 && movingAverage100 > movingAverage50 && movingAverage50 > close) {
      return "reverse";
    }
    return "partial";
  })();

  const maAlignmentDays = (() => {
    if (maAlignment !== "full" && maAlignment !== "reverse") return null;
    let days = 0;
    for (let i = lastIndex; i >= 199; i -= 1) {
      const p = adjustedSeries[i];
      const m50 = averageOf(adjustedSeries, 50, i);
      const m100 = averageOf(adjustedSeries, 100, i);
      const m200 = averageOf(adjustedSeries, 200, i);
      if (p === null || m50 === null || m100 === null || m200 === null) break;
      const state = (p > m50 && m50 > m100 && m100 > m200) ? "full"
        : (m200 > m100 && m100 > m50 && m50 > p) ? "reverse"
        : "other";
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
      const ma = averageOf(adjustedSeries, 200, j);
      if (price !== null && ma !== null && price > ma) count += 1;
    }
    return count;
  })();

  const holdingItems = PERIODS.map((period) => {
    const lastMa = averageOf(adjustedSeries, period, lastIndex);
    if (lastMa === null) {
      return { label: `${period}일선`, days: null, direction: null };
    }
    const lastPrice = adjustedSeries[lastIndex];
    const lastState = lastPrice >= lastMa;
    let days = 0;
    for (let i = lastIndex; i >= 0; i -= 1) {
      const ma = averageOf(adjustedSeries, period, i);
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
    const period = strategy.period;
    for (let i = 1; i <= lastIndex; i += 1) {
      const prevMa = averageOf(adjustedSeries, period, i - 1);
      const currMa = averageOf(adjustedSeries, period, i);
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

  const isHoldFilterQualified = (period, index, windowDays = 20, minDays = 16) => {
    if (index < windowDays - 1) {
      return false;
    }
    let aboveCount = 0;
    for (let j = index - windowDays + 1; j <= index; j += 1) {
      const price = adjustedSeries[j];
      const ma = averageOf(adjustedSeries, period, j);
      if (price !== null && ma !== null && price > ma) {
        aboveCount += 1;
      }
    }
    return aboveCount >= minDays;
  };

  CROSSING_STRATEGIES.filter((strategy) => strategy.mode === "hold_20of16").forEach((strategy) => {
    let prevQualified = null;
    for (let i = 0; i <= lastIndex; i += 1) {
      if (i < 19) {
        continue;
      }
      const isQualified = isHoldFilterQualified(strategy.period, i, 20, 16);
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

  CROSSING_STRATEGIES.filter((strategy) => strategy.mode === "full_alignment").forEach((strategy) => {
    const startIdx = 199;
    let prevAligned = null;
    for (let i = startIdx; i <= lastIndex; i += 1) {
      const price = adjustedSeries[i];
      const ma50 = averageOf(adjustedSeries, 50, i);
      const ma100 = averageOf(adjustedSeries, 100, i);
      const ma200 = averageOf(adjustedSeries, 200, i);
      if (price === null || ma50 === null || ma100 === null || ma200 === null) continue;
      const isAligned = price > ma50 && ma50 > ma100 && ma100 > ma200;
      if (prevAligned === null) {
        prevAligned = isAligned;
        if (isAligned) {
          crossingItems.push({
            period: strategy.key,
            date: records[i]?.Date || null,
            direction: "up",
            close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
          });
        }
        continue;
      }
      if (isAligned === prevAligned) continue;
      crossingItems.push({
        period: strategy.key,
        date: records[i]?.Date || null,
        direction: isAligned ? "up" : "down",
        close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
      });
      prevAligned = isAligned;
    }
  });

  CROSSING_STRATEGIES.filter((strategy) => strategy.mode === "atchu_full_alignment").forEach((strategy) => {
    const startIdx = 199;
    let prevQualified = null;
    for (let i = startIdx; i <= lastIndex; i += 1) {
      const price = adjustedSeries[i];
      const ma50 = averageOf(adjustedSeries, 50, i);
      const ma100 = averageOf(adjustedSeries, 100, i);
      const ma200 = averageOf(adjustedSeries, 200, i);
      if (price === null || ma50 === null || ma100 === null || ma200 === null) continue;
      const isAligned = price > ma50 && ma50 > ma100 && ma100 > ma200;
      const isAtchu = isHoldFilterQualified(200, i, 20, 16);
      const isQualified = isAligned && isAtchu;
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
      if (isQualified === prevQualified) continue;
      crossingItems.push({
        period: strategy.key,
        date: records[i]?.Date || null,
        direction: isQualified ? "up" : "down",
        close: parseNumber(records[i]?.Adjusted_close ?? records[i]?.Close)
      });
      prevQualified = isQualified;
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
      movingAverage100: round2(movingAverage100),
      movingAverage200: round2(movingAverage200),
      percentDiff50: round2(percentDiff(movingAverage50)),
      percentDiff100: round2(percentDiff(movingAverage100)),
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
