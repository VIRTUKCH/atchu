import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnQuote,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnStepList,
  ColumnStepItem,
  ColumnResearchCard,
  ColumnCrisisCard,
  ColumnCompareTable,
  ColumnMythFact,
  ColumnWarningCard,
  ColumnTipBox,
  ColumnHighlight,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "-18.1%",
    label: "2022년 S&P 500 연간 수익률",
    desc: "Fed 기준금리 0%→4.5% 인상 — 2008년 이후 최악의 해",
  },
  {
    value: "21.71%",
    label: "1981년 미국 기준금리 최고점",
    desc: "볼커 긴축 — 금리-주가 역관계가 가장 극명하게 나타난 시기",
  },
  {
    value: "-2%/년",
    label: "1970년대 S&P 500 실질 연평균 수익률",
    desc: "금리 4→14% 구간, 명목 수익은 있었으나 인플레 감안 시 10년간 마이너스",
  },
];

export default function InterestRatePage() {
  return (
    <ColumnPage>
      {/* 1. 헤더 */}
      <ColumnHero
        tag="거시경제"
        title={<>금리는 주가의 중력이다<br />— 버핏이 말한 "중력"의 의미</>}
        desc="금리가 오르면 주가는 왜 떨어지는가. DCF 이론부터 볼커 쇼크·2022년 Fed 인상까지, 이론·역사·전설적 투자자의 시각으로 읽는 금리-주가 관계의 모든 것."
      />

      {/* 2. 버핏 인용문 */}
      <ColumnQuote en="Interest rates act on financial valuations the way gravity acts on matter. The higher the rate, the greater the downward pull.">
        금리는 물체에 중력이 작용하듯 금융 자산의 가치에 작용한다. 금리가 높을수록 중력도 강해진다.
      </ColumnQuote>

      {/* 3. 핵심 명제 */}
      <ColumnCallout label="금리가 오를 때 주가가 떨어지는 것은 우연이 아니다">
        많은 투자자들이 금리 인상 국면에서 주가 하락을 직관적으로 경험한다.
        그러나 "왜"를 정확히 이해하는 사람은 드물다.<br /><br />
        이 관계는 세 가지 서로 다른 경로로 작동하며, 각각 독립적으로 주가를 압박한다.
        이론적으로는 수십 년 전에 검증됐고, 역사적으로는 세 차례 이상 반복 확인됐으며,
        가장 위대한 투자자들이 이를 투자 원칙의 핵심으로 삼았다.<br /><br />
        <strong>금리를 이해하면 현재 시장의 위치가 보인다. 추세추종은 그 위치에서 가장 단순하고 강력한 행동 원칙을 제공한다.</strong>
      </ColumnCallout>

      {/* 4. 통계 */}
      <ColumnStatGrid stats={STATS} />

      {/* 5. 이론 — DCF & Fed Model */}
      <ColumnSectionTitle>이론 — 왜 수학적으로 필연인가</ColumnSectionTitle>

      <ColumnCallout label="Gordon Growth Model: 주가는 미래 현금흐름의 현재가치">
        주식의 가치는 기업이 미래에 창출할 현금흐름을 현재가치로 환산한 합계다.<br /><br />
        <strong>주가 = 미래 현금흐름 ÷ 할인율</strong><br /><br />
        여기서 할인율은 <strong>무위험 금리 + 리스크 프리미엄</strong>으로 구성된다.
        무위험 금리가 올라가면 할인율이 올라가고, 분모가 커지면 결과값(주가)은 내려간다.
        이것은 수학적 필연이다. 이론이 아닌 정의(definition)다.<br /><br />
        10년 후 $100을 받기로 되어 있다고 가정하자. 금리가 2%면 현재가치는 $82다.
        금리가 5%면 현재가치는 $61다. 같은 미래 수익인데, 금리 3%p 상승만으로 현재가치가 25% 하락한다.
      </ColumnCallout>

      <ColumnCallout label="Fed Model — 주식 수익률과 국채 수익률의 경쟁">
        1997년 Yardeni Research의 Ed Yardeni가 명명한 Fed Model은
        S&P 500의 주당순이익 수익률(E/P)과 10년물 미국 국채 수익률 사이의 강한 양의 상관관계를 설명한다.<br /><br />
        투자자들은 항상 더 나은 수익을 쫓는다. 국채 수익률이 4%일 때 주식 수익률이 3%라면,
        돈은 주식에서 채권으로 이동한다. 이 자금 이동이 주가를 낮추고 채권 가격을 올리며
        두 수익률이 균형점으로 수렴한다.<br /><br />
        <strong>금리 인상 → 국채 수익률 상승 → 주식 상대 매력 하락 → 주가 하락 압력.</strong>
        이것이 Fed Model이 설명하는 경쟁 구조다.
      </ColumnCallout>

      {/* 6. 3가지 경로 */}
      <ColumnSectionTitle>금리가 주가를 압박하는 3가지 경로</ColumnSectionTitle>

      <ColumnStepList>
        <ColumnStepItem step="1" title="할인율 효과 — 미래 수익의 현재가치 감소">
          DCF 공식의 직접 효과다. 금리가 오르면 미래에 기업이 벌 돈의 현재가치가 줄어든다.
          특히 수익이 먼 미래에 집중된 성장주(기술주)가 가장 크게 타격을 받는다.
          2022년 나스닥이 S&P 500보다 훨씬 더 많이 떨어진 이유가 바로 이것이다.
        </ColumnStepItem>
        <ColumnStepItem step="2" title="기업이익 경로 — 차입비용 증가로 실적 악화">
          금리 인상은 기업의 이자비용을 직접 올린다. 부채 비율이 높은 기업은 이자 부담이 늘어
          순이익이 줄어든다. 소비자 대출 금리도 올라 가계 소비가 감소하고, 이는 기업 매출 감소로 이어진다.
          할인율 효과와 달리 이 경로는 실제 이익 수치를 낮추는 실질적인 충격이다.
        </ColumnStepItem>
        <ColumnStepItem step="3" title="대체자산 효과 — 채권으로의 자금 이동">
          금리 인상으로 국채·예금 수익률이 올라가면 주식의 상대적 매력이 떨어진다.
          리스크를 지고 주식을 보유하는 대신 국채에서 안정적 수익을 얻을 수 있기 때문이다.
          2022년 10년물 금리가 4%를 넘었을 때 "TINA(There Is No Alternative·주식 외 대안 없음)"
          내러티브가 붕괴된 것이 바로 이 효과다.
        </ColumnStepItem>
      </ColumnStepList>

      {/* 7. 저명한 투자자 3인 */}
      <ColumnSectionTitle>저명한 투자자들이 본 금리와 주가</ColumnSectionTitle>

      <ColumnResearchCard
        title="'모든 가치평가는 결국 금리로 돌아온다' — 금리를 투자의 절대 변수로"
        author="Warren Buffett (버크셔 해서웨이 회장)"
        year="1994 / 2001 / 2018"
        source="버크셔 주주서한 / Fortune 인터뷰 / CNBC Squawk Box"
        stat="1982년 '금리 15% 환경에서 P/E 20배는 어리석다' — 그 해 주식 시장은 역사적 저점에서 반등 시작"
      >
        버핏은 수십 년에 걸쳐 일관되게 같은 메시지를 전달해왔다.
        "금리는 자산에 중력과 같다." "모든 투자는 금리 대비 상대적 매력으로 평가된다."
        "금리가 낮은 환경에서는 높은 주가 배수가 정당화된다."<br /><br />
        1982년 금리가 15%에 달하던 시기, 버핏은 "이 환경에서 P/E 20배를 정당화하는 것은 어리석다"고
        공개적으로 발언했다. 반대로 저금리 환경이었던 2010년대에는 높은 주가 배수가 타당할 수 있다고
        판단하며 대규모 매수를 집행했다.<br /><br />
        그의 접근법은 단순하다: 현재 금리 수준에서 이 기업의 미래 현금흐름이 충분한 수익률을 제공하는가.
        금리는 그 판단의 기준점이다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="'실질금리는 경제성장률을 따른다' — 저금리 시대 높은 P/E의 이론적 근거"
        author="Jeremy Siegel (펜실베니아 대학교 와튼 스쿨 교수, 'Stocks for the Long Run' 저자)"
        year="1994 / 2021"
        source="Stocks for the Long Run (1994) / WSJ 칼럼"
        stat="저금리 환경(2010~2021)에서 S&P 500 P/E 30배 이상 — 시겔은 이를 '과열'이 아닌 '정당한 재평가'로 분석"
      >
        와튼 스쿨의 제러미 시겔 교수는 주식 장기 투자의 가장 강력한 학문적 지지자다.
        그는 200년 데이터를 분석해 주식이 장기적으로 가장 우수한 자산임을 증명했다.<br /><br />
        금리와 주가에 관한 그의 핵심 주장: <strong>실질금리는 장기적으로 실질 경제성장률 수준으로 수렴한다.</strong>
        경제가 잘 성장하면 실질금리도 오르고, 반대도 성립한다.<br /><br />
        2010년대 저금리 환경에서 그는 높은 P/E를 정당화했다.
        금리가 2%일 때 P/E 30배는, 금리가 6%일 때 P/E 15배와 비슷한 주가 수준이라는 논리다.
        단, 그는 금리 인상 국면 진입 시 고 P/E 자산에서의 리스크를 명확히 경고했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="부채 사이클 프레임 — 금리 인상이 경제 붕괴를 촉발하는 메커니즘"
        author="Ray Dalio (Bridgewater Associates 창업자, 'Principles' 저자)"
        year="2018 / 2021"
        source="'A Template for Understanding Big Debt Crises' (2018) / LinkedIn 에세이"
        stat="부채 사이클의 4단계: 확장 → 고점 → 수축 → 충격 — 수축은 항상 금리 인상으로 시작"
      >
        레이 달리오의 프레임은 더 넓다. 그는 단기 사이클과 장기 부채 사이클을 구분하며,
        금리 인상이 어떻게 시스템 전체를 압박하는지 설명한다.<br /><br />
        핵심 메커니즘: 경기 확장기에 부채가 쌓인다. 금리 인상이 시작되면
        부채 상환 비용이 증가하고 가처분 소득이 줄어든다.
        기업은 투자를 축소하고, 소비자는 소비를 줄인다.
        이 악순환이 자산 가격 하락을 가속화한다.<br /><br />
        달리오는 특히 <strong>부채 수준이 높은 경제일수록 금리 인상의 충격이 더 크다</strong>고 강조한다.
        2022년 Fed의 급격한 금리 인상이 실리콘밸리은행(SVB) 붕괴로 이어진 것은
        그의 프레임이 예측한 경로였다.
      </ColumnResearchCard>

      {/* 8. 역사적 사례 */}
      <ColumnSectionTitle>역사가 반복한 3번의 증거</ColumnSectionTitle>

      <ColumnCrisisCard
        year="1972~1982"
        name="스태그플레이션 — 금리와 인플레이션의 동시 충격"
        drawdown="S&P 500 실질수익률 -2%/년 (10년간)"
        duration="약 10년"
        recovery="1982년 볼커 긴축 완료 후 역사적 강세장 시작"
      >
        베트남 전쟁 비용과 오일 쇼크가 겹치면서 미국 기준금리는 4%에서 14%까지 치솟았다.
        주가는 명목상 오르는 것처럼 보였으나, 인플레이션을 감안한 실질 수익률은 10년간 연 -2%였다.
        금리가 높을수록 미래 수익의 현재가치가 줄어들고, 동시에 높은 인플레이션이 실질 구매력을 잠식했다.
        이 시기가 "주식으로 돈을 못 버는 시대"의 대표 사례로 남아 있다.
      </ColumnCrisisCard>

      <ColumnCrisisCard
        year="1979~1982"
        name="볼커 쇼크 — 인플레 잡기 위한 금리 21.71%"
        drawdown="S&P 500 최고점 대비 -27% (1980~1982)"
        duration="이중 침체(Double Dip Recession) 2번 연속"
        recovery="1982년 8월 이후 역대 최장 강세장 시작"
      >
        폴 볼커 Fed 의장은 인플레이션을 잡기 위해 기준금리를 11%에서 21.71%까지 올렸다.
        역사상 가장 극단적인 긴축이었다. 그 결과 미국 경제는 1980년과 1981~82년 두 번의 침체를 겪었고,
        실업률은 10.8%까지 치솟았다. 그러나 볼커의 긴축이 성공적으로 인플레이션을 꺾은 후,
        금리가 내려오기 시작하자 주가는 1982년 8월부터 역사적 강세장을 시작했다.
        금리 인상의 고통이 가장 컸던 시점이 주식의 역사적 매수 기회였다는 역설이다.
      </ColumnCrisisCard>

      <ColumnCrisisCard
        year="2022"
        name="2022년 Fed 인상 — 40년 만에 가장 빠른 속도"
        drawdown="S&P 500 -18.1% / 나스닥 -33.1%"
        duration="2022년 1월~10월 약 9개월"
        recovery="2023년부터 금리 인상 중단 기대감으로 반등 시작"
      >
        2022년 Fed는 기준금리를 0.25%에서 4.5%로 올렸다. 40년 만에 가장 빠른 속도였다.
        1년 만에 금리를 4.25%p 인상한 것은 전례 없는 충격이었다.
        S&P 500은 -18.1%, 나스닥은 -33.1% 하락하며 2008년 이후 최악의 해가 됐다.
        특히 PER이 높은 기술·성장주의 낙폭이 컸다. 할인율 효과가 가장 직접적으로 작용했기 때문이다.
        2023년 3월에는 실리콘밸리은행(SVB)이 금리 급등으로 채권 포트폴리오 손실을 이기지 못하고 파산했다.
      </ColumnCrisisCard>

      {/* 9. 금리 수준별 비교 테이블 */}
      <ColumnSectionTitle>금리 수준별 자산 행동 패턴</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["금리 환경", "S&P 500 밸류에이션", "성장주(기술)", "가치주·배당주", "채권"]}
        rows={[
          [
            "저금리 (0~2%)",
            { value: "고 P/E 정당화 가능", highlight: true },
            { value: "강세 — 미래 수익 현재가치 ↑", highlight: true },
            { value: "상대적 약세" },
            { value: "수익률 낮음" },
          ],
          [
            "중립 (2~4%)",
            { value: "역사적 평균 수준" },
            { value: "보통" },
            { value: "보통" },
            { value: "경쟁력 생김" },
          ],
          [
            "고금리 (4%+)",
            { value: "P/E 압축 압력" },
            { value: "약세 — 할인율 직격" },
            { value: "상대적 강세" },
            { value: "매력 급상승", highlight: true },
          ],
          [
            "급격한 인상 충격",
            { value: "전 섹터 동반 하락" },
            { value: "가장 큰 낙폭" },
            { value: "방어적이나 하락" },
            { value: "기존 보유분 평가손실" },
          ],
        ]}
      />

      {/* 10. 오해와 사실 */}
      <ColumnMythFact
        myth="금리가 오르면 무조건 주식을 팔아야 한다"
        fact="금리 인상 초기(경기 확장 중)에는 기업 실적이 강하면 주가가 오를 수 있다. 2004~2006년 Fed 금리 인상 사이클에서 S&P 500은 꾸준히 상승했다. 문제는 '얼마나 빠르게' '얼마나 높게' 오르느냐다. 2022년처럼 급격하고 큰 인상일 때 충격이 집중된다."
      />

      <ColumnMythFact
        myth="금리와 주가는 항상 반대로 움직인다"
        fact="단기적으로는 자주 역관계를 보이지만 장기적으로는 더 복잡하다. 금리 인상 이유가 '경제가 너무 뜨거워서'라면 기업 실적도 강하다. 금리 인상 이유가 '인플레이션 통제'라면 경기 냉각이 따라온다. 인상의 배경을 읽어야 한다. 단순한 역관계가 아닌 인과 구조로 이해해야 한다."
      />

      {/* 11. 경고 */}
      <ColumnWarningCard
        title="금리를 '예측'해서 투자하려는 함정"
        example="2021년 말 블룸버그 서베이 — 전문가 대부분이 2022년 금리 인상 폭을 1~1.5%로 예상했다. 실제 인상 폭은 4.25%였다"
      >
        월스트리트의 가장 정교한 이코노미스트들조차 금리 방향 예측에 일관되게 실패한다.
        금리 인상을 예측해서 사전에 주식을 팔고, 금리 인하를 예측해서 매수하는 전략은
        "예측 정확도"가 전제되어야 작동한다. 그런데 그 예측은 불가능에 가깝다.<br /><br />
        <strong>금리를 예측하는 것이 아니라, 금리가 이미 시장에 미치는 영향이 추세로 나타나고 있는지를 보는 것이 현실적이다.</strong>
        주가가 200일 이평선 아래로 내려왔다는 것은 금리 인상이든 다른 이유든
        이미 시장이 방향을 바꿨다는 신호다.
      </ColumnWarningCard>

      {/* 12. 추세추종과의 연결 */}
      <ColumnSectionTitle>금리를 이해하면 추세추종이 더 강해진다</ColumnSectionTitle>

      <ColumnCallout label="금리 예측 없이 금리 리스크를 회피하는 방법">
        금리와 주가의 관계를 이해하는 것이 왜 중요한가.
        금리 인상 국면은 추세추종 전략이 가장 빛나는 시점 중 하나이기 때문이다.<br /><br />
        금리 인상 → 주가 하락 → 200일 이평선 하향 이탈 순서로 신호가 순차적으로 나타난다.
        이 신호를 따르는 투자자는 금리를 예측할 필요가 없다.
        시장이 이미 금리의 영향을 받아 추세를 바꾸면, 그 추세가 매수/매도 신호를 제공한다.<br /><br />
        2022년을 돌아보자. Fed가 금리를 급격히 인상하기 시작한 2022년 초,
        S&P 500은 빠르게 200일 이평선 아래로 내려갔다.
        추세추종자는 이 신호에 따라 포지션을 줄이거나 현금을 보유했다.
        "금리가 얼마나 오를지"를 예측하지 않고도 자산을 보호할 수 있었다.
      </ColumnCallout>

      <ColumnTipBox icon="●" title="앗추에서 확인할 수 있는 것">
        현재 S&P 500(SPY)이 200일 이평선 위에 있는지, 아래에 있는지가 금리 리스크의 핵심 지표다.
        금리 인상이 이미 시장에 충분히 반영되어 주가가 바닥을 찍고 200일 이평선을 회복하는 시점이
        역사적으로 가장 좋은 진입 기회였다. 앗추의 추세 신호는 그 시점을 포착하는 도구다.
      </ColumnTipBox>

      {/* 13. 마무리 */}
      <ColumnHighlight>
        금리는 주가의 중력이다. 중력을 이길 수는 없지만, 중력이 바뀌는 방향은 추세에서 먼저 드러난다.
      </ColumnHighlight>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
