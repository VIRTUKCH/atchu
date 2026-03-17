import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareTable,
  ColumnBackLink,
} from "../../components/column";

export default function BuyHoldVsTrendPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title="Buy-and-Hold vs 추세추종: 누가 더 나은가"
        desc="CAGR은 유사하거나 낮을 수 있으나 MDD 50% 감소. 버틸 수 있는 전략이 이기는 전략."
      />

      <ColumnCallout label="CAGR만으로는 비교할 수 없다">
        단순한 수익률 비교로는 두 전략의 차이를 파악하기 어렵습니다.
        추세추종이 바이앤홀드보다 CAGR이 약간 낮을 수 있습니다.
        하지만 최대 드로다운이 50% 줄어든다면 어떨까요?
        <strong>-55%를 경험한 전략과 -25%를 경험한 전략 중 어느 쪽을 실제로 지킬 수 있을까요?</strong>
      </ColumnCallout>

      <ColumnCompareTable
        columns={["지표", "Buy-and-Hold", "추세추종"]}
        rows={[
          ["연평균 수익률 (CAGR)", { value: "10%", highlight: true }, { value: "8~9%", highlight: true }],
          ["최대 드로다운", { value: "-55% (2008)", bad: true }, { value: "-25%~-30%", highlight: true }],
          ["드로다운 지속 기간", { value: "2~5년", bad: true }, { value: "1~2년", highlight: true }],
          ["심리적 버팀력", { value: "낮음 (대부분 포기)", bad: true }, { value: "높음 (버틸 수 있음)", highlight: true }],
          ["연간 매매 횟수", { value: "0회", highlight: true }, { value: "2~4회", dim: true }],
          ["실제 투자자 수익", { value: "낮음 (공황 매도)", bad: true }, { value: "높음 (시스템 준수)", highlight: true }],
        ]}
      />

      <ColumnCallout label="복리의 역설: MDD 감소가 더 많이 번다">
        CAGR이 1~2%p 낮아도 MDD가 50% 줄면 실제로는 더 많이 버는 경우가 있습니다.
        -55% 폭락을 경험한 투자자의 대부분은 저점에서 팔거나 포기합니다.
        -25% 폭락이라면 버티는 비율이 훨씬 높습니다.
        <strong>지킬 수 있는 전략의 실제 수익이 이론상 더 좋은 전략보다 높습니다.</strong>
      </ColumnCallout>

      <ColumnCallout label="두 전략이 공존하는 방법">
        핵심 자산(Core)은 바이앤홀드로 장기 보유합니다.
        위성 자산(Satellite)은 추세 신호 기반으로 능동 관리합니다.
        이 Core-Satellite 접근법이 실전에서 가장 지속 가능한 방법입니다.
        이동평균선 등 추세 지표를 활용하면 위성 자산의 진입·이탈 타이밍을 참고할 수 있습니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
