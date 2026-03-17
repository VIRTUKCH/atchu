import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnResearchCard,
  ColumnCardList,
  ColumnPersonCard,
  ColumnQuote,
  ColumnHighlight,
  ColumnCompareTable,
  ColumnMythFact,
  ColumnWarningCard,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "6.7%",
    label: "200년 주식 연평균 실질 수익률",
    desc: "Jeremy Siegel (1994) — 1802년부터 2022년까지 인플레이션 차감 후 기준",
  },
  {
    value: "3%",
    label: "인플레이션 분기점",
    desc: "이 수준 이상에서 고인플레이션이 시작되면 주가 부담이 급격히 증가 (IMF WP/21/219)",
  },
  {
    value: "R² 0.76",
    desc: "CPI와 S&P 500 장기 결정계수 — 주요 경제 지표 중 가장 강한 상관관계 중 하나 (FRED 1947-2026)",
    label: "CPI-S&P 500 장기 상관계수",
  },
];

const EXPERTS = [
  {
    name: "워런 버핏",
    nameEn: "Warren Buffett",
    title: "버크셔 해서웨이 회장 · 1977년 Fortune 기고 「How Inflation Swindles the Equity Investor」",
    quote:
      "인플레이션은 입법부가 제정한 어떤 세금보다 훨씬 파괴적인 세금이다. 인플레이션 세금은 자본을 그대로 삼켜버리는 놀라운 능력을 갖고 있다.",
    quoteEn:
      "The arithmetic makes it plain that inflation is a far more devastating tax than anything that has been enacted by our legislatures. The inflation tax has a fantastic ability to simply consume capital.",
    highlight:
      "버핏은 '주식이 곧 인플레이션 헤지'라는 통념을 정면으로 반박했다. 기업은 인플레이션 시기에도 같은 설비를 유지하기 위해 더 많은 자본을 재투자해야 한다 — 이른바 '회사 촌충(Corporate Tapeworm)' 효과다. 핵심은 기업의 가격 전가 능력 유무다. 가격 결정권이 있는 브랜드 기업만 인플레이션을 이긴다.",
  },
  {
    name: "제러미 시겔",
    nameEn: "Jeremy Siegel",
    title: "Wharton School 교수 · 《Stocks for the Long Run》(1994) 저자",
    quote:
      "어떤 30년 기간도 주식의 실질 수익률이 마이너스였던 적이 없다. 주식은 인플레이션을 단순히 따라가는 것이 아니라 넘어선다. 장기 투자자에게 주식은 완벽한 인플레이션 헤지다.",
    quoteEn:
      "No thirty-year period since 1861 has shown a negative real return on stocks. Equities do not simply keep up with inflation — they surpass it. For the long-term investor, stocks are a perfect inflation hedge.",
    highlight:
      "시겔의 핵심 주장: 단기(1-3년)에서 고인플레이션은 주가를 누를 수 있다. 그러나 5년 이상 장기 지평에서는 주식이 인플레이션을 넘어선다. 1802년부터 220년 데이터에서 연 6.7% 실질 수익률이 유지됐다 — 금융위기, 전쟁, 스태그플레이션을 모두 거친 후에도.",
  },
];

export default function CpiStockMarketPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title={<>CPI가 오르면 주가는 내려간다<br />— 진실과 오해</>}
        desc="인플레이션과 주가의 관계 — 200년 데이터와 학술 연구가 보여주는 더 복잡한 그림"
      />

      <ColumnCallout label="가장 많이 오해받는 거시경제 명제">
        "CPI가 오르면 주식을 팔아야 한다."<br /><br />
        이 문장은 절반만 맞다. 고인플레이션 국면에서 주가가 단기 압박을 받는 것은 사실이다.
        그런데 200년 역사 전체를 보면 주식은 인플레이션을 <strong>압도적으로 이겨온</strong> 자산이다.<br /><br />
        핵심은 두 가지다: <strong>인플레이션의 수준</strong>과 <strong>투자 시간 지평</strong>.
        이 두 변수를 무시하면 CPI 발표 때마다 잘못된 결정을 내리게 된다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>CPI란 무엇인가</ColumnSectionTitle>

      <ColumnCallout label="소비자물가지수 — 시장이 가장 주목하는 경제 지표">
        <strong>CPI(Consumer Price Index, 소비자물가지수)</strong>는 도시 소비자가 구매하는
        재화와 서비스의 가격 변화를 측정하는 지수다. 미국 노동통계국(BLS)이 매월 발표한다.<br /><br />
        측정 항목: 주거비(약 33%), 식품(15%), 교통(15%), 의료(8%), 기타 소비재와 서비스.
        이 바구니의 평균 가격 변화율이 곧 인플레이션율이다.<br /><br />
        <strong>미국 연준의 목표는 2%다.</strong> 이 수준에서 경제는 건강하게 성장할 수 있다.
        2% 아래는 디플레이션 우려, 3% 이상은 긴축 신호로 시장이 인식한다.
      </ColumnCallout>

      <ColumnSectionTitle>이론: 주식은 인플레이션을 이겨야 한다</ColumnSectionTitle>

      <ColumnCallout label="Irving Fisher (1930) — Fisher 효과">
        경제학자 어빙 피셔는 1930년 《The Theory of Interest》에서 이론적 관계를 정립했다.<br /><br />
        <strong>명목 수익률 = 실질 수익률 + 기대 인플레이션</strong><br /><br />
        이 공식에 따르면 기업 이익과 주가는 장기적으로 인플레이션과 함께 상승해야 한다.
        인플레이션이 높아지면 명목 매출·이익도 함께 오르기 때문이다.
        이것이 "주식은 인플레이션 헤지"라는 통념의 이론적 근거다.<br /><br />
        문제는 현실이 단기에서 이 이론과 반대로 움직이는 경우가 많다는 것이다.
      </ColumnCallout>

      <ColumnSectionTitle>현실은 더 복잡하다 — 역사가 증명한 4가지 국면</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="1960년대" title="저인플레이션·강세장 — Fisher 효과 작동">
          CPI 평균 2~3%대, S&P 500은 10년간 약 +120% 상승.
          기업 이익이 완만한 인플레이션과 함께 성장하며 Fisher 효과가 교과서처럼 작동했다.
          이 시기는 "인플레이션과 주가는 함께 오른다"는 믿음이 강화된 황금기였다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1970년대" title="스태그플레이션 — Fisher 효과 붕괴">
          두 번의 오일 쇼크(1973, 1979)로 CPI가 14%대까지 치솟았다.
          S&P 500은 1973~1974년 -48%를 기록했고, 10년 내내 실질 수익률은 마이너스였다.
          인플레이션 급등 + 경기 침체가 동시에 발생하는 스태그플레이션에서 주식은 무력했다.
          이 경험이 "인플레이션 = 주가 하락"이라는 통념을 굳혔다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1980~2000년대" title="디스인플레이션·강세장 — 최고의 조합">
          연준 의장 폴 볼커의 강력한 금리 인상(1980년 연 20%)이 인플레이션을 잡았다.
          CPI가 14%→3%대로 내려오는 동안 S&P 500은 1982~2000년 약 +1,400% 상승.
          인플레이션 하강 + 금리 하강 = 주식 평가 배수(PER) 상승이 겹친 역사적 강세장이었다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2020~2022년" title="고인플레이션 재현 — 역사의 반복">
          코로나 이후 재정·통화 부양책으로 CPI가 2022년 6월 9.1%까지 치솟았다.
          연준은 2022~2023년 기준금리를 0.25%에서 5.5%로 급격히 인상.
          S&P 500은 2022년 -18.1%를 기록했다.
          그러나 인플레이션이 잡히기 시작한 2023년, 시장은 +26.3%로 반등했다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnSectionTitle>학술 연구가 밝혀낸 진실</ColumnSectionTitle>

      <ColumnResearchCard
        title="Stock Returns, Real Activity, Inflation, and Money"
        author="Eugene Fama (시카고대학교 교수, 2013년 노벨 경제학상 수상자)"
        year="1981"
        source="Journal of Finance, Vol. 36, No. 4"
        stat="단기(1~3년) 주식 수익률과 CPI는 음(-)의 상관관계 — 인플레이션이 높을수록 단기 주가 부진"
      >
        Fama는 1953~1977년 데이터를 분석하여 단기 주식 수익률과 인플레이션이 음의 상관관계를
        보임을 실증했다. 이는 Fisher 효과와 반대 방향이다.<br /><br />
        핵심 메커니즘: 인플레이션 상승은 미래 경기 침체를 예고하는 신호다.
        기대 인플레이션이 높아지면 연준이 금리를 올리고, 이는 기업 수익과 경제 활동을 위축시킨다.
        주식 시장은 이 미래 침체를 미리 가격에 반영한다.<br /><br />
        <strong>결론: 단기에서 인플레이션과 주가는 적대적이다.</strong>
        이것이 CPI 발표 직후 시장이 하락하는 이유다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="Stock Returns and Inflation: A Long-Horizon Perspective"
        author="Jacob Boudoukh & Matthew Richardson (NYU Stern School of Business)"
        year="1993"
        source="American Economic Review, Vol. 83, No. 5"
        stat="5년 이상 장기 지평에서 주식 수익률과 인플레이션은 양(+)의 상관관계 — Fisher 효과 장기 작동 확인"
      >
        Boudoukh과 Richardson은 1802년부터 1990년까지 190년 데이터를 분석했다.
        단기(1~2년)에서는 Fama의 결론과 같이 음의 상관관계가 나타났다.
        그러나 투자 지평을 5년 이상으로 늘리면 관계가 역전된다.<br /><br />
        <strong>5년 이상: 명목 주식 수익률과 인플레이션 간 양의 상관관계가 유의미하게 나타남.</strong>
        장기에서는 결국 기업 이익이 인플레이션을 반영하며 Fisher 효과가 작동한다.<br /><br />
        실무적 함의: CPI 발표에 반응하여 단기 매매를 반복하면 오히려 손해다.
        장기 보유 투자자에게 인플레이션은 위협이 아니라 자연스러운 배경 변수다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="Stocks for the Long Run: The Definitive Guide to Financial Market Returns"
        author="Jeremy Siegel (Wharton School, 펜실베이니아 대학교 교수)"
        year="1994 (초판) · 2022 (6판)"
        source="McGraw-Hill · CNBC 인터뷰 및 Wharton 강의 자료"
        stat="1802~2022년 220년 연평균 실질 수익률 6.7% — 단 한 번의 30년 기간도 마이너스 없음"
      >
        시겔의 연구는 주식의 장기 인플레이션 극복 능력을 가장 포괄적으로 입증한 저작이다.
        220년에 걸친 데이터에서 미국 주식의 실질(인플레이션 차감) 연평균 수익률은 정확히 6.7%였다.<br /><br />
        비교: 장기 채권 3.5%, 단기 채권 2.7%, 금 0.7%, 달러 현금 -1.4%.
        <strong>주식만이 200년에 걸쳐 구매력을 지속적으로 증가시킨 자산이다.</strong><br /><br />
        시겔은 2022년 고인플레이션 시기에도 이 입장을 유지했다:
        "연준 긴축이 단기 고통을 주지만, 인플레이션이 잡히면 주식은 장기 궤도로 돌아온다."
      </ColumnResearchCard>

      <ColumnSectionTitle>저명 투자자들이 본 CPI와 주식</ColumnSectionTitle>

      <ColumnCardList>
        {EXPERTS.map((inv) => (
          <ColumnPersonCard key={inv.nameEn} name={inv.name} sub={inv.title}>
            <ColumnQuote en={inv.quoteEn}>"{inv.quote}"</ColumnQuote>
            <ColumnHighlight>{inv.highlight}</ColumnHighlight>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      <ColumnSectionTitle>인플레이션 수준에 따른 주가 영향</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["인플레이션 수준", "주가 방향", "역사적 사례", "평가 압박"]}
        rows={[
          [
            "1~2%대 (저인플레이션)",
            { value: "✅ 강세 지지", highlight: true },
            "1990년대, 2010년대",
            { value: "낮음", highlight: true },
          ],
          [
            "2~3%대 (연준 목표 범위)",
            { value: "✅ 중립~긍정" },
            "2015~2019",
            { value: "보통" },
          ],
          [
            "3~5%대 (주의 구간)",
            { value: "⚠ 변동성 증가" },
            "1988~1990, 2021",
            { value: "높음" },
          ],
          [
            "5% 이상 (고인플레이션)",
            { value: "❌ 하락 압력", bad: true },
            "1973~74, 1980, 2022",
            { value: "매우 높음", bad: true },
          ],
        ]}
      />

      <ColumnSectionTitle>왜 고인플레이션이 주가를 누르는가</ColumnSectionTitle>

      <ColumnCallout label="할인율 메커니즘 — 같은 이익도 더 싸게 보인다">
        주식의 이론적 가치는 미래 현금흐름을 현재 가치로 환산한 합이다.<br /><br />
        <strong>주식 가격 = 미래 현금흐름 합계 ÷ 할인율</strong><br /><br />
        CPI가 오르면 연준이 금리를 인상한다. 금리가 오르면 할인율이 높아진다.
        할인율이 높아지면 같은 기업 이익도 현재 가치가 낮아진다 — PER이 수축하는 이유다.<br /><br />
        예시: 기업 이익이 동일하더라도 금리가 2%→5%로 오르면 적정 PER은 50→20으로 줄어들 수 있다.
        이익은 그대로인데 주가는 60% 하락할 수 있는 구조다.<br /><br />
        2022년이 정확히 이 메커니즘이 작동한 해였다.
        S&P 500 기업들의 이익은 견고했지만 PER 수축만으로 지수가 -18.1%를 기록했다.
      </ColumnCallout>

      <ColumnCallout label="인플레이션 방향이 수준만큼 중요하다">
        인플레이션이 높더라도 <strong>정점을 찍고 하락하는 국면</strong>에서 주식은 강하게 반등한다.
        시장은 미래를 선반영하기 때문이다.<br /><br />
        2022~2023년 사례:
        CPI 정점(2022년 6월 9.1%) → CPI 하락 시작 → S&P 500 바닥(2022년 10월) → 2023년 +26.3% 반등.<br /><br />
        <strong>결론: CPI의 절대 수준보다 방향이 더 중요한 경우가 많다.</strong>
        인플레이션이 5%여도 6%에서 내려오는 중이면 시장은 이미 회복을 시작한다.
      </ColumnCallout>

      <ColumnMythFact
        myth="인플레이션이 오르면 주가는 항상 내려간다 — CPI 발표를 보고 매매해야 한다"
        fact="단기(1~3년)에서 고인플레이션은 주가에 부담이다. 그러나 5년 이상 장기에서 주식은 인플레이션을 능가하는 유일한 자산이다. 핵심은 수준(3% 기준)·방향(오름/내림)·시간 지평의 조합이다. CPI 발표 하나로 포지션을 바꾸는 것은 단기 노이즈에 반응하는 것이다."
      />

      <ColumnWarningCard
        title="추세추종 투자자가 주의할 점"
        example="2022년: CPI 9.1% → 연준 금리 0.25%→5.5% → S&P 500 200일선 붕괴 → -18%. 이동평균이 먼저 신호를 줬다"
      >
        고인플레이션 국면에서 이동평균선은 CPI보다 먼저 움직인다.
        연준의 금리 인상이 시장에 반영되는 시차 동안, 200일선이 하향 전환하는 신호가 먼저 나타난다.<br /><br />
        추세추종 전략의 관점에서 CPI 자체보다 더 중요한 질문은 단 하나다:
        <strong>지금 200일 이동평균선 위인가, 아래인가?</strong><br /><br />
        인플레이션이 8%여도 시장이 200일선 위에 있다면 추세는 살아 있는 것이다.
        반대로 인플레이션이 2%여도 200일선 아래라면 추세가 깨진 것이다.
        거시 데이터를 분석하는 능력보다 추세를 따르는 규율이 장기 수익률을 결정한다.
      </ColumnWarningCard>

      <ColumnCallout label="결론: CPI는 주가의 단기 적, 장기 친구">
        Eugene Fama의 단기 음의 상관관계와 Jeremy Siegel의 장기 양의 상관관계 — 두 연구는 모순이 아니다.
        둘 다 옳다. 다만 작동하는 시간 지평이 다를 뿐이다.<br /><br />
        Warren Buffett이 경고하듯, 가격 전가 능력 없는 기업은 인플레이션에 취약하다.
        그러나 Siegel의 데이터가 증명하듯, <strong>시장 전체는 220년에 걸쳐 인플레이션을 압도해왔다.</strong><br /><br />
        CPI 발표 때마다 불안해지는 것은 자연스러운 반응이다.
        그 불안이 단기 매매로 이어지지 않도록 하는 것 — 그것이 장기 투자의 핵심이다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
