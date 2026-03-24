import React from "react";
import "../styles/column.css";
import { qvmDiySignalPayload } from "../utils/qvmDiyDataLoaders";
import { ColumnKeyFact, ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import QvmDiyEquityCurveChart from "../components/qvm/QvmDiyEquityCurveChart";

const VARIANT_CONFIG = {
  qvmEw: {
    label: "QVM-EW (균등 배분)",
    short: "QVM-EW",
    curveKey: "qvmEw",
    description: "QUAL + VLUE + MTUM 각 33.3% 균등 배분, 월 리밸런싱",
  },
  qvmMom: {
    label: "QVM-MOM (모멘텀 로테이션)",
    short: "QVM-MOM",
    curveKey: "qvmMom",
    description: "12-1개월 모멘텀 순위 기반 50/30/20 배분 + 10개월 SMA 필터, 월 리밸런싱",
  },
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

function ReturnsSection({ equityCurve, curveKey }) {
  const returns = calcPeriodReturns(equityCurve, curveKey);
  if (!returns) return null;
  const periods = [
    { key: "1M", label: "1개월" },
    { key: "3M", label: "3개월" },
    { key: "6M", label: "6개월" },
    { key: "1Y", label: "1년" },
    { key: "3Y", label: "3년" },
    { key: "5Y", label: "5년" },
  ];
  const stats = periods.map((p) => {
    if (returns[p.key] == null) return { value: "—", label: p.label, desc: "데이터 부족" };
    const num = parseFloat(returns[p.key]);
    return { value: `${num >= 0 ? "+" : ""}${returns[p.key]}%`, label: p.label, desc: "USD 기준" };
  });
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        기간별 수익률
      </h3>
      <ColumnStatGrid stats={stats} />
    </div>
  );
}

function PortfolioSection({ portfolios, signal, variant }) {
  const vc = VARIANT_CONFIG[variant];
  const portfolio = portfolios?.[vc.curveKey];
  if (!portfolio) return null;

  const allocations = portfolio.allocations || [];
  const dateLabel = signal?.rebalanceDate ? signal.rebalanceDate.slice(0, 7) + " 월말 기준" : "";

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        현재 포트폴리오
      </h3>
      {dateLabel && (
        <div style={{ marginBottom: 12, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
          {dateLabel}
          {portfolio.bilWeight > 0 && ` | BIL ${portfolio.bilWeight}%`}
        </div>
      )}
      <ColumnCompareTable
        columns={["ETF", "한글명", "비중", ...(variant === "qvmMom" ? ["추세 필터"] : [])]}
        rows={allocations.map((a) => [
          a.ticker,
          a.nameKo,
          `${a.weight}%`,
          ...(variant === "qvmMom" ? [a.aboveSma === false ? "SMA 아래 → BIL" : "통과"] : []),
        ])}
      />
    </div>
  );
}

function MomRankingSection({ signal }) {
  const ranking = signal?.momRanking;
  if (!ranking || ranking.length === 0) return null;

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        모멘텀 랭킹 (12-1개월 수익률)
      </h3>
      <ColumnCompareTable
        columns={["순위", "ETF", "한글명", "12-1M 수익률", "10M SMA"]}
        rows={ranking.map((r) => [
          `${r.rank}위`,
          r.ticker,
          r.nameKo,
          r.return12m1 != null ? `${r.return12m1 >= 0 ? "+" : ""}${r.return12m1}%` : "—",
          r.aboveSma ? "위" : "아래 → BIL",
        ])}
      />
    </div>
  );
}

function PerformanceSection({ backtest, variant }) {
  if (!backtest) return null;
  const vc = VARIANT_CONFIG[variant];
  const perf = backtest[vc.curveKey];
  const spy = backtest.spy;

  const stats = [
    { value: perf?.cagr != null ? `${perf.cagr}%` : "—", label: `${vc.short} CAGR`, desc: "연평균 수익률" },
    { value: perf?.mdd != null ? `${perf.mdd}%` : "—", label: `${vc.short} MDD`, desc: "최대 낙폭" },
    { value: perf?.sharpe != null ? `${perf.sharpe}` : "—", label: "샤프비율", desc: "위험조정 수익" },
    { value: perf?.totalReturn != null ? `${perf.totalReturn}%` : "—", label: "누적 수익률", desc: `${backtest.startDate}~` },
  ];

  const compareRows = [
    [vc.short, perf?.cagr != null ? `${perf.cagr}%` : "—", perf?.mdd != null ? `${perf.mdd}%` : "—", perf?.sharpe ?? "—", perf?.totalReturn != null ? `${perf.totalReturn}%` : "—"],
    ["SPY B&H", spy?.cagr != null ? `${spy.cagr}%` : "—", spy?.mdd != null ? `${spy.mdd}%` : "—", spy?.sharpe ?? "—", spy?.totalReturn != null ? `${spy.totalReturn}%` : "—"],
  ];

  // 다른 변형도 있으면 비교에 추가
  const otherKey = variant === "qvmEw" ? "qvmMom" : "qvmEw";
  const otherPerf = backtest[otherKey];
  const otherLabel = variant === "qvmEw" ? "QVM-MOM" : "QVM-EW";
  if (otherPerf) {
    compareRows.splice(1, 0, [
      otherLabel,
      otherPerf.cagr != null ? `${otherPerf.cagr}%` : "—",
      otherPerf.mdd != null ? `${otherPerf.mdd}%` : "—",
      otherPerf.sharpe ?? "—",
      otherPerf.totalReturn != null ? `${otherPerf.totalReturn}%` : "—",
    ]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          성과 요약
        </h3>
        <ColumnStatGrid stats={stats} />
        <div style={{ marginTop: 16 }}>
          <ColumnCompareTable columns={["전략", "CAGR", "MDD", "샤프", "누적 수익률"]} rows={compareRows} />
        </div>
      </div>
      <QvmDiyEquityCurveChart equityCurve={backtest.equityCurve} variant={vc.curveKey} />
    </div>
  );
}

export default function QvmDiyPage({ variant = "qvmEw" }) {
  const vc = VARIANT_CONFIG[variant] || VARIANT_CONFIG.qvmEw;
  const hasData = qvmDiySignalPayload != null && qvmDiySignalPayload.backtest?.equityCurve?.length > 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">&larr; 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        {vc.label}
      </h2>

      {/* [1] 기간별 수익률 */}
      {hasData && <ReturnsSection equityCurve={qvmDiySignalPayload.backtest.equityCurve} curveKey={vc.curveKey} />}

      {!hasData && (
        <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>
            QVM DIY 데이터가 아직 생성되지 않았습니다.<br />
            파이프라인을 실행하면 자동으로 생성됩니다.
          </p>
        </div>
      )}

      {/* [2] 현재 포트폴리오 */}
      {hasData && (
        <PortfolioSection
          portfolios={qvmDiySignalPayload.portfolios}
          signal={qvmDiySignalPayload.signal}
          variant={variant}
        />
      )}

      {/* [3] QVM-MOM만: 모멘텀 랭킹 */}
      {hasData && variant === "qvmMom" && (
        <MomRankingSection signal={qvmDiySignalPayload.signal} />
      )}

      {/* [4] 전략 설명 */}
      {variant === "qvmEw" ? (
        <div className="panel-card" style={{ padding: "20px" }}>
          <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
            왜 균등 배분인가
          </h3>
          <ColumnCallout>
            어떤 팩터가 앞으로 잘 될지 모른다면, 가장 합리적인 선택은 균등하게 나누는 것이다. Quality, Value, Momentum 각각 33.3%씩 배분하고 매월 리밸런싱한다.
          </ColumnCallout>
          <ColumnCallout style={{ marginTop: 12 }}>
            필터 없이 항상 100% 투자 상태를 유지한다. 단순하지만, 팩터 간 상호 보완 효과를 자연스럽게 얻을 수 있다. 시장 타이밍 판단이 필요 없다는 것이 최대 장점이다.
          </ColumnCallout>
        </div>
      ) : (
        <div className="panel-card" style={{ padding: "20px" }}>
          <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
            왜 모멘텀 로테이션 + 추세 필터인가
          </h3>
          <ColumnCallout>
            최근 12개월간 가장 강한 팩터에 50%, 2위에 30%, 3위에 20%를 배분한다. "잘 나가는 팩터에 더 실어주는" 적극 전략이다. 최근 1개월은 제외하여 단기 반전 노이즈를 걸러낸다.
          </ColumnCallout>
          <ColumnCallout style={{ marginTop: 12 }}>
            추가로 각 ETF의 10개월 이동평균(SMA)을 확인한다. 월말 종가가 10개월 SMA 아래면 해당 ETF를 사지 않고 BIL(단기 국채)로 대체한다. 하락장에서 자동으로 현금 비중이 올라가는 방어 메커니즘이다.
          </ColumnCallout>
          <div style={{ marginTop: 16 }}>
            <ColumnKeyFactGrid>
              <ColumnKeyFact value="상대 모멘텀" label="12-1M 수익률 순위" desc="잘 나가는 팩터에 집중 배분" />
              <ColumnKeyFact value="절대 모멘텀" label="10개월 SMA 필터" desc="추세 이탈 시 BIL로 방어" />
              <ColumnKeyFact value="50/30/20" label="순위별 가중" desc="1위 50% → 2위 30% → 3위 20%" />
            </ColumnKeyFactGrid>
          </div>
        </div>
      )}

      {/* [5] 성과 요약 + 차트 */}
      {hasData && <PerformanceSection backtest={qvmDiySignalPayload.backtest} variant={variant} />}

      {/* [6] 한계점 */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          한계점
        </h3>
        <ColumnKeyFactGrid>
          <ColumnKeyFact value="롱온리 한계" label="숏 없음" desc="팩터 프리미엄의 절반(하위 종목 매도)을 포기한 구조" />
          <ColumnKeyFact value="ETF 혼합 ≠ 통합" label="AQR 교훈" desc="ETF를 섞는 것은 종목 수준에서 통합하는 것보다 효과가 낮다" />
          <ColumnKeyFact value="거래 비용" label="월 리밸런싱" desc="실제 매매 시 수수료·스프레드·세금 미반영" />
          {variant === "qvmMom" && (
            <ColumnKeyFact value="과최적화 위험" label="파라미터 선택" desc="50/30/20 비중, 10M SMA 등 백테스트 최적화에 주의" />
          )}
        </ColumnKeyFactGrid>
      </div>

      {/* [7] 면책 */}
      <ColumnWarningCard>
        이 페이지는 QVM 멀티팩터 DIY 전략을 학습·참고용으로 정리한 것입니다.
        투자 판단의 책임은 본인에게 있으며, 과거 성과가 미래 수익을 보장하지 않습니다.
        거래 비용·세금·슬리피지가 반영되지 않은 백테스트 결과입니다.
      </ColumnWarningCard>
    </div>
  );
}
