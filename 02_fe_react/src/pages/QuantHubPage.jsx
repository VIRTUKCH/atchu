import React from "react";
import { Link } from "react-router-dom";
import { QUANT_STRATEGIES } from "../config/quantItems";
import { baaSignalPayload } from "../utils/baaDataLoaders";

function getSignalSummary(strategy) {
  if (strategy.status === "coming_soon") {
    return { text: "준비 중", variant: "coming" };
  }
  if (strategy.id === "baa" && baaSignalPayload?.signal) {
    const { mode, rebalanceDate } = baaSignalPayload.signal;
    const dateLabel = rebalanceDate ? rebalanceDate.slice(0, 7) + " 월말 기준" : "";
    return mode === "offensive"
      ? { text: "공격", variant: "offensive", dateLabel }
      : { text: "방어", variant: "defensive", dateLabel };
  }
  return { text: "데이터 없음", variant: "coming" };
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
                <span
                  className={`quant-signal-badge quant-signal-badge--${signal.variant}`}
                >
                  {signal.text}
                </span>
                {signal.dateLabel && (
                  <span style={{ fontSize: "clamp(13px, calc(11px + 0.5vw), 15px)", color: "var(--muted)" }}>
                    {signal.dateLabel}
                  </span>
                )}
              </div>
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
