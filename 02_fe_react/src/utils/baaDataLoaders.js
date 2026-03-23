const baaSignalModules = import.meta.glob("../../data/summary/baa/baa_signal.json", {
  eager: true,
  import: "default"
});

const baaSignalPayload = Object.values(baaSignalModules)[0] || null;

export { baaSignalPayload };
