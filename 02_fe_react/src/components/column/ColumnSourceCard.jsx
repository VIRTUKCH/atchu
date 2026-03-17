import React from "react";

export function ColumnSourceCard({ icon, title, desc }) {
  return (
    <div className="col-source-card">
      {icon && <div className="col-source-icon">{icon}</div>}
      <div>
        <div className="col-source-title">{title}</div>
        {desc && <p className="col-source-desc">{desc}</p>}
      </div>
    </div>
  );
}
