import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnCompareRow,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "약 68%", label: "일시투자 우수 기간", desc: "뱅가드 연구 기준 (미국·영국·호주)" },
  { value: "약 2.3%p", label: "일시투자 평균 초과", desc: "미국 시장 기준 (뱅가드 2012)" },
  { value: "39%", label: "적립식 선호 이유", desc: "심리적 안도감 때문에" },
];

export default function DcaVsLumpSumPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title="적립식 vs 일시투자: 과학은 뭐라고 말하나"
        desc="약 68%의 기간에서 일시투자가 우수. 하지만 개인에겐 적립식이 심리적 안정을 제공."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="뱅가드의 연구 결론">
        뱅가드(2012)의 연구에서 역사적 데이터를 분석한 결과,
        목돈을 한 번에 투자하는 일시투자(Lump Sum)가
        12개월에 나눠 투자하는 분할 투자(DCA)보다
        약 68%의 기간에서 더 높은 수익률을 보였습니다.
        이론적으로는 일시투자가 더 유리합니다.
      </ColumnCallout>

      <ColumnCompareRow
        left={{ label: "일시투자 (이론)", value: "약 2.3%p 우위", sub: "약 68% 기간에서 분할 투자 상회", variant: "good" }}
        right={{ label: "적립식 DCA (실전)", value: "심리 안정", sub: "변동성 공포를 분산시켜 포기 방지", variant: "good" }}
      />

      <ColumnCallout label="그러나 실전은 다르다">
        일시투자가 이론적으로 우수하지만, 현실에는 중요한 전제가 있습니다.
        "1억 원을 한 번에 투자했는데 다음 달 -30%가 되면 버틸 수 있는가?"
        버티지 못하고 팔아버린다면 적립식보다 훨씬 나쁜 결과가 됩니다.
        <strong>지킬 수 있는 전략이 이론상 더 나은 전략보다 실제 수익이 높습니다.</strong>
      </ColumnCallout>

      <ColumnCallout label="추세 신호와 결합한 최선의 방법">
        추세 신호(200일선)가 상향인 상황에서는 일시투자에 가깝게 집중.
        추세 신호가 하향이면 현금 비중 유지 또는 분할 진입.
        이 두 가지를 결합하면 일시투자의 수익성과 적립식의 심리 안정을 동시에 얻을 수 있습니다.
        <strong>결국 투자의 정답은 지속 가능한 방법입니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
