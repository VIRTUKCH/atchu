import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareTable,
  ColumnKeyFact,
  ColumnKeyFactGrid,
  ColumnBackLink,
} from "../../components/column";

export default function BuffettVsHedgePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title={<>워런 버핏 vs 5개 헤지펀드:<br />10년 내기의 결과</>}
        desc="2007년, 버핏이 100만 달러를 걸고 제안했습니다. 'S&P500이 어떤 헤지펀드도 이긴다.'"
      />

      <ColumnCallout label="2007년, 버핏의 도발">
        워런 버핏이 헤지펀드 운용사 프로티지 파트너스에 제안했습니다.
        "향후 10년간 S&P500 인덱스펀드가 당신들이 고른 5개 헤지펀드보다 높은 수익률을 낼 것이다."
        상금은 100만 달러. 결과는 예상보다 압도적이었습니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["연도", "S&P500 인덱스", "헤지펀드 5개 평균"]}
        rows={[
          ["2008", { value: "-37%", bad: true }, { value: "-24%", bad: true }],
          ["2009", { value: "+26%", highlight: true }, { value: "+16%" }],
          ["2012", { value: "+16%", highlight: true }, { value: "+3%", dim: true }],
          ["2014", { value: "+14%", highlight: true }, { value: "+4%", dim: true }],
          ["2017 (종료)", { value: "+7.1% 연평균", highlight: true }, { value: "+2.2% 연평균", dim: true }],
        ]}
      />

      <ColumnKeyFactGrid>
        <ColumnKeyFact value="7.1%" label="S&P500 연평균 수익률" desc="10년 복리" />
        <ColumnKeyFact value="2.2%" label="헤지펀드 연평균" desc="5개 펀드 평균" variant="bad" />
      </ColumnKeyFactGrid>

      <ColumnCallout label="버핏의 유언장에 적힌 투자 지시">
        2013년 버크셔 해서웨이 연례 서한에서 버핏은 밝혔습니다.
        "내 유언장에는 이렇게 적혀 있다 — 재산의 90%는 S&P500 인덱스펀드에,
        10%는 단기 국채에 투자하라." 세계 최고의 투자자가 택한 가장 단순한 전략입니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
