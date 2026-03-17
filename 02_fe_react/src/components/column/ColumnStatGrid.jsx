import React from "react";

export function ColumnStatGrid({ stats }) {
  return (
    <div className="col-stats-row">
      {stats.map((s) => (
        <div key={s.label} className="col-stat-card">
          <div className="col-stat-value">{s.value}</div>
          <div className="col-stat-label">{s.label}</div>
          <div className="col-stat-desc">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}
