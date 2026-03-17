import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnKeyFact,
  ColumnKeyFactGrid,
  ColumnSectionTitle,
  ColumnPullQuote,
  ColumnBackLink,
} from "../../components/column";

export default function PeterLynchWarningPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title={<>피터 린치의 경고:<br />'상위 30일을 놓치면 수익이 반토막'</>}
        desc="1997년 $100,000 투자. 최고 상승 30일만 놓쳤을 때 $153,792 vs 보유 시 $341,722."
      />

      <ColumnCallout label="피터 린치가 30년 운용 후 내린 결론">
        피델리티 마젤란 펀드를 13년간 운용하며 연평균 29.2%를 달성한 피터 린치.
        그는 은퇴 후 개인 투자자들에게 강조했습니다.
        "시장 타이밍을 맞추려는 시도가 장기 수익을 파괴한다.
        시장 밖에 있는 것이 가장 비싼 선택이 될 수 있다."
      </ColumnCallout>

      <ColumnKeyFactGrid>
        <ColumnKeyFact value="$341,722" label="1997년 $10만 전체 보유" desc="S&P500 1997~2012년 보유" />
        <ColumnKeyFact value="$153,792" label="상위 30일을 놓친 경우" desc="나머지 기간 보유" variant="bad" />
        <ColumnKeyFact value="-55%" label="30일 놓침으로 인한 손실" desc="전체 보유 대비" variant="bad" />
      </ColumnKeyFactGrid>

      <ColumnCallout label="상위 30일의 절반은 하락장 바닥 근처">
        더 충격적인 사실이 있습니다.
        역사적으로 최고 상승일의 약 절반은 시장이 하락하는 기간 동안 발생했습니다.
        하락장에서 공포로 팔고 나오면, 가장 중요한 반등 날을 놓칠 가능성이 높습니다.
        <strong>하락장에서 팔고 나오는 것이 왜 위험한지를 수치로 보여주는 데이터입니다.</strong>
      </ColumnCallout>

      <ColumnSectionTitle>다른 관점: 큰 하락을 피하는 것이 더 중요하다</ColumnSectionTitle>

      <ColumnCallout label="저명한 투자자들 사이에서도 관점은 나뉩니다">
        피터 린치의 말에는 일리가 있습니다.
        그러나 모든 위대한 투자자가 같은 결론을 내린 것은 아닙니다.
        "시장에 머물러라"는 관점만큼이나, "큰 손실을 피하는 것이 먼저"라는
        관점도 오랜 데이터로 뒷받침됩니다.
      </ColumnCallout>

      <ColumnPullQuote
        attribution="Mebane Faber"
        role={<>{"A Quantitative Approach to Tactical Asset Allocation"} 저자</>}
      >
        10개월 이평선 위에 있을 때만 보유하면, 수익률은 비슷하면서 최대 낙폭은 절반으로 줄어든다.
      </ColumnPullQuote>

      <ColumnPullQuote
        attribution="Howard Marks"
        role="Oaktree Capital Management 공동 창립자"
      >
        훌륭한 투자자는 맞는 것보다 틀리지 않는 것을 더 중요하게 생각한다.
      </ColumnPullQuote>

      <ColumnCallout label="두 관점 모두 데이터로 뒷받침된다">
        린치의 데이터는 사실입니다. 상위 30일을 놓치면 수익이 줄어듭니다.
        동시에 파버의 데이터도 사실입니다. 최악의 하락일을 피하면 드로다운이 절반으로 줄어듭니다.
        추세추종은 상위 상승일 일부를 놓치는 대가를 치르고, 대신 대폭락의 손실을 제한합니다.
        <strong>어떤 리스크를 감수할 것인지는 투자자의 선택입니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
