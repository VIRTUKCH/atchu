import React from "react";

export function ColumnPersonCard({ name, sub, badge, children }) {
  return (
    <div className="col-card">
      <div className={`col-card-header${badge ? " divided" : ""}`}>
        <div>
          <div className="col-card-name">{name}</div>
          {sub && <div className="col-card-sub">{sub}</div>}
        </div>
        {badge && <div className="col-card-badge">{badge}</div>}
      </div>
      <div className="col-card-body">{children}</div>
    </div>
  );
}
