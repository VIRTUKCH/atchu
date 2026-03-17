import React from "react";

export function ColumnCallout({ label, children }) {
  return (
    <div className="col-callout">
      {label && <div className="col-callout-label">{label}</div>}
      <p className="col-callout-text">{children}</p>
    </div>
  );
}
