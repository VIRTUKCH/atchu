import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnAllocationBar,
  ColumnCompareRow,
  ColumnBackLink,
} from "../../components/column";

const ALLOCATION = [
  { label: "미국 주식 (S&P500 등)", pct: 35, color: "#3b82f6" },
  { label: "글로벌 주식", pct: 20, color: "#6366f1" },
  { label: "채권 (국채, 회사채)", pct: 20, color: "#10b981" },
  { label: "원자재 (금, 에너지)", pct: 15, color: "#f59e0b" },
  { label: "기타 (리츠, 통화)", pct: 10, color: "#ef4444" },
];

export default function DiversificationSciencePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title="분산투자의 과학: 왜 185개를 추적하는가"
        desc="상관성 없는 자산들이 함께 상승할 때 추세 강도가 극대화되는 원리."
      />

      <ColumnCallout label="분산이 리스크를 줄이는 수학적 원리">
        두 자산의 상관관계가 낮을수록 포트폴리오 전체의 변동성이 감소합니다.
        주식과 채권의 상관관계가 -0.3이라면, 주식이 하락할 때 채권이 상승할 가능성이 있습니다.
        이것이 현대 포트폴리오 이론(MPT)의 핵심입니다.
        노벨상 수상자 해리 마코위츠가 1952년에 증명했습니다.
      </ColumnCallout>

      <ColumnAllocationBar items={ALLOCATION} />

      <ColumnCompareRow
        left={{ label: "단일 자산 추세 신호", value: "노이즈 多", sub: "S&P500 하나만 보면 잡음이 많음", variant: "bad" }}
        right={{ label: "185개 추세 강도 지수", value: "신호 명확", sub: "전체 추세 방향이 더 선명하게 보임", variant: "good" }}
      />

      <ColumnCallout label="앗추가 185개를 추적하는 이유">
        앗추는 글로벌 주식, 채권, 원자재, 통화 등 185개 자산의 추세 상태를 한 화면에 정리합니다.
        단일 자산만 보는 것보다 넓은 시야로 시장 흐름을 파악할 수 있도록 데이터를 제공합니다.
      </ColumnCallout>

      <ColumnCallout label="분산과 추세추종의 시너지">
        분산투자는 리스크를 줄이고, 추세추종은 큰 하락을 피합니다.
        이 두 전략이 결합될 때 가장 강력한 리스크 관리가 됩니다.
        하락장에서 분산만으로는 모든 자산이 함께 떨어지는 '상관관계 1 현상'을 피하기 어렵습니다.
        추세 신호가 이때 포트폴리오를 현금으로 전환하는 역할을 합니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
