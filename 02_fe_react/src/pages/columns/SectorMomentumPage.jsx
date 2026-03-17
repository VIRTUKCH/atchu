import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnResearchCard,
  ColumnMythFact,
  ColumnCompareTable,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "100년+", label: "검증 기간", desc: "Fama-French 1920년대 데이터 기반" },
  { value: "70%", label: "연간 승률", desc: "buy-and-hold 대비 (Faber 섹터 연구)" },
  { value: "+5.4%p", label: "연간 초과 수익", desc: "vs S&P500 (SSRN Dynamic Sector Rotation, 2023)" },
];

export default function SectorMomentumPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전략 심화"
        title={<>경제 사이클을 예측하지 마라<br />— 이미 강한 섹터를 사라</>}
        desc="섹터 모멘텀 전략. 100년 데이터가 검증한 방법. 예측이 아닌 신호를 따라간다."
      />

      <ColumnCallout label="두 가지 다른 접근법">
        섹터 투자에는 두 가지 방식이 있다.<br /><br />
        <strong>① 예측형</strong>: "지금 경기 회복기니까 기술주를 사자"
        — 사이클 판단이 틀릴 가능성이 높고, 맞아도 타이밍을 놓치기 쉽다.<br /><br />
        <strong>② 모멘텀형</strong>: "지금 가장 강하게 오르는 섹터가 어디인가?"
        — 예측 없이 이미 나온 가격 신호를 따른다.<br /><br />
        100년의 데이터는 ②번이 더 일관된 성과를 냈음을 보여준다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnCompareTable
        columns={["섹터 ETF", "2022년 성과", "비고"]}
        rows={[
          ["XLE (에너지)", { value: "+64.2%", highlight: true }, { value: "2022년 최강 섹터" }],
          ["XLI (산업재)", { value: "-5.5%" }, { value: "방어적" }],
          ["XLK (기술)", { value: "-27.7%" }, { value: "에너지와 91.9%p 격차" }],
          ["XLC (통신서비스)", { value: "-38.0%", bad: true }, { value: "2022년 최약 섹터" }],
        ]}
      />

      <ColumnCallout label="2022년 — 같은 시장, 102%p 격차">
        2022년 에너지(XLE)는 <strong>+64%</strong>, 통신서비스(XLC)는 <strong>-38%</strong>.
        같은 해 같은 미국 시장에서 격차가 102%p에 달했다.<br /><br />
        이 차이를 경제 사이클 예측으로 맞추는 것은 불가능에 가깝다.
        하지만 모멘텀 신호는 2021년 말 이미 에너지의 강세를 가리키고 있었다.
        이미 나온 신호를 따랐다면 이 격차를 활용할 수 있었다.
      </ColumnCallout>

      <ColumnResearchCard
        source="SSRN"
        year="2023"
        title="Dynamic Sector Rotation Strategy"
        stat="S&P500 대비 +5.4% 연간 초과 수익, 샤프 비율 약 4배"
      >
        2023년 발표된 이 연구는 SPDR 섹터 ETF를 대상으로 동적 섹터 로테이션 전략을 백테스트했다.
        Fama-French 5팩터 알파를 기반으로 섹터를 선정하면 S&P500 대비 연 5.4% 초과 수익이 났고,
        경기 사이클 정보를 추가로 결합하면 초과 수익이 연 7.1%까지 올라갔다.
        특히 샤프 비율이 약 4배 높았다 — 수익률뿐 아니라 리스크 조정 후에도 우월했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Cambria / Fama-French Data Library"
        year="2010"
        title="Relative Strength Strategies for Investing (섹터 부문)"
        author="Mebane T. Faber"
        stat="1920년대부터 80년+ 백테스트 — 연간 약 70%의 기간에서 buy-and-hold 초과"
      >
        Faber는 Fama-French의 산업·섹터 데이터를 활용해 1920년대부터 수십 년을 백테스트했다.
        최근 수익률이 높은 섹터를 사는 단순한 모멘텀 전략이
        전체 기간의 약 70%에서 단순 보유 전략을 앞섰다.
        수익률뿐 아니라 리스크 조정 후 성과도 우월했다.
        AQR의 "Value and Momentum Everywhere(2013)"는 이 효과가 섹터·자산군 전반에 걸쳐
        보편적으로 존재함을 확인했다.
      </ColumnResearchCard>

      <ColumnCallout label="실전 전략: 3단계로 실행하기">
        <strong>1단계 — 유니버스 설정</strong><br />
        SPDR 섹터 ETF 11개(XLK·XLE·XLF·XLV·XLC·XLY·XLP·XLI·XLRE·XLB·XLU)를 대상으로 한다.<br /><br />
        <strong>2단계 — 모멘텀 순위 산출</strong><br />
        매월 말, 각 섹터 ETF의 최근 3~6개월 수익률로 순위를 매긴다.
        1개월은 단기 역전 현상이 있어 역효과가 날 수 있으므로 피한다.<br /><br />
        <strong>3단계 — 상위 섹터 편입</strong><br />
        상위 3~5개 섹터를 동일 비중으로 편입, 월 1회 리밸런싱.
        편입 후보가 200일 이평선 아래에 있다면 해당 비중은 현금 또는 채권으로 대체한다.
      </ColumnCallout>

      <ColumnMythFact
        myth="섹터 투자는 경제 사이클을 정확히 예측해야만 수익을 낼 수 있다"
        fact="100년 데이터에서 경제 예측 없이 모멘텀 신호만 따른 전략이 S&P500을 연 5% 이상 앞섰다. 예측 정확도가 아니라 규칙 준수가 핵심이다."
      />

      <ColumnCallout label="주의사항">
        단기 모멘텀(1개월)은 역전 현상(Short-term Reversal)이 있어 오히려 역효과가 날 수 있다.
        3~12개월 중간 기간이 가장 안정적이다.<br />
        섹터 전환 시 매매비용과 세금이 누적될 수 있다.<br />
        <strong>실제로 많은 섹터 로테이션 펀드가 인덱스를 하회한다
        — 전략의 문제가 아니라 실행 규율의 문제다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
