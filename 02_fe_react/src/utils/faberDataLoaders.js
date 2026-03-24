const faberSignalModules = import.meta.glob(
  "../../data/summary/faber/faber_signal.json",
  { eager: true, import: "default" }
);

const faberSignalPayload = Object.values(faberSignalModules)[0] || null;

export { faberSignalPayload };
