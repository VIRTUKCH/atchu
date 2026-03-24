const trendSignalModules = import.meta.glob(
  "../../data/summary/trend/trend_signal.json",
  { eager: true, import: "default" }
);

const trendSignalPayload = Object.values(trendSignalModules)[0] || null;

export { trendSignalPayload };
