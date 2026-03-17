import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnStepList,
  ColumnStepItem,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "$1.75억", label: "5년 누적 수익", desc: "거북이 트레이더 전체 성과 (알려진 수치)" },
  { value: "2주", label: "교육 기간", desc: "전략 전수에 걸린 시간" },
  { value: "14명", label: "첫 기수 학생 수", desc: "일반인 지원자 중 선발" },
];

export default function TurtleTraderPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title={<>거북이 트레이더:<br />2주 교육으로 $1.75억 수익</>}
        desc="1983년, 월스트리트 역사상 가장 유명한 실험이 시작됐습니다."
      />

      <ColumnPullQuote
        attribution="Richard Dennis"
        role="거북이 실험 주도자 · 선물 트레이더"
      >
        나는 2주 만에 훌륭한 트레이더를 만들 수 있다고 생각한다. 트레이딩은 배울 수 있는 기술이다.
      </ColumnPullQuote>

      <ColumnCallout label="논쟁에서 시작된 실험">
        리처드 데니스와 빌 에카트 사이의 논쟁 — "뛰어난 트레이더는 태어나는가, 만들어지는가?"
        이를 직접 실험으로 증명하기 위해 신문에 광고를 냈고, 일반인 14명을 선발해
        2주 동안 트레이딩 전략을 가르쳤습니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>실험의 타임라인</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="1983" title="신문 광고로 14명 모집">
          트레이딩 경험이 없는 일반인도 포함. 데니스가 직접 2주 동안 전략을 전수.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1984" title="거북이들, 실전 투자 시작">
          데니스의 자금으로 실전 운용 시작. 규칙대로만 하면 됐습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1988" title="5년간 총 $1.75억 수익">
          논쟁의 결론 — 트레이더는 만들어집니다. 시스템과 규율이 전부였습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2003" title="커티스 페이스, 거북이 규칙 무료 공개">
          거북이 트레이더 출신 Curtis Faith가 originalturtles.org에서 규칙을 공개. 핵심은 놀랍도록 단순했습니다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnSectionTitle>거북이 규칙의 핵심 3가지</ColumnSectionTitle>

      <ColumnStepList>
        <ColumnStepItem step={1} title="추세 진입">
          가격이 최근 20일 또는 55일 고점을 돌파하면 매수. 이평선과 같은 원리로
          추세를 확인하고 진입합니다. 너무 늦게 사는 것 같아도 괜찮습니다.
          추세의 중간에서 사도 충분합니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="포지션 사이징">
          계좌의 1~2% 이상을 단일 포지션에 절대 투자하지 않습니다.
          한 번의 실수가 전체를 날리지 않게 하는 가장 중요한 규칙입니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="손절 규칙">
          포지션이 2ATR(평균 변동폭의 2배) 이상 역행하면 무조건 손절합니다.
          '조금 더 기다려볼까'라는 생각이 들 여지를 없앱니다. 시스템이 결정합니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnCallout label="거북이 전략과 이동평균선의 공통점">
        둘 다 <strong>추세 확인 후 진입, 추세 이탈 시 대피</strong>하는 규칙 기반 접근입니다.
        거북이 규칙은 채널 돌파, 이동평균선은 가격 평균을 기준으로 하지만
        핵심 원리는 동일합니다 — 감정이 아닌 시스템이 매매를 결정합니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
