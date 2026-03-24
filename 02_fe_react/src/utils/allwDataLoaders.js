const allwSignalModules = import.meta.glob(
  "../../data/summary/allw/allw_signal.json",
  { eager: true, import: "default" }
);
const allwSignalPayload = Object.values(allwSignalModules)[0] || null;
export { allwSignalPayload };
