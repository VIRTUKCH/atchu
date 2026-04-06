const csvModules = import.meta.glob("../../data/csv/*.csv", {
  query: "?raw",
  import: "default"
});

const latestSnapshotModules = import.meta.glob("../../data/summary/snapshot/summary_snapshots.json", {
  eager: true,
  import: "default"
});

const latestTrendNotificationModules = import.meta.glob(
  "../../data/summary/trend/trend_notifications.json",
  {
    eager: true,
    import: "default"
  }
);

const tickerModules = import.meta.glob("../../data/tickers/*.json", {
  eager: true,
  import: "default"
});

const privateTickerModules = import.meta.glob("../../data/tickers/private/*.json", {
  eager: true,
  import: "default"
});

const latestSnapshotPayload = Object.values(latestSnapshotModules)[0] || null;

const latestTrendNotificationPayload = (() => {
  const payload = Object.values(latestTrendNotificationModules)[0];
  return payload && typeof payload === "object" ? payload : null;
})();

export {
  csvModules,
  tickerModules,
  privateTickerModules,
  latestSnapshotPayload,
  latestTrendNotificationPayload
};
