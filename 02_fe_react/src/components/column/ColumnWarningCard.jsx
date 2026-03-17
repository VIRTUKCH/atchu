import React from "react";

export function ColumnWarningCard({ title, example, children }) {
  return (
    <div className="col-warning-card">
      <div className="col-warning-title">⚠ {title}</div>
      <p className="col-warning-desc">{children}</p>
      {example && <div className="col-warning-example">{example}</div>}
    </div>
  );
}
