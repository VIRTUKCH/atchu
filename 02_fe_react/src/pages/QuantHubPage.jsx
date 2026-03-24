import React from "react";
import { Link } from "react-router-dom";
import { QUANT_STRATEGIES } from "../config/quantItems";
import { baaSignalPayload } from "../utils/baaDataLoaders";

/** equity curve 배열에서 기간별 수익률을 계산한다. 순수 USD 기준. */
function calcPeriodReturns(equityCurve, curveKey) {
  if (!equityCurve || !curveKey || equityCurve.length < 2) return null;
  const latest = equityCurve[equityCurve.length - 1];
  const latestVal = latest[curveKey];
  if (latestVal == null) return null;

  const lookup = (monthsAgo) => {
    const idx = equityCurve.length - 1 - monthsAgo;
    if (idx < 0) return null;
    return equityCurve[idx][curveKey];
  };

  const pct = (prev) => prev != null ? ((latestVal / prev - 1) * 100).toFixed(1) : null;

  return {
    "1Y": pct(lookup(12)),
    "6M": pct(lookup(6)),
    "3M": pct(lookup(3)),
    "1M": pct(lookup(1)),
  };
}

function getSignalSummary(strategy) {
  if (strategy.status === "coming_soon") {
    return { text: "준비 중", variant: "coming" };
  }
  if (strategy.id.startsWith("baa") && baaSignalPayload?.signal) {
    const { mode, rebalanceDate } = baaSignalPayload.signal;
    const dateLabel = rebalanceDate ? rebalanceDate.slice(0, 7) + " 월말 기준" : "";
    const returns = calcPeriodReturns(baaSignalPayload.backtest?.equityCurve, strategy.curveKey);
    return {
      text: mode === "offensive" ? "공격" : "방어",
      variant: mode === "offensive" ? "offensive" : "defensive",
      dateLabel,
      returns,
    };
  }
  return { text: "데이터 없음", variant: "coming" };
}

function ReturnsBadges({ returns }) {
  if (!returns) return null;
  const periods = ["1Y", "6M", "3M", "1M"];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
      {periods.map((p) => {
        const val = returns[p];
        if (val == null) return null;
        const num = parseFloat(val);
        const color = num >= 0 ? "var(--accent-green)" : "var(--accent-red, #ef4444)";
        return (
          <span
            key={p}
            style={{
              fontSize: "clamp(12px, calc(10px + 0.5vw), 14px)",
              color,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {p} {num >= 0 ? "+" : ""}{val}%
          </span>
        );
      })}
    </div>
  );
}

export default function QuantHubPage() {
  return (
    <section className="panel-card" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="section-header">
        <div>
          <div className="panel-title">퀀트 엿보기</div>
          <p className="panel-subtitle">개인 투자 의사결정 보조 도구</p>
        </div>
      </div>
      <div className="more-link-list">
        {QUANT_STRATEGIES.map((s) => {
          const signal = getSignalSummary(s);
          const disabled = s.status === "coming_soon";

          const card = (
            <div
              className="more-link-card"
              style={disabled ? { opacity: 0.5, cursor: "default" } : undefined}
            >
              <div className="more-link-label">{s.label}</div>
              <div className="more-link-desc">{s.description}</div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`quant-signal-badge quant-signal-badge--${signal.variant}`}>
                  {signal.text}
                </span>
                {signal.dateLabel && (
                  <span style={{ fontSize: "clamp(13px, calc(11px + 0.5vw), 15px)", color: "var(--muted)" }}>
                    {signal.dateLabel}
                  </span>
                )}
              </div>
              <ReturnsBadges returns={signal.returns} />
            </div>
          );

          if (disabled) {
            return <div key={s.id}>{card}</div>;
          }

          return (
            <Link key={s.id} to={s.path} className="more-link-card-wrapper">
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
