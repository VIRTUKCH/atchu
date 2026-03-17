import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnKeyFact,
  ColumnKeyFactGrid,
  ColumnStepList,
  ColumnStepItem,
  ColumnCompareRow,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function DalbarResearchPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title="개인투자자는 왜 지수를 못 이길까 — DALBAR 연구"
        desc="20년간 개인 평균 연 2.2% vs S&P500 7.1%. 수익률 차이는 종목이 아닌 행동에서 생긴다."
      />

      <ColumnKeyFactGrid>
        <ColumnKeyFact value="2.2%" label="개인 투자자 평균 연 수익률" desc="DALBAR 20년 분석" variant="bad" />
        <ColumnKeyFact value="7.1%" label="S&P500 연평균 수익률" desc="같은 기간" />
        <ColumnKeyFact value="4.9%p" label="연간 수익률 격차" desc="20년 복리 시 엄청난 차이" variant="bad" />
      </ColumnKeyFactGrid>

      <ColumnCallout label="DALBAR 연구: 30년간 반복된 패턴">
        DALBAR(미국 금융 리서치 기관)는 1994년부터 매년 개인 투자자의 실제 수익률을 분석합니다.
        결론은 매년 동일합니다 — 개인 투자자는 지수를 크게 하회합니다.
        문제는 어떤 펀드를 골랐느냐가 아니었습니다.
        <strong>언제 사고 언제 팔았느냐, 즉 '행동'이 수익률을 결정했습니다.</strong>
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="공황 매도">
          하락장에서 공포를 느껴 저점 근처에서 매도합니다.
          이것이 가장 큰 수익률 손실의 원인입니다.
          감정이 규칙을 이긴 순간 손실이 확정됩니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="추격 매수">
          충분히 오른 후 FOMO(기회를 놓칠까 봐 두려워함)로 고점 근처에서 매수합니다.
          "이번엔 다를 것"이라는 확신은 대부분 틀립니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="잦은 매매">
          뉴스와 소음에 반응해 과도하게 매매합니다.
          거래 비용과 타이밍 실수가 누적되어 수익률을 갉아먹습니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnCompareRow
        left={{ label: "$10만 20년 보유 (S&P500)", value: "$38.7만", sub: "연 7.1% 복리", variant: "good" }}
        right={{ label: "$10만 20년 개인 평균", value: "$15.4만", sub: "연 2.2% 복리", variant: "bad" }}
      />

      <ColumnMythFact
        myth="좋은 종목만 잘 고르면 지수를 이길 수 있다"
        fact="DALBAR 연구에 따르면 수익률 격차의 대부분은 종목 선택이 아닌 행동에서 발생합니다. 좋은 종목을 골라도 잘못된 타이밍에 팔면 의미가 없습니다. 시스템이 감정 대신 결정해야 합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
