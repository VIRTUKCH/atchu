import React from "react";

export function ColumnFlowCard({ title, step, branches }) {
  return (
    <div className="col-flow-card">
      {title && <div className="col-flow-title">{title}</div>}

      <div className="col-flow-step">
        {step.icon && <div className="col-flow-icon">{step.icon}</div>}
        <div className="col-flow-label">{step.label}</div>
        {step.sub && <div className="col-flow-sub">{step.sub}</div>}
      </div>

      <div className="col-flow-arrow">↓</div>

      <div className="col-flow-branches">
        {branches.map((b, i) => (
          <div key={i} className={`col-flow-branch-item ${b.variant || ""}`}>
            <span className={`col-flow-tag ${b.variant || ""}`}>{b.label}</span>
            <span className="col-flow-branch-text">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
