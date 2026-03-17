import React from "react";

export function ColumnCrisisCard({ year, name, drawdown, duration, recovery, children }) {
  return (
    <div className="col-crisis-card">
      <div className="col-crisis-header">
        <div className="col-crisis-name-group">
          {year && <span className="col-crisis-year">{year}</span>}
          <span className="col-crisis-name">{name}</span>
        </div>
        {drawdown && <div className="col-crisis-drawdown">{drawdown}</div>}
      </div>
      <div className="col-crisis-body">
        {(duration || recovery) && (
          <div className="col-crisis-meta">
            {duration && (
              <span className="col-crisis-meta-item">
                하락 기간 <span>{duration}</span>
              </span>
            )}
            {recovery && (
              <span className="col-crisis-meta-item">
                회복 기간 <span>{recovery}</span>
              </span>
            )}
          </div>
        )}
        {children && <p className="col-crisis-desc">{children}</p>}
      </div>
    </div>
  );
}
