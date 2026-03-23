import React from "react";

const modeConfig = {
  offensive: { label: "공격 (Offensive)", bg: "var(--accent-green, #22c55e)", color: "#fff" },
  defensive: { label: "방어 (Defensive)", bg: "var(--accent-blue, #3b82f6)", color: "#fff" }
};

export default function BaaSignalBadge({ mode, rebalanceDate, canaryPositiveCount }) {
  const config = modeConfig[mode] || modeConfig.defensive;
  const negative = 4 - (canaryPositiveCount ?? 0);

  return (
    <div className="panel-card" style={{ textAlign: "center", padding: "28px 20px" }}>
      <div
        style={{
          display: "inline-block",
          padding: "12px 32px",
          borderRadius: "var(--radius-sm, 8px)",
          background: config.bg,
          color: config.color,
          fontSize: "clamp(28px, calc(22.4px + 1.5vw), 36px)",
          fontWeight: 700,
          letterSpacing: "0.02em"
        }}
      >
        {config.label}
      </div>
      <div style={{ marginTop: 12, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
        {mode === "offensive"
          ? `카나리아 4개 모두 양(+) → 공격 모드`
          : `카나리아 ${negative}개 음(−) → 방어 모드`}
      </div>
      {rebalanceDate && (
        <div style={{ marginTop: 6, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
          {rebalanceDate.slice(0, 7)} 월말 기준
        </div>
      )}
    </div>
  );
}
