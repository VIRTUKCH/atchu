import React from "react";
import "../styles/column.css";
import { dmSignalPayload } from "../utils/dmDataLoaders";
import { ColumnKeyFact, ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnTimeline, ColumnTimelineItem } from "../components/column/ColumnTimeline";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import DmEquityCurveChart from "../components/dm/DmEquityCurveChart";

/* ═══ Variant config ═══ */

const VARIANT_CONFIG = {
  gem: {
    label: "듀얼 모멘텀 GEM",
    short: "GEM",
    curveKey: "gem",
    author: "Gary Antonacci",
    description: "미국(SPY) vs 선진국(EFA) 상대모멘텀 → 승자 vs T-Bill(BIL) 절대모멘텀 → 통과 시 투자, 실패 시 채권(AGG)",
    type: "comparison",
  },
  adm: {
    label: "듀얼 모멘텀 ADM",
    short: "ADM",
    curveKey: "adm",
    author: "Gary Antonacci (변형)",
    description: "가속 모멘텀(1M+3M+6M 합산) — 둘 다 음수면 장기채(TLT)로 대피, 아니면 최고 점수 자산에 투자",
    type: "ranking",
  },
  cdm: {
    label: "듀얼 모멘텀 CDM",
    short: "CDM",
    curveKey: "cdm",
    author: "Gary Antonacci (변형)",
    description: "4개 모듈(주식·크레딧·부동산·스트레스) × 25% — 각 모듈 독립 듀얼 모멘텀 판단",
    type: "modules",
  },
  sector: {
    label: "듀얼 모멘텀 섹터",
    short: "Sector",
    curveKey: "sector",
    author: "Gary Antonacci (변형)",
    description: "미국 10개 섹터 중 12개월 수익률 상위 4 → 각각 T-Bill 대비 절대모멘텀 필터",
    type: "sectorRanking",
  },
};

/* ═══ Shared — calcPeriodReturns ═══ */

function calcPeriodReturns(equityCurve, curveKey) {
  if (!equityCurve || !curveKey || equityCurve.length < 2) return null;
  const latest = equityCurve[equityCurve.length - 1];
  const latestVal = latest[curveKey];
  if (latestVal == null) return null;
  const lookup = (mAgo) => {
    const idx = equityCurve.length - 1 - mAgo;
    return idx >= 0 ? equityCurve[idx][curveKey] : null;
  };
  const pct = (prev) => (prev != null ? ((latestVal / prev - 1) * 100).toFixed(1) : null);
  return { "5Y": pct(lookup(60)), "3Y": pct(lookup(36)), "1Y": pct(lookup(12)), "6M": pct(lookup(6)), "3M": pct(lookup(3)), "1M": pct(lookup(1)) };
}

/* ═══ Shared sections ═══ */

function ReturnsSection({ equityCurve, curveKey }) {
  const returns = calcPeriodReturns(equityCurve, curveKey);
  if (!returns) return null;
  const periods = [
    { key: "1M", label: "1개월" }, { key: "3M", label: "3개월" }, { key: "6M", label: "6개월" },
    { key: "1Y", label: "1년" }, { key: "3Y", label: "3년" }, { key: "5Y", label: "5년" },
  ];
  const stats = periods
    .filter((p) => returns[p.key] != null)
    .map((p) => {
      const num = parseFloat(returns[p.key]);
      return { value: `${num >= 0 ? "+" : ""}${returns[p.key]}%`, label: p.label, desc: "USD 기준" };
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

function SignalBadge({ signal, vc }) {
  if (!signal) return null;
  const invested = signal.mode === "invested";
  const badgeColor = invested ? "#22c55e" : "#3b82f6";
  const modeLabel = invested ? "투자 (Invested)" : "방어 (Defensive)";
  const dateLabel = signal.rebalanceDate ? signal.rebalanceDate.slice(0, 7) + " 월말 기준" : "";

  let detail = "";
  if (vc.type === "comparison") {
    detail = invested ? `승자 ${signal.winner} — T-Bill 상회` : "T-Bill 하회 → 채권(AGG) 대피";
  } else if (vc.type === "ranking") {
    detail = invested ? `최고 점수: ${signal.topAsset}` : "모든 자산 점수 음수 → 장기채(TLT) 대피";
  } else if (vc.type === "modules") {
    detail = invested ? "모듈별 투자 자산 보유 중" : "전 모듈 현금(BIL) 대피";
  } else {
    detail = invested ? "상위 섹터 투자 중" : "전 섹터 T-Bill 하회 → 현금 대피";
  }

  return (
    <div className="panel-card" style={{ padding: "20px", textAlign: "center" }}>
      <div style={{
        display: "inline-block", padding: "8px 20px", borderRadius: "var(--radius-sm, 6px)",
        background: badgeColor, color: "#fff", fontWeight: 700,
        fontSize: "clamp(28px, calc(22.4px + 1.5vw), 36px)", marginBottom: 8,
      }}>
        {modeLabel}
      </div>
      <div style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)", marginTop: 4 }}>
        {detail}
      </div>
      {dateLabel && (
        <div style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)", marginTop: 4 }}>
          {dateLabel}
        </div>
      )}
    </div>
  );
}

function PortfolioSection({ allocations }) {
  if (!allocations || allocations.length === 0) return null;
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        현재 포트폴리오
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {allocations.map((a, i) => (
          <span key={i} className="ticker-pill" style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)" }}>
            {a.ticker} {a.nameKo} {a.weight}%
          </span>
        ))}
      </div>
    </div>
  );
}

function BacktestSection({ backtest, vc }) {
  if (!backtest) return null;
  const v = backtest[vc.curveKey];
  const spy = backtest.spy;
  const sf = backtest.sixtyForty;
  const stats = [
    { value: `${v?.cagr ?? "—"}%`, label: `${vc.short} CAGR`, desc: "연평균 수익률" },
    { value: `${v?.mdd ?? "—"}%`, label: `${vc.short} MDD`, desc: "최대 낙폭" },
    { value: `${v?.sharpe ?? "—"}`, label: "샤프비율", desc: "위험조정 수익" },
    { value: `${backtest.defensiveRatio != null ? Math.round(backtest.defensiveRatio * 100) : "—"}%`, label: "방어 비율", desc: "방어 모드 기간" },
  ];
  const compareRows = [
    [vc.short, `${v?.cagr ?? "—"}%`, `${v?.mdd ?? "—"}%`, `${v?.sharpe ?? "—"}`, `${v?.maxAnnualLoss ?? "—"}%`],
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
      <DmEquityCurveChart equityCurve={backtest.equityCurve} curveKey={vc.curveKey} curveLabel={vc.short} />
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
          const modeLabel = h.mode === "invested" ? "투자" : "방어";
          const allocs = (h.allocations || []).map((a) => `${a.ticker} ${a.weight}%`).join(" + ");
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
            fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)",
          }}
        >
          전체 {history.length}개월 보기
        </button>
      )}
    </div>
  );
}

/* ═══ Variant-specific sections ═══ */

/** GEM: SPY vs EFA 12개월 수익률 비교 + BIL 체크 */
function ComparisonSection({ comparison }) {
  if (!comparison || comparison.length === 0) return null;
  const spy = comparison.find((c) => c.ticker === "SPY");
  const efa = comparison.find((c) => c.ticker === "EFA");
  const bil = comparison.find((c) => c.ticker === "BIL");
  const winner = (spy?.return12m ?? 0) >= (efa?.return12m ?? 0) ? spy : efa;
  const winnerAboveBil = (winner?.return12m ?? 0) > (bil?.return12m ?? 0);

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        상대 모멘텀 비교 (12개월)
      </h3>
      <ColumnKeyFactGrid>
        {comparison.map((c) => (
          <ColumnKeyFact
            key={c.ticker}
            value={`${c.return12m != null ? (c.return12m >= 0 ? "+" : "") + c.return12m.toFixed(2) + "%" : "—"}`}
            variant={c.ticker === winner?.ticker ? "positive" : undefined}
            label={`${c.ticker} · ${c.nameKo}`}
            desc={c.ticker === bil?.ticker ? "무위험 기준" : "12개월 수익률"}
          />
        ))}
      </ColumnKeyFactGrid>
      <div style={{ marginTop: 16 }}>
        <ColumnCallout>
          1단계 상대모멘텀: {winner?.ticker} 승 ({winner?.return12m?.toFixed(2)}%)
          {" → "}
          2단계 절대모멘텀: {winner?.ticker} {winnerAboveBil ? ">" : "≤"} BIL → {winnerAboveBil ? `${winner?.ticker} 투자` : "AGG(채권) 대피"}
        </ColumnCallout>
      </div>
    </div>
  );
}

/** ADM: 1M+3M+6M 점수 분해 테이블 */
function ScoreBreakdownSection({ ranking }) {
  if (!ranking || ranking.length === 0) return null;
  const allNegative = ranking.every((r) => (r.totalScore ?? 0) < 0);
  const rows = ranking.map((r) => [
    r.selected ? { value: r.ticker, highlight: true } : r.ticker,
    r.nameKo,
    r.score1m != null ? `${r.score1m >= 0 ? "+" : ""}${r.score1m.toFixed(2)}%` : "—",
    r.score3m != null ? `${r.score3m >= 0 ? "+" : ""}${r.score3m.toFixed(2)}%` : "—",
    r.score6m != null ? `${r.score6m >= 0 ? "+" : ""}${r.score6m.toFixed(2)}%` : "—",
    r.totalScore != null ? `${r.totalScore >= 0 ? "+" : ""}${r.totalScore.toFixed(2)}` : "—",
    r.selected ? "✓" : "",
  ]);
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        가속 모멘텀 점수
      </h3>
      <ColumnCallout>
        점수 = 1개월 수익률 + 3개월 수익률 + 6개월 수익률
        {allNegative ? " → 모두 음수 → TLT(장기채) 대피" : ""}
      </ColumnCallout>
      <div style={{ marginTop: 16 }}>
        <ColumnCompareTable columns={["티커", "이름", "1M", "3M", "6M", "합산 점수", "선택"]} rows={rows} />
      </div>
    </div>
  );
}

/** CDM: 4개 모듈 카드 */
function ModulesSection({ modules }) {
  if (!modules || modules.length === 0) return null;
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        모듈별 듀얼 모멘텀 판단
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {modules.map((m) => {
          const isBil = m.result === "BIL";
          return (
            <div key={m.name} style={{
              padding: "14px 16px", borderRadius: "var(--radius-sm, 10px)",
              border: "1px solid var(--line)", background: "var(--panel-2)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)" }}>
                  {m.name} (25%)
                </span>
                <span className="ticker-pill" style={{
                  fontSize: "clamp(13px, calc(12.3px + 0.19vw), 14px)",
                  background: isBil ? "var(--accent-blue)" : "var(--accent-green)",
                  color: "#fff",
                }}>
                  {m.result}
                </span>
              </div>
              <div style={{ fontSize: "clamp(14px, calc(13.3px + 0.19vw), 15px)", color: "var(--muted)" }}>
                {m.candidates.length > 1 && (
                  <>상대: {m.candidates.join(" vs ")} → 승자 {m.winner} ({m.winnerReturn12m >= 0 ? "+" : ""}{m.winnerReturn12m}%)<br /></>
                )}
                절대: {m.winner} {m.winnerReturn12m > m.bilReturn12m ? ">" : "≤"} BIL ({m.bilReturn12m >= 0 ? "+" : ""}{m.bilReturn12m}%)
                {isBil ? " → 현금 대피" : ` → ${m.result} 투자`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 섹터 DM: 10행 랭킹 테이블 */
function SectorRankingSection({ ranking }) {
  if (!ranking || ranking.length === 0) return null;
  const rows = ranking.map((r) => {
    const ticker = r.selected ? { value: r.ticker, highlight: true } : r.ticker;
    return [
      String(r.rank),
      ticker,
      r.nameKo,
      r.return12m != null ? `${r.return12m >= 0 ? "+" : ""}${r.return12m.toFixed(2)}%` : "—",
      r.aboveBil ? "✓" : "✗",
      r.selected ? "✓" : "",
    ];
  });
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        섹터 12개월 모멘텀 순위
      </h3>
      <ColumnCallout>
        상위 4개 섹터 선정 (상대 모멘텀) → 각 섹터의 12M 수익률이 T-Bill(BIL) 초과 시 투자, 미달 시 현금 대체 (절대 모멘텀)
      </ColumnCallout>
      <div style={{ marginTop: 16 }}>
        <ColumnCompareTable columns={["순위", "티커", "섹터", "12M 수익률", "> BIL", "선택"]} rows={rows} />
      </div>
    </div>
  );
}

/* ═══ Main page ═══ */

export default function DualMomentumPage({ variant = "gem" }) {
  const vc = VARIANT_CONFIG[variant] || VARIANT_CONFIG.gem;

  if (!dmSignalPayload) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">{vc.label}</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          듀얼 모멘텀 신호 데이터가 아직 생성되지 않았습니다.<br />
          파이프라인을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const data = dmSignalPayload.variants?.[variant];
  if (!data) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">{vc.label}</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>해당 변형의 데이터가 없습니다.</p>
      </div>
    );
  }

  const { signal, portfolio, backtest, history } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">← 퀀트 엿보기</ColumnBackLink>

      <div>
        <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 4 }}>
          {vc.label}
        </h2>
        <p style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)", margin: 0 }}>
          {vc.description}
        </p>
      </div>

      <ReturnsSection equityCurve={backtest?.equityCurve} curveKey={vc.curveKey} />

      <SignalBadge signal={signal} vc={vc} />

      <PortfolioSection allocations={portfolio?.allocations} />

      {/* 변형별 섹션 */}
      {vc.type === "comparison" && <ComparisonSection comparison={data.comparison} />}
      {vc.type === "ranking" && <ScoreBreakdownSection ranking={data.ranking} />}
      {vc.type === "modules" && <ModulesSection modules={data.modules} />}
      {vc.type === "sectorRanking" && <SectorRankingSection ranking={data.ranking} />}

      <BacktestSection backtest={backtest} vc={vc} />

      <HistorySection history={history} />

      <ColumnWarningCard>
        듀얼 모멘텀 전략은 개인 학습·참고용입니다. 투자 판단의 책임은 본인에게 있습니다.
        Gary Antonacci의 "Dual Momentum Investing"(2014)을 기반으로 구현했으며, 과거 성과가 미래 수익을 보장하지 않습니다.
      </ColumnWarningCard>
    </div>
  );
}
