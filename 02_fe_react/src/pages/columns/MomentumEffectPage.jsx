import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareRow,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

export default function MomentumEffectPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title="모멘텀 효과: 강세주는 왜 계속 강세인가"
        desc="최근 3~12개월 강세주가 향후도 강세. 미국에선 유효, 한국에선 역행이 더 효과적."
      />

      <ColumnCallout label="모멘텀 효과: 1993년 증명된 현상">
        1993년 제가디쉬와 티트만의 연구에서 최초로 학술적으로 증명됐습니다.
        최근 3~12개월간 강세였던 주식이 향후 3~12개월도 강세인 경향이 있습니다.
        이 현상은 미국, 유럽, 아시아 등 전 세계 시장에서 관찰됩니다.
        <strong>시장이 새로운 정보에 과소반응한다는 행동재무학적 설명이 일반적입니다.</strong>
      </ColumnCallout>

      <ColumnCompareRow
        left={{ label: "미국 모멘텀 효과", value: "정방향 유효", sub: "강세 → 추가 강세 지속", variant: "good" }}
        right={{ label: "한국 모멘텀 효과", value: "역행 경향", sub: "강세 후 역행, 가치주 회귀", variant: "bad" }}
      />

      <ColumnCallout label="왜 미국과 한국이 다른가">
        한국 주식 시장은 소수 대형주 집중도가 높고, 외국인 투자자의 영향이 큽니다.
        삼성전자, SK하이닉스 등 반도체 사이클에 따라 전체 지수가 움직입니다.
        이런 환경에서는 과매수 후 역행(Mean Reversion)이 더 잘 작동합니다.
        반면 미국은 500개 기업의 다양한 섹터가 순환하며 모멘텀이 지속됩니다.
      </ColumnCallout>

      <ColumnCallout label="앗추와 모멘텀의 연결">
        앗추가 제공하는 이동평균선 기반 추세 데이터는 모멘텀 효과와 관련이 있습니다.
        200일선 위에 있다는 것은 장기 모멘텀이 유지되고 있다는 참고 데이터입니다.
        앗추는 이 데이터를 시각화하여 투자자가 직접 판단할 수 있는 환경을 제공합니다.
      </ColumnCallout>

      <ColumnTipBox>
        모멘텀 투자 실전 팁:<br />
        - 최근 6~12개월 강세 ETF 파악<br />
        - 200일선 위에서만 모멘텀 추종<br />
        - 섹터 로테이션과 결합하면 효과 극대화<br />
        - 역방향(한국 주식)에는 반대 전략 고려
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
