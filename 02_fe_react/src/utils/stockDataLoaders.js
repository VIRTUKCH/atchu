/**
 * 개별주(S&P 500) 데이터 로더.
 * ETF와 달리 CSV는 번들하지 않고 public/csv_stock/에서 on-demand fetch.
 */
import { buildCsvAnalytics } from "./csvAnalytics";

// 스냅샷 JSON (eager load — 빌드 시 포함)
const stockSnapshotModules = import.meta.glob(
  "../../data/summary/stock_snapshot/stock_snapshots.json",
  { eager: true, import: "default" }
);
const stockSnapshotPayload = Object.values(stockSnapshotModules)[0] || null;

// 티커 메타데이터 (eager load)
const stockTickerModules = import.meta.glob(
  "../../data/tickers_stock/*.json",
  { eager: true, import: "default" }
);

const normalizeKey = (ticker) => String(ticker || "").trim().toUpperCase();

// 티커 메타 Map 빌드
function buildStockTickerMeta() {
  const map = new Map();
  Object.values(stockTickerModules).forEach((mod) => {
    const items = Array.isArray(mod) ? mod : mod?.items || [];
    items.forEach((item) => {
      if (!item?.ticker) return;
      const key = normalizeKey(item.ticker);
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          ticker: key,
          nameKo: item.name_ko || item.name || key,
          group: item.type || "기타",
          subGroup: item.subType || null
        });
      }
    });
  });
  return map;
}

// 스냅샷 Map 빌드
function buildStockSnapshotMap() {
  const map = {};
  if (!stockSnapshotPayload?.tickers) return map;
  Object.entries(stockSnapshotPayload.tickers).forEach(([key, data]) => {
    const normalized = normalizeKey(key);
    if (data?.snapshot) {
      map[normalized] = data.snapshot;
    }
  });
  return map;
}

// 스냅샷 → 표시용 shape 변환 (appDataAdapters.toRecentShape과 동일)
function toRecentShape(snapshot) {
  if (!snapshot) return {};
  return {
    open: snapshot.open,
    close: snapshot.close,
    previous_close: snapshot.previousClose,
    percent_change_from_previous_close: snapshot.percentChangeFromPreviousClose,
    percent_change_5d: snapshot.percentChange5d,
    high: snapshot.high,
    low: snapshot.low,
    volume: snapshot.volume,
    data_date_market: snapshot.dataDateMarket,
    ma_alignment: snapshot.maAlignment || null,
    moving_averages: {
      fifty_day: snapshot.movingAverage50,
      one_hundred_day: snapshot.movingAverage100,
      two_hundred_day: snapshot.movingAverage200
    },
    percent_difference_from_moving_averages: {
      fifty_day: snapshot.percentDiff50,
      one_hundred_day: snapshot.percentDiff100,
      two_hundred_day: snapshot.percentDiff200
    }
  };
}

// 리스트용 분석 데이터 (스냅샷 기반 — CSV 로드 없이)
function getStockListAnalytics(ticker) {
  const key = normalizeKey(ticker);
  const tickerData = stockSnapshotPayload?.tickers?.[key];
  if (!tickerData) return null;
  return {
    snapshot: tickerData.snapshot || null,
    trendHolding: tickerData.trendHolding || { items: [] },
    crossingHistory: tickerData.crossingHistory || { annualizedMap: {}, mddMap: {} }
  };
}

// 상세 페이지용 — CSV on-demand fetch + 분석
const detailCache = new Map();
async function loadStockDetailAnalytics(ticker) {
  const key = normalizeKey(ticker);
  if (detailCache.has(key)) return detailCache.get(key);

  const symbol = key.includes(".") ? key : `${key}.US`;
  const url = `${import.meta.env.BASE_URL}csv_stock/${symbol}_all.csv`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      detailCache.set(key, null);
      return null;
    }
    const csvText = await res.text();
    const analytics = buildCsvAnalytics(csvText);
    detailCache.set(key, analytics);
    return analytics;
  } catch {
    detailCache.set(key, null);
    return null;
  }
}

// 추세 알림 JSON (eager load)
const stockTrendModules = import.meta.glob(
  "../../data/summary/stock_trend/stock_trend_notifications.json",
  { eager: true, import: "default" }
);
const stockTrendNotificationPayload = Object.values(stockTrendModules)[0] || null;

// MarketHeatmap용 overviewTickers 배열 빌드
function buildStockOverviewTickers() {
  return Array.from(buildStockTickerMeta().values()).map((meta) => ({
    ticker: meta.ticker,
    name_ko: meta.nameKo || meta.name || meta.ticker,
    nameKo: meta.nameKo || meta.name || meta.ticker,
    heatmap_label: meta.heatmap_label || meta.ticker,
    heatmap_group: meta.group || meta.type || "기타",
    group: meta.group || meta.type || "기타",
    subGroup: meta.subGroup || meta.subType || null,
    type: meta.group || meta.type || "기타",
    asset_type: "개별주"
  }));
}

const stockTickerMetaMap = buildStockTickerMeta();
const stockSnapshotMap = buildStockSnapshotMap();
const stockOverviewTickers = buildStockOverviewTickers();

export {
  stockTickerMetaMap,
  stockSnapshotMap,
  stockSnapshotPayload,
  stockTrendNotificationPayload,
  stockOverviewTickers,
  toRecentShape,
  getStockListAnalytics,
  loadStockDetailAnalytics
};
