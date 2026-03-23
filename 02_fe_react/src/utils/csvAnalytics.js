const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildCsvAnalytics = (csvText, options = {}) => {
  if (!csvText) {
    return null;
  }
  const windowDays = options.windowDays || 20;
  const periods = options.periods || [50, 100, 200];
  const lines = csvText.trim().split("\n");
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
  records.sort((a, b) => a.Date.localeCompare(b.Date));
  const lastIndex = records.length - 1;
  const latest = records[lastIndex];
  const previous = records[lastIndex - 1];
  const close = parseNumber(latest.Close);
  const previousClose = parseNumber(previous.Close);
  const adjustedSeries = records.map((row) => parseNumber(row.Adjusted_close));
  const prefixSum = new Float64Array(adjustedSeries.length + 1);
  const prefixValid = new Uint16Array(adjustedSeries.length + 1);
  for (let i = 0; i < adjustedSeries.length; i += 1) {
    prefixSum[i + 1] = prefixSum[i] + (adjustedSeries[i] ?? 0);
    prefixValid[i + 1] = prefixValid[i] + (adjustedSeries[i] !== null ? 1 : 0);
  }
  const averageOf = (period, index) => {
    if (index + 1 < period) {
      return null;
    }
    const start = index - period + 1;
    if (prefixValid[index + 1] - prefixValid[start] < period) {
      return null;
    }
    return (prefixSum[index + 1] - prefixSum[start]) / period;
  };
  const movingAverage50 = averageOf(50, lastIndex);
  const movingAverage200 = averageOf(200, lastIndex);
  const percentDiff = (ma) => {
    if (!ma || close === null) {
      return null;
    }
    return ((close - ma) / ma) * 100;
  };
  const maAlignment = (() => {
    if (movingAverage50 === null || movingAverage200 === null) {
      return null;
    }
    return movingAverage50 > movingAverage200 ? "golden" : "dead";
  })();
  const percentChangeFromPreviousClose =
    close !== null && previousClose !== null
      ? ((close - previousClose) / previousClose) * 100
      : null;
  const snapshot = {
    id: "local-qqq-snapshot",
    open: parseNumber(latest.Open),
    close,
    previousClose,
    percentChangeFromPreviousClose,
    high: parseNumber(latest.High),
    low: parseNumber(latest.Low),
    volume: parseNumber(latest.Volume),
    dataDateMarket: latest.Date || null,
    dataTimestampUtc: latest.Date ? `${latest.Date}T00:00:00Z` : null,
    movingAverage50,
    movingAverage200,
    percentDiff50: percentDiff(movingAverage50),
    percentDiff200: percentDiff(movingAverage200),
    maAlignment
  };

  const supportItems = periods.map((period) => {
    let aboveDays = 0;
    let belowDays = 0;
    const startIndex = Math.max(0, records.length - windowDays);
    for (let i = startIndex; i < records.length; i += 1) {
      const ma = averageOf(period, i);
      const price = adjustedSeries[i];
      if (ma === null || price === null) {
        continue;
      }
      if (price >= ma) {
        aboveDays += 1;
      } else {
        belowDays += 1;
      }
    }
    return {
      label: `${period}일선`,
      aboveDays,
      belowDays
    };
  });

  const holdingItems = periods.map((period) => {
    const lastMa = averageOf(period, lastIndex);
    if (lastMa === null) {
      return { label: `${period}일선`, days: null, direction: null };
    }
    const lastPrice = adjustedSeries[lastIndex];
    const lastState = lastPrice >= lastMa;
    let count = 0;
    for (let i = lastIndex; i >= 0; i -= 1) {
      const ma = averageOf(period, i);
      const price = adjustedSeries[i];
      if (ma === null || price === null) {
        break;
      }
      const state = price >= ma;
      if (state === lastState) {
        count += 1;
      } else {
        break;
      }
    }
    const direction = lastState ? "up" : "down";
    return {
      label: `${period}일선`,
      days: count,
      direction
    };
  });

  const dateValues = records.map((row) => row.Date || null);
  const dateObjects = dateValues.map((value) => (value ? new Date(value) : null));
  const lastDate = dateObjects[lastIndex];
  const firstDate = dateObjects[0];
  const startDateLabel = records[0]?.Date || null;
  const endDateLabel = latest?.Date || null;
  const yearsOfData =
    firstDate && lastDate && !Number.isNaN(firstDate.getTime()) && !Number.isNaN(lastDate.getTime())
      ? Math.max(0, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : null;
  const findStartIndexByYears = (years, fallbackDays) => {
    if (!lastDate || Number.isNaN(lastDate.getTime())) {
      return Math.max(0, records.length - fallbackDays);
    }
    const cutoff = new Date(lastDate);
    cutoff.setFullYear(cutoff.getFullYear() - years);
    const foundIndex = dateObjects.findIndex(
      (date) => date && date >= cutoff
    );
    return foundIndex === -1 ? 0 : foundIndex;
  };
  const findStartIndexByDays = (days) =>
    Math.max(0, records.length - days);
  const buildChartItems = (startIndex) => {
    const items = [];
    for (let i = startIndex; i <= lastIndex; i += 1) {
      const closeValue = adjustedSeries[i];
      items.push({
        date: records[i]?.Date || null,
        open: parseNumber(records[i]?.Open),
        high: parseNumber(records[i]?.High),
        low: parseNumber(records[i]?.Low),
        closeRaw: parseNumber(records[i]?.Close),
        close: closeValue ?? null,
        ma50: averageOf(50, i),
        ma200: averageOf(200, i)
      });
    }
    return items;
  };
  const chartSeries = {
    oneYear: {
      years: 1,
      items: buildChartItems(findStartIndexByYears(1, 252))
    },
    threeMonth: {
      years: null,
      items: buildChartItems(findStartIndexByDays(63))
    },
    fiveYear: {
      years: 5,
      items: buildChartItems(findStartIndexByYears(5, 252 * 5))
    },
    full: {
      years: null,
      items: buildChartItems(0)
    }
  };

  const crossingStrategies = [
    { key: 200, period: 200, label: "200일선", mode: "cross" },
    {
      key: "200-20of16",
      period: 200,
      label: "앗추 필터 (200일)",
      mode: "hold_20of16"
    },
    { key: "golden_cross", label: "골든크로스", mode: "golden_cross" },
  ];
  const crossingPeriods = crossingStrategies.map((strategy) => strategy.key);
  const crossingPeriodLabels = crossingStrategies.reduce((acc, strategy) => {
    acc[strategy.key] = strategy.label;
    return acc;
  }, {});
  const crossingItems = [];
  const buildCrossingId = (periodKey, date) => `${periodKey}-${date || "unknown"}`;
  const resolveCloseValue = (row) => {
    const adjustedClose = parseNumber(row?.Adjusted_close);
    if (adjustedClose !== null) {
      return adjustedClose;
    }
    return parseNumber(row?.Close);
  };
  crossingStrategies
    .filter((strategy) => strategy.mode === "cross")
    .forEach((strategy) => {
      const period = strategy.period;
      const periodKey = strategy.key;
      for (let i = 1; i <= lastIndex; i += 1) {
        const prevMa = averageOf(period, i - 1);
        const currMa = averageOf(period, i);
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
        const currentRow = records[i];
        const prevRow = records[i - 1];
        const currentClose = resolveCloseValue(currentRow);
        const prevClose = resolveCloseValue(prevRow);
        const changePercent =
          currentClose !== null && prevClose !== null
            ? ((currentClose - prevClose) / prevClose) * 100
            : null;
        crossingItems.push({
          id: buildCrossingId(periodKey, currentRow?.Date),
          period: periodKey,
          date: currentRow?.Date || null,
          direction: crossedUp ? "up" : "down",
          close: currentClose,
          adjustedClose: currPrice,
          changePercent
        });
      }
    });

  // 최근 20일 중 16일 이상 N일선 상단 유지 여부를 기준으로 진입/청산 로그를 남긴다.
  const holdFilterWindow = 20;
  const holdFilterMinDays = 16;
  // hold_20of16 판정을 O(n) 슬라이딩 윈도우로 사전 계산
  const holdQualifiedCache = {};
  periods.forEach((period) => {
    const qualified = new Array(adjustedSeries.length).fill(false);
    let aboveCount = 0;
    for (let i = 0; i < adjustedSeries.length; i += 1) {
      const price = adjustedSeries[i];
      const ma = averageOf(period, i);
      const isAbove = price !== null && ma !== null && price > ma;
      if (isAbove) {
        aboveCount += 1;
      }
      if (i >= holdFilterWindow) {
        const oldPrice = adjustedSeries[i - holdFilterWindow];
        const oldMa = averageOf(period, i - holdFilterWindow);
        const wasAbove = oldPrice !== null && oldMa !== null && oldPrice > oldMa;
        if (wasAbove) {
          aboveCount -= 1;
        }
      }
      if (i >= holdFilterWindow - 1) {
        qualified[i] = aboveCount >= holdFilterMinDays;
      }
    }
    holdQualifiedCache[period] = qualified;
  });
  crossingStrategies
    .filter((strategy) => strategy.mode === "hold_20of16")
    .forEach((strategy) => {
      let prevHoldQualified = null;
      for (let i = 0; i <= lastIndex; i += 1) {
        if (i < holdFilterWindow - 1) {
          continue;
        }
        const isQualified = holdQualifiedCache[strategy.period]?.[i] ?? false;
        if (prevHoldQualified === null) {
          prevHoldQualified = isQualified;
          if (isQualified) {
            const currentRow = records[i];
            const prevRow = i > 0 ? records[i - 1] : null;
            const currentClose = resolveCloseValue(currentRow);
            const prevClose = resolveCloseValue(prevRow);
            const changePercent =
              currentClose !== null && prevClose !== null
                ? ((currentClose - prevClose) / prevClose) * 100
                : null;
            crossingItems.push({
              id: buildCrossingId(strategy.key, currentRow?.Date),
              period: strategy.key,
              date: currentRow?.Date || null,
              direction: "up",
              close: currentClose,
              adjustedClose: adjustedSeries[i],
              changePercent
            });
          }
          continue;
        }
        if (isQualified === prevHoldQualified) {
          continue;
        }
        const currentRow = records[i];
        const prevRow = i > 0 ? records[i - 1] : null;
        const currentClose = resolveCloseValue(currentRow);
        const prevClose = resolveCloseValue(prevRow);
        const changePercent =
          currentClose !== null && prevClose !== null
            ? ((currentClose - prevClose) / prevClose) * 100
            : null;
        crossingItems.push({
          id: buildCrossingId(strategy.key, currentRow?.Date),
          period: strategy.key,
          date: currentRow?.Date || null,
          direction: isQualified ? "up" : "down",
          close: currentClose,
          adjustedClose: adjustedSeries[i],
          changePercent
        });
        prevHoldQualified = isQualified;
      }
    });

  // 골든크로스 전략: MA50 > MA200 전환 시 매수(up), MA200 > MA50 전환 시 매도(down)
  crossingStrategies
    .filter((strategy) => strategy.mode === "golden_cross")
    .forEach((strategy) => {
      const startIdx = Math.max(199, 0);
      let prevGolden = null;
      for (let i = startIdx; i <= lastIndex; i += 1) {
        const ma50 = averageOf(50, i);
        const ma200 = averageOf(200, i);
        if (ma50 === null || ma200 === null) continue;
        const isGolden = ma50 > ma200;
        if (prevGolden === null) {
          prevGolden = isGolden;
          if (isGolden) {
            const currentRow = records[i];
            const prevRow = i > 0 ? records[i - 1] : null;
            const currentClose = resolveCloseValue(currentRow);
            const prevClose = resolveCloseValue(prevRow);
            const changePercent =
              currentClose !== null && prevClose !== null
                ? ((currentClose - prevClose) / prevClose) * 100
                : null;
            crossingItems.push({
              id: buildCrossingId(strategy.key, currentRow?.Date),
              period: strategy.key,
              date: currentRow?.Date || null,
              direction: "up",
              close: currentClose,
              adjustedClose: adjustedSeries[i],
              changePercent
            });
          }
          continue;
        }
        if (isGolden === prevGolden) continue;
        const currentRow = records[i];
        const prevRow = i > 0 ? records[i - 1] : null;
        const currentClose = resolveCloseValue(currentRow);
        const prevClose = resolveCloseValue(prevRow);
        const changePercent =
          currentClose !== null && prevClose !== null
            ? ((currentClose - prevClose) / prevClose) * 100
            : null;
        crossingItems.push({
          id: buildCrossingId(strategy.key, currentRow?.Date),
          period: strategy.key,
          date: currentRow?.Date || null,
          direction: isGolden ? "up" : "down",
          close: currentClose,
          adjustedClose: adjustedSeries[i],
          changePercent
        });
        prevGolden = isGolden;
      }
    });

  const computeCrossingStats = (items, periodKey, cutoffDate = null) => {
    const filtered = items.filter((item) => {
      if (item.period !== periodKey || !item.date) {
        return false;
      }
      if (!cutoffDate) {
        return true;
      }
      const itemDate = new Date(item.date);
      if (Number.isNaN(itemDate.getTime())) {
        return false;
      }
      return itemDate >= cutoffDate;
    });
    if (filtered.length === 0) {
      return { expectedReturn: null, trades: [] };
    }
    let equity = 1;
    let holding = false;
    let entryPrice = null;
    let entryDate = null;
    let hasClosedPosition = false;
    let assumedExit = null;
    const trades = [];
    filtered.forEach((item) => {
      const price = item.close ?? item.adjustedClose ?? null;
      if (price === null) {
        return;
      }
      if (item.direction === "up") {
        if (!holding) {
          holding = true;
          entryPrice = price;
          entryDate = item.date;
        }
        return;
      }
      if (item.direction === "down") {
        if (holding && entryPrice !== null) {
          const tradeReturn = (price / entryPrice - 1) * 100;
          equity *= price / entryPrice;
          trades.push({
            entryDate,
            exitDate: item.date,
            returnPercent: tradeReturn
          });
          hasClosedPosition = true;
          holding = false;
          entryPrice = null;
          entryDate = null;
        }
      }
    });
    // 마지막 하락 돌파가 없어 미청산 상태로 끝나면 최신 종가로 가정 청산해 수익률 계산에 반영한다.
    if (holding && entryPrice !== null && entryPrice > 0) {
      const latestExitPrice = latest?.Close !== undefined ? resolveCloseValue(latest) : adjustedSeries[lastIndex];
      if (latestExitPrice !== null && latestExitPrice > 0) {
        const assumedReturn = (latestExitPrice / entryPrice - 1) * 100;
        equity *= latestExitPrice / entryPrice;
        hasClosedPosition = true;
        assumedExit = {
          entryDate,
          exitDate: latest?.Date || endDateLabel || null,
          returnPercent: assumedReturn,
          close: latestExitPrice
        };
      }
    }

    const expectedReturn = hasClosedPosition ? (equity - 1) * 100 : null;
    return { expectedReturn, trades, assumedExit };
  };

  const crossingStatsMap = {};
  crossingPeriods.forEach((period) => {
    crossingStatsMap[period] = computeCrossingStats(crossingItems, period);
  });
  const annualizedReturnMap = {};
  crossingPeriods.forEach((period) => {
    const stats = crossingStatsMap[period];
    annualizedReturnMap[period] =
      yearsOfData && yearsOfData > 0 && stats.expectedReturn !== null
        ? (Math.pow(1 + stats.expectedReturn / 100, 1 / yearsOfData) - 1) * 100
        : null;
  });

  const tradeReturnMap = new Map();
  crossingPeriods.forEach((period) => {
    crossingStatsMap[period].trades.forEach((trade) => {
      tradeReturnMap.set(`${period}-${trade.exitDate}`, trade.returnPercent);
    });
  });
  const crossingItemsWithTrade = crossingItems.map((item) => ({
    ...item,
    tradeReturn: tradeReturnMap.get(`${item.period}-${item.date}`) ?? null
  }));
  const assumedExitItems = crossingPeriods
    .map((period) => {
      const assumed = crossingStatsMap?.[period]?.assumedExit;
      if (!assumed || !assumed.exitDate) {
        return null;
      }
      return {
        id: `${buildCrossingId(period, assumed.exitDate)}-assumed`,
        period,
        date: assumed.exitDate,
        direction: "down",
        close: assumed.close ?? null,
        adjustedClose: null,
        changePercent: null,
        tradeReturn: assumed.returnPercent ?? null,
        assumedExit: true
      };
    })
    .filter(Boolean);

  const findFirstValidIndex = () =>
    adjustedSeries.findIndex((value) => value !== null);
  const findLastValidIndex = () => {
    for (let i = lastIndex; i >= 0; i -= 1) {
      if (adjustedSeries[i] !== null) {
        return i;
      }
    }
    return -1;
  };

  const computeBuyHoldDrawdown = () => {
    const firstValidIndex = findFirstValidIndex();
    const lastValidIndex = findLastValidIndex();
    if (firstValidIndex === -1 || lastValidIndex === -1) {
      return {
        entryPrice: null,
        entryDate: null,
        latestPrice: null,
        latestDate: null,
        mddPercent: null,
        cagrPercent: null,
        mddUpdatedDate: null
      };
    }
    let peak = adjustedSeries[firstValidIndex];
    let maxDrawdown = 0;
    let mddUpdatedDate = records[firstValidIndex]?.Date || null;
    for (let i = firstValidIndex + 1; i <= lastValidIndex; i += 1) {
      const price = adjustedSeries[i];
      if (price === null) {
        continue;
      }
      if (price > peak) {
        peak = price;
      }
      const drawdown = price / peak - 1;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
        mddUpdatedDate = records[i]?.Date || null;
      }
    }
    const buyHoldYears =
      yearsOfData && yearsOfData > 0
        ? yearsOfData
        : null;
    const entryPrice = adjustedSeries[firstValidIndex];
    const latestPrice = adjustedSeries[lastValidIndex];
    const cagrPercent =
      buyHoldYears &&
      entryPrice !== null &&
      latestPrice !== null &&
      entryPrice > 0
        ? (Math.pow(latestPrice / entryPrice, 1 / buyHoldYears) - 1) * 100
        : null;
    return {
      entryPrice,
      entryDate: records[firstValidIndex]?.Date || null,
      latestPrice,
      latestDate: records[lastValidIndex]?.Date || null,
      mddPercent: maxDrawdown * 100,
      cagrPercent,
      mddUpdatedDate
    };
  };

  const isHoldFilterQualified = (period, index) =>
    holdQualifiedCache[period]?.[index] ?? false;

  const computeMovingAverageDrawdown = (period, mode = "cross") => {
    let equity = 1;
    let peak = 1;
    let maxDrawdown = 0;
    let mddUpdatedDate = null;
    let prevPrice = null;
    let prevSignal = false;
    let hasReturn = false;
    for (let i = 0; i <= lastIndex; i += 1) {
      const price = adjustedSeries[i];
      const ma = averageOf(period, i);
      if (price === null || ma === null) {
        prevPrice = price;
        prevSignal = false;
        continue;
      }
      if (prevPrice !== null && prevSignal) {
        equity *= price / prevPrice;
        hasReturn = true;
        if (equity > peak) {
          peak = equity;
        }
        const drawdown = equity / peak - 1;
        if (drawdown < maxDrawdown) {
          maxDrawdown = drawdown;
          mddUpdatedDate = records[i]?.Date || null;
        }
      }
      if (mode === "golden_cross") {
        const ma50 = averageOf(50, i);
        const ma200 = averageOf(200, i);
        prevSignal = ma50 !== null && ma200 !== null && ma50 > ma200;
      } else {
        prevSignal =
          mode === "hold_20of16"
            ? isHoldFilterQualified(period, i)
            : price >= ma;
      }
      prevPrice = price;
    }
    if (!hasReturn) {
      return { mddPercent: null, mddUpdatedDate: null };
    }
    return { mddPercent: maxDrawdown * 100, mddUpdatedDate };
  };
  const computeStrategyDrawdown = (strategy) => {
    if (!strategy || !strategy.mode) {
      return { mddPercent: null, mddUpdatedDate: null };
    }
    let equity = 1;
    let peak = 1;
    let maxDrawdown = 0;
    let mddUpdatedDate = null;
    let prevPrice = null;
    let prevSignal = false;
    let hasReturn = false;
    for (let i = 0; i <= lastIndex; i += 1) {
      const price = adjustedSeries[i];
      if (price === null) {
        prevPrice = price;
        prevSignal = false;
        continue;
      }
      if (prevPrice !== null && prevSignal) {
        equity *= price / prevPrice;
        hasReturn = true;
        if (equity > peak) {
          peak = equity;
        }
        const drawdown = equity / peak - 1;
        if (drawdown < maxDrawdown) {
          maxDrawdown = drawdown;
          mddUpdatedDate = records[i]?.Date || null;
        }
      }
      let currentSignal = false;
      if (strategy.mode === "cross") {
        const ma = averageOf(strategy.period, i);
        currentSignal = ma !== null && price >= ma;
      } else if (strategy.mode === "hold_20of16") {
        currentSignal = isHoldFilterQualified(strategy.period, i);
      } else if (strategy.mode === "golden_cross") {
        const ma50 = averageOf(50, i);
        const ma200 = averageOf(200, i);
        currentSignal = ma50 !== null && ma200 !== null && ma50 > ma200;
      }
      prevSignal = currentSignal;
      prevPrice = price;
    }
    if (!hasReturn) {
      return { mddPercent: null, mddUpdatedDate: null };
    }
    return { mddPercent: maxDrawdown * 100, mddUpdatedDate };
  };
  const strategyDrawdownMap = crossingStrategies.reduce((acc, strategy) => {
    acc[strategy.key] = computeStrategyDrawdown(strategy);
    return acc;
  }, {});

  const drawdownStats = {
    buyHold: computeBuyHoldDrawdown(),
    movingAverage: {
      200: computeMovingAverageDrawdown(200),
      "200-20of16": computeMovingAverageDrawdown(200, "hold_20of16"),
      "golden_cross": computeMovingAverageDrawdown(null, "golden_cross")
    }
  };

  // ── 심화 지표 (샤프/소르티노/승률/평균보유기간/수익팩터) ──
  const computeAdvancedMetrics = () => {
    const TRADING_DAYS = 252;
    const calcStdDev = (values) => {
      if (values.length < 2) return null;
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
      return Math.sqrt(variance);
    };
    const calcDownsideDev = (values) => {
      if (values.length < 2) return null;
      const sumSq = values.reduce((s, v) => {
        const d = Math.min(v, 0);
        return s + d * d;
      }, 0);
      return Math.sqrt(sumSq / (values.length - 1));
    };

    const bhReturns = [];
    for (let i = 1; i < adjustedSeries.length; i += 1) {
      if (adjustedSeries[i] !== null && adjustedSeries[i - 1] !== null && adjustedSeries[i - 1] > 0) {
        bhReturns.push(adjustedSeries[i] / adjustedSeries[i - 1] - 1);
      }
    }
    const bhStd = calcStdDev(bhReturns);
    const bhDownside = calcDownsideDev(bhReturns);
    const bhAnnualStd = bhStd !== null ? bhStd * Math.sqrt(TRADING_DAYS) : null;
    const bhAnnualDownside = bhDownside !== null ? bhDownside * Math.sqrt(TRADING_DAYS) : null;
    const bhCagr = drawdownStats.buyHold.cagrPercent !== null
      ? drawdownStats.buyHold.cagrPercent / 100
      : null;
    const buyHoldMetrics = {
      sharpe: bhCagr !== null && bhAnnualStd > 0 ? bhCagr / bhAnnualStd : null,
      sortino: bhCagr !== null && bhAnnualDownside > 0 ? bhCagr / bhAnnualDownside : null
    };

    const strategyMetrics = {};
    crossingStrategies.forEach((strategy) => {
      const stratReturns = [];
      for (let i = 1; i < adjustedSeries.length; i += 1) {
        const price = adjustedSeries[i];
        const prevPrice = adjustedSeries[i - 1];
        if (price === null || prevPrice === null || prevPrice <= 0) continue;
        let wasHolding = false;
        if (strategy.mode === "cross") {
          const ma = averageOf(strategy.period, i - 1);
          wasHolding = ma !== null && prevPrice >= ma;
        } else if (strategy.mode === "hold_20of16") {
          wasHolding = holdQualifiedCache[strategy.period]?.[i - 1] ?? false;
        } else if (strategy.mode === "golden_cross") {
          const ma50 = averageOf(50, i - 1);
          const ma200 = averageOf(200, i - 1);
          wasHolding = ma50 !== null && ma200 !== null && ma50 > ma200;
        }
        stratReturns.push(wasHolding ? price / prevPrice - 1 : 0);
      }
      const stratStd = calcStdDev(stratReturns);
      const stratDownside = calcDownsideDev(stratReturns);
      const stratAnnualStd = stratStd !== null ? stratStd * Math.sqrt(TRADING_DAYS) : null;
      const stratAnnualDownside = stratDownside !== null ? stratDownside * Math.sqrt(TRADING_DAYS) : null;
      const cagr = annualizedReturnMap[strategy.key];
      const cagrDec = cagr !== null && cagr !== undefined ? cagr / 100 : null;
      const sharpe = cagrDec !== null && stratAnnualStd > 0 ? cagrDec / stratAnnualStd : null;
      const sortino = cagrDec !== null && stratAnnualDownside > 0 ? cagrDec / stratAnnualDownside : null;

      const trades = crossingStatsMap[strategy.key]?.trades || [];
      const totalTrades = trades.length;
      const winningTrades = trades.filter((t) => t.returnPercent > 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : null;
      const holdDays = trades
        .map((t) => {
          if (!t.entryDate || !t.exitDate) return null;
          const entry = new Date(t.entryDate);
          const exit = new Date(t.exitDate);
          if (Number.isNaN(entry.getTime()) || Number.isNaN(exit.getTime())) return null;
          return Math.round((exit - entry) / (1000 * 60 * 60 * 24));
        })
        .filter((d) => d !== null);
      const avgHoldingDays = holdDays.length > 0
        ? Math.round(holdDays.reduce((s, d) => s + d, 0) / holdDays.length)
        : null;
      const totalProfit = trades.filter((t) => t.returnPercent > 0).reduce((s, t) => s + t.returnPercent, 0);
      const totalLoss = Math.abs(trades.filter((t) => t.returnPercent < 0).reduce((s, t) => s + t.returnPercent, 0));
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : null;

      strategyMetrics[strategy.key] = {
        sharpe, sortino, winRate, totalTrades, winningTrades, avgHoldingDays, profitFactor
      };
    });
    return { buyHold: buyHoldMetrics, strategies: strategyMetrics };
  };
  const advancedMetrics = computeAdvancedMetrics();

  return {
    snapshot,
    trendSupport: { windowDays, items: supportItems },
    trendHolding: { items: holdingItems },
    chartSeries,
    crossingHistory: {
      items: [...crossingItemsWithTrade, ...assumedExitItems].reverse(),
      startDate: startDateLabel,
      endDate: endDateLabel,
      yearsOfData,
      periods: crossingPeriods,
      periodLabels: crossingPeriodLabels,
      statsMap: crossingStatsMap,
      annualizedMap: annualizedReturnMap,
      mddMap: strategyDrawdownMap
    },
    drawdownStats,
    advancedMetrics
  };
};


export { buildCsvAnalytics };
