import { useMemo } from "react";

export default function useRouteModel({
  tickers,
  latestSnapshotPayload,
  snapshotMap,
  getLocalListAnalytics,
  navigate,
  formatSignedPercent,
  latestTrendNotificationPayload,
  indexEtfPageModel,
  indexEtfDetailModel,
  overviewTickers
}) {
  return useMemo(
    () => ({
      tickers,
      latestSnapshotPayload,
      snapshotMap,
      getLocalListAnalytics,
      navigate,
      formatSignedPercent,
      latestTrendNotificationPayload,
      indexEtfPageModel,
      indexEtfDetailModel,
      overviewTickers
    }),
    [
      tickers,
      latestSnapshotPayload,
      snapshotMap,
      getLocalListAnalytics,
      navigate,
      formatSignedPercent,
      latestTrendNotificationPayload,
      indexEtfPageModel,
      indexEtfDetailModel,
      overviewTickers
    ]
  );
}
