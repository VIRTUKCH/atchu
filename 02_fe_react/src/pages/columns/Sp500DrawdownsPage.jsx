import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnSectionTitle,
  ColumnCrisisCard,
  ColumnBackLink,
} from "../../components/column";

export default function Sp500DrawdownsPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="위기 분석"
        title="S&P500이 경험한 역사적 최악의 순간들"
        desc="1929년 대공황부터 2020년까지. 모든 폭락 이후 신고점을 경신한 100년의 기록."
      />

      <ColumnCallout label="모든 폭락에는 하나의 공통점이 있다">
        지금까지 S&P500은 수십 번의 폭락을 경험했습니다.
        하지만 단 하나의 예외도 없이, 모든 폭락 이후에는 결국 신고점을 경신했습니다.
        문제는 '폭락이 오는가'가 아니라 '그때 버틸 수 있는가'입니다.
      </ColumnCallout>

      <ColumnSectionTitle>역사적 주요 드로다운</ColumnSectionTitle>

      <ColumnCrisisCard
        year="1929~1932"
        name="대공황"
        drawdown="-86%"
        duration="약 1,000일"
        desc="역사상 최대 폭락. 회복까지 25년 소요. 하지만 이후 미국 경제는 세계 최강으로 성장."
      />
      <ColumnCrisisCard
        year="1973~1974"
        name="오일쇼크 스태그플레이션"
        drawdown="-48%"
        duration="630일"
        desc="1차 오일쇼크와 물가 급등. 연준의 금리 인상이 경기 침체를 촉발."
      />
      <ColumnCrisisCard
        year="1987.10"
        name="블랙 먼데이"
        drawdown="-34%"
        duration="단 하루"
        desc="단 하루 -22.6% 폭락. 역사상 최대 단일일 낙폭. 하지만 2년 만에 회복."
      />
      <ColumnCrisisCard
        year="2000~2002"
        name="닷컴 버블"
        drawdown="-49%"
        duration="943일"
        desc="나스닥은 -78%. 인터넷 버블 붕괴로 수많은 닷컴 기업이 사라짐."
      />
      <ColumnCrisisCard
        year="2007~2009"
        name="금융위기"
        drawdown="-55%"
        duration="517일"
        desc="리먼브라더스 파산. 글로벌 금융 시스템 마비. 역사상 두 번째 최대 폭락."
      />
      <ColumnCrisisCard
        year="2020.02~03"
        name="코로나 폭락"
        drawdown="-34%"
        duration="33일"
        desc="역사상 가장 빠른 폭락. 5개월 만에 신고점 회복. 역사상 가장 빠른 회복."
      />

      <ColumnCallout label="결론: 100년간 한 번도 영구적으로 무너진 적 없다">
        대공황(-86%), 오일쇼크(-48%), 블랙먼데이(-34%), 닷컴버블(-49%),
        금융위기(-55%), 코로나(-34%).
        <strong>모든 폭락 이후 S&P500은 결국 신고점을 경신했습니다.</strong>
        장기 투자자에게 폭락은 위협이 아니라 더 낮은 가격에 살 수 있는 기회였습니다.
        단, 그 기회를 잡으려면 버틸 수 있는 전략이 필요합니다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
