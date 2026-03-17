import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnStepList,
  ColumnStepItem,
  ColumnTipBox,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  { value: "20일", label: "단기 이평선", desc: "단기 추세 및 모멘텀 파악" },
  { value: "60일", label: "중기 이평선", desc: "중기 방향성 및 추세 확인" },
  { value: "200일", label: "장기 이평선", desc: "장기 추세 기준선 (핵심)" },
];

const meta = getFaqMeta("/what_is_moving_average");

export default function WhatIsMovingAveragePage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      <ColumnCallout label="이평선이 하는 일">
        이동평균선은 일정 기간의 주가 평균을 시간 순서로 이은 선입니다.
        매일의 등락을 <strong>평균으로 평탄화</strong>해서 방향을 보여줍니다.
        예측이 아니라 <strong>현재 추세의 방향을 확인</strong>하는 도구입니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>이평선의 3가지 역할</ColumnSectionTitle>

      <ColumnStepList>
        <ColumnStepItem step={1} title="추세 판단">
          가격이 이평선 <strong>위</strong>에 있으면 상승 추세, <strong>아래</strong>에 있으면 하락 추세.
          200일선이 상향이면 황소장(Bull), 하향이면 곰장(Bear)으로 판단하는 기준이 됩니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="지지선·저항선">
          상승 추세에서 이평선은 <strong>지지선</strong> 역할을 합니다. 주가가 이평선 근처로
          내려오면 반등하는 경우가 많습니다. 반대로 하락 추세에서는 <strong>저항선</strong>으로
          작동해 반등이 이평선을 뚫지 못하는 패턴이 나타납니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="매매 신호">
          가격이 이평선을 위로 돌파하면 매수 신호, 아래로 이탈하면 매도 신호로 활용합니다.
          골든 크로스(단기선이 장기선을 위로 교차)와 데드 크로스(반대)가 대표적인 신호입니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnTipBox icon="💡">
        <strong>200일선 위 = 황소장(Bull Market)</strong><br />
        <strong>200일선 아래 = 곰장(Bear Market)</strong><br />
        기관 투자자들이 이 기준으로 리스크 온/오프를 결정합니다. 그래서 200일선이 실제로 작동하는 지지선·저항선이 됩니다.
      </ColumnTipBox>

      <ColumnMythFact
        myth="이평선은 미래를 예측하는 도구다"
        fact="이평선은 과거 데이터의 평균이므로 후행 지표입니다. 미래를 예측하는 게 아니라 현재 추세가 살아있는지 확인하는 필터입니다."
      />

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
