import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnInfoCard,
  ColumnDecayExample,
  ColumnSolution,
  ColumnBackLink,
} from "../../components/column";

export default function VolatilityDecayPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="레버리지"
        title="눈에 보이지 않는 손실: 변동성 감쇠(Volatility Decay)"
        desc="10% 하락 후 11.11% 상승 = 지수는 원점, 2배 레버리지는 마이너스인 이유."
      />

      <ColumnInfoCard label="변동성 감쇠란?">
        레버리지 ETF는 매일 레버리지 비율을 리셋합니다.
        가격이 오르락내리락하는 횡보장에서 지수가 원점으로 돌아와도
        레버리지 ETF는 손실을 기록하는 현상입니다.
        이것이 '변동성 감쇠(Volatility Decay)' 또는 '베타 슬리피지(Beta Slippage)'입니다.
      </ColumnInfoCard>

      <ColumnDecayExample
        baseReturn={-10}
        recoveryReturn={11.11}
        label2x="2배 레버리지"
        label3x="3배 레버리지"
      />

      <ColumnCallout label="왜 이런 일이 생기는가">
        100에서 10% 하락하면 90이 됩니다. 다시 11.11% 상승하면 100으로 돌아옵니다.
        지수는 원점입니다.<br /><br />
        2배 레버리지는? 100에서 -20% → 80. 다시 +22.22% → 97.8.
        지수는 0%인데 2배 레버리지는 -2.2%입니다.<br /><br />
        3배 레버리지는? 100에서 -30% → 70. 다시 +33.33% → 93.3.
        지수는 0%인데 3배 레버리지는 -6.7%입니다.<br /><br />
        <strong>횡보장이 길어질수록 이 손실이 누적됩니다.</strong>
      </ColumnCallout>

      <ColumnSolution>
        추세 신호로 횡보장을 회피하면 변동성 감쇠를 최소화할 수 있습니다.
        200일선 위에서만 레버리지를 보유하고, 이탈 시 현금으로 전환합니다.
        강한 추세(상승 또는 하락)가 있는 구간에서는 변동성 감쇠가 최소화됩니다.
        레버리지 ETF는 '추세가 있을 때' 사용하는 도구입니다.
      </ColumnSolution>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
