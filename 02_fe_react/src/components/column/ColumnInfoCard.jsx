import React from "react";

export function ColumnInfoCard({ title, children }) {
  return (
    <div className="col-info-card">
      {title && <div className="col-info-title">{title}</div>}
      {children}
    </div>
  );
}

export function ColumnInfoDesc({ children }) {
  return <p className="col-info-desc">{children}</p>;
}

export function ColumnSolution({ children }) {
  return <p className="col-solution">{children}</p>;
}

export function ColumnDecayExample({ rows, note }) {
  return (
    <div className="col-decay-example">
      {rows.map((row, i) => (
        <div key={i} className="col-decay-row">
          <span className="col-decay-label">{row.label}</span>
          <span className="col-decay-arrow">→</span>
          <span className={`col-decay-val${row.variant ? " " + row.variant : ""}`}>
            {row.value}
          </span>
        </div>
      ))}
      {note && <div className="col-decay-note">{note}</div>}
    </div>
  );
}
