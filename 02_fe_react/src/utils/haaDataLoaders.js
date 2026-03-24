const haaSignalModules = import.meta.glob("../../data/summary/haa/haa_signal.json", {
  eager: true,
  import: "default"
});

const haaSignalPayload = Object.values(haaSignalModules)[0] || null;

export { haaSignalPayload };
