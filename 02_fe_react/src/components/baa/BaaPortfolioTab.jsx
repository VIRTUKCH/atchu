import React, { useState } from "react";
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

export default function BaaPortfolioTab({ portfolios, defaultTab = "aggressive" }) {
  const [tab, setTab] = useState(defaultTab);
  const current = portfolios?.[tab];
  const allocations = current?.allocations || [];

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["aggressive", "balanced"].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm, 6px)",
              border: tab === key ? "2px solid var(--accent, #3b82f6)" : "1px solid var(--line)",
              background: tab === key ? "var(--panel-2)" : "transparent",
              color: "var(--ink)",
              fontWeight: tab === key ? 600 : 400,
              cursor: "pointer",
              fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)"
            }}
          >
            {key === "aggressive" ? "Aggressive (G4)" : "Balanced (G12)"}
          </button>
        ))}
      </div>

      {allocations.length > 0 && (
        <>
          <ColumnAllocationBar
            title={`${tab === "aggressive" ? "Aggressive" : "Balanced"} 배분`}
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
