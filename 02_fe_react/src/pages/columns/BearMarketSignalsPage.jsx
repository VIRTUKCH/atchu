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
  ColumnCompareTable,
  ColumnMythFact,
  ColumnWarningCard,
  ColumnCardList,
  ColumnPersonCard,
  ColumnQuote,
  ColumnHighlight,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "100%",
    label: "수익률 곡선 역전의 침체 선행 기록",
    desc: "1960년 이후 모든 경기침체 전 2s10s 역전 발생 (NY Fed)",
  },
  {
    value: "230%",
    label: "2026년 1월 버핏 지수",
    desc: "60년 만에 역대 최고. 이 수준 도달 후 3번 모두 S&P -25%+ 하락",
  },
  {
    value: "71%",
    label: "마진 부채 고점 후 1년 내 S&P 하락 확률",
    desc: "1999·2007·2021년 고점 분석 (Advisor Perspectives)",
  },
];

const LEGENDS = [
  {
    name: "스탠리 드러켄밀러",
    sub: "소로스 펀드 수석 매니저, 퀀텀 펀드",
    quote:
      "밸류에이션으로 타이밍을 잡지 않습니다. 유동성 + 기술적 분석 + 펀더멘털, 3중 확인이 제 방법입니다.",
    highlight:
      "2021년 말: ①밸류에이션 극단화 ②연준 긴축 전환 ③시장 폭 약화라는 세 가지 신호가 동시에 켜졌다. 그는 채권·주식을 공매도하고 원유·금·구리를 매수했다. 2022년 베어마켓을 정확히 포착한 결과였다.",
  },
  {
    name: "마이클 버리",
    sub: "Scion Asset Management, 영화 '빅쇼트' 주인공",
    quote:
      "NYSE 200일 이평선 상위 종목 비율이 13.48%입니다. 2007년 12월과 동일한 수준입니다.",
    highlight:
      "2022년 9월 버리의 발언. S&P 500 지수가 아직 안정적으로 보여도 내부 종목들이 이미 광범위하게 무너지고 있음을 포착하는 시장 폭 지표다. 표면이 아닌 내부를 들여다본다.",
  },
  {
    name: "제레미 그랜섬",
    sub: "GMO 공동창업자, 슈퍼버블 이론가",
    quote:
      "역사상 슈퍼버블이 완전히 붕괴하지 않고 멈춘 사례는 없습니다.",
    highlight:
      "슈퍼버블 기준은 추세 대비 2.5 시그마 이상 이탈. 1929년, 2000년, 2008년이 해당한다. 그랜섬이 경고하는 가장 위험한 구간은 베어마켓 랠리다 — 투자자들이 저점을 착각해 다시 들어오게 만들기 때문이다.",
  },
];

export default function BearMarketSignalsPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title={
          <>
            시장이 무너지기 전에
            <br />
            먼저 무너지는 것들
          </>
        }
        desc="트럭 화물량, 구리-금 비율, 수익률 곡선… 역사적 하락장마다 반복됐던 7가지 경고 카테고리를 저명한 투자자와 논문 근거와 함께."
      />

      <ColumnCallout label="완벽한 예측은 없다. 하지만 신호는 반복됐다">
        어떤 단일 지표도 하락장을 100% 정확하게 예측하지 못한다.
        그럼에도 1929년, 1973년, 2000년, 2008년, 2020년 — 역사적 대하락 앞에는
        공통적으로 반복되는 신호들이 있었다.<br /><br />
        트럭이 덜 달리고, 배가 비어 다니고, 구리 가격이 금에 눌리고,
        단기 금리가 장기 금리를 추월하고, 모두가 빌린 돈으로 주식을 살 때.<br /><br />
        <strong>아래 7개 카테고리는 각각이 '경고'가 아니라, 함께 켜질 때 진짜 경고가 된다.</strong>
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── Section 1: 실물 경제 ── */}
      <ColumnSectionTitle>실물 경제가 먼저 말한다</ColumnSectionTitle>

      <ColumnCallout label="경기 악화는 화물차가 먼저 느낀다 — Cass Freight Index">
        <strong>Cass Freight Index</strong>는 미국 내 트럭 화물 운송량과 지출을 추적하는 지수다.
        연준 FRED에서도 공식 제공한다. 소비재가 공장에서 마트로 이동하고, 원자재가 항구에서
        공장으로 이동하는 모든 흐름이 이 지수에 담긴다.<br /><br />
        화물 운송량이 줄어든다는 것은 팔 물건이 줄었거나, 살 사람이 줄었다는 뜻이다.
        제조업과 소비 위축이 주가에 반영되기 전에 이미 트럭이 먼저 느끼는 것이다.<br /><br />
        <strong>역사적 신호:</strong> 2019년에 Cass Freight Index는 42주 연속 전년 동기 대비 하락을 기록했다.
        시장은 그해 연준의 금리 인하로 안도 랠리를 펼쳤지만, 실물 경제가 내보내던 경고음은 달랐다.
        2023년에는 -10%를 넘어서며 "화물 경기침체(freight recession)"라는 표현이 등장했다.
      </ColumnCallout>

      <ColumnCallout label="바다 위의 공실률 — 발틱 건화물지수(BDI)">
        <strong>발틱 건화물지수(Baltic Dry Index)</strong>는 철광석, 석탄, 곡물 등
        원자재를 실어 나르는 벌크선의 운임 비용이다. 런던 발틱 거래소에서 매일 집계한다.
        선박 용선 수요가 늘면 운임이 오르고, 수요가 줄면 운임이 떨어진다.<br /><br />
        선박은 단기간에 늘리거나 줄일 수 없기 때문에, 운임 급락은 수요가 갑자기 사라졌다는
        가장 직접적인 신호다.<br /><br />
        <strong>2008년 사례:</strong> BDI는 2008년 5월 11,793 포인트로 사상 최고치를 찍은 뒤,
        12월에는 663포인트로 <strong>-94%</strong> 폭락했다. 리먼 브라더스 파산(2008년 9월) 이전부터
        이미 하락이 시작됐다. 글로벌 교역량 붕괴가 주가 붕괴보다 먼저 바다 위에 나타났다.
      </ColumnCallout>

      <ColumnCallout label="Jeffrey Gundlach이 가장 좋아하는 지표 — 구리/금 비율">
        구리는 전자제품, 건설, 인프라 모든 곳에 쓰여 경제 활동의 온도계로 불린다.
        그래서 월가에서는 구리를 "<strong>Dr. Copper</strong>(경제학 박사)"라고 부른다.
        금은 반대로 경기와 무관하게, 불안이 높아질수록 수요가 느는 안전자산이다.<br /><br />
        <strong>구리/금 비율</strong> = 구리 가격 ÷ 금 가격. 이 비율이 하락하면
        산업 수요는 줄고 안전자산 선호가 높아진다는 신호, 즉 위험 회피 국면 진입을 의미한다.<br /><br />
        DoubleLine의 CEO <strong>제프리 건들락(Jeffrey Gundlach)</strong>은 이 비율을
        "가장 좋아하는 선행 지표 중 하나"로 공개적으로 언급해왔다.
        2026년 현재 금/구리 비율은 역사적 경고 수준에 도달해 있다.
      </ColumnCallout>

      {/* ── Section 2: 금융 시스템 ── */}
      <ColumnSectionTitle>금융 시스템의 균열</ColumnSectionTitle>

      <ColumnResearchCard
        title="2s10s 수익률 곡선 역전 — 가장 신뢰받는 침체 예고"
        author="Arturo Estrella & Frederic Mishkin (뉴욕 연준, 1996) / NY Fed 공식 모델"
        year="1960~현재"
        source="NY Fed Recession Probability Model"
        stat="1960년 이후 8번의 모든 경기침체 전 발동. 평균 8~22개월 선행"
      >
        <strong>수익률 곡선 역전</strong>은 단기 금리(2년물 국채)가 장기 금리(10년물 국채)를 초과할 때 발생한다.
        정상적인 경제에서는 장기 금리가 높다. 더 오래 빌려주는 리스크에 대한 보상이다.<br /><br />
        이 관계가 뒤집히면 두 가지를 의미한다. 첫째, 투자자들이 단기 미래를 매우 비관적으로 보고
        장기 채권으로 돈이 몰린다. 둘째, 단기로 자금을 조달해 장기로 대출하는 은행의 수익성이 악화되어
        대출이 줄어든다. 신용 긴축이 경기 둔화로 이어지는 것이다.<br /><br />
        뉴욕 연준은 3개월물-10년물 스프레드를 기반으로 12개월 내 경기침체 확률을 매달 공식 발표한다.
        2006년 1월의 역전은 폭이 -19bp에 불과했지만, 22개월 후 2008년 금융위기가 발발했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="고수익채권 스프레드 — 기업들이 위험해지고 있다"
        author="ICE BofA / FRED"
        year="2007~현재"
        source="ICE BofA US High Yield Index OAS (FRED)"
        stat="2008년 위기: 스프레드 확대가 주가 고점보다 수개월 먼저 시작됨"
      >
        <strong>정크본드 스프레드</strong>는 신용등급이 낮은 기업(BBB 이하)의 채권 금리에서
        미국 국채 금리를 뺀 값이다. 투자자들이 기업 부도 위험을 얼마나 높게 보는지 측정한다.<br /><br />
        스프레드가 갑자기 확대되면 시장이 기업들의 재무 건전성에 의문을 품기 시작했다는 뜻이다.
        주식 투자자들은 아직 낙관적일 때, 채권 시장이 먼저 경고를 내보내는 경우가 많다.
        채권 시장은 주식 시장보다 더 냉정하게 현실을 반영하는 경향이 있기 때문이다.<br /><br />
        2007년 중반부터 스프레드가 확대되기 시작했고, S&P 500이 고점을 찍은 것은
        그보다 수개월 뒤였다. 2020년 3월에는 1,000bp를 넘어서며 공황 수준을 기록했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="M2 통화량 감소 — 1870년 이후 5번째"
        author="FRED / The Motley Fool"
        year="2022~2023"
        source="FRED M2 통화량 데이터"
        stat="2022.4~2023.10: -4.76% 감소. 이전 4회 모두 공황 또는 대침체"
      >
        <strong>M2</strong>는 현금, 요구불예금, 저축예금, MMF 등을 포함하는 광의 통화량이다.
        시중에 돌아다니는 돈의 총량이라고 볼 수 있다.<br /><br />
        M2가 감소한다는 것은 유동성이 줄어드는 것이다.
        살 수 있는 돈이 줄면 자산 가격에 하락 압력이 생긴다.
        역사적으로 M2와 주가는 6~12개월의 시차를 두고 높은 상관관계를 보였다.<br /><br />
        2022년 4월부터 2023년 10월까지 M2는 -4.76% 감소했다.
        1870년 이후 150년 역사에서 다섯 번째로 발생한 사례인데,
        이전 네 번은 각각 1878년, 1893년, 1921년, 1931~1933년 대공황이었다.
        이번이 경기침체 없이 지나간 사실은 역사적으로 이례적인 결과였다.
      </ColumnResearchCard>

      {/* ── Section 3: 밸류에이션 ── */}
      <ColumnSectionTitle>밸류에이션의 극단 — "이미 너무 비싸다"</ColumnSectionTitle>

      <ColumnResearchCard
        title="버핏 지수 — 단일 지표로 가장 좋은 것"
        author="Warren Buffett (Fortune 인터뷰, 2001) / Berkshire Hathaway"
        year="2001~현재"
        source="Wilshire 5000 / 미국 GDP (Current Market Valuation)"
        stat="2026년 1월 230% — 60년 만에 역대 최고. 2.4 표준편차 이탈"
      >
        버핏 지수는 <strong>미국 주식 시가총액 ÷ 명목 GDP</strong>다.
        워런 버핏은 2001년 Fortune 인터뷰에서 이 지표를 "단일 지표로는 주식 시장의 가치를
        판단하는 데 가장 좋은 것"이라고 언급했다.<br /><br />
        지수가 100%라면 주식 시장 크기가 경제 규모와 같다. 200%에 근접하면
        버핏은 "불장난하는 것"이라는 표현을 썼다. 그리고 2026년 1월,
        이 지표는 <strong>230%</strong>를 기록했다. 60년 만에 역대 최고 수준이다.<br /><br />
        버핏의 행동도 말한다. 버크셔 해서웨이의 현금 보유는 2024년 말 기준 사상 최대 수준에 달했다.
        그가 사고 싶은 것을 찾지 못하고 있다는 묵시적 신호다.
        1970년 이후 이 지표가 현재 수준에 도달한 세 번, 그 후 S&P 500은 모두 -25% 이상 하락했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="실러 P/E (CAPE) — 130년 데이터가 말하는 과열 기준"
        author="Robert Shiller (Yale University, 노벨경제학상 2013)"
        year="1870~현재"
        source="Yale Shiller Data / multpl.com"
        stat="현재 CAPE 38 — 130년 역사에서 2번째로 높은 수준. 1위는 2000년 닷컴 버블 44"
      >
        <strong>CAPE(Cyclically Adjusted Price-to-Earnings)</strong>는 현재 주가를
        10년 인플레이션 조정 평균 순이익으로 나눈 값이다.
        단기 실적 변동의 영향을 제거하기 위해 10년 평균을 쓴다.<br /><br />
        실러 교수는 1870년부터 130년의 데이터를 분석해 CAPE가 높을수록
        이후 20년 수익률이 낮다는 강한 역상관관계를 발견했다.
        이 연구로 2013년 노벨경제학상을 수상했다.<br /><br />
        역사적으로 CAPE 30 이상이 지속된 이후에는 반드시 20% 이상의 하락이 따라왔다.
        1929년 직전 CAPE는 32였고, 2000년 닷컴 버블 정점에서는 44에 달했다.
        현재 값인 38은 130년 역사에서 두 번째로 높은 수준이다.
        다만 CAPE는 장기(10년+) 수익률 예측에 유효하며, 단기 타이밍 도구로는 적합하지 않다.
      </ColumnResearchCard>

      {/* ── Section 4: 전설들 ── */}
      <ColumnSectionTitle>전설들이 먼저 움직인다</ColumnSectionTitle>

      <ColumnCallout label="그들의 공통점: 단 하나의 신호로 결정하지 않는다">
        아래 세 투자자는 모두 유명한 하락장 예측으로 알려져 있다.
        하지만 그들의 방법론을 들여다보면 공통점이 있다.
        <strong>단일 지표에 의존하지 않는다.</strong>
        여러 신호가 동시에 켜질 때, 그 때 비로소 확신을 갖고 움직였다.
      </ColumnCallout>

      <ColumnCardList>
        {LEGENDS.map((legend) => (
          <ColumnPersonCard key={legend.name} name={legend.name} sub={legend.sub}>
            <ColumnQuote>{legend.quote}</ColumnQuote>
            <ColumnHighlight>{legend.highlight}</ColumnHighlight>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      {/* ── Section 5: 센티먼트 ── */}
      <ColumnSectionTitle>센티먼트의 역설</ColumnSectionTitle>

      <ColumnCallout label="빌린 돈이 많을수록 낙폭이 커진다 — 마진 부채">
        <strong>마진 부채</strong>는 투자자들이 증권사에서 돈을 빌려 주식을 산 총액이다.
        NYSE에서 매월 집계한다. 마진 부채 자체는 문제가 아니다.
        문제는 이것이 극단적으로 높을 때 발생한다.<br /><br />
        주가가 하락하면 증권사는 담보 부족을 이유로 <strong>마진 콜(추가 증거금 요구)</strong>을 보낸다.
        투자자가 돈을 채우지 못하면 강제 매도가 발생하고, 이 강제 매도가 추가 하락을 만들어
        또 다른 마진 콜을 불러온다. 하락이 하락을 부르는 연쇄 반응이다.<br /><br />
        역사적으로 마진 부채 고점은 S&P 500 고점과 1~3개월 차이를 두고 나타났다.
        2000년, 2007년, 2021년 모두 그랬다. 2025년 12월, 마진 부채는 $1.23조로
        7개월 연속 사상 최고치를 경신하고 있다.
      </ColumnCallout>

      <ColumnCallout label="모두가 낙관할 때가 가장 위험하다 — AAII 투자자 감성">
        <strong>AAII 투자자 감성 조사</strong>는 1987년부터 매주 개인 투자자들에게
        "향후 6개월 주식 시장 방향"을 묻는다. 역사적 평균은 강세 38.8%, 약세 30.6%다.<br /><br />
        이 지표는 역설적으로 읽어야 한다.
        강세 비율이 극단적으로 높으면 경고 신호고,
        약세 비율이 극단적으로 높으면 오히려 매수 기회다.<br /><br />
        <strong>두 극단의 사례:</strong><br />
        · 2000년 1월 6일: 강세 75% → 닷컴 버블 정점, 이후 S&P -49%<br />
        · 2009년 3월 5일: 약세 70.3% (역대 최고) → 정확히 베어마켓 바닥, 이후 대세 강세장 시작<br /><br />
        군중이 한 방향으로 몰릴수록, 반대 방향을 살펴봐야 한다.
      </ColumnCallout>

      <ColumnCallout label="공포 지수가 낮을 때 더 조심해야 한다 — VIX의 역설">
        <strong>VIX(변동성 지수)</strong>는 S&P 500 옵션에 내재된 30일 예상 변동성을 나타낸다.
        "공포 지수"라고 불리지만, 역설적으로 낮은 VIX가 더 위험할 수 있다.<br /><br />
        VIX가 오랫동안 낮게 유지된다는 것은 투자자들이 위험을 과소평가하고 있다는 신호다.
        모두가 안심하고 있을 때, 시장은 작은 충격에도 크게 흔들릴 준비가 되어 있는 것이다.<br /><br />
        <strong>반대로 VIX가 극단적으로 높을 때</strong> — 40 이상의 공황 수준 —는
        역설적으로 바닥에 가까워지고 있다는 신호일 수 있다.
        2008년 VIX 80, 2020년 VIX 85는 모두 직후 저점이자 이후 강세장의 출발점이었다.
      </ColumnCallout>

      {/* ── Section 6: 경제 선행 지표 ── */}
      <ColumnSectionTitle>경제학자들이 쓰는 선행 지표</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem
          year="Conference Board LEI"
          title="10개 지표의 복합 신호 — 평균 7개월 선행"
        >
          컨퍼런스 보드의 <strong>선행 경제 지수(LEI)</strong>는 건축 허가, ISM 신규 주문,
          주식 가격, 신용 스프레드, 소비자 기대치 등 10개 지표를 종합한 복합 지수다.
          경기침체보다 평균 7개월 먼저 하락하는 경향이 있다.<br /><br />
          실무에서는 "3D 규칙"을 쓴다: 6개월 확산 지수 ≤ 50이면서
          6개월 변화율이 -4.2% 미만이면 경보. 2023~2024년에 18개월 중 15개월이 하락했지만
          미국 경제는 연착륙에 성공했다. 허위 신호 가능성도 항상 존재한다.
        </ColumnTimelineItem>

        <ColumnTimelineItem
          year="샴 룰 (Sahm Rule)"
          title="실업률 기반 — 1950년 이후 11번 침체 중 11번 발동"
        >
          전 연준 이코노미스트 <strong>클라우디아 샴(Claudia Sahm)</strong>이 개발한 룰이다.
          3개월 실업률 이동평균이 과거 12개월 최저점보다 <strong>0.5%p 이상</strong> 상승하면
          경기침체가 시작됐다고 판단한다.<br /><br />
          1950년 이후 11번의 모든 경기침체 때 발동했고, 허위 신호는 2회에 불과하다.
          다만 후행성이 있다 — 침체 시작 후 평균 3개월 뒤에 발동한다.
          2024년에는 이민자 유입으로 노동 공급이 늘면서 발동했지만 실제 침체는 오지 않았다.
        </ColumnTimelineItem>

        <ColumnTimelineItem
          year="ISM 제조업 PMI"
          title="50선이 분기점 — 26개월 연속 수축의 의미"
        >
          <strong>ISM 제조업 구매관리자지수(PMI)</strong>는 매월 400개 이상 제조업체에
          신규 주문, 생산, 고용 등을 조사한다. 50 이상은 확장, 50 미만은 수축을 의미한다.<br /><br />
          2022년 11월부터 2024년 12월까지 <strong>26개월 연속</strong> 50을 하회했다.
          사상 최장 수축 기간이었다. 그럼에도 서비스업과 소비가 경제를 지탱하면서
          전면적인 침체로 번지지 않았다. PMI 하나만으로 시장을 판단하는 것의 한계를 보여준다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      {/* ── Section 7: 요약 테이블 ── */}
      <ColumnSectionTitle>지표 요약 — 언제 경고등이 켜지나</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["지표", "경고 신호", "선행 기간", "신뢰도"]}
        rows={[
          ["수익률 곡선 역전 (2s10s)", { value: "음수 전환" }, { value: "8~22개월", highlight: true }, { value: "높음" }],
          ["고수익채권 스프레드", { value: "급격 확대" }, { value: "수개월", highlight: true }, { value: "높음" }],
          ["Conference Board LEI", { value: "6개월 연속 하락" }, { value: "7개월" }, { value: "중간~높음" }],
          ["CAPE 비율", { value: "30 초과 지속" }, { value: "5~10년 (장기)" }, { value: "높음 (장기)" }],
          ["버핏 지수", { value: "200% 초과" }, { value: "불확실 (장기)" }, { value: "중간" }],
          ["M2 감소", { value: "YoY 2%+ 감소" }, { value: "6~12개월" }, { value: "높음 (이론)" }],
          ["구리/금 비율", { value: "급격 하락" }, { value: "수개월" }, { value: "중간~높음" }],
          ["Cass Freight Index", { value: "YoY 지속 감소" }, { value: "1~3개월" }, { value: "중간" }],
          ["마진 부채", { value: "고점 후 반전" }, { value: "1~3개월" }, { value: "중간" }],
          ["AAII 강세 비율", { value: "60% 초과" }, { value: "단기 반대 지표" }, { value: "중간" }],
        ]}
      />

      {/* ── MythFact ── */}
      <ColumnMythFact
        myth="하나의 지표가 아직 안 울리면 괜찮다"
        fact="역사적 대하락은 단일 지표가 아니라 '신호의 축적'으로 왔다. 2008년엔 수익률 곡선 역전 + 고수익채권 스프레드 확대 + 주택가격 하락이 동시에 발생했다. 드러켄밀러가 '3중 확인'을 고집하는 이유가 바로 이것이다."
      />

      {/* ── WarningCard ── */}
      <ColumnWarningCard
        title="추세추종자에게 하락장 예측이 필요한가"
        example="1929~2026년, 완벽한 단일 예측 지표는 존재하지 않았다"
      >
        위 지표들은 경고를 주는 것이지, 정확한 타이밍을 알려주지 않는다.
        CAPE 비율은 10년 전부터 "비싸다"고 했지만 시장은 계속 올랐다.
        M2는 감소했지만 미국 경제는 연착륙했다. 샴 룰은 발동했지만 침체는 오지 않았다.<br /><br />
        추세추종 관점에서는 이 모든 예측보다
        <strong>"이미 200일 이평선을 이탈했는가"</strong>가 더 확실한 기준이다.<br /><br />
        위의 지표들이 필요한 이유는 다른 데 있다.
        이평선 이탈이 왔을 때, 그것이 왜 발생했는지 이해하고 흔들리지 않도록 해주는 것이다.
        근거를 알면 패닉에 빠져 잘못된 결정을 내릴 확률이 낮아진다.
      </ColumnWarningCard>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
