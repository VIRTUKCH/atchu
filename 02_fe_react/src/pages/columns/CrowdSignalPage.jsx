import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnResearchCard,
  ColumnPersonCard,
  ColumnCardList,
  ColumnQuote,
  ColumnHighlight,
  ColumnCompareTable,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnWarningCard,
  ColumnMythFact,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "100년+",
    label: "기록된 패턴의 역사",
    desc: "1929년 Bernard Baruch의 회고록부터 2021년 GameStop 열풍까지 반복",
  },
  {
    value: "68%",
    label: "잡지 표지 역지표 확률",
    desc: "Citigroup 연구(2016). The Economist 표지 44개 분석 결과",
  },
  {
    value: "6.5%p",
    label: "개인 투자자 연간 손실",
    desc: "Barber & Odean (2000). 적극적으로 매매한 개인 vs 시장 평균의 차이",
  },
];

const LYNCH_STAGES = [
  ["1단계 — 바닥", "주식 얘기를 꺼내면 치과 이야기로 화제가 바뀐다", "바닥, 상승 준비 중"],
  ["2단계 — 회복 초기", "'주식은 위험하다'는 말만 나온다", "시장 +15% 안팎"],
  ["3단계 — 상승 중", "모두가 나에게 주식 추천을 받으러 온다", "시장 +30% 안팎"],
  ["4단계 — 고점 신호", "일반인이 오히려 나에게 주식을 추천해준다", "⚠️ 고점 경계"],
];

export default function CrowdSignalPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title={
          <>
            인간 지표: 길거리에서 주식 이야기가
            <br />
            들려오면 팔아라?
          </>
        }
        desc="구두닦이 소년부터 맘카페까지, 100년을 이어온 시장 신호의 실체"
      />

      <ColumnCallout label="모두가 아는 이야기">
        "맘카페에서 주식 이야기가 올라오면 고점 신호다." 한국 주식 커뮤니티에서 자주
        들리는 말이다. 그런데 이 이야기, 한국만의 현상이 아니다. 1929년
        대공황 직전에도 똑같은 일이 있었다. 100년 넘게 반복된 이 패턴을, 조롱
        대신 왜 그런지 이해해보는 것으로 시작해보자.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 1929년 구두닦이 ── */}
      <ColumnSectionTitle>1929년, 구두닦이 소년의 주식 팁</ColumnSectionTitle>

      <ColumnCallout label="Bernard Baruch, 회고록 《Baruch: My Own Story》(1957)">
        "택시 운전사들이 무슨 주식을 사야 한다고 알려줬다. 구두닦이 소년은
        구두를 닦으면서 그날의 금융 뉴스를 요약해줬다. 내 사무실 앞
        길거리 거지까지 팁을 줬다. 내 요리사도 증권 계좌를 갖고 있었고
        시세를 꼼꼼히 추적했다."
      </ColumnCallout>

      <ColumnCallout label="월스트리트의 '고독한 늑대'가 내린 결론">
        당시 최고의 투자자 중 한 명이었던 Bernard Baruch는 이 장면을 보고
        포지션을 전부 정리했다. 그가 남긴 논리는 단순했다.{" "}
        <strong>
          "모두가 투자자가 됐다면, 더 이상 살 사람이 없다."
        </strong>{" "}
        가격은 결국 수요와 공급이다. 살 수 있는 사람이 이미 다 샀다면,
        남은 건 팔 사람뿐이다.
      </ColumnCallout>

      <ColumnTimeline>
        <ColumnTimelineItem year="1929.10.24" title="검은 목요일 — 다우 -11%">
          주가 폭락 첫날. 하루 만에 수십억 달러가 증발했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1929.10.28" title="검은 월요일 — 다우 -13%">
          주말 사이에도 패닉이 가라앉지 않았다. 월요일 개장과 함께 추가 폭락.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1929.10.29" title="검은 화요일 — 다우 -12%">
          사흘 만에 다우 지수는 고점 대비 약 40% 하락. 이후 3년에 걸쳐 -89%까지 내려갔다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1932.07" title="대공황 바닥">
          1929년 9월 고점에서 약 3년 만에 -89%. 회복에는 25년이 걸렸다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      {/* ── 전설들의 관찰 ── */}
      <ColumnSectionTitle>전설이 남긴 관찰들</ColumnSectionTitle>

      <ColumnCardList>
        <ColumnPersonCard
          name="피터 린치"
          sub="피델리티 마젤란 펀드 운용 · 13년간 연 평균 29.2% 수익 · 《One Up On Wall Street》 저자"
        >
          <ColumnQuote en="When the people I meet at cocktail parties start recommending stocks to me, I know it's time to worry.">
            "칵테일 파티에서 만난 사람들이 나에게 주식을 추천하기 시작하면,
            걱정해야 할 때가 됐다는 걸 안다."
          </ColumnQuote>
          <ColumnHighlight>
            린치는 파티에서 나누는 주식 대화의 온도를 시장 사이클의 바로미터로
            활용했다. 그가 책에서 묘사한 4단계 흐름은 아래 표를 참고.
          </ColumnHighlight>
        </ColumnPersonCard>

        <ColumnPersonCard
          name="워런 버핏"
          sub="버크셔 해서웨이 회장 · 60년+ 운용 경력 · 주주서한(~1986년~) 인용"
        >
          <ColumnQuote en="We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.">
            "우리는 단순히, 다른 사람들이 탐욕스러울 때 두려워하고 —
            다른 사람들이 두려워할 때만 탐욕스러워지려 노력한다."
          </ColumnQuote>
          <ColumnHighlight>
            버핏의 이 원칙은 단순히 '역발상'이 아니다. 군중이 낙관적일 때
            자산 가격에는 이미 좋은 소식이 과도하게 반영되어 있다는 가치평가의
            논리다.
          </ColumnHighlight>
        </ColumnPersonCard>
      </ColumnCardList>

      <ColumnSectionTitle>피터 린치의 칵테일 파티 4단계</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["단계", "파티에서 어떤 대화가 오가는가", "시장 상태"]}
        rows={LYNCH_STAGES.map(([stage, talk, market]) => [
          { value: stage },
          talk,
          market,
        ])}
      />

      {/* ── 잡지 표지의 저주 ── */}
      <ColumnSectionTitle>잡지 표지의 저주</ColumnSectionTitle>

      <ColumnCallout label="1979년 BusinessWeek — '주식의 죽음'">
        1979년 8월, BusinessWeek는 표지에 "The Death of Equities(주식의 죽음)"를
        실었다. 1970년대 내내 주식이 악몽의 10년을 보낸 직후였다. 당시
        다우 지수는 800선. 결과는?{" "}
        <strong>
          그 표지가 나온 이후 거의 20년간 역사상 최대 강세장이 시작됐다.
        </strong>
      </ColumnCallout>

      <ColumnCallout label="Citigroup 연구 (2016) — The Economist 표지 44개 분석">
        Gregory Marks와 Brent Donnelly의 연구는 1998년부터 2016년까지
        The Economist의 명확히 낙관적 또는 비관적인 표지 44개를 분석했다.{" "}
        <strong>68%의 확률로 표지와 반대 방향으로 시장이 움직였다.</strong>{" "}
        핵심 메커니즘은 간단하다 — 기자가 어떤 주제를 표지로 다룰 때쯤이면,
        그 이야기는 이미 시장에 완전히 반영되어 있다.
      </ColumnCallout>

      {/* ── 학술 연구 ── */}
      <ColumnSectionTitle>학자들은 뭐라고 했을까</ColumnSectionTitle>

      <ColumnResearchCard
        source="Journal of Finance"
        year="2000"
        title="Trading Is Hazardous to Your Wealth"
        author="Brad Barber & Terrance Odean (UC Davis)"
        stat="개인 vs 시장 연 -6.5%p"
      >
        66,456가구의 직접 주식 투자 데이터를 분석한 연구다.{" "}
        <strong>가장 적극적으로 매매한 가구의 연 수익률은 11.4%</strong>였고,
        같은 기간 시장 평균은 17.9%였다. 6.5%p의 차이. 흥미로운 점은 종목
        선택 실력이 아니라{" "}
        <strong>행동 패턴 — 잦은 매매, 확증 편향, 과신 — 이 손실을 만들어낸다</strong>는
        것이다. 개인 투자자의 참여 자체가 문제가 아니라, 시장이 과열될수록
        그 행동 패턴이 강화된다는 점이 핵심이다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Journal of Economic Perspectives"
        year="2006"
        title="Investor Sentiment in the Stock Market"
        author="Malcolm Baker & Jeffrey Wurgler (NYU Stern)"
        stat="6~36개월 역지표 효과"
      >
        개인 투자자 감정 지수가 극단적으로 낙관적일 때, 이후{" "}
        <strong>6개월에서 3년 사이의 수익률이 낮아지는 경향</strong>이 있음을
        보였다. 반대로 감정이 극단적으로 비관적일 때는 이후 수익률이 높아지는
        경향이 있었다. 단기(1개월 이내)에는 역지표 효과가 약하고,{" "}
        <strong>중장기 시계에서 유의미하다</strong>는 점이 중요한 함의다.
      </ColumnResearchCard>

      {/* ── 맘카페 주식 이야기 ── */}
      <ColumnSectionTitle>그럼 맘카페 주식 이야기는 틀린 건가?</ColumnSectionTitle>

      <ColumnCallout label="이 신호들의 공통점">
        구두닦이 소년, 택시 운전사, 칵테일 파티 손님, 잡지 표지 — 이 모든
        신호가 가리키는 것은 하나다.{" "}
        <strong>
          "더 이상 새로운 매수자를 끌어들일 여지가 줄어들고 있다."
        </strong>{" "}
        주식을 아직 한 번도 사보지 않은 사람들까지 사기 시작했다면, 새로 살
        사람이 거의 남지 않았다는 뜻이다. 맘카페의 주식 이야기도 이 맥락에서
        읽는 것이 정확하다 — 조롱이 아니라, 시장에 남은 잠재 수요가 얼마나
        되는지에 대한 지표로.
      </ColumnCallout>

      <ColumnMythFact
        myth="맘카페 주식 이야기 = 무조건 고점 신호이므로, 즉시 팔아야 한다"
        fact="고점의 '한 가지 신호'일 수 있다. 하지만 시장은 훨씬 더 오래 비합리적으로 움직일 수 있다. 케인스의 말처럼 — '시장은 당신이 지급능력을 유지하는 것보다 더 오래 비합리적 상태를 유지할 수 있다.' 신호가 맞더라도 타이밍은 여전히 불확실하다."
      />

      {/* ── 역지표의 함정 ── */}
      <ColumnWarningCard
        title="역지표를 역지표로 쓰는 것의 함정"
        example="예: 2021년 GameStop 열풍 당시 많은 사람이 '이건 분명 버블이야'라며 공매도에 나섰다가 손실. 시장의 비합리성이 예상보다 훨씬 오래 지속됐다."
      >
        이 신호를 보고 전량 매도하거나 공매도에 나서는 것은 또 다른 형태의
        시장 예측이다. 피터 린치 본인도 "나는 시장 타이밍 예측을 믿지 않는다"고
        명확히 선을 그었다. 1단계부터 4단계까지의 진행 속도는 매번 다르고,
        4단계라고 판단했을 때 시장은 몇 달 더 오를 수도 있다.
      </ColumnWarningCard>

      {/* ── 추세 추종자에게 ── */}
      <ColumnTipBox icon="💡" title="추세 추종자에게 이 신호의 의미">
        인간 지표는 "팔아야 하는 신호"가 아니라{" "}
        <strong>"방심하지 말아야 할 신호"</strong>로 읽는 것이 적합하다.
        <br />
        <br />
        200일선이나 16/20 규칙 같은 객관적 지표가 아직 하락 신호를 보내지
        않았다면, 주변의 과열 분위기는 그 신호를 더 주의 깊게 지켜볼 계기가
        된다. 시스템 신호가 하락을 가리킬 때 — 그때 행동하면 된다.
        <br />
        <br />
        주변 사람들이 주식 이야기를 많이 한다면: 포트폴리오 리스크를 점검하고,
        손절 기준을 미리 확인해두자. 결정은 시스템이 하고, 인간 지표는 그
        시스템을 더 꼼꼼히 들여다볼 이유를 주는 것으로 충분하다.
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
