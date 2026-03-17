import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnKeyFact,
  ColumnKeyFactGrid,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnCrisisCard,
  ColumnSectionTitle,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function Crisis2008Page() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="위기 분석"
        title="2008년 금융위기: 추세추종이 60% 손실을 막았다"
        desc="S&P500 -55.2%, 그러나 추세추종 전략은 -22.4%에 그쳤습니다. CTA 펀드는 오히려 +14% (Barclay CTA Index)."
      />

      <ColumnKeyFactGrid>
        <ColumnKeyFact value="-55.2%" label="S&P500 최대 낙폭" desc="2007.10 ~ 2009.03" variant="bad" />
        <ColumnKeyFact value="-22.4%" label="다중자산 추세추종" desc="같은 기간 손실" />
        <ColumnKeyFact value="+14%" label="CTA 펀드 평균" desc="Barclay CTA Index 2008년 기준" />
      </ColumnKeyFactGrid>

      <ColumnCallout label="추세 신호는 이미 나왔다">
        2007년 10월, S&P500이 200일 이동평균선 아래로 이탈하기 시작했습니다.
        추세추종 시스템은 이 신호를 포착해 주식 비중을 줄이고 현금 또는 채권으로 이동했습니다.
        리먼브라더스 파산(2008.09) 이전에 이미 방어 태세를 갖출 수 있었습니다.
      </ColumnCallout>

      <ColumnSectionTitle>금융위기의 타임라인</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="2007.10" title="S&P500 역사적 고점">
          1,576포인트. 200일선 이탈 신호가 이미 나타나기 시작했습니다.
          추세추종 시스템은 리스크 축소를 시작했습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2008.03" title="베어스턴스 붕괴">
          월스트리트 5위 투자은행 붕괴. Fed가 JP모건 인수를 주선.
          이 시점에 주식 시장은 아직 고점 대비 -20% 수준이었습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2008.09" title="리먼브라더스 파산">
          158년 역사의 투자은행 파산. 세계 금융 시스템이 마비.
          S&P500은 단 6주 만에 추가 -30% 급락했습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2009.03" title="S&P500 저점 666포인트">
          고점 대비 -55.2%. 추세추종 전략은 이 하락의 절반 이하만 경험했습니다.
          이후 본격적인 회복이 시작됐습니다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnSectionTitle>역사적 폭락 비교</ColumnSectionTitle>

      <ColumnCrisisCard
        year="2000~2002"
        name="닷컴 버블"
        drawdown="-49%"
        duration="943일"
        desc="나스닥은 -78%. 인터넷 버블 붕괴."
      />
      <ColumnCrisisCard
        year="2007~2009"
        name="금융위기"
        drawdown="-55%"
        duration="517일"
        desc="리먼 파산. 역사상 최대 금융 시스템 위기."
      />
      <ColumnCrisisCard
        year="2020.02~03"
        name="코로나 폭락"
        drawdown="-34%"
        duration="33일"
        desc="역사상 가장 빠른 폭락, 역사상 가장 빠른 회복."
      />

      <ColumnMythFact
        myth="폭락을 피하려면 미리 예측하고 팔아야 한다"
        fact="추세추종은 예측이 아닙니다. 신호가 나온 뒤 따라가도 손실의 절반 이하만 경험했습니다. 200일선 이탈 신호는 대부분의 큰 폭락에서 조기에 나타납니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
