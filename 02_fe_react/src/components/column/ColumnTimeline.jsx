import React from "react";

export function ColumnTimeline({ children }) {
  return <div className="col-timeline">{children}</div>;
}

export function ColumnTimelineItem({ year, title, children }) {
  return (
    <div className="col-timeline-item">
      {year && <div className="col-timeline-year">{year}</div>}
      {title && <div className="col-timeline-title">{title}</div>}
      {children && <p className="col-timeline-body">{children}</p>}
    </div>
  );
}
