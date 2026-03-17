import React from "react";

export function ColumnKeyFact({ icon, value, variant, label, desc }) {
  return (
    <div className="col-key-fact">
      {icon && <div className="col-key-fact-icon">{icon}</div>}
      <div>
        <div className={`col-key-fact-value${variant ? " " + variant : ""}`}>{value}</div>
        {label && <div className="col-key-fact-label">{label}</div>}
        {desc && <div className="col-key-fact-desc">{desc}</div>}
      </div>
    </div>
  );
}

export function ColumnKeyFactGrid({ children }) {
  return <div className="col-key-fact-grid">{children}</div>;
}
