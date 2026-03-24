import { buildCsvAnalytics } from "./csvAnalytics";
import {
  normalizeTickerKey,
  extractTickerFromPath,
  buildLocalListAnalyticsMap,
  getLocalListAnalyticsByMap,
  getLocalSnapshotByMap
} from "./tickerMeta";

const toRecentShape = (snapshot) => {
  if (!snapshot) {
    return {};
  }
  return {
    open: snapshot.open,
    close: snapshot.close,
    previous_close: snapshot.previousClose,
    percent_change_from_previous_close: snapshot.percentChangeFromPreviousClose,
    percent_change_5d: snapshot.percentChange5d,
    percent_change_63d: snapshot.percentChange63d,
    percent_change_252d: snapshot.percentChange252d,
    percent_change_1260d: snapshot.percentChange1260d,
    high: snapshot.high,
    low: snapshot.low,
    volume: snapshot.volume,
    data_date_market: snapshot.dataDateMarket,
    ma_alignment: snapshot.maAlignment || null,
    ma_alignment_days: snapshot.maAlignmentDays ?? null,
    moving_averages: {
      fifty_day: snapshot.movingAverage50,
      two_hundred_day: snapshot.movingAverage200
    },
    percent_difference_from_moving_averages: {
      fifty_day: snapshot.percentDiff50,
      two_hundred_day: snapshot.percentDiff200
    }
  };
};

const parseForexCsv = (csvText) => {
  if (!csvText) return null;
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return null;
  const map = new Map();
  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(",");
    const date = parts[0]?.trim();
    const close = Number(parts[4]?.trim());
    if (date && Number.isFinite(close) && close > 0) {
      map.set(date, close);
    }
  }
  return map.size > 0 ? map : null;
};

const createAppDataAdapters = ({ latestSnapshotPayload, csvModules }) => {
  const localListAnalyticsMap = buildLocalListAnalyticsMap(latestSnapshotPayload);
  const localDetailAnalyticsCache = new Map();
  const csvPathBySymbol = {};
  let forexCsvPath = null;

  Object.keys(csvModules).forEach((path) => {
    if (path.includes("KRW.FOREX")) {
      forexCsvPath = path;
      return;
    }
    const symbol = extractTickerFromPath(path);
    if (!symbol) {
      return;
    }
    const normalizedSymbol = normalizeTickerKey(symbol);
    csvPathBySymbol[normalizedSymbol] = path;
    if (normalizedSymbol.includes(".")) {
      const base = normalizeTickerKey(normalizedSymbol.split(".")[0]);
      if (!csvPathBySymbol[base]) {
        csvPathBySymbol[base] = path;
      }
    }
  });

  let forexRateMapCache;
  const loadForexRateMap = async () => {
    if (forexRateMapCache !== undefined) return forexRateMapCache;
    if (!forexCsvPath || !csvModules[forexCsvPath]) {
      forexRateMapCache = null;
      return null;
    }
    try {
      const raw = await csvModules[forexCsvPath]();
      forexRateMapCache = parseForexCsv(raw) || null;
      return forexRateMapCache;
    } catch {
      forexRateMapCache = null;
      return null;
    }
  };

  const loadLocalDetailAnalytics = async (ticker) => {
    const normalized = normalizeTickerKey(ticker);
    if (!normalized) {
      return null;
    }
    if (localDetailAnalyticsCache.has(normalized)) {
      return localDetailAnalyticsCache.get(normalized);
    }
    const path = csvPathBySymbol[normalized] || csvPathBySymbol[`${normalized}.US`];
    if (!path || !csvModules[path]) {
      localDetailAnalyticsCache.set(normalized, null);
      return null;
    }
    try {
      const [raw, forexRateMap] = await Promise.all([
        csvModules[path](),
        loadForexRateMap()
      ]);
      const analytics = buildCsvAnalytics(raw, { forexRateMap });
      localDetailAnalyticsCache.set(normalized, analytics);
      if (normalized.includes(".")) {
        const base = normalizeTickerKey(normalized.split(".")[0]);
        if (!localDetailAnalyticsCache.has(base)) {
          localDetailAnalyticsCache.set(base, analytics);
        }
      }
      return analytics;
    } catch (error) {
      localDetailAnalyticsCache.set(normalized, null);
      return null;
    }
  };

  const getLocalListAnalytics = (ticker) =>
    getLocalListAnalyticsByMap(localListAnalyticsMap, ticker);

  const getLocalSnapshot = (ticker) => getLocalSnapshotByMap(localListAnalyticsMap, ticker);

  return {
    loadLocalDetailAnalytics,
    getLocalListAnalytics,
    getLocalSnapshot,
    toRecentShape
  };
};

export { createAppDataAdapters, toRecentShape };
