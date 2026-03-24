import React from "react";
import "../styles/column.css";
import { businessCycleSignalPayload } from "../utils/businessCycleDataLoaders";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnTimeline, ColumnTimelineItem } from "../components/column/ColumnTimeline";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import { ColumnAllocationBar } from "../components/column/ColumnAllocationBar";
import BusinessCycleEquityCurveChart from "../components/business-cycle/BusinessCycleEquityCurveChart";

const ALLOC_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899"];

const PHASE_COLORS = {
  early: "#22c55e",     // 초록 — 회복기
  mid: "#3b82f6",       // 파랑 — 호황기
  late: "#f59e0b",      // 주황 — 둔화기
  recession: "#ef4444", // 빨강 — 침체기
};

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

/* ── Sections ── */

function ReturnsSection({ equityCurve }) {
  const returns = calcPeriodReturns(equityCurve, "businessCycle");
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

function PhaseIndicatorSection({ signal, phaseIndicators, phaseMapping }) {
  if (!signal || !phaseIndicators || !phaseMapping) return null;

  const currentPhase = signal.phase;
  const phases = ["early", "mid", "recession", "late"]; // 2x2 그리드: 상단(early,mid) 하단(recession,late)

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        경기 국면 판단
      </h3>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)",
            fontWeight: 600,
            color: "#fff",
            background: PHASE_COLORS[currentPhase],
          }}
        >
          {signal.phaseLabel}
        </span>
        {signal.rebalanceDate && (
          <span style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
            {signal.rebalanceDate.slice(0, 7)} 월말 기준
          </span>
        )}
      </div>

      <ColumnCallout>
        SPY 6개월 수익률 <strong>{phaseIndicators.spyMomentum6m >= 0 ? "+" : ""}{phaseIndicators.spyMomentum6m}%</strong>{" "}
        → 주식 {phaseIndicators.spyMomentum6m > 0 ? "상승(↑)" : "하락(↓)"}
        {" "}&nbsp;|&nbsp;{" "}
        IEF/SHY 비율 변화 <strong>{phaseIndicators.rateDirection6m >= 0 ? "+" : ""}{phaseIndicators.rateDirection6m}%</strong>{" "}
        → 금리 {phaseIndicators.rateDirectionSign === "negative" ? "하락(↓)" : "상승(↑)"}
      </ColumnCallout>

      {/* 2x2 국면 그리드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginTop: 16,
      }}>
        {phases.map((p) => {
          const isActive = p === currentPhase;
          const mapping = phaseMapping[p];
          return (
            <div
              key={p}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: `2px solid ${isActive ? PHASE_COLORS[p] : "var(--line)"}`,
                background: isActive ? `${PHASE_COLORS[p]}15` : "var(--panel-2)",
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <div style={{
                fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)",
                fontWeight: 600,
                color: isActive ? PHASE_COLORS[p] : "var(--ink)",
                marginBottom: 4,
              }}>
                {mapping?.label}
              </div>
              <div style={{
                fontSize: "clamp(13px, calc(11px + 0.5vw), 15px)",
                color: "var(--muted)",
                marginBottom: 6,
              }}>
                {mapping?.condition}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {mapping?.sectors?.map((s) => (
                  <span
                    key={s.ticker}
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "clamp(12px, calc(10px + 0.5vw), 14px)",
                      fontWeight: 500,
                      background: isActive ? `${PHASE_COLORS[p]}30` : "var(--line)",
                      color: isActive ? PHASE_COLORS[p] : "var(--muted)",
                    }}
                  >
                    {s.ticker}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortfolioSection({ portfolio }) {
  if (!portfolio?.allocations || portfolio.allocations.length === 0) return null;

  const items = portfolio.allocations.map((a, i) => ({
    label: `${a.ticker} · ${a.nameKo}`,
    pct: Math.round(a.weight * 100) / 100,
    color: ALLOC_COLORS[i % ALLOC_COLORS.length],
  }));

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        이번 달 포트폴리오
      </h3>
      <ColumnAllocationBar items={items} />
      <div style={{ marginTop: 12 }}>
        <ColumnCompareTable
          columns={["티커", "섹터", "비중"]}
          rows={portfolio.allocations.map((a) => [
            { value: a.ticker, highlight: true },
            a.nameKo,
            `${a.weight}%`,
          ])}
        />
      </div>
    </div>
  );
}

function SectorMappingSection({ phaseMapping, currentPhase }) {
  if (!phaseMapping) return null;
  const phaseOrder = ["early", "mid", "late", "recession"];
  const rows = phaseOrder.map((p) => {
    const m = phaseMapping[p];
    const sectorText = m.sectors.map((s) => `${s.ticker}(${s.nameKo})`).join(", ");
    const label = p === currentPhase ? { value: m.label, highlight: true } : m.label;
    return [label, m.condition, sectorText];
  });
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        국면별 섹터 매핑
      </h3>
      <ColumnCompareTable columns={["국면", "조건", "투자 섹터"]} rows={rows} />
    </div>
  );
}

function BacktestSection({ backtest }) {
  if (!backtest) return null;
  const bc = backtest.businessCycle;
  const spy = backtest.benchmarkSpy;
  const sf = backtest.benchmark6040;
  const pd = backtest.phaseDistribution;
  const stats = [
    { value: `${bc?.cagr ?? "—"}%`, label: "전략 CAGR", desc: "연평균 수익률" },
    { value: `${bc?.mdd ?? "—"}%`, label: "MDD", desc: "최대 낙폭" },
    { value: `${bc?.sharpe ?? "—"}`, label: "샤프비율", desc: "위험조정 수익" },
    { value: `${bc?.maxAnnualLoss ?? "—"}%`, label: "최악 연간 손실", desc: "1년 기준" },
  ];
  const compareRows = [
    ["경기순환 로테이션", `${bc?.cagr ?? "—"}%`, `${bc?.mdd ?? "—"}%`, `${bc?.sharpe ?? "—"}`],
    ["SPY B&H", `${spy?.cagr ?? "—"}%`, `${spy?.mdd ?? "—"}%`, `${spy?.sharpe ?? "—"}`],
    ["60/40 B&H", `${sf?.cagr ?? "—"}%`, `${sf?.mdd ?? "—"}%`, `${sf?.sharpe ?? "—"}`],
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
          <ColumnCompareTable columns={["전략", "CAGR", "MDD", "샤프"]} rows={compareRows} />
        </div>
        {pd && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", fontWeight: 600, marginBottom: 8 }}>
              국면 분포
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {Object.entries(pd).map(([p, ratio]) => (
                <span key={p} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: PHASE_COLORS[p], display: "inline-block" }} />
                  <span style={{ color: "var(--muted)" }}>
                    {p === "early" ? "회복기" : p === "mid" ? "호황기" : p === "late" ? "둔화기" : "침체기"}{" "}
                    {Math.round(ratio * 100)}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <BusinessCycleEquityCurveChart equityCurve={backtest.equityCurve} />
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
          const allocs = (h.portfolio || []).map((a) => `${a.ticker} ${a.weight}%`).join(" + ");
          const indicators = `SPY 6M: ${h.spyMomentum6m >= 0 ? "+" : ""}${h.spyMomentum6m}%  |  금리: ${h.rateDirection6m >= 0 ? "+" : ""}${h.rateDirection6m}%`;
          return (
            <ColumnTimelineItem key={h.date} year={h.date?.slice(0, 7)} title={h.phaseLabel}>
              {allocs}
              <br />
              <span style={{ fontSize: "clamp(13px, calc(11px + 0.5vw), 15px)", color: "var(--muted)" }}>{indicators}</span>
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

/* ── Main ── */

export default function BusinessCyclePage() {
  if (!businessCycleSignalPayload) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">경기순환 섹터 로테이션</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          경기순환 신호 데이터가 아직 생성되지 않았습니다.<br />
          파이프라인을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const { signal, phaseIndicators, phaseMapping, portfolio, backtest, history } = businessCycleSignalPayload;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">← 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        경기순환 섹터 로테이션
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", margin: 0 }}>
        경기 4국면(회복→호황→둔화→침체)별 강세 섹터 자동 매핑 — Sam Stovall
      </p>

      <ReturnsSection equityCurve={backtest?.equityCurve} />

      <PhaseIndicatorSection signal={signal} phaseIndicators={phaseIndicators} phaseMapping={phaseMapping} />

      <PortfolioSection portfolio={portfolio} />

      <SectorMappingSection phaseMapping={phaseMapping} currentPhase={signal?.phase} />

      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          국면 판단 방법
        </h3>
        <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.6, margin: 0 }}>
          이 전략은 <strong>모멘텀 근사</strong> 방식으로 경기 국면을 판단합니다.
          실제 거시경제 지표(ISM PMI, LEI) 대신 시장 가격 데이터만 사용합니다.
        </p>
        <ul style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.8, margin: "8px 0 0", paddingLeft: 20 }}>
          <li><strong>주식 모멘텀</strong>: SPY 6개월 수익률 (양수 = 주식시장 상승 추세)</li>
          <li><strong>금리 방향</strong>: IEF(중기채) / SHY(단기채) 비율의 6개월 변화 (비율 상승 = 금리 하락, 장기채 강세)</li>
          <li>두 신호의 조합으로 4국면 중 하나를 결정하고, 해당 국면의 강세 섹터에 균등 배분</li>
        </ul>
      </div>

      <BacktestSection backtest={backtest} />

      <HistorySection history={history} />

      <ColumnWarningCard>
        경기순환 섹터 로테이션 전략은 개인 학습·참고용입니다. 투자 판단의 책임은 본인에게 있습니다.
        이 페이지는 Sam Stovall의 "S&P's Guide to Sector Investing"에 기반한 모멘텀 근사 구현이며, 과거 성과가 미래 수익을 보장하지 않습니다.
      </ColumnWarningCard>
    </div>
  );
}
