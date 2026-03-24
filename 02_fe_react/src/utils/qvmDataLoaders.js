const qvmSignalModules = import.meta.glob(
  "../../data/summary/qvm/qvm_signal.json",
  { eager: true, import: "default" }
);
const qvmSignalPayload = Object.values(qvmSignalModules)[0] || null;
export { qvmSignalPayload };
