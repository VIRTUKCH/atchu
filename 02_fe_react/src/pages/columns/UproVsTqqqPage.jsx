import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareTable,
  ColumnWarningCard,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

export default function UproVsTqqqPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="레버리지"
        title="UPRO vs TQQQ: 수익도 3배, 손실도 3배"
        desc="10년 연 30~40% 수익률의 이면. 최대 드로다운 77~82%의 현실."
      />

      <ColumnCompareTable
        columns={["항목", "UPRO (S&P500 3배)", "TQQQ (나스닥100 3배)"]}
        rows={[
          ["추적 지수", { value: "S&P500" }, { value: "나스닥100" }],
          ["10년 연평균 수익", { value: "~35%", highlight: true }, { value: "~40%", highlight: true }],
          ["2022년 연간 손실", { value: "-68%", bad: true }, { value: "-82%", bad: true }],
          ["최대 드로다운", { value: "-77%", bad: true }, { value: "-82%", bad: true }],
          ["운용 비용(연)", { value: "0.91%", dim: true }, { value: "0.88%", dim: true }],
          ["일일 리밸런싱", { value: "매일", dim: true }, { value: "매일", dim: true }],
        ]}
      />

      <ColumnCallout label="10년 성과의 이면">
        2012~2021년처럼 S&P500이 지속 상승하는 구간에서 UPRO는 압도적입니다.
        하지만 2022년 금리 인상 국면에서 UPRO는 -68%, TQQQ는 -82%를 기록했습니다.
        1억을 투자했다면 TQQQ는 8개월 만에 1,800만원이 됩니다.
        <strong>레버리지는 추세가 있을 때만 위력을 발휘합니다.</strong>
      </ColumnCallout>

      <ColumnWarningCard>
        <strong>레버리지 ETF 장기 보유 주의사항:</strong><br /><br />
        1. 변동성 감쇠(Volatility Decay): 횡보장에서 지수보다 빠르게 손실<br />
        2. 일일 리밸런싱 비용: 매일 레버리지 비율을 맞추기 위한 내부 거래 비용<br />
        3. 금리 비용: 레버리지를 위한 차입 비용이 수익률을 줄임<br />
        4. 심리적 한계: -80% 경험 후 보유 지속이 현실적으로 가능한가?
      </ColumnWarningCard>

      <ColumnTipBox>
        추세 신호와 레버리지 ETF 조합:<br />
        200일선 위 → UPRO/TQQQ 보유<br />
        200일선 아래 → 현금 또는 채권 전환<br />
        이 단순한 규칙이 변동성 감쇠와 최대 드로다운을 동시에 줄여줍니다.
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
