import React from "react";
import "../styles/column.css";
import { baaSignalPayload } from "../utils/baaDataLoaders";
import BaaSignalBadge from "../components/baa/BaaSignalBadge";
import BaaPortfolioTab from "../components/baa/BaaPortfolioTab";
import { ColumnKeyFact, ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnTimeline, ColumnTimelineItem } from "../components/column/ColumnTimeline";
import BaaEquityCurveChart from "../components/baa/BaaEquityCurveChart";

function CanarySection({ canary, mode }) {
  if (!canary || canary.length === 0) return null;
  const positive = canary.filter((c) => c.momentum13612w > 0).length;
  const negativeNames = canary.filter((c) => c.momentum13612w <= 0).map((c) => c.ticker);

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        카나리아 모멘텀
      </h3>
      <ColumnCallout>
        {mode === "offensive"
          ? "전원 양(+) → 공격 모드"
          : `${negativeNames.join(", ")} 음(−) → 방어 모드`}
      </ColumnCallout>
      <div style={{ marginTop: 16 }}>
        <ColumnKeyFactGrid>
          {canary.map((c) => (
            <ColumnKeyFact
              key={c.ticker}
              value={`${c.momentum13612w > 0 ? "+" : ""}${c.momentum13612w.toFixed(2)}%`}
              variant={c.momentum13612w > 0 ? "positive" : "negative"}
              label={`${c.ticker} · ${c.nameKo}`}
              desc="13612W 모멘텀"
            />
          ))}
        </ColumnKeyFactGrid>
      </div>
    </div>
  );
}

function RankingSection({ offensiveRanking, defensiveRanking }) {
  const offensiveRows = (offensiveRanking || []).map((r, i) => {
    const selected = r.selectedG4 && r.selectedG12 ? "A·B"
      : r.selectedG4 ? "A"
      : r.selectedG12 ? "B"
      : "";
    const ticker = (r.selectedG4 || r.selectedG12)
      ? { value: r.ticker, highlight: true }
      : r.ticker;
    return [
      String(i + 1),
      ticker,
      r.nameKo || "",
      `${r.momentum13612w > 0 ? "+" : ""}${r.momentum13612w.toFixed(2)}%`,
      r.relMomentum.toFixed(3),
      selected
    ];
  });

  const bilRelMomentum = (defensiveRanking || []).find((r) => r.ticker === "BIL")?.relMomentum ?? 0;
  const defensiveRows = (defensiveRanking || []).map((r, i) => {
    const ticker = r.selected ? { value: r.ticker, highlight: true } : r.ticker;
    const relMom = r.relMomentum < bilRelMomentum && r.ticker !== "BIL"
      ? { value: r.relMomentum.toFixed(3), bad: true }
      : r.relMomentum.toFixed(3);
    return [
      String(i + 1),
      ticker,
      r.nameKo || "",
      relMom,
      r.selected ? "✓" : "",
      r.replacedByBil ? "→ BIL" : ""
    ];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          공격 유니버스 (G12) 모멘텀 순위
        </h3>
        <ColumnCompareTable
          columns={["순위", "티커", "이름", "13612W", "상대 모멘텀", "선택"]}
          rows={offensiveRows}
        />
      </div>

      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          방어 유니버스 모멘텀 순위
        </h3>
        <ColumnCompareTable
          columns={["순위", "티커", "이름", "상대 모멘텀", "선택", "BIL 대체"]}
          rows={defensiveRows}
        />
      </div>
    </div>
  );
}

function BacktestSection({ backtest }) {
  if (!backtest) return null;
  const { aggressive: a, balanced: b, benchmarkSpy: spy, benchmark6040: sf, defensiveRatio } = backtest;

  const stats = [
    { value: `${a?.cagr ?? "—"}%`, label: "BAA-A CAGR", desc: "Aggressive 연평균" },
    { value: `${b?.cagr ?? "—"}%`, label: "BAA-B CAGR", desc: "Balanced 연평균" },
    { value: `${a?.mdd ?? "—"}%`, label: "BAA-A MDD", desc: "최대 낙폭" },
    { value: `${defensiveRatio != null ? Math.round(defensiveRatio * 100) : "—"}%`, label: "방어 비율", desc: "방어 모드 기간" }
  ];

  const compareRows = [
    ["BAA Aggressive", `${a?.cagr ?? "—"}%`, `${a?.mdd ?? "—"}%`, `${a?.sharpe ?? "—"}`, `${a?.maxAnnualLoss ?? "—"}%`],
    ["BAA Balanced", `${b?.cagr ?? "—"}%`, `${b?.mdd ?? "—"}%`, `${b?.sharpe ?? "—"}`, `${b?.maxAnnualLoss ?? "—"}%`],
    ["SPY B&H", `${spy?.cagr ?? "—"}%`, `${spy?.mdd ?? "—"}%`, `${spy?.sharpe ?? "—"}`, ""],
    ["60/40 B&H", `${sf?.cagr ?? "—"}%`, `${sf?.mdd ?? "—"}%`, `${sf?.sharpe ?? "—"}`, ""]
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
          <ColumnCompareTable
            columns={["전략", "CAGR", "MDD", "샤프", "최대 연손실"]}
            rows={compareRows}
          />
        </div>
      </div>
      <BaaEquityCurveChart equityCurve={backtest.equityCurve} />
    </div>
  );
}

function HistorySection({ history }) {
  if (!history || history.length === 0) return null;
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? history : history.slice(0, 12);

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        월별 리밸런싱 히스토리
      </h3>
      <ColumnTimeline>
        {visible.map((h) => {
          const modeLabel = h.mode === "offensive" ? "공격" : "방어";
          const allocs = (h.aggressive || []).map((a) => `${a.ticker} ${a.weight}%`).join(" + ");
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
            marginTop: 12,
            padding: "8px 16px",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm, 6px)",
            background: "transparent",
            color: "var(--ink)",
            cursor: "pointer",
            fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)"
          }}
        >
          전체 {history.length}개월 보기
        </button>
      )}
    </div>
  );
}

export default function BaaQuantPeekPage() {
  if (!baaSignalPayload) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">퀀트 엿보기</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          BAA 신호 데이터가 아직 생성되지 않았습니다.<br />
          파이프라인을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const { signal, canary, offensiveRanking, defensiveRanking, portfolios, backtest, history } = baaSignalPayload;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        퀀트 엿보기 — BAA 전략
      </h2>

      <BaaSignalBadge
        mode={signal?.mode}
        rebalanceDate={signal?.rebalanceDate}
        canaryPositiveCount={signal?.canaryPositiveCount}
      />

      <BaaPortfolioTab portfolios={portfolios} />

      <CanarySection canary={canary} mode={signal?.mode} />

      <RankingSection
        offensiveRanking={offensiveRanking}
        defensiveRanking={defensiveRanking}
      />

      <BacktestSection backtest={backtest} />

      <HistorySection history={history} />

      <ColumnWarningCard>
        BAA 전략은 개인 학습·참고용입니다. 투자 판단의 책임은 본인에게 있습니다.
        이 페이지는 Wouter Keller의 논문(2022)을 기반으로 구현했으며, 과거 성과가 미래 수익을 보장하지 않습니다.
      </ColumnWarningCard>
    </div>
  );
}
