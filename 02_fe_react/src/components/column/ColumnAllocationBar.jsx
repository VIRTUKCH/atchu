import React from "react";

export function ColumnAllocationBar({ title, items }) {
  return (
    <div className="col-allocation">
      {title && <div className="col-allocation-title">{title}</div>}
      <div className="col-allocation-bar">
        {items.map((item, i) => (
          <div
            key={i}
            className="col-allocation-segment"
            style={{ flex: item.pct, background: item.color }}
            title={`${item.label} ${item.pct}%`}
          />
        ))}
      </div>
      <div className="col-allocation-legend">
        {items.map((item, i) => (
          <div key={i} className="col-allocation-legend-item">
            <div className="col-allocation-dot" style={{ background: item.color }} />
            <span className="col-allocation-legend-label">{item.label}</span>
            <span className="col-allocation-legend-pct">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
