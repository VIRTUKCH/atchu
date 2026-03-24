import React from "react";
import "../styles/quant-hub.css";
import { QUANT_STRATEGIES } from "../config/quantItems";
import { baaSignalPayload } from "../utils/baaDataLoaders";
import QuantStrategyCard from "../components/quant/QuantStrategyCard";

function calcPeriodReturns(equityCurve, curveKey) {
  if (!equityCurve || !curveKey || equityCurve.length < 2) return null;
  const latest = equityCurve[equityCurve.length - 1];
  const latestVal = latest[curveKey];
  if (latestVal == null) return null;
  const lookup = (monthsAgo) => {
    const idx = equityCurve.length - 1 - monthsAgo;
    return idx >= 0 ? equityCurve[idx][curveKey] : null;
  };
  const pct = (prev) => prev != null ? ((latestVal / prev - 1) * 100).toFixed(1) : null;
  return { "5Y": pct(lookup(60)), "3Y": pct(lookup(36)), "1Y": pct(lookup(12)), "6M": pct(lookup(6)), "3M": pct(lookup(3)), "1M": pct(lookup(1)) };
}

function getCardData(strategy) {
  if (strategy.status === "coming_soon" || !strategy.id.startsWith("baa") || !baaSignalPayload) {
    return {
      signal: strategy.status === "coming_soon"
        ? { text: "준비 중", variant: "coming" }
        : { text: "데이터 없음", variant: "coming" },
      portfolio: null,
      backtest: null,
      returns: null,
    };
  }

  const { signal, portfolios, backtest } = baaSignalPayload;
  const { mode, rebalanceDate } = signal || {};
  const dateLabel = rebalanceDate ? rebalanceDate.slice(0, 7) + " 월말 기준" : "";

  const variantKey = strategy.curveKey;
  const portfolio = portfolios?.[variantKey]?.allocations || [];
  const bt = backtest?.[variantKey];
  const returns = calcPeriodReturns(backtest?.equityCurve, variantKey);

  return {
    signal: {
      text: mode === "offensive" ? "공격" : "방어",
      variant: mode === "offensive" ? "offensive" : "defensive",
      dateLabel,
    },
    portfolio,
    backtest: bt ? {
      cagr: bt.cagr,
      mdd: bt.mdd,
      sharpe: bt.sharpe,
      defensiveRatio: backtest.defensiveRatio,
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

export default function QuantHubPage() {
  return (
    <section>
      <div className="panel-card" style={{ marginBottom: 16 }}>
        <div className="section-header">
          <div>
            <div className="panel-title">퀀트 엿보기</div>
            <p className="panel-subtitle">개인 투자 의사결정 보조 도구</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {QUANT_STRATEGIES.map((s) => {
          const { signal, portfolio, backtest, returns } = getCardData(s);
          return (
            <QuantStrategyCard
              key={s.id}
              strategy={s}
              signal={signal}
              portfolio={portfolio}
              backtest={backtest}
              returns={returns}
              disabled={s.status === "coming_soon"}
            />
          );
        })}
      </div>
    </section>
  );
}
