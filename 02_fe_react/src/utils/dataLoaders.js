const csvModules = import.meta.glob("../../data/csv/*.csv", {
  query: "?raw",
  import: "default"
});

const latestSnapshotModules = import.meta.glob("../../data/summary/snapshot/summary_snapshots.json", {
  eager: true,
  import: "default"
});

const datedTrendNotificationModules = import.meta.glob(
  "../../data/summary/trend/*_trend_notifications.json",
  {
    eager: true,
    import: "default"
  }
);

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

const pickLatestPayload = (modules, regex, fallbackModules) => {
  const datedCandidates = Object.entries(modules)
    .map(([modulePath, payload]) => {
      const fileName = modulePath.split("/").pop() || "";
      const dateMatch = fileName.match(regex);
      return {
        date: dateMatch ? dateMatch[1] : "",
        payload
      };
    })
    .filter((item) => item.date && item.payload && typeof item.payload === "object")
    .sort((a, b) => b.date.localeCompare(a.date));

  if (datedCandidates.length > 0) {
    return datedCandidates[0].payload;
  }
  const latestFallback = Object.values(fallbackModules)[0];
  return latestFallback && typeof latestFallback === "object" ? latestFallback : null;
};

const latestSnapshotPayload = Object.values(latestSnapshotModules)[0] || null;

const latestTrendNotificationPayload = pickLatestPayload(
  datedTrendNotificationModules,
  /^(\d{4}-\d{2}-\d{2})_trend_notifications\.json$/,
  latestTrendNotificationModules
);

export {
  csvModules,
  tickerModules,
  privateTickerModules,
  latestSnapshotPayload,
  latestTrendNotificationPayload
};
