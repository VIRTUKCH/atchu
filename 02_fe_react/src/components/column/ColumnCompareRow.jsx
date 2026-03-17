import React from "react";

export function ColumnCompareRow({ left, right, period }) {
  return (
    <div className="col-compare-row">
      <div className="col-compare-sides">
        <CompareSide {...left} />
        <div className="col-compare-vs">VS</div>
        <CompareSide {...right} />
      </div>
      {period && <div className="col-compare-period">{period}</div>}
    </div>
  );
}

function CompareSide({ label, value, sub, variant = "neutral" }) {
  return (
    <div className={`col-compare-side ${variant}`}>
      <div className="col-compare-value">{value}</div>
      <div className="col-compare-label">{label}</div>
      {sub && <div className="col-compare-sub">{sub}</div>}
    </div>
  );
}
