import React from "react";

const COLORS = { businessCycle: "#22c55e", spy: "#f59e0b", sixtyForty: "#a855f7" };
const LABELS = { businessCycle: "경기순환 로테이션", spy: "SPY B&H", sixtyForty: "60/40" };

const W = 760;
const H = 300;
const PAD = { top: 20, right: 16, bottom: 36, left: 56 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

export default function BusinessCycleEquityCurveChart({ equityCurve }) {
  if (!equityCurve || equityCurve.length < 2) return null;

  const keys = Object.keys(COLORS).filter((k) => equityCurve[0][k] != null);
  const allVals = equityCurve.flatMap((p) => keys.map((k) => p[k]).filter(Boolean));
  const minY = Math.min(...allVals) * 0.95;
  const maxY = Math.max(...allVals) * 1.05;
  const rangeY = maxY - minY || 1;

  const toX = (i) => PAD.left + (i / (equityCurve.length - 1)) * plotW;
  const toY = (v) => PAD.top + plotH - ((v - minY) / rangeY) * plotH;

  const buildPath = (key) =>
    equityCurve
      .map((p, i) => (p[key] != null ? `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p[key]).toFixed(1)}` : ""))
      .filter(Boolean)
      .join(" ");

  const yTicks = [];
  const step = rangeY / 4;
  for (let i = 0; i <= 4; i++) {
    const v = minY + step * i;
    yTicks.push({ v, y: toY(v), label: v.toFixed(1) });
  }

  const xStep = Math.max(1, Math.floor(equityCurve.length / 5));
  const xLabels = equityCurve
    .filter((_, i) => i % xStep === 0 || i === equityCurve.length - 1)
    .map((p) => ({
      x: toX(equityCurve.indexOf(p)),
      label: p.date?.slice(0, 7) || "",
    }));

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        누적 수익률 곡선
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 12 }}>
        {keys.map((k) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)" }}>
            <span style={{ width: 12, height: 3, background: COLORS[k], display: "inline-block", borderRadius: 1 }} />
            <span style={{ color: "var(--muted)" }}>{LABELS[k]}</span>
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="var(--line, #e5e7eb)" strokeWidth="0.5" />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="var(--muted, #9ca3af)" fontSize="11">{t.label}</text>
          </g>
        ))}
        {xLabels.map((t, i) => (
          <text key={i} x={t.x} y={H - 6} textAnchor="middle" fill="var(--muted, #9ca3af)" fontSize="11">{t.label}</text>
        ))}
        {keys.map((k) => (
          <path key={k} d={buildPath(k)} fill="none" stroke={COLORS[k]} strokeWidth="1.8" strokeLinejoin="round" />
        ))}
        {minY <= 1 && maxY >= 1 && (
          <line x1={PAD.left} x2={W - PAD.right} y1={toY(1)} y2={toY(1)} stroke="var(--muted, #9ca3af)" strokeWidth="0.5" strokeDasharray="4 2" />
        )}
      </svg>
    </div>
  );
}
