import React from "react";
import "../styles/column.css";
import { haaSignalPayload } from "../utils/haaDataLoaders";
import { ColumnKeyFact, ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnTimeline, ColumnTimelineItem } from "../components/column/ColumnTimeline";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import HaaEquityCurveChart from "../components/haa/HaaEquityCurveChart";

function calcPeriodReturns(equityCurve) {
  if (!equityCurve || equityCurve.length < 2) return null;
  const latest = equityCurve[equityCurve.length - 1];
  const latestVal = latest.haa;
  if (latestVal == null) return null;
  const lookup = (monthsAgo) => {
    const idx = equityCurve.length - 1 - monthsAgo;
    return idx >= 0 ? equityCurve[idx].haa : null;
  };
  const pct = (prev) => prev != null ? ((latestVal / prev - 1) * 100).toFixed(1) : null;
  return { "5Y": pct(lookup(60)), "3Y": pct(lookup(36)), "1Y": pct(lookup(12)), "6M": pct(lookup(6)), "3M": pct(lookup(3)), "1M": pct(lookup(1)) };
}

function ReturnsSection({ equityCurve }) {
  const returns = calcPeriodReturns(equityCurve);
  if (!returns) return null;
  const periods = [
    { key: "1M", label: "1개월" },
    { key: "3M", label: "3개월" },
    { key: "6M", label: "6개월" },
    { key: "1Y", label: "1년" },
    { key: "3Y", label: "3년" },
    { key: "5Y", label: "5년" },
  ];
  const stats = periods
    .filter((p) => returns[p.key] != null)
    .map((p) => {
      const num = parseFloat(returns[p.key]);
      return {
        value: `${num >= 0 ? "+" : ""}${returns[p.key]}%`,
        label: p.label,
        desc: "USD 기준",
      };
    });
  if (stats.length === 0) return null;
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        기간별 수익률
      </h3>
      <ColumnStatGrid stats={stats} />
    </div>
  );
}

function SignalBadge({ signal }) {
  if (!signal) return null;
  const { mode, rebalanceDate, canaryPositive } = signal;
  const isOffensive = mode === "offensive";
  const badgeColor = isOffensive ? "#22c55e" : "#3b82f6";
  const modeLabel = isOffensive ? "공격 (Offensive)" : "방어 (Defensive)";
  const dateLabel = rebalanceDate ? rebalanceDate.slice(0, 7) + " 월말 기준" : "";

  return (
    <div className="panel-card" style={{ padding: "20px", textAlign: "center" }}>
      <div style={{
        display: "inline-block", padding: "8px 20px", borderRadius: "var(--radius-sm, 6px)",
        background: badgeColor, color: "#fff", fontWeight: 700,
        fontSize: "clamp(28px, calc(22.4px + 1.5vw), 36px)", marginBottom: 8
      }}>
        {modeLabel}
      </div>
      <div style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)", marginTop: 4 }}>
        {canaryPositive ? "TIP 모멘텀 양(+) → 공격 모드" : "TIP 모멘텀 음(−) → 방어 모드"}
      </div>
      {dateLabel && (
        <div style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)", marginTop: 4 }}>
          {dateLabel}
        </div>
      )}
    </div>
  );
}

function PortfolioSection({ portfolio }) {
  if (!portfolio || !portfolio.allocations || portfolio.allocations.length === 0) return null;
  const rows = portfolio.allocations.map((a) => {
    const ticker = a.replacedByBil
      ? { value: `BIL (← ${a.originalTicker || "?"})`, bad: true }
      : a.ticker;
    return [
      ticker,
      a.nameKo || "",
      `${a.weight}%`,
      a.momentum != null ? `${a.momentum > 0 ? "+" : ""}${a.momentum}%` : "—"
    ];
  });
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        이번 달 포트폴리오
      </h3>
      {portfolio.mode === "offensive" && (
        <ColumnCallout>공격 유니버스 top 4 — 각 25% 균등 배분</ColumnCallout>
      )}
      {portfolio.mode === "defensive" && (
        <ColumnCallout>방어 모드 — 전액 채권</ColumnCallout>
      )}
      <div style={{ marginTop: 12 }}>
        <ColumnCompareTable columns={["티커", "이름", "비중", "모멘텀"]} rows={rows} />
      </div>
    </div>
  );
}

function CanarySection({ canary }) {
  if (!canary || canary.length === 0) return null;
  const tip = canary[0];
  const isPositive = tip.momentum != null && tip.momentum > 0;
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        카나리아 — TIP (물가연동 국채)
      </h3>
      <ColumnCallout>
        {isPositive
          ? "TIP 모멘텀 양(+) → 공격 모드. 인플레이션 기대 상승 = 위험자산 우호적"
          : "TIP 모멘텀 음(−) → 방어 모드. 인플레이션 기대 하락 = 위험자산 비우호적"}
      </ColumnCallout>
      <div style={{ marginTop: 16 }}>
        <ColumnKeyFactGrid>
          <ColumnKeyFact
            value={`${tip.momentum > 0 ? "+" : ""}${tip.momentum?.toFixed(2) ?? "—"}%`}
            variant={isPositive ? "positive" : "negative"}
            label="TIP · 물가연동 국채"
            desc="균등 평균 모멘텀"
          />
        </ColumnKeyFactGrid>
      </div>
    </div>
  );
}

function RankingSection({ offensiveRanking, defensiveInfo }) {
  const offensiveRows = (offensiveRanking || []).map((r, i) => {
    const ticker = r.selected ? { value: r.ticker, highlight: true } : r.ticker;
    const momStr = `${r.momentum > 0 ? "+" : ""}${r.momentum?.toFixed(2) ?? "—"}%`;
    const mom = r.replacedByBil ? { value: momStr, bad: true } : momStr;
    return [
      String(i + 1), ticker, r.nameKo || "", mom,
      r.selected ? "✓" : "", r.replacedByBil ? "→ BIL" : ""
    ];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          공격 유니버스 모멘텀 순위
        </h3>
        <ColumnCompareTable columns={["순위", "티커", "이름", "모멘텀", "선택", "BIL 대체"]} rows={offensiveRows} />
      </div>
      {defensiveInfo && (
        <div className="panel-card" style={{ padding: "20px" }}>
          <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
            방어 자산 — IEF (중기 국채)
          </h3>
          <ColumnCallout>
            {defensiveInfo.replacedByBil
              ? `IEF 모멘텀 ${defensiveInfo.momentum?.toFixed(2) ?? "—"}% (음수) → 방어 시 BIL로 대체`
              : `IEF 모멘텀 +${defensiveInfo.momentum?.toFixed(2) ?? "—"}% (양수) → 방어 시 IEF 100%`}
          </ColumnCallout>
        </div>
      )}
    </div>
  );
}

function BacktestSection({ backtest }) {
  if (!backtest) return null;
  const v = backtest.haa;
  const spy = backtest.benchmarkSpy;
  const sf = backtest.benchmark6040;
  const stats = [
    { value: `${v?.cagr ?? "—"}%`, label: "HAA CAGR", desc: "연평균 수익률" },
    { value: `${v?.mdd ?? "—"}%`, label: "HAA MDD", desc: "최대 낙폭" },
    { value: `${v?.sharpe ?? "—"}`, label: "샤프비율", desc: "위험조정 수익" },
    { value: `${backtest.defensiveRatio != null ? Math.round(backtest.defensiveRatio * 100) : "—"}%`, label: "방어 비율", desc: "방어 모드 기간" },
  ];
  const compareRows = [
    ["HAA", `${v?.cagr ?? "—"}%`, `${v?.mdd ?? "—"}%`, `${v?.sharpe ?? "—"}`, `${v?.maxAnnualLoss ?? "—"}%`],
    ["SPY B&H", `${spy?.cagr ?? "—"}%`, `${spy?.mdd ?? "—"}%`, `${spy?.sharpe ?? "—"}`, ""],
    ["60/40 B&H", `${sf?.cagr ?? "—"}%`, `${sf?.mdd ?? "—"}%`, `${sf?.sharpe ?? "—"}`, ""],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 4, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          전략 성과 요약
        </h3>
        {backtest.startDate && (
          <div style={{ marginBottom: 12, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
            {backtest.startDate.slice(0, 7)} ~ {backtest.endDate?.slice(0, 7)} 백테스트
          </div>
        )}
        <ColumnStatGrid stats={stats} />
        <div style={{ marginTop: 16 }}>
          <ColumnCompareTable columns={["전략", "CAGR", "MDD", "샤프", "최대 연손실"]} rows={compareRows} />
        </div>
      </div>
      <HaaEquityCurveChart equityCurve={backtest.equityCurve} />
    </div>
  );
}

function HistorySection({ history }) {
  if (!history || history.length === 0) return null;
  const [showAll, setShowAll] = React.useState(false);
  const sorted = [...history].reverse();
  const visible = showAll ? sorted : sorted.slice(0, 12);
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        월별 리밸런싱 히스토리
      </h3>
      <ColumnTimeline>
        {visible.map((h) => {
          const modeLabel = h.mode === "offensive" ? "공격" : "방어";
          const allocs = (h.haa || []).map((a) => `${a.ticker} ${a.weight}%`).join(" + ");
          return (
            <ColumnTimelineItem key={h.date} year={h.date?.slice(0, 7)} title={modeLabel}>
              {allocs || "—"}
            </ColumnTimelineItem>
          );
        })}
      </ColumnTimeline>
      {!showAll && history.length > 12 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            marginTop: 12, padding: "8px 16px",
            border: "1px solid var(--line)", borderRadius: "var(--radius-sm, 6px)",
            background: "transparent", color: "var(--ink)", cursor: "pointer",
            fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)"
          }}
        >
          전체 {history.length}개월 보기
        </button>
      )}
    </div>
  );
}

export default function HaaQuantPeekPage() {
  if (!haaSignalPayload) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">HAA (Hybrid Asset Allocation)</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          HAA 신호 데이터가 아직 생성되지 않았습니다.<br />
          파이프라인을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const { signal, canary, offensiveRanking, defensiveInfo, portfolios, backtest, history } = haaSignalPayload;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">← 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        HAA (Hybrid Asset Allocation)
      </h2>

      <ReturnsSection equityCurve={backtest?.equityCurve} />

      <SignalBadge signal={signal} />

      <PortfolioSection portfolio={portfolios?.haa} />

      <CanarySection canary={canary} />

      <RankingSection offensiveRanking={offensiveRanking} defensiveInfo={defensiveInfo} />

      <BacktestSection backtest={backtest} />

      <HistorySection history={history} />

      <ColumnWarningCard>
        HAA 전략은 개인 학습·참고용입니다. 투자 판단의 책임은 본인에게 있습니다.
        이 페이지는 Wouter Keller의 논문(2023)을 기반으로 구현했으며, 과거 성과가 미래 수익을 보장하지 않습니다.
      </ColumnWarningCard>
    </div>
  );
}
