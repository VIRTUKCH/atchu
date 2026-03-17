import React from "react";

export function ColumnMythFact({ myth, fact }) {
  return (
    <div className="col-myth-fact">
      <div className="col-myth">
        <span className="col-myth-badge">통설</span>
        <span className="col-myth-text">{myth}</span>
      </div>
      <div className="col-fact">
        <span className="col-fact-badge">사실</span>
        <span className="col-fact-text">{fact}</span>
      </div>
    </div>
  );
}
