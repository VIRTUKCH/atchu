import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnInfoCard,
  ColumnCompareTable,
  ColumnBackLink,
} from "../../components/column";

export default function RiskAdjustedReturnPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title="샤프 비율과 소르티노 비율: 리스크 조정 수익률의 이해"
        desc="단순 수익률 비교의 함정. 하락 변동성만 패널티로 주는 소르티노가 추세추종 평가에 적합."
      />

      <ColumnInfoCard label="샤프 비율이란?">
        (포트폴리오 수익률 - 무위험 수익률) ÷ 전체 변동성<br /><br />
        위험 1단위당 얼마나 많은 수익을 냈는지 측정합니다.
        높을수록 리스크 대비 수익이 좋습니다.
        단점: 상방 변동성(수익)과 하방 변동성(손실)을 구분하지 않습니다.
        추세추종은 상방 변동성이 있어 샤프 비율이 낮게 나올 수 있습니다.
      </ColumnInfoCard>

      <ColumnInfoCard label="소르티노 비율이란?">
        (포트폴리오 수익률 - 목표 수익률) ÷ 하방 변동성만<br /><br />
        하락 변동성만 패널티로 줍니다. 상승 변동성은 좋은 것이므로 무시합니다.
        추세추종 전략처럼 큰 상방 추세를 타는 전략에 더 적합합니다.
        같은 수익률이어도 하락이 적을수록 소르티노 비율이 높습니다.
      </ColumnInfoCard>

      <ColumnCompareTable
        columns={["전략", "CAGR", "샤프 비율", "소르티노 비율", "최대 MDD"]}
        rows={[
          ["S&P500 Buy-and-Hold", { value: "10%" }, { value: "0.55" }, { value: "0.75" }, { value: "-55%", bad: true }],
          ["추세추종 (200일선)", { value: "8~9%" }, { value: "0.60", highlight: true }, { value: "0.95", highlight: true }, { value: "-25%", highlight: true }],
          ["올웨더 포트폴리오", { value: "7%" }, { value: "0.70", highlight: true }, { value: "1.10", highlight: true }, { value: "-20%", highlight: true }],
          ["HFEA (레버리지)", { value: "17~20%" }, { value: "0.45", dim: true }, { value: "0.55", dim: true }, { value: "-75%", bad: true }],
        ]}
      />

      <ColumnCallout label="추세추종은 단순 수익률보다 리스크 조정에서 빛난다">
        추세추종의 CAGR은 바이앤홀드보다 낮을 수 있습니다.
        하지만 샤프 비율과 소르티노 비율을 보면 다른 그림이 나옵니다.
        최대 드로다운이 절반으로 줄면서 리스크 조정 수익률이 높아집니다.
        <strong>얼마나 벌었느냐보다 얼마나 적은 리스크로 벌었느냐가 진짜 실력입니다.</strong>
      </ColumnCallout>

      <ColumnCallout label="실제 투자자에게 더 중요한 지표">
        수익률만 보는 투자자는 -55% 폭락 앞에서 무너집니다.
        소르티노 비율이 높은 전략은 버티기 쉽습니다.
        장기 복리의 힘은 높은 수익률이 아니라 중단 없이 지속하는 것에서 나옵니다.
        지속 가능한 전략이 장기적으로 이깁니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
