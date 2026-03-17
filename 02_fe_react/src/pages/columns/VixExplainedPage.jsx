import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "20 이하", label: "정상 시장", desc: "시장 안정기, 장기 평균 수준의 수익" },
  { value: "20~30", label: "불안 구간", desc: "변동성 확대, 경계 필요" },
  { value: "30 이상", label: "공포 구간", desc: "과거 데이터에서 이후 12개월 수익률이 높은 경향" },
];

export default function VixExplainedPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title="공포지수(VIX)가 80을 넘을 때 무슨 일이 생기나"
        desc="역사적 VIX 스파이크와 이후 12개월 수익률 데이터."
      />

      <ColumnCallout label="VIX란 무엇인가">
        VIX는 S&P500 옵션 가격에서 추출한 향후 30일 시장 변동성 예측치입니다.
        CBOE(시카고 옵션거래소)가 산출하며, 투자자들이 얼마나 불안해하는지를 보여줍니다.
        높을수록 공포가 크고, 낮을수록 시장이 안정적임을 의미합니다.
        일명 '공포지수'라고 불립니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnTimeline>
        <ColumnTimelineItem year="2008.11" title="VIX 80.86 (종가 기준) — 금융위기">
          리먼 파산 2개월 후. 역사상 최고 수준. 이후 12개월 S&P500 +53%.
          극단적 공포가 극단적 매수 기회였음을 사후에 확인.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2010.05" title="VIX 45 — 유럽 재정위기">
          그리스 부채 위기로 VIX 급등. 이후 12개월 S&P500 +30%.
          유럽 위기가 미국 주식의 매수 기회로 작용.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2020.03" title="VIX 82.69 — 코로나 폭락">
          역사상 두 번째 최고치. 이후 12개월 S&P500 +75%.
          가장 짧은 공포, 가장 빠른 회복의 패턴.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2022.10" title="VIX 34 — 금리 인상 공포">
          인플레이션 + 금리 인상 공포. 이후 12개월 S&P500 +24%.
          VIX 30 이상에서 매수는 역사적으로 유리한 전략.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnCallout label="VIX 고점 = 매도 타이밍이 아니다">
        직관과 반대로, VIX가 높을 때 팔면 최악의 결정이 되는 경우가 많습니다.
        VIX 30 이상 구간 이후의 12개월 수익률은 과거 데이터에서 평균보다 높은 경향을 보였습니다.
        <strong>과거 사례를 보면, 극단적 공포 시기가 장기적으로 유리한 진입 시점이 되는 경우가 많았습니다.</strong>
      </ColumnCallout>

      <ColumnMythFact
        myth="VIX가 높으면 위험하므로 주식을 팔아야 한다"
        fact="과거 데이터에서 VIX 고점은 단기 바닥과 일치하는 경우가 많았습니다. VIX 30 이상 구간 이후의 12개월 수익률은 평균보다 높은 경향을 보였습니다. 다만 과거 패턴이 항상 반복된다는 보장은 없습니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
