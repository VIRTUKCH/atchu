import React from "react";
import { Link } from "react-router-dom";

export function ColumnBackLink({ to, children }) {
  return (
    <div className="col-back-row">
      <Link to={to} className="col-back-link">{children}</Link>
    </div>
  );
}
