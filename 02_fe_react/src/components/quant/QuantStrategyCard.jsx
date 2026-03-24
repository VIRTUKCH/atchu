import React from "react";
import { Link } from "react-router-dom";

const RETURN_PERIODS = ["5Y", "3Y", "1Y", "6M", "3M", "1M"];

function ReturnBox({ period, value }) {
  if (value == null) return null;
  const num = parseFloat(value);
  const color = num >= 0 ? "var(--accent-green)" : "var(--accent-red)";
  return (
    <div className="quant-return-box">
      <div className="quant-return-period">{period}</div>
      <div className="quant-return-value" style={{ color }}>
        {num >= 0 ? "+" : ""}{value}%
      </div>
    </div>
  );
}

function StatsRow({ label, value, color }) {
  return (
    <div className="quant-stats-row">
      <dt>{label}</dt>
      <dd style={color ? { color } : undefined}>{value}</dd>
    </div>
  );
}

export default function QuantStrategyCard({ strategy, signal, portfolio, backtest, returns, disabled }) {
  const Wrapper = disabled ? "div" : Link;
  const wrapperProps = disabled ? {} : { to: strategy.path };

  return (
    <Wrapper
      className={`quant-card${disabled ? " quant-card--disabled" : ""}`}
      {...wrapperProps}
    >
      {/* Head */}
      <div className="quant-card-head">
        <span className="ticker-pill">{strategy.label}</span>
      </div>
      <div className="quant-card-desc">{strategy.description}</div>
      <div className="quant-card-signal-row">
        <span className={`quant-signal-badge quant-signal-badge--${signal.variant}`}>
          {signal.text}
        </span>
        {signal.dateLabel && (
          <span className="quant-card-date">{signal.dateLabel}</span>
        )}
      </div>

      {/* Body: 좌우 2열 (데스크탑), 세로 1열 (모바일) */}
      {!disabled && portfolio && (
        <div className="quant-card-body">
          <div className="quant-card-left">
            <div>
              <div className="quant-section-label">현재 포트폴리오</div>
              <div className="quant-portfolio-chips">
                {portfolio.map((a) => (
                  <div key={a.ticker} className="quant-portfolio-chip">
                    <span className="quant-portfolio-ticker">{a.ticker}</span>
                    <span className="quant-portfolio-name">{a.nameKo}</span>
                    <span className="quant-portfolio-weight">{a.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {returns && (
              <div>
                <div className="quant-section-label">기간별 수익률</div>
                <div className="quant-returns-grid">
                  {RETURN_PERIODS.map((p) => (
                    <ReturnBox key={p} period={p} value={returns[p]} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="quant-card-right">
            {backtest && (
              <dl className="quant-stats-dl">
                <StatsRow
                  label="CAGR"
                  value={`${backtest.cagr >= 0 ? "+" : ""}${backtest.cagr}%`}
                  color={backtest.cagr >= 0 ? "var(--accent-green)" : "var(--accent-red)"}
                />
                <StatsRow
                  label="MDD"
                  value={`${backtest.mdd}%`}
                  color="var(--accent-red)"
                />
                <StatsRow label="샤프비율" value={backtest.sharpe} />
                {backtest.defensiveRatio != null && (
                  <StatsRow
                    label="방어 비율"
                    value={`${Math.round(backtest.defensiveRatio * 100)}%`}
                  />
                )}
                {backtest.startDate && (
                  <StatsRow
                    label="데이터 시작"
                    value={`${backtest.startDate.slice(0, 10)}~`}
                  />
                )}
              </dl>
            )}
          </div>
        </div>
      )}

      {disabled && (
        <div className="quant-card-coming">곧 추가됩니다</div>
      )}
    </Wrapper>
  );
}
