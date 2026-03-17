import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnKeyFact,
  ColumnKeyFactGrid,
  ColumnCompareTable,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function BadTimingStillWinsPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="위기 분석"
        title={<>최고점만 골라서 샀어도<br />결국 백만장자가 됐다</>}
        desc="최악의 타이밍으로 투자해도 장기 보유 시 성공. 복리와 S&P500 장기 상승의 힘."
      />

      <ColumnCallout label="역사상 최악의 타이밍 투자자 시뮬레이션">
        매년 고점에만 투자하는 최악의 투자자를 상상해 보세요.
        1970년부터 매년 1만 달러를 그 해의 최고점에 투자했다면 어땠을까요?
        1987년 블랙먼데이 직전, 2000년 닷컴 버블 직전, 2007년 금융위기 직전에 투자했습니다.
        <strong>그래도 2020년에는 백만장자가 됐습니다.</strong>
      </ColumnCallout>

      <ColumnKeyFactGrid>
        <ColumnKeyFact value="$1.1M+" label="최악의 타이밍 투자자" desc="1970~2020년, 매년 고점 투자" />
        <ColumnKeyFact value="$1.4M+" label="최적 타이밍 투자자" desc="매년 저점 투자" />
        <ColumnKeyFact value="$1.0M+" label="아예 안 한 사람" desc="현금 보유 시 인플레이션 손실" variant="bad" />
      </ColumnKeyFactGrid>

      <ColumnCompareTable
        columns={["전략", "50년 후 자산", "핵심 변수"]}
        rows={[
          ["매년 고점 투자", { value: "$1.1M+", highlight: true }, "장기 보유"],
          ["매년 저점 투자", { value: "$1.4M+", highlight: true }, "최적 타이밍"],
          ["매년 분할 투자", { value: "$1.2M+", highlight: true }, "규칙적 실행"],
          ["현금 보유", { value: "$200K-", dim: true }, "인플레이션으로 손실"],
        ]}
      />

      <ColumnCallout label="왜 최악의 타이밍도 이기는가">
        S&P500의 장기 연평균 수익률은 약 10%(명목)입니다.
        폭락 직후에 샀더라도 시간이 지나면 그 가격보다 훨씬 높아집니다.
        1987년 블랙먼데이 고점에 투자했다면? 5년 후 이미 플러스였습니다.
        <strong>문제는 타이밍이 아닙니다. 팔지 않는 것이 핵심입니다.</strong>
      </ColumnCallout>

      <ColumnMythFact
        myth="지금은 너무 비싸서 조정을 기다렸다가 사야 한다"
        fact="역사적으로 조정을 기다린 투자자가 지금 당장 투자한 투자자보다 낮은 수익을 올린 경우가 많습니다. '언제 샀느냐'보다 '얼마나 오래 보유했느냐'가 결과를 결정합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
