import { useCallback, useMemo } from "react";
import { cagrStrategyLabelMap, getBestOverallCagrInfo } from "../utils/tickerMeta";

export default function usePageModels({
  tickers,
  tickersLoading,
  tickersError,
  snapshotMap,
  selectedType,
  toggleType,
  sortMode,
  setSortMode,
  navigate,
  API_ENABLED,
  getLocalSnapshot,
  loadLocalDetailAnalytics,
  toRecentShape,
  getLocalListAnalytics,
  isStaleCloseByUsMarketDate,
  typeLabels,
  formatTrendSuitabilityLabel,
  formatPrice,
  formatPercent,
  formatSignedPercent,
  latestSnapshotPayload,
  overviewTickers,
}) {
  const getTypeLabel = useCallback((type) => typeLabels[type] || type, [typeLabels]);

  const tickerMetaMap = useMemo(
    () =>
      new Map(
        tickers
          .filter((item) => item?.ticker)
          .map((item) => [item.ticker.toUpperCase(), item])
      ),
    [tickers]
  );

  const indexEtfPageModel = useMemo(
    () => ({
      tickers,
      selectedType,
      toggleType,
      getTypeLabel,
      sortMode,
      setSortMode,
      tickersLoading,
      tickersError,
      snapshotMap,
      toRecentShape,
      getLocalListAnalytics,
      isStaleCloseByUsMarketDate,
      getBestOverallCagrInfo,
      cagrStrategyLabelMap,
      tickerMetaMap,
      navigate,
    }),
    [
      tickers,
      selectedType,
      toggleType,
      getTypeLabel,
      sortMode,
      setSortMode,
      tickersLoading,
      tickersError,
      snapshotMap,
      toRecentShape,
      getLocalListAnalytics,
      isStaleCloseByUsMarketDate,
      tickerMetaMap,
      navigate,
    ]
  );

  const indexEtfDetailModel = useMemo(
    () => ({
      tickerMetaMap,
      API_ENABLED,
      getLocalSnapshot,
      loadLocalDetailAnalytics,
      toRecentShape,
      isStaleCloseByUsMarketDate,
      getTypeLabel,
      formatTrendSuitabilityLabel,
      formatPrice,
      formatPercent,
      formatSignedPercent,
      getBestOverallCagrInfo,
      cagrStrategyLabelMap,
    }),
    [
      tickerMetaMap,
      API_ENABLED,
      getLocalSnapshot,
      loadLocalDetailAnalytics,
      toRecentShape,
      isStaleCloseByUsMarketDate,
      getTypeLabel,
      formatTrendSuitabilityLabel,
      formatPrice,
      formatPercent,
      formatSignedPercent,
    ]
  );

  return {
    indexEtfPageModel,
    indexEtfDetailModel
  };
}
