const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));

const formatUsDateWithWeekday = (dateKey) => {
  if (!isIsoDate(dateKey)) {
    return dateKey || "-";
  }
  const base = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(base.getTime())) {
    return dateKey;
  }
  const weekday = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "America/New_York",
    weekday: "short"
  }).format(base);
  return `${dateKey} (${weekday})`;
};

const formatTrendSuitabilityLabel = (value) => {
  if (value === "적합") {
    return "추세추종 적합";
  }
  if (value === "고위험") {
    return "고위험";
  }
  return value || "-";
};

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return `${Number(value).toFixed(2)}%`;
};

const formatSignedPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  const num = Number(value);
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

const getSentiment = (ratio) => {
  if (ratio >= 80) return { label: "매우 강세", color: "var(--trend-very-strong, rgba(22,163,74,0.9))" };
  if (ratio >= 60) return { label: "강세", color: "var(--trend-strong, rgba(34,197,94,0.85))" };
  if (ratio >= 40) return { label: "보통", color: "var(--trend-neutral, rgba(234,179,8,0.85))" };
  if (ratio >= 20) return { label: "약세", color: "var(--trend-weak, rgba(249,115,22,0.85))" };
  return { label: "매우 약세", color: "var(--trend-very-weak, rgba(239,68,68,0.9))" };
};

export {
  formatPercent,
  formatPrice,
  formatSignedPercent,
  formatTrendSuitabilityLabel,
  formatUsDateWithWeekday,
  getSentiment,
  isIsoDate
};
