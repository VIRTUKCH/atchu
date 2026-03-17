import React from "react";

export function ColumnTipBox({ icon, title, children }) {
  return (
    <div className="col-tip-box">
      {icon && <div className="col-tip-icon">{icon}</div>}
      <div>
        {title && <div className="col-tip-title">{title}</div>}
        <p className="col-tip-body">{children}</p>
      </div>
    </div>
  );
}
