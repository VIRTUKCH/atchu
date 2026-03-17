import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "연 10%", label: "명목 연평균 수익률", desc: "1930년 이후 장기 평균" },
  { value: "약 10,000배", label: "배당 재투자 시 수익", desc: "1930년 $1 기준 (추정치)" },
  { value: "500개", label: "편입 기업 수", desc: "미국 최대 시가총액 기업들" },
];

export default function WhySp500Page() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title="왜 S&P500인가: 95년 데이터의 증거"
        desc="1930년부터 약 200배, 배당 재투자 시 약 10,000배. 모든 위기를 극복하고 신고점을 경신한 이유."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="S&P500은 미국 경제 자체다">
        S&P500은 단순한 주가지수가 아닙니다.
        미국 시가총액 상위 500개 기업을 담은 미국 경제의 대표 지표입니다.
        애플, 마이크로소프트, 아마존, 구글, 엔비디아 등이 포함됩니다.
        기업이 성장하면 편입되고, 쇠퇴하면 제외됩니다.
        <strong>과거 데이터에 따르면, S&P500은 미국 경제 성장과 함께 장기 우상향 추세를 보여왔습니다.</strong>
      </ColumnCallout>

      <ColumnTimeline>
        <ColumnTimelineItem year="1929~1932" title="대공황 — -86%, 명목 가격 기준 회복 25년">
          역사상 최악의 폭락. 하지만 결국 신고점 경신.
          배당을 재투자한 장기 투자자는 대공황도 이겼습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1973~1974" title="오일쇼크 — -48%">
          1차 오일쇼크와 스태그플레이션. 하지만 1980년대 압도적 반등.
          레이건 감세 정책과 기술 혁신이 새 사이클을 열었습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2000~2002" title="닷컴 버블 — -49%">
          IT 버블 붕괴. 나스닥은 -78%였지만 S&P500은 -49%로 방어.
          S&P500 분산 효과가 섹터 쏠림을 완충했습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2007~2009" title="금융위기 — -55%">
          역사상 두 번째 최대 폭락. 하지만 2013년 신고점 경신.
          이후 11년간 강세장(연평균 +16%)이 이어졌습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2020" title="코로나 — -34%, 5개월 만에 신고점">
          역사상 가장 빠른 폭락과 가장 빠른 회복.
          S&P500의 탄력성이 다시 한번 입증됐습니다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnCallout label="왜 한국 투자자에게도 S&P500인가">
        코스피의 최근 10~15년 연평균 수익률은 3~4% 수준에 머물러 있습니다.
        S&P500은 같은 기간 약 10%. 장기적으로 보면 상당한 격차입니다.
        미국 기업들은 글로벌 시장에서 수익을 창출합니다.
        애플의 아이폰은 한국에서도 팔리고, 구글 광고는 전 세계에서 수익을 냅니다.
        <strong>S&P500에 투자하면 글로벌 시장에서 수익을 내는 대형 기업들에 분산 투자하는 효과를 얻을 수 있습니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
