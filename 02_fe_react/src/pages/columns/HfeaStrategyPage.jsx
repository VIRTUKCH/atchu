import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnAllocationBar,
  ColumnCompareRow,
  ColumnWarningCard,
  ColumnBackLink,
} from "../../components/column";

const ALLOCATION = [
  { label: "UPRO (S&P500 3배)", pct: 55, color: "#3b82f6" },
  { label: "TMF (장기채 3배)", pct: 45, color: "#10b981" },
];

export default function HfeaStrategyPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="레버리지"
        title="HFEA 전략 완전 해부: UPRO 55% + TMF 45%"
        desc="인터넷 커뮤니티에서 유명해진 레버리지 포트폴리오 전략의 장단점 분석."
      />

      <ColumnCallout label="HFEA 전략이란?">
        Hedgefundie's Excellent Adventure의 약자입니다.
        2019년 보글헤드 포럼에서 한 개인 투자자가 제안한 전략으로,
        레버리지 ETF 두 가지를 55:45로 보유하고 분기마다 리밸런싱합니다.
        백테스트에서 압도적인 성과를 보여 온라인 투자 커뮤니티에서 폭발적인 인기를 얻었습니다.
      </ColumnCallout>

      <ColumnAllocationBar items={ALLOCATION} />

      <ColumnCompareRow
        left={{ label: "HFEA (1987~2020)", value: "연 17~20%", sub: "백테스트 기준, 리밸런싱 주기에 따라 상이", variant: "good" }}
        right={{ label: "SPY 단순 보유", value: "연 10%", sub: "같은 기간 S&P500", variant: "good" }}
      />

      <ColumnCallout label="왜 주식+채권을 함께 보유하는가">
        전통적으로 주식과 장기채는 음의 상관관계를 보입니다.
        경기 침체 시 주식이 하락하면 채권 가격이 상승하고(금리 하락),
        이 반대 움직임이 포트폴리오를 안정시킵니다.
        레버리지를 사용하더라도 자산 간 상관관계로 리스크를 분산합니다.
      </ColumnCallout>

      <ColumnWarningCard>
        <strong>HFEA의 실제 위험 — 2022년 사례:</strong><br /><br />
        2022년 금리 급등기에 UPRO와 TMF가 동시에 폭락했습니다.<br />
        UPRO: -68%, TMF: -79%. HFEA 포트폴리오는 -70% 이상 손실.<br /><br />
        주식-채권 음의 상관관계는 인플레이션+금리 급등 환경에서 붕괴됩니다.
        역사적으로 항상 통하지 않으며, 2022년이 그 예외 케이스였습니다.<br /><br />
        레버리지 전략에는 반드시 추세 신호 기반 리스크 관리가 필요합니다.
      </ColumnWarningCard>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
