import React from "react";
import "../styles/column.css";
import { faberSignalPayload } from "../utils/faberDataLoaders";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnTimeline, ColumnTimelineItem } from "../components/column/ColumnTimeline";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import { ColumnAllocationBar } from "../components/column/ColumnAllocationBar";
import FaberEquityCurveChart from "../components/faber/FaberEquityCurveChart";

const ALLOC_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899"];

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
  const returns = calcPeriodReturns(equityCurve, "faberSector");
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

function SignalSection({ signal }) {
  if (!signal) return null;
  const { mode, rebalanceDate, spyClose, spySma10m, spyAboveSma } = signal;
  const isInvested = mode === "invested";
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        트렌드 필터
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span
          className={`quant-signal-badge quant-signal-badge--${isInvested ? "offensive" : "defensive"}`}
        >
          {isInvested ? "투자" : "현금 대피"}
        </span>
        {rebalanceDate && (
          <span style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
            {rebalanceDate.slice(0, 7)} 월말 기준
          </span>
        )}
      </div>
      <ColumnCallout>
        SPY 종가 <strong>{spyClose}</strong>{" "}
        {spyAboveSma ? ">" : "<"}{" "}
        10개월 SMA <strong>{spySma10m}</strong>{" "}
        → {isInvested ? "SMA 위 — 상위 3 섹터 투자" : "SMA 아래 — 전 포지션 청산, 현금 대피"}
      </ColumnCallout>
    </div>
  );
}

function PortfolioSection({ portfolio }) {
  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          이번 달 포트폴리오
        </h3>
        <ColumnCallout>현금 대피 중 — 투자 없음</ColumnCallout>
      </div>
    );
  }

  const items = portfolio.map((a, i) => ({
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
          columns={["티커", "섹터", "비중", "3M ROC"]}
          rows={portfolio.map((a) => [
            { value: a.ticker, highlight: true },
            a.nameKo,
            `${a.weight}%`,
            `${a.roc3m >= 0 ? "+" : ""}${a.roc3m}%`,
          ])}
        />
      </div>
    </div>
  );
}

function SectorRankingSection({ sectors }) {
  if (!sectors || sectors.length === 0) return null;
  const rows = sectors.map((s) => {
    const ticker = s.selected ? { value: s.ticker, highlight: true } : s.ticker;
    return [
      String(s.rank), ticker, s.nameKo,
      `${s.roc3m >= 0 ? "+" : ""}${s.roc3m}%`,
      s.selected ? "✓" : "",
    ];
  });
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        섹터 모멘텀 순위 (3M ROC)
      </h3>
      <ColumnCompareTable columns={["순위", "티커", "섹터", "3M ROC", "선택"]} rows={rows} />
    </div>
  );
}

function BacktestSection({ backtest }) {
  if (!backtest) return null;
  const f = backtest.faberSector;
  const spy = backtest.benchmarkSpy;
  const sf = backtest.benchmark6040;
  const stats = [
    { value: `${f?.cagr ?? "—"}%`, label: "Faber CAGR", desc: "연평균 수익률" },
    { value: `${f?.mdd ?? "—"}%`, label: "Faber MDD", desc: "최대 낙폭" },
    { value: `${f?.sharpe ?? "—"}`, label: "샤프비율", desc: "위험조정 수익" },
    { value: `${backtest.cashRatio != null ? Math.round(backtest.cashRatio * 100) : "—"}%`, label: "현금 비율", desc: "현금 대피 기간" },
  ];
  const compareRows = [
    ["Faber 섹터", `${f?.cagr ?? "—"}%`, `${f?.mdd ?? "—"}%`, `${f?.sharpe ?? "—"}`],
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
      </div>
      <FaberEquityCurveChart equityCurve={backtest.equityCurve} />
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
          const modeLabel = h.mode === "invested" ? "투자" : "현금";
          const allocs = h.mode === "invested"
            ? (h.portfolio || []).map((a) => `${a.ticker} ${a.weight}%`).join(" + ")
            : "현금 대피";
          const smaInfo = `SPY ${h.spyClose} ${h.mode === "invested" ? ">" : "<"} SMA ${h.spySma10m}`;
          return (
            <ColumnTimelineItem key={h.date} year={h.date?.slice(0, 7)} title={modeLabel}>
              {allocs}
              <br />
              <span style={{ fontSize: "clamp(13px, calc(11px + 0.5vw), 15px)", color: "var(--muted)" }}>{smaInfo}</span>
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

export default function FaberSectorPage() {
  if (!faberSignalPayload) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">Faber 섹터 모멘텀</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          Faber 신호 데이터가 아직 생성되지 않았습니다.<br />
          파이프라인을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const { signal, sectors, portfolio, backtest, history } = faberSignalPayload;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">← 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        Faber 섹터 모멘텀
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", margin: 0 }}>
        10개 섹터 중 3개월 수익률 상위 3 투자 + SPY 10개월 SMA 트렌드 필터 — Meb Faber
      </p>

      <ReturnsSection equityCurve={backtest?.equityCurve} />

      <SignalSection signal={signal} />

      <PortfolioSection portfolio={portfolio} />

      <SectorRankingSection sectors={sectors} />

      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          유니버스 구성
        </h3>
        <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.6, margin: 0 }}>
          Faber 원 논문은 특정 ETF가 아닌 <strong>French-Fama 10 Industry Portfolios</strong> (1926~2009 학술 데이터)를 사용합니다.
          이를 실제 투자 가능한 ETF로 매핑할 때, <strong>XLC(통신서비스, 2018~)는 제외</strong>했습니다.
        </p>
        <ul style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.8, margin: "8px 0 0", paddingLeft: 20 }}>
          <li>XLC는 2018년 GICS 재분류 때 신설 — Meta·Alphabet 등을 흡수한 현대 섹터로, 논문의 "Telecommunications"(옛 통신사)과 성격이 다름</li>
          <li>XLC 포함 시 데이터가 7년뿐이지만, 제외하면 <strong>20년+ 백테스트</strong> 가능 (2008 금융위기 포함)</li>
          <li>부동산은 XLRE(2015~) 대신 <strong>VNQ(2004~)</strong> 사용 — 동일 섹터, 더 긴 데이터</li>
        </ul>
      </div>

      <BacktestSection backtest={backtest} />

      <HistorySection history={history} />

      <ColumnWarningCard>
        Faber 섹터 모멘텀 전략은 개인 학습·참고용입니다. 투자 판단의 책임은 본인에게 있습니다.
        이 페이지는 Meb Faber의 논문 "Relative Strength Strategies for Investing"(2010)을 기반으로 구현했으며, 과거 성과가 미래 수익을 보장하지 않습니다.
      </ColumnWarningCard>
    </div>
  );
}
