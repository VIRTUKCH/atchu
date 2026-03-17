import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnStepList,
  ColumnStepItem,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "12조원", label: "2023년 서학개미 순매수", desc: "해외 주식 직구 규모" },
  { value: "86%", label: "노후 준비 목적", desc: "해외 투자 동기 조사" },
  { value: "60%", label: "20대 ETF 선택", desc: "젊은 세대의 분산 투자 선호" },
];

export default function OverseasInvestorPsychologyPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title="서학개미의 심리: '나만 뒤처질까' 공포가 만든 투자 붐"
        desc="86%가 노후·집 마련 목표. 20대 60%가 ETF 선택. 공포 기반 투자의 실체."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="서학개미는 왜 S&P500에 집중하는가">
        한국 개인 투자자들의 해외 주식 투자는 2020년 코로나 이후 폭발적으로 늘었습니다.
        그런데 투자 동기의 86%가 "노후 준비"와 "집 마련"입니다.
        수익 추구가 아니라 <strong>뒤처지지 않으려는 공포</strong>가 동인이었습니다.
        "주변이 다 투자하는데 나만 안 하면 격차가 벌어진다"는 심리입니다.
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="왜 S&P500인가">
          한국 코스피보다 장기 성과가 압도적으로 우수합니다.
          지난 30년간 S&P500은 연평균 10%, 코스피는 연평균 3~4% 수준이었습니다.
          글로벌 500대 기업의 분산 투자 효과도 한몫합니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="왜 ETF인가">
          개별 종목 선택의 어려움을 피할 수 있습니다.
          비용이 낮고, 분산 효과가 즉각적입니다.
          20대 투자자의 60%가 ETF를 선택한 것은 합리적인 판단입니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="공포 기반 투자의 함정">
          공포로 시작한 투자는 공포로 끝나기 쉽습니다.
          폭락장에서 "이제 다 끝났다"는 공포가 정확히 저점에서 매도를 유발합니다.
          시스템 기반 투자 원칙 없이는 심리에 흔들립니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnCallout label="앗추가 제공하는 것">
        -50% 폭락장에서 아무 데이터 없이 버티는 것은 쉽지 않습니다.
        앗추는 185개 자산의 추세 상태를 한 화면에 정리하여,
        현재 시장이 어떤 상태인지 데이터로 확인할 수 있게 합니다.
        이 데이터를 어떻게 활용할지는 투자자 본인의 판단입니다.
      </ColumnCallout>

      <ColumnMythFact
        myth="모두가 S&P500에 투자하면 거품이 생긴다"
        fact="S&P500은 시가총액 가중 지수로, 500개 기업의 가치를 지속적으로 반영합니다. 거품 여부는 추세와 밸류에이션이 말해줍니다. 이평선이 하향이면 비중 축소, 상향이면 유지하는 규칙이면 충분합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
