import React from "react";
import "../styles/column.css";
import { qvmSignalPayload } from "../utils/qvmDataLoaders";
import { ColumnKeyFact, ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import QvmEquityCurveChart from "../components/qvm/QvmEquityCurveChart";

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
    if (returns[p.key] == null) {
      return { value: "—", label: p.label, desc: "데이터 부족" };
    }
    const num = parseFloat(returns[p.key]);
    return {
      value: `${num >= 0 ? "+" : ""}${returns[p.key]}%`,
      label: p.label,
      desc: "USD 기준",
    };
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

function PerformanceSection({ performance, equityCurve }) {
  if (!performance) return null;
  const qvml = performance.qvml;
  const spy = performance.spy;
  const stats = [
    { value: qvml?.cagr != null ? `${qvml.cagr}%` : "—", label: "QVML CAGR", desc: "연평균 수익률" },
    { value: qvml?.mdd != null ? `${qvml.mdd}%` : "—", label: "QVML MDD", desc: "최대 낙폭" },
    { value: qvml?.sharpe != null ? `${qvml.sharpe}` : "—", label: "샤프비율", desc: "위험조정 수익" },
    { value: qvml?.totalReturn != null ? `${qvml.totalReturn}%` : "—", label: "누적 수익률", desc: "출시 이후" },
  ];
  const compareRows = [
    ["QVML", qvml?.cagr != null ? `${qvml.cagr}%` : "—", qvml?.mdd != null ? `${qvml.mdd}%` : "—", qvml?.sharpe ?? "—", qvml?.totalReturn != null ? `${qvml.totalReturn}%` : "—"],
    ["SPY B&H", spy?.cagr != null ? `${spy.cagr}%` : "—", spy?.mdd != null ? `${spy.mdd}%` : "—", spy?.sharpe ?? "—", spy?.totalReturn != null ? `${spy.totalReturn}%` : "—"],
  ];
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
      <QvmEquityCurveChart equityCurve={equityCurve} />
    </div>
  );
}

export default function QvmPage() {
  const hasData = qvmSignalPayload != null;
  const strategy = hasData ? qvmSignalPayload.strategy : null;
  const factorDefs = hasData ? qvmSignalPayload.factorDefinitions : null;
  const performance = hasData ? qvmSignalPayload.performance : null;
  const equityCurve = hasData ? qvmSignalPayload.equityCurve : null;
  const latestClose = hasData ? qvmSignalPayload.latestClose : null;
  const dataMonths = hasData ? qvmSignalPayload.dataMonths : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">&larr; 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        멀티팩터 QVM
      </h2>

      {/* [1] 기간별 수익률 */}
      {hasData && <ReturnsSection equityCurve={equityCurve} curveKey="qvml" />}

      {/* 데이터 없을 때 안내 */}
      {!hasData && (
        <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>
            QVM 멀티팩터 데이터가 아직 생성되지 않았습니다.<br />
            파이프라인을 실행하면 자동으로 생성됩니다.
          </p>
        </div>
      )}

      {/* [2] QVML ETF 정보 */}
      {strategy && (
        <div className="panel-card" style={{ padding: "20px" }}>
          <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
            QVML ETF
          </h3>
          {latestClose && (
            <div style={{ marginBottom: 12, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
              QVML ${latestClose.price} | 월수익률 {latestClose.monthReturn >= 0 ? "+" : ""}{latestClose.monthReturn}% | {latestClose.date}
              {dataMonths != null && ` | 데이터 ${dataMonths}개월`}
            </div>
          )}
          <ColumnKeyFactGrid>
            <ColumnKeyFact value="Invesco" label="운용사" desc="S&P 500 QVM Multi-Factor Index 추종" />
            <ColumnKeyFact value="0.11%" label="보수" desc="연간 운용 비용" />
            <ColumnKeyFact value="~450종목" label="보유 종목" desc="S&P 500 상위 90%" />
            <ColumnKeyFact value="분기 1회" label="리밸런싱" desc="3/6/9/12월" />
          </ColumnKeyFactGrid>
        </div>
      )}

      {/* [3] 왜 멀티팩터인가 */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          왜 멀티팩터인가
        </h3>

        <h4 style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", marginBottom: 12, color: "var(--ink)" }}>1. 단일 팩터의 한계</h4>
        <ColumnCallout>
          Value 팩터는 2017-2023년 "팩터의 겨울"을 겪었고, Momentum은 급반전(crash)에 취약하다. 어떤 팩터든 혼자서는 10년 이상 부진할 수 있다. 하나에 몰빵하면 인내심이 바닥나는 시기가 반드시 온다.
        </ColumnCallout>

        <h4 style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", marginTop: 20, marginBottom: 12, color: "var(--ink)" }}>2. 해법: 다른 시기에 작동하는 팩터를 결합</h4>
        <ColumnCallout>
          Quality는 침체기에 강하고, Value는 경기 회복기에, Momentum은 추세 구간에서 빛난다. 세 팩터를 결합하면 한 팩터의 부진을 다른 팩터가 보완한다.
        </ColumnCallout>

        <h4 style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", marginTop: 20, marginBottom: 12, color: "var(--ink)" }}>3. AQR의 핵심 교훈 — "섞지 말고 통합하라"</h4>
        <ColumnCallout>
          QUAL+VLUE+MTUM ETF를 각각 사서 섞는 것보다, 개별 종목 수준에서 Q+V+M 점수를 통합 계산해 선별하는 것이 더 효과적이다. "좋으면서 싸면서 오르는" 종목을 직접 찾는 것이 핵심이다. QVML이 바로 이 방식이다.
        </ColumnCallout>
      </div>

      {/* [4] 3가지 팩터 정의 */}
      {factorDefs && (
        <div className="panel-card" style={{ padding: "20px" }}>
          <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
            S&P QVM 스코어링 방법론
          </h3>
          <ColumnCallout style={{ marginBottom: 16 }}>
            Multi-Factor Score = (Quality z + Value z + Momentum z) &divide; 3 &rarr; 상위 90% 선별 &rarr; 시총 &times; 점수 가중
          </ColumnCallout>
          <ColumnKeyFactGrid>
            <ColumnKeyFact
              value="Quality"
              label="좋은 회사"
              desc="ROE, Accruals(역), Leverage(역) — 높은 수익성 + 낮은 부채"
            />
            <ColumnKeyFact
              value="Value"
              label="싼 회사"
              desc="B/P, E/P, S/P — 장부가·이익·매출 대비 저평가"
            />
            <ColumnKeyFact
              value="Momentum"
              label="오르는 회사"
              desc="12-1개월 위험조정 수익률 — 최근 상승 추세"
            />
          </ColumnKeyFactGrid>
          <div style={{ marginTop: 16 }}>
            <ColumnCompareTable
              columns={["팩터", "측정 지표", "강세 시기"]}
              rows={[
                ["Quality", "ROE, 저부채, 낮은 Accruals", "침체기·불확실성 구간"],
                ["Value", "B/P, E/P, S/P (저평가)", "경기 회복기·금리 상승기"],
                ["Momentum", "12-1M 위험조정 수익률", "추세 지속 구간"],
              ]}
            />
          </div>
        </div>
      )}

      {/* [5] 성과 — 데이터가 있을 때만 */}
      {hasData && <PerformanceSection performance={performance} equityCurve={equityCurve} />}

      {/* [6] 구현의 한계 — 롱온리 ETF */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          멀티팩터 ETF의 현실
        </h3>
        <ColumnCallout>
          AQR의 롱숏 펀드(QMNIX)는 2024년 사상 최고 수익을 기록했지만, 같은 팩터를 쓰는 롱온리 ETF 10개 중 초과수익을 낸 건 단 1개(OMFL)뿐이었다. 숏(하위 종목 매도)이 없으면 팩터 프리미엄의 절반을 놓친다.
        </ColumnCallout>
        <div style={{ marginTop: 16 }}>
          <ColumnCompareTable
            columns={["", "롱숏 (기관)", "롱온리 ETF (개인)"]}
            rows={[
              ["팩터 노출", "높음 (상위 매수 + 하위 매도)", "낮음 (상위만 매수, 베타 ~0.9)"],
              ["초과수익", "2024 QMNIX 사상 최고", "10개 중 1개만 성공"],
              ["접근성", "적격투자자, 수수료 높음", "누구나, 보수 0.1%대"],
              ["역할", "진정한 팩터 프리미엄 추출", "시장 대비 약간의 틸트"],
            ]}
          />
        </div>
      </div>

      {/* [7] 한계점 */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          한계점
        </h3>
        <ColumnKeyFactGrid>
          <ColumnKeyFact value="롱온리 한계" label="숏 없음" desc="팩터 프리미엄의 절반(하위 종목 매도)을 포기한 구조" />
          <ColumnKeyFact value="팩터 크라우딩" label="인기 = 위험" desc="같은 팩터에 자금 집중 시 밸류에이션 왜곡 가능" />
          <ColumnKeyFact value="데이터 짧음" label="2021.06~ 출시" desc="약 4.5년 실적만 존재, 장기 검증 부족" />
          <ColumnKeyFact value="레짐 의존" label="환경 변화" desc="Value 10년 부진, Momentum crash 등 특정 환경에서 약세 가능" />
        </ColumnKeyFactGrid>
      </div>

      {/* [8] 면책 조항 */}
      <ColumnWarningCard>
        이 페이지는 S&P 500 QVM Multi-Factor 전략을 학습·참고용으로 정리한 것입니다.
        투자 판단의 책임은 본인에게 있으며, 과거 성과가 미래 수익을 보장하지 않습니다.
        QVML ETF는 2021년 6월 출시로 실적 데이터가 제한적입니다.
      </ColumnWarningCard>
    </div>
  );
}
