import React from "react";

export function ColumnStepList({ children }) {
  return <div className="col-step-list">{children}</div>;
}

export function ColumnStepItem({ step, title, children }) {
  return (
    <div className="col-step-item">
      <div className="col-step-number">{step}</div>
      <div>
        {title && <div className="col-step-title">{title}</div>}
        {children && <p className="col-step-body">{children}</p>}
      </div>
    </div>
  );
}
