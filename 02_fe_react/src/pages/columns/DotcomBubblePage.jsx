import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "-78%", label: "나스닥 낙폭", desc: "2000년 3월 고점 대비" },
  { value: "943일", label: "하락 지속 기간", desc: "약 2년 7개월" },
  { value: "-95%", label: "아마존 주가 낙폭", desc: "버블 최고점 대비" },
];

export default function DotcomBubblePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="위기 분석"
        title="2000년 닷컴 버블: 나스닥 -78%, 아마존 -95%"
        desc="943일간의 하락. 추세 이탈 신호는 이미 2000년 초에 나왔습니다."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="모두가 알고 있었지만 아무도 팔지 않았다">
        1990년대 말, 인터넷 기업들은 수익이 없어도 주가가 수백 배씩 올랐습니다.
        "이번엔 다르다(This time is different)"는 말이 넘쳐났고,
        밸류에이션 논리는 통하지 않는다고 여겼습니다.
        하지만 이동평균선은 이미 2000년 초부터 이탈 신호를 내고 있었습니다.
      </ColumnCallout>

      <ColumnTimeline>
        <ColumnTimelineItem year="2000.03" title="나스닥 역사적 고점 5,048 (3월 10일)">
          닷컴 기업들의 PER이 수백~수천 배. FOMO(기회를 놓칠까 봐 두려워함)가 정점.
          200일 이평선은 여전히 상향이었지만 과열 신호가 누적됐습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2000.03" title="버블 붕괴 시작">
          200일선을 하향 이탈. 추세추종 시스템은 첫 번째 매도 신호를 발생시켰습니다.
          많은 투자자들은 "일시적 조정"으로 판단하고 보유했습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2001.09" title="9/11 테러">
          이미 하락 중이던 시장에 추가 충격. 나스닥은 고점 대비 -60% 이상 하락.
          추세추종 전략은 이미 현금 또는 채권으로 이동한 상태였습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2002.10" title="나스닥 저점 1,114">
          고점 대비 -78%. 아마존은 고점 $106에서 $5.51로 -95% 폭락.
          이후 2015년에야 닷컴 버블 고점을 회복했습니다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnCallout label="추세는 IT도 예외가 없었다">
        많은 투자자들이 "인터넷 혁명은 다르다"고 생각했습니다.
        하지만 추세는 IT 섹터에도 동일하게 적용됐습니다.
        200일선 이탈 신호를 따랐다면 대부분의 손실을 피할 수 있었습니다.
        <strong>이후 아마존은 6만% 이상 상승했습니다 — 버텼다면 말이죠.</strong>
      </ColumnCallout>

      <ColumnMythFact
        myth="IT 혁명 같은 구조적 변화에는 추세 분석이 통하지 않는다"
        fact="닷컴 버블에서도 추세 신호는 정확했습니다. 2000년 초 200일선 이탈 이후 꾸준히 하락했습니다. 혁신적인 섹터일수록 과열과 버블이 더 심하게 발생하며, 추세 이탈 신호는 더 명확합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
