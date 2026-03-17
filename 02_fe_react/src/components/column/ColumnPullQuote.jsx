import React from "react";

export function ColumnPullQuote({ attribution, role, children }) {
  return (
    <div className="col-pull-quote">
      <span className="col-pull-quote-mark">"</span>
      <div className="col-pull-quote-text">{children}</div>
      {attribution && (
        <div className="col-pull-quote-attribution">
          <strong>{attribution}</strong>
          {role && ` · ${role}`}
        </div>
      )}
    </div>
  );
}
