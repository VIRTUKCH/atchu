import React from "react";

const formatCount = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return String(value);
};

const DirectionText = ({ direction }) => {
  if (direction === "up") {
    return <span className="metric-change trend-up">상승</span>;
  }
  if (direction === "down") {
    return <span className="metric-change trend-down">하락</span>;
  }
  return <span>-</span>;
};

export default function TrendHoldingDaysCard({ items = [] }) {
  const allItems = items.length
    ? items
    : [
        { label: "200일선", days: null, direction: null }
      ];
  const rows = allItems.filter(
    (row) => row.label === "200일선"
  );

  return (
    <div className="trend-block">
      <div className="trend-title">200일선 추세 유지일수</div>
      <p className="section-description">
        200일선 기준 현재 추세가 며칠째 이어지고 있는지 보여줍니다. 숫자가 클수록 추세가 안정적입니다.
      </p>
      <div className="trend-grid">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`detail-metric trend-card ${
              row.direction === "up" ? "trend-up" : row.direction === "down" ? "trend-down" : ""
            }`}
          >
            <span>{row.label}</span>
            <strong>
              <DirectionText direction={row.direction} /> {formatCount(row.days)}일째
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
