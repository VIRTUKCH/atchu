const dmSignalModules = import.meta.glob(
  "../../data/summary/dm/dm_signal.json",
  { eager: true, import: "default" }
);

export const dmSignalPayload = Object.values(dmSignalModules)[0] || null;
