const businessCycleSignalModules = import.meta.glob(
  "../../data/summary/business-cycle/business_cycle_signal.json",
  { eager: true, import: "default" }
);

const businessCycleSignalPayload = Object.values(businessCycleSignalModules)[0] || null;

export { businessCycleSignalPayload };
