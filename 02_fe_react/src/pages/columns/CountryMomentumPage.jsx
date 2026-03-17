import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnResearchCard,
  ColumnMythFact,
  ColumnPersonCard,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "54년", label: "검증 기간", desc: "1970~2024 상위 국가 모멘텀 백테스트" },
  { value: "+2.75%p", label: "연간 초과 수익", desc: "MSCI World 대비 (연 13.09% vs 10.34%)" },
  { value: "40개국+", label: "검증 국가 수", desc: "모멘텀 효과가 확인된 글로벌 시장" },
];

export default function CountryMomentumPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title={<>어느 나라가 오를지 예측하지 마라<br />— 이미 오르고 있는 나라를 사라</>}
        desc="국가 모멘텀 전략. 헤지펀드가 수십 년간 써온 방법을, 이제 개인도 ETF 하나로 쓸 수 있다."
      />

      <ColumnCallout label="모두가 틀린 질문">
        "요즘 어느 나라 주식이 좋을까?"<br />
        이 질문 자체가 틀렸다. 미래를 예측하려는 것이기 때문이다.<br /><br />
        <strong>올바른 질문은 이것이다: "지금 오르고 있는 나라가 어디인가?"</strong><br />
        이미 나온 가격 신호에서 답을 찾는다. 예측이 아닌 추종이다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnResearchCard
        source="SSRN (Social Science Research Network)"
        year="2010"
        title="Relative Strength Strategies for Investing"
        author="Mebane T. Faber"
        stat="국가 모멘텀 전략 — buy-and-hold 대비 약 70% 연간 승률"
      >
        Faber는 글로벌 국가 주가지수를 대상으로 상대 모멘텀(Relative Strength) 전략을 백테스트했다.
        규칙은 단순하다: 최근 수익률 상위 국가 ETF를 매수하고, 하위 국가는 회피한다.
        1970년대부터 수십 년 데이터에서 이 전략은 단순 분산 투자를 꾸준히 앞섰다.
        추세 필터(200일선)를 추가하면 드로다운도 함께 줄어들었다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Journal of Finance"
        year="2013"
        title="Value and Momentum Everywhere"
        author="Clifford Asness · Tobias Moskowitz · Lasse Pedersen (AQR Capital)"
        stat="국가 주식지수·채권·통화·원자재 등 8개 자산군 전반에서 모멘텀 프리미엄 확인"
      >
        AQR(세계 최대 퀀트 헤지펀드 중 하나)의 공동창업자들이 발표한 논문이다.
        미국·영국·유럽·일본 개별 주식부터 국가 주식지수 선물까지 분석했다.
        모멘텀 프리미엄은 어느 하나의 시장에 국한된 현상이 아님을 증명했고,
        국가별 모멘텀 전략은 서로 다른 자산군의 모멘텀과도 높은 상관성을 보였다.
        이는 모멘텀이 심리적·구조적 원인으로 발생하는 보편적 현상임을 시사한다.
      </ColumnResearchCard>

      <ColumnCallout label="전략이 작동하는 이유 — 행동경제학적 설명">
        좋은 뉴스가 나와도 투자자들은 즉각 반응하지 않는다.{" "}
        <strong>과소반응(Under-reaction)</strong>이 일어난다.<br />
        이 지연된 반응이 모멘텀을 만든다. 상승이 지속되면{" "}
        <strong>과잉반응(Over-reaction)</strong>이 붙어 추가 상승이 이어진다.<br />
        국가 단위에서도 이 현상은 동일하게 작동한다.
        Jegadeesh &amp; Titman(1993)이 최초 발견한 이 효과는
        이후 40개국 이상의 시장에서 반복 검증됐다.
      </ColumnCallout>

      <ColumnPersonCard
        name="Meb Faber"
        sub="Cambria Investment Management CEO"
        badge="글로벌 모멘텀 ETF 운용자"
      >
        Faber는 자신의 연구를 실제 ETF로 구현했다.{" "}
        <strong>Cambria Global Momentum ETF(GMOM)</strong>는
        약 50개 글로벌 ETF 중 모멘텀 상위 33%(약 17개)를 선정해 편입한다.
        국가 ETF만이 아니라 채권·원자재·통화 ETF까지 포함하는{" "}
        <strong>멀티에셋 모멘텀 전략</strong>이다.
        200일 이평선 필터를 추가해 절대 모멘텀도 함께 확인한다.
        BlackRock도 같은 아이디어로{" "}
        <strong>iShares International Country Rotation Active ETF(CORO)</strong>를 운용 중이다.
      </ColumnPersonCard>

      <ColumnCallout label="실전 ETF 성과: 이론과 현실의 차이">
        GMOM은 2014년 설정 이후 2025년까지 연 약 5% 수익률을 기록했다.{" "}
        같은 기간 SPY는 연 약 14.5%였다.<br /><br />
        전략 자체의 실패가 아니다.{" "}
        2014~2024는 미국 대형 기술주가 전 세계를 압도한 시기였고,{" "}
        글로벌 분산 전략은 구조적으로 불리한 환경이었다.{" "}
        역사적으로도 이 10년은 모멘텀 전략이 가장 부진했던 기간 중 하나였다.<br /><br />
        또한 모멘텀 전략은 급반전 구간(2020·2023 Magnificent 7 랠리)에서{" "}
        시장이 이미 오른 뒤 뒤늦게 진입하는 구조적 단점이 있다.<br /><br />
        <strong>페이지의 백테스트 수치(연 13.09%)는 학술 전략의 이론적 근거를 보여주는 참고값이다.
        실제 ETF 성과와 다를 수 있으며, 전략을 맹목적으로 따르기 전 현재 시장 환경을 확인해야 한다.</strong>
      </ColumnCallout>

      <ColumnCallout label="실전 전략: 3단계로 실행하기">
        <strong>1단계 — 유니버스 설정</strong><br />
        iShares MSCI 국가 ETF(EWJ·EWG·EWU·EWZ·INDA·EWY·EWA 등) 10~20개를 대상으로 한다.
        신흥국과 선진국은 별도로 관리하는 것이 권장된다.<br /><br />
        <strong>2단계 — 모멘텀 순위 산출</strong><br />
        매월 말, 각 국가 ETF의 최근 6개월(또는 12개월) 수익률로 순위를 매긴다.
        단기(1개월)는 역전 현상이 있으므로 중간 기간이 가장 안정적이다.<br /><br />
        <strong>3단계 — 상위 국가 매수 + 필터 적용</strong><br />
        상위 3~5개 국가 ETF를 동일 비중으로 편입한다.
        단, 해당 ETF가 200일 이평선 아래에 있다면 편입하지 않고 현금 또는 채권을 유지한다.
      </ColumnCallout>

      <ColumnMythFact
        myth="국제 투자는 어느 나라가 오를지 예측할 수 있어야 한다"
        fact="54년 백테스트에서 예측 없이 모멘텀 순위만 따라간 전략이 MSCI World를 연 2.75%p 앞섰다. 예측이 아닌 규칙 준수가 핵심이다."
      />

      <ColumnCallout label="주의사항">
        신흥국(이머징)은 변동성이 크므로 선진국과 별도 유니버스로 관리하는 것이 권장된다.<br />
        월 1회 리밸런싱 시 발생하는 거래비용·세금도 수익률에 영향을 준다.<br />
        모멘텀 전략은 급반전(모멘텀 크래시) 구간에서 단기 손실이 클 수 있다.<br />
        <strong>단독 전략보다 200일선 절대 모멘텀 필터와 함께 쓰는 것이 현실적이다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
