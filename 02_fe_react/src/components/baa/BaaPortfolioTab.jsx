import React from "react";
import { ColumnAllocationBar } from "../column/ColumnAllocationBar";
import { ColumnCompareTable } from "../column/ColumnCompareTable";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function buildAllocationItems(allocations) {
  return (allocations || []).map((a, i) => ({
    label: a.replacedByBil ? `BIL (← ${a.ticker})` : a.ticker,
    pct: Math.round(a.weight * 100) / 100,
    color: COLORS[i % COLORS.length]
  }));
}

function buildRows(allocations) {
  return (allocations || []).map((a) => {
    const ticker = a.replacedByBil ? { value: `${a.ticker} → BIL`, bad: true } : a.ticker;
    return [
      ticker,
      a.nameKo || "",
      `${Math.round(a.weight * 100) / 100}%`,
      a.momentum13612w != null ? `${a.momentum13612w > 0 ? "+" : ""}${a.momentum13612w.toFixed(2)}%` : "—",
      a.relMomentum != null ? a.relMomentum.toFixed(3) : "—"
    ];
  });
}

export default function BaaPortfolioTab({ portfolios, variant = "aggressive" }) {
  const current = portfolios?.[variant];
  const allocations = current?.allocations || [];
  const label = variant === "aggressive" ? "Aggressive (G4)" : "Balanced (G12)";

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 16, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        {label} 배분
      </h3>

      {allocations.length > 0 && (
        <>
          <ColumnAllocationBar
            title={null}
            items={buildAllocationItems(allocations)}
          />
          <div style={{ marginTop: 16 }}>
            <ColumnCompareTable
              columns={["티커", "이름", "비중", "13612W", "상대 모멘텀"]}
              rows={buildRows(allocations)}
            />
          </div>
        </>
      )}

      {allocations.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>
          포트폴리오 데이터가 없습니다
        </div>
      )}
    </div>
  );
}
