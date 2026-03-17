import React from "react";

export default function AnalystHeader({ title, date, source, author }) {
  const authorLabel = author && author.trim() ? author : "찾을 수 없음";
  return (
    <div className="analyst-header">
      <div className="analyst-card-head">
        <strong>{title}</strong>
        <span>{date}</span>
      </div>
      <div className="analyst-card-meta">
        <span>출처 : {source}</span>
        <span>작성자 : {authorLabel}</span>
      </div>
    </div>
  );
}
