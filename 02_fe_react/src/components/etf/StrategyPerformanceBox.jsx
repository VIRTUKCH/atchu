import React from "react";

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

export default function StrategyPerformanceBox({ strategy, metrics }) {
  const cards = [
    { label: "1D", raw: metrics?.oneDay },
    { label: "7D", raw: metrics?.sevenDay },
    { label: "1M", raw: metrics?.oneMonth },
    { label: "3M", raw: metrics?.threeMonth },
    { label: "1Y", raw: metrics?.oneYear },
    { label: "3Y", raw: metrics?.threeYear },
    { label: "5Y", raw: metrics?.fiveYear },
    { label: "CAGR", raw: metrics?.cagrSinceInception }
  ];

  const resolveValueClass = (raw) => {
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      return "";
    }
    if (num > 0) {
      return "change-up";
    }
    if (num < 0) {
      return "change-down";
    }
    return "";
  };

  return (
    <div className="strategy-metrics-box">
      <div className="strategy-metrics-box-title">전략 성과</div>
      <div className="strategy-performance-grid">
        {cards.map((card) => (
          <div
            key={`${strategy?.title || "strategy"}-${card.label}`}
            className={`detail-metric trend-card strategy-performance-card ${resolveValueClass(card.raw)}`}
          >
            <span>{card.label}</span>
            <em className={`metric-change ${resolveValueClass(card.raw)}`}>{formatPercent(card.raw)}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
