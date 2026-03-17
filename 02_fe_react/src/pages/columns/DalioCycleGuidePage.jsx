import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnPersonCard,
  ColumnCardList,
  ColumnQuote,
  ColumnHighlight,
  ColumnBackLink,
} from "../../components/column";

const PHASES = [
  {
    name: "1단계 — 초기 회복",
    condition: "성장↑ / 물가↓",
    desc: "불황이 끝나고 경기가 살아나기 시작하는 국면입니다. 물가는 아직 낮고, 중앙은행은 금리를 낮게 유지하는 경향이 있습니다.",
    highlight: "달리오는 이 국면에서 주식이 비교적 강하게 반응한다고 봤습니다.",
  },
  {
    name: "2단계 — 확장",
    condition: "성장↑ / 물가↑",
    desc: "경기가 활발하고 기업 실적이 좋아지는 시기입니다. 고용과 소비가 늘어나지만 물가도 함께 오르기 시작합니다.",
    highlight: "달리오는 이 국면에서 성장주·경기민감 섹터를 선호했습니다.",
  },
  {
    name: "3단계 — 후기 사이클",
    condition: "성장 둔화 / 물가 부담",
    desc: "경기 성장세가 꺾이기 시작하지만 물가는 여전히 높은 국면입니다. 중앙은행이 금리를 올려 물가를 잡으려 하는 경향이 있습니다.",
    highlight: "달리오 관점에서는 방어주·배당주가 비교적 안정적인 선택으로 여겨졌습니다.",
  },
  {
    name: "4단계 — 침체·디레버리징",
    condition: "성장↓ / 신용수축",
    desc: "경기가 나빠지고 대출 상환이 늘어나는 시기입니다. 기업 실적이 부진하고 자산 가격이 하락하는 경향이 있습니다.",
    highlight: "달리오는 이 국면에서 채권·금·달러 등 안전자산을 선호했습니다.",
  },
  {
    name: "5단계 — 재완화·리플레이션",
    condition: "완화정책 시작",
    desc: "중앙은행이 금리를 내리고 유동성을 공급하는 국면입니다. 경기 회복 기대감이 높아지며 다음 사이클의 1단계를 준비한다고 봤습니다.",
    highlight: "위험자산이 서서히 회복하기 시작하는 시기라는 시각입니다.",
  },
];

const STATS = [
  {
    value: "2축",
    label: "경제를 읽는 기준",
    desc: "성장(Growth)과 물가(Inflation). 달리오는 이 두 가지로 경제 국면을 설명했습니다.",
  },
  {
    value: "5단계",
    label: "경제 사이클 구분",
    desc: "두 축의 조합에 따라 경제가 순환하는 5가지 국면으로 정의했습니다.",
  },
  {
    value: "브리지워터",
    label: "달리오의 헤지펀드",
    desc: "세계 최대 헤지펀드로 알려진 브리지워터 어소시에이츠의 창업자입니다.",
  },
];

export default function DalioCycleGuidePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="달리오의 시각"
        title={<>레이달리오 사이클이<br />무엇인가요?</>}
        desc="세계 최대 헤지펀드 브리지워터의 창업자 레이 달리오는 경제를 성장과 물가 두 축으로 나누어 사이클을 설명했습니다."
      />

      <ColumnCallout label="이런 시각도 있습니다">
        달리오는 경제가 복잡해 보여도 <strong>성장과 물가 두 축의 조합</strong>으로
        5가지 국면을 반복 순환한다고 설명했습니다. 어느 국면이냐에 따라
        유리한 자산군이 달라질 수 있다는 게 그의 시각입니다.
        다만 이는 달리오 개인의 프레임워크이며, 실제 시장은 이 틀대로 움직이지 않을 수 있습니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>달리오가 말하는 5가지 경제 국면</ColumnSectionTitle>

      <ColumnCardList>
        {PHASES.map((phase) => (
          <ColumnPersonCard key={phase.name} name={phase.name} sub={phase.condition}>
            <ColumnQuote>{phase.desc}</ColumnQuote>
            <ColumnHighlight>{phase.highlight}</ColumnHighlight>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
