import React from "react";

export function ColumnQuote({ en, children }) {
  return (
    <>
      <blockquote className="col-quote">{children}</blockquote>
      {en && <div className="col-quote-en">{en}</div>}
    </>
  );
}
