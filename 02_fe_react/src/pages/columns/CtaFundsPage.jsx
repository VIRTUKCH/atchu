import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnCrisisCard,
  ColumnSectionTitle,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "$3,500억+", label: "CTA 운용 자산 규모", desc: "2024년 글로벌 추정치" },
  { value: "+14%", label: "2008년 CTA 평균 수익", desc: "Barclay CTA Index 기준" },
  { value: "53%", label: "국내 재간접 펀드 CTA 포함", desc: "운용사별 상이" },
];

export default function CtaFundsPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title="CTA 헤지펀드: 위기에 강한 시스템 투자의 원조"
        desc="닷컴·금융위기·코로나 당시 다른 펀드가 하락할 때 CTA 펀드는 어땠는가."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="CTA란 무엇인가?">
        CTA(Commodity Trading Advisor)는 선물, 옵션, FX 등 다양한 자산군에서
        추세추종 알고리즘으로 운용하는 헤지펀드입니다.
        인간의 감정 없이 순수하게 추세 신호를 따릅니다.
        거북이 트레이더들이 사용한 전략이 CTA의 원형입니다.
      </ColumnCallout>

      <ColumnSectionTitle>위기 시 CTA vs S&P500 비교</ColumnSectionTitle>

      <ColumnCrisisCard
        year="2000~2002"
        name="닷컴 버블 — CTA 대응"
        drawdown="S&P500 -49%"
        duration="CTA 평균 +20%~+40%"
        desc="주식 하락 추세를 포착해 공매도 포지션. 위기가 기회가 됐습니다."
      />
      <ColumnCrisisCard
        year="2007~2009"
        name="금융위기 — CTA 대응"
        drawdown="S&P500 -55%"
        duration="CTA 평균 +14%"
        desc="Barclay CTA Index 기준. 주식, 부동산, 신용 모두 하락하는 환경에서 플러스."
      />
      <ColumnCrisisCard
        year="2020.02~03"
        name="코로나 폭락 — CTA 대응"
        drawdown="S&P500 -34%"
        duration="CTA 혼재 성과"
        desc="낙폭이 너무 빠르고 회복도 빨라 CTA 성과가 혼재. 시스템의 한계도 드러난 사례."
      />

      <ColumnCallout label="CTA와 앗추의 공통점">
        앗추가 추적하는 데이터는 CTA 헤지펀드의 추세추종 원칙에서 영감을 받았습니다.
        추세 확인 후 진입, 추세 이탈 시 정리하는 규칙 기반 접근을 공유합니다.
        다만 CTA는 선물·옵션·FX 등 다양한 파생상품을 활용하는 반면, 앗추는 이동평균선 데이터를 시각화하여 제공합니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
