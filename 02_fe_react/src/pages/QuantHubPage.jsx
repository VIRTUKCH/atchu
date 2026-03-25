import React from "react";
import "../styles/quant-hub.css";
import { QUANT_STRATEGIES } from "../config/quantItems";
import { baaSignalPayload } from "../utils/baaDataLoaders";
import { haaSignalPayload } from "../utils/haaDataLoaders";
import { faberSignalPayload } from "../utils/faberDataLoaders";
import { allwSignalPayload } from "../utils/allwDataLoaders";
import { qvmSignalPayload } from "../utils/qvmDataLoaders";
import { qvmDiySignalPayload } from "../utils/qvmDiyDataLoaders";
import { dmSignalPayload } from "../utils/dmDataLoaders";
import { trendSignalPayload } from "../utils/trendDataLoaders";
import { businessCycleSignalPayload } from "../utils/businessCycleDataLoaders";
import QuantStrategyCard from "../components/quant/QuantStrategyCard";

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
  const returns = payload.periodReturns?.[variantKey] || null;

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
      sortino: bt.sortino,
      spyCagr: backtest.benchmarkSpy?.cagr,
      spyMdd: backtest.benchmarkSpy?.mdd,
      spySharpe: backtest.benchmarkSpy?.sharpe,
      spySortino: backtest.benchmarkSpy?.sortino,
      maCagr: backtest.benchmarkSpyMa?.cagr,
      maMdd: backtest.benchmarkSpyMa?.mdd,
      maSharpe: backtest.benchmarkSpyMa?.sharpe,
      maSortino: backtest.benchmarkSpyMa?.sortino,
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

  if (strategy.id.startsWith("dm-")) {
    return getDmCardData(strategy);
  }

  if (strategy.id.startsWith("cta-")) {
    return getTrendCardData(strategy);
  }

  if (strategy.id === "business-cycle") {
    return getBusinessCycleCardData(strategy);
  }

  if (strategy.id === "multi-factor") {
    return getQvmCardData(strategy);
  }

  if (strategy.id === "qvm-ew" || strategy.id === "qvm-mom") {
    return getQvmDiyCardData(strategy);
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

  const returns = faberSignalPayload.periodReturns?.faberSector || null;
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
      sortino: bt.sortino,
      spyCagr: backtest.benchmarkSpy?.cagr,
      spyMdd: backtest.benchmarkSpy?.mdd,
      spySharpe: backtest.benchmarkSpy?.sharpe,
      spySortino: backtest.benchmarkSpy?.sortino,
      maCagr: backtest.benchmarkSpyMa?.cagr,
      maMdd: backtest.benchmarkSpyMa?.mdd,
      maSharpe: backtest.benchmarkSpyMa?.sharpe,
      maSortino: backtest.benchmarkSpyMa?.sortino,
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

function getDmCardData(strategy) {
  if (!dmSignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }
  const variantKey = strategy.id.replace("dm-", "");
  const variant = dmSignalPayload.variants?.[variantKey];
  if (!variant) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { signal, portfolio, backtest } = variant;
  const mode = signal?.mode;
  const dateLabel = signal?.rebalanceDate ? signal.rebalanceDate.slice(0, 7) + " 월말 기준" : "";
  const curveKey = strategy.curveKey;
  const returns = variant.periodReturns || null;
  const bt = backtest?.[curveKey];

  return {
    signal: {
      text: mode === "invested" ? "투자" : mode === "defensive" ? "방어" : mode,
      variant: mode === "invested" ? "offensive" : "defensive",
      dateLabel,
    },
    portfolio: (portfolio?.allocations || []).map((a) => ({
      ticker: a.ticker,
      nameKo: a.nameKo,
      weight: a.weight,
    })),
    backtest: bt ? {
      cagr: bt.cagr,
      mdd: bt.mdd,
      sharpe: bt.sharpe,
      sortino: bt.sortino,
      spyCagr: backtest.spy?.cagr,
      spyMdd: backtest.spy?.mdd,
      spySharpe: backtest.spy?.sharpe,
      spySortino: backtest.spy?.sortino,
      maCagr: backtest.spyMa?.cagr,
      maMdd: backtest.spyMa?.mdd,
      maSharpe: backtest.spyMa?.sharpe,
      maSortino: backtest.spyMa?.sortino,
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

function getTrendCardData(strategy) {
  if (!trendSignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { signal, portfolio, backtest, cagrWeights } = trendSignalPayload;
  const dateLabel = signal?.rebalanceDate ? signal.rebalanceDate.slice(0, 7) + " 월말 기준" : "";
  const investedCount = signal?.investedCount ?? 0;
  const totalCount = (signal?.investedCount ?? 0) + (signal?.cashCount ?? 0) || 9;
  const curveKey = strategy.curveKey || "trend";
  const returns = trendSignalPayload.periodReturns?.[curveKey] || null;
  const bt = backtest?.[curveKey];

  // CAGR가중이면 cagrWeights 기반 포트폴리오 구성
  let cardPortfolio;
  if (curveKey === "trendCagr" && cagrWeights) {
    const assets = signal?.assets || [];
    const invested = assets.filter((a) => a.invested);
    const cash = assets.filter((a) => !a.invested);
    let cashWeight = 0;
    cardPortfolio = [];
    for (const a of invested) {
      const w = cagrWeights.find((c) => c.ticker === a.ticker);
      cardPortfolio.push({ ticker: a.ticker, nameKo: w?.nameKo || a.ticker, weight: w?.cagrWeight ?? 11.1 });
    }
    for (const a of cash) {
      const w = cagrWeights.find((c) => c.ticker === a.ticker);
      cashWeight += w?.cagrWeight ?? 11.1;
    }
    if (cashWeight > 0) {
      cardPortfolio.push({ ticker: "SGOV", nameKo: "초단기 국채", weight: Math.round(cashWeight * 100) / 100 });
    }
  } else {
    cardPortfolio = (portfolio || []).map((a) => ({ ticker: a.ticker, nameKo: a.nameKo, weight: a.weight }));
  }

  return {
    signal: {
      text: `${investedCount}/${totalCount} 투자`,
      variant: investedCount > totalCount / 2 ? "offensive" : "defensive",
      dateLabel,
    },
    portfolio: cardPortfolio,
    backtest: bt ? {
      cagr: bt.cagr,
      mdd: bt.mdd,
      sharpe: bt.sharpe,
      sortino: bt.sortino,
      spyCagr: backtest.spy?.cagr,
      spyMdd: backtest.spy?.mdd,
      spySharpe: backtest.spy?.sharpe,
      spySortino: backtest.spy?.sortino,
      maCagr: backtest.spyMa?.cagr,
      maMdd: backtest.spyMa?.mdd,
      maSharpe: backtest.spyMa?.sharpe,
      maSortino: backtest.spyMa?.sortino,
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

function getBusinessCycleCardData(strategy) {
  if (!businessCycleSignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { signal, portfolio, backtest } = businessCycleSignalPayload;
  const dateLabel = signal?.rebalanceDate ? signal.rebalanceDate.slice(0, 7) + " 월말 기준" : "";

  const PHASE_VARIANTS = { early: "offensive", mid: "offensive", late: "defensive", recession: "defensive" };
  const returns = businessCycleSignalPayload.periodReturns?.businessCycle || null;
  const bt = backtest?.businessCycle;

  return {
    signal: {
      text: signal?.phaseLabel || "—",
      variant: PHASE_VARIANTS[signal?.phase] || "coming",
      dateLabel,
    },
    portfolio: (portfolio?.allocations || []).map((a) => ({
      ticker: a.ticker,
      nameKo: a.nameKo,
      weight: a.weight,
    })),
    backtest: bt ? {
      cagr: bt.cagr,
      mdd: bt.mdd,
      sharpe: bt.sharpe,
      sortino: bt.sortino,
      spyCagr: backtest.benchmarkSpy?.cagr,
      spyMdd: backtest.benchmarkSpy?.mdd,
      spySharpe: backtest.benchmarkSpy?.sharpe,
      spySortino: backtest.benchmarkSpy?.sortino,
      maCagr: backtest.benchmarkSpyMa?.cagr,
      maMdd: backtest.benchmarkSpyMa?.mdd,
      maSharpe: backtest.benchmarkSpyMa?.sharpe,
      maSortino: backtest.benchmarkSpyMa?.sortino,
      startDate: backtest.startDate,
    } : null,
    returns,
  };
}

function getQvmDiyCardData(strategy) {
  if (!qvmDiySignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }
  const variantKey = strategy.curveKey;
  const portfolio = qvmDiySignalPayload.portfolios?.[variantKey]?.allocations || [];
  const bt = qvmDiySignalPayload.backtest?.[variantKey];
  const returns = qvmDiySignalPayload.periodReturns?.[variantKey] || null;
  const dateLabel = qvmDiySignalPayload.signal?.rebalanceDate
    ? String(qvmDiySignalPayload.signal.rebalanceDate).slice(0, 7) + " 월말 기준" : "";

  return {
    signal: {
      text: variantKey === "qvmEw" ? "균등 배분" : "모멘텀 로테이션",
      variant: "offensive",
      dateLabel,
    },
    portfolio: portfolio.map((a) => ({ ticker: a.ticker, nameKo: a.nameKo, weight: a.weight })),
    backtest: bt ? {
      cagr: bt.cagr,
      mdd: bt.mdd,
      sharpe: bt.sharpe,
      sortino: bt.sortino,
      spyCagr: qvmDiySignalPayload.backtest?.spy?.cagr,
      spyMdd: qvmDiySignalPayload.backtest?.spy?.mdd,
      spySharpe: qvmDiySignalPayload.backtest?.spy?.sharpe,
      spySortino: qvmDiySignalPayload.backtest?.spy?.sortino,
      maCagr: qvmDiySignalPayload.backtest?.spyMa?.cagr,
      maMdd: qvmDiySignalPayload.backtest?.spyMa?.mdd,
      maSharpe: qvmDiySignalPayload.backtest?.spyMa?.sharpe,
      maSortino: qvmDiySignalPayload.backtest?.spyMa?.sortino,
      startDate: qvmDiySignalPayload.backtest?.startDate,
    } : null,
    returns,
  };
}

function getQvmCardData(strategy) {
  if (!qvmSignalPayload) {
    return { signal: { text: "데이터 없음", variant: "coming" }, portfolio: null, backtest: null, returns: null };
  }

  const { performance, equityCurve, latestClose } = qvmSignalPayload;
  const dateLabel = latestClose?.date ? latestClose.date.slice(0, 7) + " 기준" : "";
  const returns = qvmSignalPayload.periodReturns?.qvml || null;
  const qvmlPerf = performance?.qvml;

  return {
    signal: {
      text: "통합 팩터",
      variant: "offensive",
      dateLabel,
    },
    portfolio: [{ ticker: "QVML", nameKo: "S&P 500 QVM 멀티팩터", weight: 100 }],
    backtest: qvmlPerf ? {
      cagr: qvmlPerf.cagr,
      mdd: qvmlPerf.mdd,
      sharpe: qvmlPerf.sharpe,
      sortino: qvmlPerf.sortino,
      spyCagr: performance?.spy?.cagr,
      spyMdd: performance?.spy?.mdd,
      spySharpe: performance?.spy?.sharpe,
      spySortino: performance?.spy?.sortino,
      maCagr: performance?.spyMa?.cagr,
      maMdd: performance?.spyMa?.mdd,
      maSharpe: performance?.spyMa?.sharpe,
      maSortino: performance?.spyMa?.sortino,
      startDate: equityCurve?.[0]?.date,
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
  const returns = allwSignalPayload.periodReturns?.allw || null;
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
      sortino: allwPerf.sortino,
      spyCagr: performance?.spy?.cagr,
      spyMdd: performance?.spy?.mdd,
      spySharpe: performance?.spy?.sharpe,
      spySortino: performance?.spy?.sortino,
      maCagr: performance?.spyMa?.cagr,
      maMdd: performance?.spyMa?.mdd,
      maSharpe: performance?.spyMa?.sharpe,
      maSortino: performance?.spyMa?.sortino,
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
