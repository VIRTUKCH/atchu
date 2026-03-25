const normalizeTickerKey = (ticker) => (ticker || "").toUpperCase();

const extractTickerFromPath = (path) => {
  const file = path.split("/").pop() || "";
  if (!file.endsWith(".csv")) {
    return null;
  }
  const base = file.replace("_all.csv", "");
  return base || null;
};

const movingAveragePeriods = [200];
const holdFilterPeriods = ["200-20of16"];

const cagrStrategyLabelMap = {
  200: "200일 이평선",
  "200-20of16": "앗추 필터 (200일)",
  golden_cross: "골든크로스"
};

const getBestCagrInfoByKeys = (analytics, keys) => {
  const annualizedMap = analytics?.crossingHistory?.annualizedMap || {};
  let bestPeriod = null;
  let bestValue = null;
  keys.forEach((period) => {
    const raw = annualizedMap?.[period];
    if (raw === null || raw === undefined) {
      return;
    }
    const value = Number(raw);
    if (Number.isNaN(value)) {
      return;
    }
    if (bestValue === null || value > bestValue) {
      bestValue = value;
      bestPeriod = period;
    }
  });
  return { period: bestPeriod, value: bestValue };
};

const getBestOverallCagrInfo = (analytics) =>
  getBestCagrInfoByKeys(analytics, [...holdFilterPeriods]);

const buildLocalListAnalyticsMap = (latestSnapshotPayload) => {
  const map = {};
  const tickers = latestSnapshotPayload?.tickers;
  if (!tickers || typeof tickers !== "object") {
    return map;
  }
  Object.entries(tickers).forEach(([ticker, analytics]) => {
    const normalized = normalizeTickerKey(ticker);
    if (!normalized || !analytics) {
      return;
    }
    map[normalized] = analytics;
    if (normalized.includes(".")) {
      const base = normalizeTickerKey(normalized.split(".")[0]);
      if (!map[base]) map[base] = analytics;
    }
  });
  return map;
};

const getLocalListAnalyticsByMap = (localListAnalyticsMap, ticker) => {
  if (!ticker) {
    return null;
  }
  const normalized = normalizeTickerKey(ticker);
  return localListAnalyticsMap[normalized] || null;
};

const getLocalSnapshotByMap = (localListAnalyticsMap, ticker) =>
  getLocalListAnalyticsByMap(localListAnalyticsMap, ticker)?.snapshot ?? null;

const flattenTickerEntries = (entry) => {
  if (Array.isArray(entry)) {
    return entry;
  }
  if (entry && typeof entry === "object" && Array.isArray(entry.items)) {
    return entry.items;
  }
  return [];
};

const buildLocalTickers = (tickerModules) => {
  const groupPriority = new Map(
    [
      "미국 대표 지수",
      "성장",
      "밸류",
      "퀄리티",
      "저변동성",
      "배당",
      "스타일",
      "섹터",
      "국가",
      "채권",
      "원자재",
      "중소형",
      "레버리지",
      "인버스",
      "기타"
    ].map((value, index) => [value, index])
  );
  const deduped = new Map();
  Object.values(tickerModules).forEach((mod) => {
    if (mod?.hidden === true) return;
    const fileType = String(mod?.type || "").trim();
    const fileTypeProfile = mod?.type_profile || null;
    const items = Array.isArray(mod) ? mod : (mod?.items || []);
    items.forEach((item) => {
      const tickerKey = String(item?.ticker || "").trim().toUpperCase();
      if (!tickerKey) return;
      const itemType = String(item?.type || item?.asset_type || fileType || "").trim();
      const group = fileType || itemType;
      const enriched = { ...item, type: itemType, group, heatmap_group: group, type_profile: fileTypeProfile };
      const incomingRank = groupPriority.has(group)
        ? groupPriority.get(group)
        : Number.MAX_SAFE_INTEGER;
      const existing = deduped.get(tickerKey);
      if (!existing) {
        deduped.set(tickerKey, enriched);
        return;
      }
      const existingGroup = String(existing?.group || "").trim();
      const existingRank = groupPriority.has(existingGroup)
        ? groupPriority.get(existingGroup)
        : Number.MAX_SAFE_INTEGER;
      if (incomingRank < existingRank) {
        deduped.set(tickerKey, enriched);
      }
    });
  });
  return Array.from(deduped.values());
};

const buildMockTickers = (localTickers) =>
  Array.isArray(localTickers)
    ? localTickers.map((item) => ({
        id: `mock-${String(item.ticker || "").toLowerCase()}`,
        ticker: item.ticker,
        name: item.name,
        nameKo: item.name_ko,
        heatmapLabel: item.heatmap_label,
        shortDescription: item.short_description,
        type: item.type || item.asset_type,
        group: item.group || item.type || item.asset_type,
        heatmapGroup: item.heatmap_group || item.group || item.type || item.asset_type,
        tags: item.tags,
        trendFollowing: item.trend_following,
        businessArea: item.business_area,
        typeProfile: item.type_profile
      }))
    : [];

export {
  normalizeTickerKey,
  extractTickerFromPath,
  cagrStrategyLabelMap,
  getBestOverallCagrInfo,
  buildLocalListAnalyticsMap,
  getLocalListAnalyticsByMap,
  getLocalSnapshotByMap,
  flattenTickerEntries,
  buildLocalTickers,
  buildMockTickers
};
