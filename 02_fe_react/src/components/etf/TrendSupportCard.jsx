import React from "react";

const formatCount = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return String(value);
};

export default function TrendSupportCard({ windowDays = 20, items = [] }) {
  const allItems = items.length
    ? items
    : [
        { label: "200일선", aboveDays: null, belowDays: null }
      ];
  const rows = allItems.filter(
    (row) => row.label === "200일선"
  );
  return (
    <div className="trend-block">
      <div className="trend-title">최근 {windowDays}일 추세선 유지 (앗추 필터)</div>
      <p className="section-description">
        최근 {windowDays}일 중 200일선 위에서 며칠을 보냈는지 보여줍니다. 16일 이상이면 앗추 필터를 충족한 안정적인 추세입니다.
      </p>
      <div className="trend-grid">
        {rows.map((row) => (
          <div key={row.label} className="detail-metric trend-card">
            <span>{row.label}</span>
            <strong>
              {formatCount(row.aboveDays)} / {formatCount(row.belowDays)}
            </strong>
            <em className="metric-change">
              위 / 아래
              {Number.isFinite(Number(row.aboveDays)) && Number(row.aboveDays) >= 16 && (
                <span className="metric-change trend-up"> (16+)</span>
              )}
            </em>
          </div>
        ))}
      </div>
    </div>
  );
}
