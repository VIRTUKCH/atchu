import React from "react";

export function ColumnCompareTable({ columns, rows }) {
  return (
    <div className="col-compare-table-wrap">
      <table className="col-compare-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                if (typeof cell === "string") {
                  return <td key={j}>{cell}</td>;
                }
                const { value, highlight, bad, dim } = cell;
                const cls = highlight ? "highlight" : bad ? "bad" : dim ? "dim" : "";
                return <td key={j} className={cls || undefined}>{value}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
