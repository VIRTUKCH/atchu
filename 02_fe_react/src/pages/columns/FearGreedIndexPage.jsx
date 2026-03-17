import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareTable,
  ColumnPullQuote,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function FearGreedIndexPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title="공포-탐욕 지수로 읽는 시장 심리"
        desc="CNN 0~100 척도. 극단적 공포 구간이 역사적으로 최고의 매수 기회인 이유."
      />

      <ColumnPullQuote
        attribution="Warren Buffett"
        role="버크셔 해서웨이 회장"
      >
        다른 사람이 탐욕스러울 때 두려워하고, 다른 사람이 두려워할 때 탐욕스러워하라.
      </ColumnPullQuote>

      <ColumnCallout label="공포-탐욕 지수란?">
        CNN이 개발한 0~100 척도의 시장 심리 지표입니다.
        주가 모멘텀, 주가 강도, 풋/콜 비율, 정크본드 수요 등 7가지 지표를 종합합니다.
        0에 가까울수록 극단적 공포, 100에 가까울수록 극단적 탐욕입니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["구간", "심리 상태", "이후 12개월 평균 수익률"]}
        rows={[
          ["0~25", { value: "극단적 공포", bad: true }, { value: "+24.9%", highlight: true }],
          ["25~45", { value: "공포" }, { value: "+15.3%", highlight: true }],
          ["45~55", { value: "중립" }, { value: "+11.2%" }],
          ["55~75", { value: "탐욕" }, { value: "+7.1%" }],
          ["75~100", { value: "극단적 탐욕", highlight: true }, { value: "+3.2%", dim: true }],
        ]}
      />

      <ColumnCallout label="버핏이 2008년에 '지금 사라'고 한 이유">
        2008년 10월, 공포-탐욕 지수는 극단적 공포 구간에 있었습니다.
        버핏은 뉴욕타임스 기고문에서 "지금 미국 주식을 매수하고 있다"고 밝혔습니다.
        이후 10년간 S&P500은 +380% 상승했습니다.
        <strong>극단적 공포는 대부분 역사적 매수 기회였습니다.</strong>
      </ColumnCallout>

      <ColumnMythFact
        myth="시장이 공포에 빠지면 함께 팔고 나와야 한다"
        fact="역사적 데이터에서 극단적 공포 구간 이후 12개월 평균 수익률은 +24.9%입니다. 반대로 극단적 탐욕 구간 이후 수익률은 +3.2%에 불과합니다. 대중과 반대 방향이 통계적으로 유리합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
