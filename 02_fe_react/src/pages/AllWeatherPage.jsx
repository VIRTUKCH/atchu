import React from "react";
import "../styles/column.css";
import { allwSignalPayload } from "../utils/allwDataLoaders";
import { ColumnKeyFact, ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import AllwEquityCurveChart from "../components/allw/AllwEquityCurveChart";

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

function PerformanceSection({ performance, equityCurve }) {
  if (!performance) return null;
  const allw = performance.allw;
  const spy = performance.spy;
  const stats = [
    { value: allw?.cagr != null ? `${allw.cagr}%` : "—", label: "ALLW CAGR", desc: "연평균 수익률" },
    { value: allw?.mdd != null ? `${allw.mdd}%` : "—", label: "ALLW MDD", desc: "최대 낙폭" },
    { value: allw?.sharpe != null ? `${allw.sharpe}` : "—", label: "샤프비율", desc: "위험조정 수익" },
    { value: allw?.totalReturn != null ? `${allw.totalReturn}%` : "—", label: "누적 수익률", desc: "출시 이후" },
  ];
  const compareRows = [
    ["ALLW", allw?.cagr != null ? `${allw.cagr}%` : "—", allw?.mdd != null ? `${allw.mdd}%` : "—", allw?.sharpe ?? "—", allw?.totalReturn != null ? `${allw.totalReturn}%` : "—"],
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
      <AllwEquityCurveChart equityCurve={equityCurve} />
    </div>
  );
}

export default function AllWeatherPage() {
  const hasData = allwSignalPayload != null;
  const allocation = hasData ? allwSignalPayload.allocation : null;
  const performance = hasData ? allwSignalPayload.performance : null;
  const equityCurve = hasData ? allwSignalPayload.equityCurve : null;
  const latestClose = hasData ? allwSignalPayload.latestClose : null;
  const dataMonths = hasData ? allwSignalPayload.dataMonths : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">← 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        리스크 패리티 / All Weather
      </h2>

      {/* [1] 기간별 수익률 */}
      {hasData && <ReturnsSection equityCurve={equityCurve} curveKey="allw" />}

      {/* 데이터 없을 때 안내 */}
      {!hasData && (
        <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>
            All Weather 데이터가 아직 생성되지 않았습니다.<br />
            파이프라인을 실행하면 자동으로 생성됩니다.
          </p>
        </div>
      )}

      {/* [2] 배분 비중 */}
      {allocation && (
        <div className="panel-card" style={{ padding: "20px" }}>
          <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
            Dalio의 All Weather 배분
          </h3>
          {latestClose && (
            <div style={{ marginBottom: 12, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
              ALLW ${latestClose.price} | 월수익률 {latestClose.monthReturn >= 0 ? "+" : ""}{latestClose.monthReturn}% | {latestClose.date}
              {dataMonths != null && ` | 데이터 ${dataMonths}개월`}
            </div>
          )}
          <ColumnCompareTable
            columns={["자산", "ETF", "비중", "역할"]}
            rows={allocation.map((a) => [a.asset, a.etf, `${a.weight}%`, a.role])}
          />
        </div>
      )}

      {/* [3] 왜 리스크 패리티인가 */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          왜 리스크 패리티인가
        </h3>
        <ColumnCallout>
          전통적인 60/40 포트폴리오는 주식 60%, 채권 40%이지만 실제 위험의 90%가 주식에 집중되어 있다. 채권 40%는 사실상 장식에 가깝다.
        </ColumnCallout>
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", marginBottom: 12, color: "var(--ink)" }}>경제 4계절</h4>
          <ColumnKeyFactGrid>
            <ColumnKeyFact value="주식, 원자재" label="성장↑ 인플레↑" desc="경기 호황 + 물가 상승" />
            <ColumnKeyFact value="주식, 채권" label="성장↑ 인플레↓" desc="골디락스 (이상적 환경)" />
            <ColumnKeyFact value="금, TIPS" label="성장↓ 인플레↑" desc="스태그플레이션" />
            <ColumnKeyFact value="명목 채권" label="성장↓ 인플레↓" desc="디플레이션/침체" />
          </ColumnKeyFactGrid>
        </div>
        <ColumnCallout style={{ marginTop: 16 }}>
          "미래를 모른다는 걸 받아들이고, 장기적으로 모든 경제 환경에 균형잡힌 투자를 선택하라." — Ray Dalio
        </ColumnCallout>
      </div>

      {/* [4] 2022년: 채권의 역습 */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          2022년: 채권의 역습
        </h3>
        <ColumnCallout>
          2022년 All Weather는 -22% 손실을 기록했다. 40년 만의 채권 폭락으로 주식-채권 상관관계가 +0.65까지 치솟으며, "분산 투자가 작동하지 않는다"는 비판이 쏟아졌다.
        </ColumnCallout>
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", marginBottom: 12, color: "var(--ink)" }}>Dalio의 반박</h4>
          <ColumnKeyFactGrid>
            <ColumnKeyFact value="설계의 일부" label="상관관계 변화" desc="4계절 프레임워크는 상관관계 변화를 전제로 설계됨" />
            <ColumnKeyFact value="2019년 경고" label="패러다임 전환" desc="인플레 하락 자산에 과도하게 집중된 세계를 이미 경고" />
            <ColumnKeyFact value="위험이 더 낮다" label="분산 레버리지" desc="분산된 레버리지 포트폴리오가 집중된 무레버리지보다 안전" />
            <ColumnKeyFact value="장기 시각" label="한 해로 판단 말라" desc="1973-2024 실질 수익 연 4.6%, -20% 초과 drawdown 단 2번" />
          </ColumnKeyFactGrid>
        </div>
        <div style={{ marginTop: 16 }}>
          <ColumnCompareTable
            columns={["항목", "인정한 것", "반박한 것"]}
            rows={[
              ["2022년 손실", "-22% 손실은 사실", "전략 결함이 아닌 예상 가능한 시나리오"],
              ["명목채권 과다", "DIY 버전의 약점", "Bridgewater 버전은 TIPS+원자재로 보완"],
              ["레버리지 위험", "동시 하락 시 증폭 가능", "분산된 레버리지 > 집중된 무레버리지"],
              ["장기 수익률", "S&P 대비 연 2% 낮음", "변동성 절반, MDD 절반이 보상"],
            ]}
          />
        </div>
      </div>

      {/* [5] ALLW ETF */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          ALLW ETF
        </h3>
        <ColumnCallout>
          2025년 3월, 30년간 기관 투자자 전용($500,000 최소)이던 Bridgewater의 All Weather 전략이 ETF로 최초 공개되었다. 출시 1년 만에 AUM $1B 돌파.
        </ColumnCallout>
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", marginBottom: 12, color: "var(--ink)" }}>ALLW 명목 노출 (레버리지 후, 2025.12 기준)</h4>
          <ColumnKeyFactGrid>
            <ColumnKeyFact value="73.1%" label="명목 국채" desc="미국+해외 국채" />
            <ColumnKeyFact value="36.5%" label="물가연동채 (TIPS)" desc="인플레이션 헤지" />
            <ColumnKeyFact value="43.6%" label="글로벌 주식" desc="미국+해외 주식" />
            <ColumnKeyFact value="34.0%" label="원자재 (금 포함)" desc="실물자산" />
          </ColumnKeyFactGrid>
          <div style={{ marginTop: 8, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
            합계 ~187% — 선물/스왑으로 1.88x 레버리지 사용
          </div>
        </div>
      </div>

      {/* [6] 성과 — 데이터가 있을 때만 표시 */}
      {hasData && <PerformanceSection performance={performance} equityCurve={equityCurve} />}

      {/* [7] 한계점 */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          한계점
        </h3>
        <ColumnKeyFactGrid>
          <ColumnKeyFact value="금리 상승기 약세" label="채권 비중 55%" desc="2022년처럼 금리 급등 시 채권 손실이 포트폴리오를 끌어내림" />
          <ColumnKeyFact value="동시 하락 증폭" label="레버리지 1.88x" desc="주식·채권·원자재 동시 하락 시 레버리지가 손실을 증폭" />
          <ColumnKeyFact value="채권 강세장 의존" label="1980-2020 편향" desc="40년간 금리 하락 추세에서의 성과가 과대평가 가능" />
          <ColumnKeyFact value="기대수익 낮음" label="DIY 버전 한계" desc="레버리지 없는 DIY(30/40/15/7.5/7.5)는 주식 대비 수익 열세" />
        </ColumnKeyFactGrid>
      </div>

      {/* [8] 면책 조항 */}
      <ColumnWarningCard>
        이 페이지는 Ray Dalio의 All Weather 포트폴리오를 학습·참고용으로 정리한 것입니다.
        투자 판단의 책임은 본인에게 있으며, 과거 성과가 미래 수익을 보장하지 않습니다.
        ALLW ETF는 2025년 3월 출시로 실적 데이터가 제한적입니다.
      </ColumnWarningCard>
    </div>
  );
}
