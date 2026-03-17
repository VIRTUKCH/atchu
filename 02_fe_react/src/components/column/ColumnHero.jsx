import React from "react";

export function ColumnHero({ tag, title, desc }) {
  return (
    <div className="col-hero">
      {tag && <div className="col-hero-tag">{tag}</div>}
      <h1 className="col-hero-title">{title}</h1>
      {desc && <p className="col-hero-desc">{desc}</p>}
    </div>
  );
}
