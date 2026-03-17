import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnCallout,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "45년+", label: "운용 경력", desc: "1980년 Tudor Investment Corp 창립 이래" },
  { value: "125.9%", label: "1987년 연간 수익률", desc: "블랙먼데이 해, 수수료 차감 후 순수익 기준" },
  { value: "200일선", label: "핵심 기준", desc: "모든 포지션 판단의 기준으로 사용" },
];

export default function PaulTudorJonesPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title={<>폴 튜더 존스:<br />"200일선 아래에서는<br />좋은 일이 없다"</>}
        desc="1980년부터 40년 넘게 운용. 그의 판단 기준은 단 하나였습니다."
      />

      <ColumnPullQuote
        attribution="Paul Tudor Jones"
        role="Tudor Investment Corp 창립자 · 헤지펀드 매니저"
      >
        "My metric for everything I look at is the 200-day moving average.
        Using the 200-day moving average rule, you can avoid the catastrophe."
        <br /><br />
        내가 보는 모든 것의 기준은 200일 이동평균선이다.
        200일 이평선 규칙을 쓰면 모든 것을 잃는 상황을 피할 수 있다.
        <br />
        <small>— Tony Robbins, <em>Money: Master The Game</em> (2014) 인터뷰에서 인용</small>
      </ColumnPullQuote>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>커리어 주요 이정표</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="1980" title="Tudor Investment Corp 창립">
          헤지펀드를 설립. 초기부터 추세추종과 200일 이평선을 핵심 전략으로 채택.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1987" title="블랙먼데이 — 연간 순수익 125.9%">
          S&P500 선물 공매도 포지션으로 시장 붕괴에서 큰 수익.
          수수료 차감 후 연간 순수익률 125.9%. 200일선 이탈 신호를 근거로 미리 대응했다고 알려짐.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1990년대~" title="장기간 수익 기록">
          설립 이후 대부분의 해에 수익을 기록. 다만 2016년 BVI 펀드에서 -2.6% 손실이 보고된 바 있음.
          복잡한 매크로 분석보다 단순한 이평선 기준을 일관되게 고수.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="현재" title="45년+ 현역">
          월스트리트에서 가장 오랫동안 활동해온 트레이더 중 한 명.
          여전히 200일선을 모든 포지션 판단의 첫 번째 기준으로 사용한다고 알려짐.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnCallout label="개인 투자자에게 주는 시사점">
        폴 튜더 존스는 수백억 달러를 운용하는 기관이지만, 그가 쓰는 기준은
        누구나 무료로 쓸 수 있는 200일 이동평균선입니다.
        <strong>동일한 지표를 활용해 시장을 모니터링할 수 있습니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
