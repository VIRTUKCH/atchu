import React from "react";

export function ColumnResearchCard({ title, author, year, source, stat, children }) {
  return (
    <div className="col-research-card">
      <div className="col-research-meta">
        {source && <span className="col-research-source">{source}</span>}
        {year && <span className="col-research-year">{year}</span>}
      </div>
      <div className="col-research-title">{title}</div>
      {author && <div className="col-research-author">{author}</div>}
      {children && <div className="col-research-body">{children}</div>}
      {stat && <div className="col-research-stat">{stat}</div>}
    </div>
  );
}
