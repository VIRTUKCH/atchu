import React from "react";

export function ColumnHighlight({ children }) {
  return (
    <div className="col-highlight">
      <span className="col-highlight-dot">●</span>{" "}
      {children}
    </div>
  );
}
