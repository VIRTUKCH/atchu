import React from "react";
import "../styles/quant-hub.css";
import { QUANT_STRATEGIES } from "../config/quantItems";
import { baaSignalPayload } from "../utils/baaDataLoaders";
import { haaSignalPayload } from "../utils/haaDataLoaders";
import { faberSignalPayload } from "../utils/faberDataLoaders";
import { allwSignalPayload } from "../utils/allwDataLoaders";
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

function getCardDataFromPayload(strategy, payload) {
  if (!payload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { signal, portfolios, backtest } = payload;
  const rebalanceDate = signal?.rebalanceDate || signal?.rebalanceDate;
  const mode = signal?.mode;
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
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

function getCardData(strategy) {
  if (strategy.status === "coming_soon") {
    return { signal: { text: "준비 중", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  if (strategy.id.startsWith("baa")) {
    return getCardDataFromPayload(strategy, baaSignalPayload);
  }

  if (strategy.id === "haa") {
    return getCardDataFromPayload(strategy, haaSignalPayload);
  }

  if (strategy.id === "faber-sector") {
    return getFaberCardData(strategy);
  }

  if (strategy.id === "risk-parity") {
    return getAllwCardData(strategy);
  }

  return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
}

function getFaberCardData(strategy) {
  if (!faberSignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { signal, portfolio, backtest } = faberSignalPayload;
  const { mode, rebalanceDate } = signal || {};
  const dateLabel = rebalanceDate ? rebalanceDate.slice(0, 7) + " 월말 기준" : "";
  const isInvested = mode === "invested";

  const returns = calcPeriodReturns(backtest?.equityCurve, "faberSector");
  const bt = backtest?.faberSector;

  return {
    signal: {
      text: isInvested ? "투자" : "현금",
      variant: isInvested ? "offensive" : "defensive",
      dateLabel,
    },
    portfolio: (portfolio || []).map((a) => ({
      ticker: a.ticker,
      nameKo: a.nameKo,
      weight: a.weight,
    })),
    backtest: bt ? {
      cagr: bt.cagr,
      mdd: bt.mdd,
      sharpe: bt.sharpe,
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

function getAllwCardData(strategy) {
  if (!allwSignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { performance, equityCurve, latestClose, allocation } = allwSignalPayload;
  const dateLabel = latestClose?.date ? latestClose.date.slice(0, 7) + " 기준" : "";
  const returns = calcPeriodReturns(equityCurve, "allw");
  const allwPerf = performance?.allw;

  return {
    signal: {
      text: "정적 배분",
      variant: "offensive",
      dateLabel,
    },
    portfolio: [{ ticker: "ALLW", nameKo: "올웨더 (Bridgewater)", weight: 100 }],
    backtest: allwPerf ? {
      cagr: allwPerf.cagr,
      mdd: allwPerf.mdd,
      sharpe: allwPerf.sharpe,
      startDate: equityCurve?.[0]?.date,
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
