import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnStepList,
  ColumnStepItem,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "2주", label: "뇌 트라우마 회복 기간", desc: "신경과학 연구 기준" },
  { value: "4단계", label: "생존 프로세스", desc: "정보 차단 → 표현 → 교정 → 전환" },
  { value: "-50%", label: "잘못된 판단 확률 상승", desc: "극도의 공포 상태에서" },
];

export default function BearMarketSurvivalPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title="폭락장 2주 생존 가이드: 앱 삭제가 최고의 전략인 이유"
        desc="뇌 트라우마 회복 기간 2주. 정보 차단 → 불안 표현 → 인지 교정 → 주의 전환."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="폭락장에서 뇌는 제대로 작동하지 않는다">
        연구에 따르면 극도의 공포 상태에서 인간의 전두엽(이성적 판단 담당)은
        기능이 크게 저하됩니다. 편도체(공포 반응)가 지배하기 시작합니다.
        이 상태에서 내리는 투자 결정의 대부분은 나중에 후회하게 됩니다.
        <strong>폭락장에서 최고의 전략은 아무것도 하지 않는 것입니다.</strong>
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="2주간 투자 앱 삭제">
          증권사 앱과 포트폴리오 확인 앱을 모두 삭제합니다.
          가격을 볼수록 공포 반응이 강해지고 잘못된 결정을 내릴 확률이 높아집니다.
          2주는 뇌의 급성 스트레스 반응이 정상화되는 시간입니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="불안을 말로 표현하기">
          투자 불안을 혼자 삭이지 말고 신뢰할 수 있는 사람에게 말로 표현합니다.
          언어화는 편도체 반응을 줄이고 전두엽 활동을 늘립니다.
          일기, 메모, 대화 모두 효과적입니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="인지 교정">
          "지금까지 모든 폭락 이후 신고점을 경신했다"는 사실을 구체적으로 떠올립니다.
          역사적 데이터가 감정보다 더 신뢰할 수 있는 근거입니다.
          과거 회복 타임라인을 직접 찾아보는 것도 효과적입니다.
        </ColumnStepItem>
        <ColumnStepItem step={4} title="주의 전환">
          투자 외의 생산적인 활동(운동, 취미, 업무)에 집중합니다.
          2주 후 다시 상황을 확인할 때는 훨씬 이성적인 판단이 가능합니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnTipBox>
        앱을 지우는 것이 손절 버튼보다 나은 이유:<br />
        역사적으로 폭락장 저점에서 손절한 투자자의 대부분은 회복을 놓쳤습니다.
        반면 2주를 버틴 투자자는 대부분 결국 회복을 경험했습니다.
        최악의 결정은 극도의 공포 상태에서 나옵니다.
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
