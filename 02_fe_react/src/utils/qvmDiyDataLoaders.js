const qvmDiySignalModules = import.meta.glob(
  "../../data/summary/qvm/qvm_diy_signal.json",
  { eager: true, import: "default" }
);
const qvmDiySignalPayload = Object.values(qvmDiySignalModules)[0] || null;
export { qvmDiySignalPayload };
