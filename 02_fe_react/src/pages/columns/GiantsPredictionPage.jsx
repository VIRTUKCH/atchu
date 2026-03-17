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
  ColumnPersonCard,
  ColumnCardList,
  ColumnCompareTable,
  ColumnMythFact,
  ColumnWarningCard,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "34%",
    label: "신흥시장 초과 수익 (2025)",
    desc: "달리오 포트폴리오 기준, 신흥시장이 미국을 앞선 성과",
  },
  {
    value: "165%",
    label: "데이터센터 전력 수요 증가",
    desc: "2030년까지 (Goldman Sachs Research, 2024)",
  },
  {
    value: "4~7%",
    label: "미국 주식 10년 기대수익률",
    desc: "Vanguard·Goldman Sachs 전망 (역사 평균 10%보다 낮음)",
  },
];

export default function GiantsPredictionPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title={<>거인들이 바라본 2030:<br />주식시장 대전환 청사진</>}
        desc="머스크, 달리오, 그랜텀이 동시에 가리키는 5가지 대변화. 앞으로 10년의 주식시장은 지난 10년과 다를 수 있다."
      />

      <ColumnCallout label="왜 지금인가">
        2026년 현재, 세 가지 거대한 흐름이 동시에 진행 중이다.<br /><br />
        <strong>AI 혁명</strong>이 산업 구조를 바꾸고,
        <strong> 미국 부채 위기</strong>가 임계점에 가까워지고 있으며,
        <strong> 지정학 재편</strong>으로 신흥국이 부상하고 있다.<br /><br />
        세계적인 투자자와 기관들은 이 변화를 어떻게 읽고 있을까?
        머스크부터 달리오, 그랜텀까지 — 그들이 동시에 가리키는 5가지 신호를 정리했다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ─── 섹션 1: 에너지 ─── */}
      <ColumnSectionTitle>예측 1. 에너지가 AI의 목을 조인다</ColumnSectionTitle>

      <ColumnCallout label="일론 머스크, 2024">
        "AI 발전의 병목이 <strong>칩 → 변압기 → 전력 생산</strong> 순서로 이동하고 있다."<br /><br />
        머스크의 xAI 멤피스 데이터센터는 1기가와트(GW) 규모다. 이는 원전 1기와 맞먹는 용량으로,
        약 75만 가구에 전력을 공급할 수 있다. AI 한 곳에 도시 하나의 전력이 필요한 시대다.<br /><br />
        더 충격적인 것은 격차다. 중국은 지난 12개월간 200GW 이상의 발전 용량을 추가했다.
        미국은 같은 기간 50GW 미만이다. AI 패권 경쟁이 결국 에너지 인프라 경쟁임을 보여주는 수치다.
      </ColumnCallout>

      <ColumnResearchCard
        title="AI 데이터센터 전력 수요 전망"
        author="Goldman Sachs Research"
        year="2024"
        source="Goldman Sachs Global Investment Research"
        stat="2030년까지 165% 증가 — 미국 데이터센터 전력 비중 4.4% → 최대 12%"
      >
        골드만삭스는 AI 데이터센터로 인해 2030년까지 전 세계 전력 수요가 현재 대비
        165% 이상 증가할 것으로 전망했다.<br /><br />
        2023년 기준 미국 데이터센터는 전체 전력의 4.4%(176 TWh)를 소비했다.
        2028년에는 최대 12%(약 580 TWh)까지 늘어날 수 있다.<br /><br />
        보고서에 따르면 데이터센터 운영자의 <strong>72%가 전력 확보를 "극도로 도전적"</strong>이라고 평가했다.
        에너지 인프라는 AI 성장의 최대 병목이자, 동시에 새로운 투자 기회다.
      </ColumnResearchCard>

      <ColumnCallout label="투자 시사점">
        에너지 인프라가 병목이 된다는 것은 그 영역에서 기회가 생긴다는 뜻이기도 하다.<br /><br />
        전력망 업그레이드, 소형 원자로(SMR), 천연가스 발전 등 에너지 인프라 관련 ETF와 기업들이
        구조적 수혜를 받을 수 있다. 단, 추세추종 원칙대로 — 200일 이평선 위에 있을 때만 보유한다.
      </ColumnCallout>

      {/* ─── 섹션 2: 신흥시장 ─── */}
      <ColumnSectionTitle>예측 2. 미국보다 개도국이 더 오를 것이다</ColumnSectionTitle>

      <ColumnCardList>
        <ColumnPersonCard
          name="Ray Dalio"
          sub="브리지워터 어소시에이츠 창업자"
          badge="거시 투자"
        >
          달리오는 신흥시장, 특히 인도에 개인 자산의 60% 이상을 배치했다.
          그의 논리는 단순하다 — 부채 수준이 낮고 성장 동력이 강한 나라가 장기적으로 유리하다.<br /><br />
          실제로 2025년 한 해, 신흥시장 주식은 달러 기준으로 <strong>미국 대비 34% 초과 수익</strong>을 올렸다.
          단순한 이론이 아니라 현실에서 나타난 숫자다.
        </ColumnPersonCard>

        <ColumnPersonCard
          name="Jeremy Grantham"
          sub="GMO 공동창업자"
          badge="가치 투자"
        >
          GMO의 그랜텀은 미국 주식에 대해 오랫동안 경고해 왔다.
          "미국 주식은 과도하게 평가됐다." 2025년 9월 기준, 신흥시장과 미국 S&P 500의
          밸류에이션 스프레드는 <strong>8.5%포인트</strong>에 달한다.<br /><br />
          GMO는 신흥시장을 "무거운 비중으로 초과배치(heavily overweight)해야 한다"고 공식 입장을 밝혔다.
          개인 자산의 55%를 신흥시장에 배치한 것도 말만이 아님을 보여준다.
        </ColumnPersonCard>
      </ColumnCardList>

      <ColumnResearchCard
        title="신흥시장, 2030년에 글로벌 비중 35%로 확대"
        author="Goldman Sachs Global Investment Research"
        year="2023"
        source="Goldman Sachs Research — Emerging Markets Outlook"
        stat="글로벌 주식시장 비중: 2023년 27% → 2030년 35%"
      >
        골드만삭스는 신흥시장의 글로벌 주식시장 점유율이 2023년 27%에서
        2030년 35%로 확대될 것으로 전망했다.<br /><br />
        인도가 특히 주목받는다. 인도의 글로벌 비중은 2022년 3%에서
        2050년 8%, 2075년에는 12%까지 성장할 것으로 예상된다.
        14억 인구, 젊은 인구 구조, 상대적으로 낮은 부채 수준이 그 근거다.
      </ColumnResearchCard>

      <ColumnCompareTable
        columns={["구분", "미국 S&P 500", "신흥시장 (EM)"]}
        rows={[
          ["10년 기대수익률", { value: "4~7%" }, { value: "9~11%", highlight: true }],
          ["현재 밸류에이션 (CAPE)", { value: "약 37배 (역사 상위 10%)" }, { value: "15~18배", highlight: true }],
          ["부채 수준", { value: "GDP 대비 높음" }, { value: "상대적으로 낮음", highlight: true }],
          ["핵심 성장 동력", { value: "AI·빅테크" }, { value: "소비 확대·중산층 성장" }],
          ["추세추종 시사점", { value: "200MA 위지만 고평가 구간" }, { value: "상승 추세 초입 가능성" }],
        ]}
      />

      {/* ─── 섹션 3: AI ─── */}
      <ColumnSectionTitle>예측 3. AI는 주가를 끌어올린다 — 그런데 이미 반영됐다?</ColumnSectionTitle>

      <ColumnCallout label="Morgan Stanley, 2025">
        모건스탠리는 AI가 전면 도입될 경우 S&P 500 시가총액이
        <strong> $13~16조 추가</strong>될 수 있다고 분석했다.
        현재 대비 24~29% 증가에 해당하는 규모다.<br /><br />
        실제로 변화는 이미 시작됐다. 2025년 4분기 기준, AI를 채택한 기업 중
        30%가 "계량화 가능한 재정적 효과"를 보고하기 시작했다. 1년 전(24%)보다 높아진 수치다.<br /><br />
        AI 혁명은 과장이 아니다. 다만 문제는 시장이 이미 그것을 알고 있다는 것이다.
      </ColumnCallout>

      <ColumnWarningCard
        title="주의: AI 밸류에이션이 이미 대규모로 선반영됐을 수 있다"
        example="골드만삭스 분석 (2025년 11월): 시장은 이미 AI에서 $19조의 가치를 반영했다"
      >
        골드만삭스에 따르면 2025년 11월 현재 S&P 500의 CAPE 비율은 약 37배로,
        1988년 이후 상위 10% 수준의 고평가 구간이다.<br /><br />
        AI로 인한 기대 이익이 이미 주가에 선반영됐다는 의미다.
        실제 경제적 효과가 시장의 기대에 미치지 못할 경우 상당한 조정이 올 수 있다.<br /><br />
        AI는 분명 실제 혁명이다. 하지만 투자의 세계에서는 좋은 스토리와 좋은 수익이 항상 일치하지 않는다.
      </ColumnWarningCard>

      {/* ─── 섹션 4: 부채 사이클 ─── */}
      <ColumnSectionTitle>예측 4. 미국의 빅사이클 — 달리오의 6단계 경고</ColumnSectionTitle>

      <ColumnCallout label="Ray Dalio, 2026년 2월 뮌헨 안보회의">
        달리오는 500년의 제국 흥망성쇠를 분석해 장기 부채 사이클(Big Cycle)을 설계했다.
        그의 진단에 따르면 미국은 현재 <strong>Stage 5~6(사전붕괴 → 위험한 최종 단계)</strong>에 진입하고 있다.<br /><br />
        그는 2026년 2월 뮌헨 안보회의에서 공식적으로 경고했다: "세계 질서가 무너지고 있다."
      </ColumnCallout>

      <ColumnTimeline>
        <ColumnTimelineItem year="현재 징후" title="미국 부채와 불평등의 임계점">
          미국 국가채무는 $38조(역대 최고)에 달하며, 매월 $500억씩 증가하고 있다.
          상위 1%가 전체 자산의 32%를 보유하는 불평등 구조는 내부 분열을 심화시키고 있다.<br /><br />
          달리오는 이를 1930년대와의 유사성으로 설명한다. 그가 제시하는 흐름은:
          <strong> 부채 고조 → 화폐 절하 → 내부 갈등 → 대국 간 충돌</strong>이다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="역사적 패턴" title="1945년 이후 75년, 사이클의 끝">
          2차 세계대전 이후 확립된 현 세계 질서는 약 75~80년 주기로 교체된다.
          달리오의 분석에 따르면 2020년대가 바로 그 전환점이다.<br /><br />
          그의 권고: 포트폴리오의 <strong>10~15%를 금(gold)으로</strong> 보유할 것.
          부채 사이클이 정점을 지날 때 금은 역사적으로 가장 강한 성과를 냈다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      {/* ─── 섹션 5: 기관 수익률 ─── */}
      <ColumnSectionTitle>예측 5. 10년 후 내 수익률은? 기관들의 전망</ColumnSectionTitle>

      <ColumnCallout label="역사 평균보다 낮은 미래">
        S&P 500은 1930년 이후 배당 재투자 기준 연평균 약 10%를 기록했다.
        그런데 주요 기관들은 앞으로 10년은 그보다 훨씬 낮을 것으로 전망한다.<br /><br />
        주된 이유는 두 가지다 — 역사적으로 높은 밸류에이션(CAPE 37배)과
        저성장 고금리 환경이 복합적으로 작용하기 때문이다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["기관", "미국 주식 10년 기대수익률", "비고"]}
        rows={[
          [{ value: "Vanguard", highlight: false }, { value: "2.8~4.8%" }, { value: "기술주 리스크 주의" }],
          [{ value: "Goldman Sachs" }, { value: "~6%" }, { value: "글로벌 포트폴리오 7.7%" }],
          [{ value: "JP Morgan" }, { value: "4~5%" }, { value: "신흥시장 9~10% 전망" }],
          [{ value: "역사 평균 (참고)" }, { value: "10%" }, { value: "1930~2023년 기준" }],
        ]}
      />

      <ColumnCallout label="결론">
        3대 기관이 모두 미국 주식의 향후 10년 기대수익률을 역사 평균보다 크게 낮게 전망한다.
        그렇다고 주식을 안 해야 한다는 뜻이 아니다.<br /><br />
        이 환경에서는 <strong>자산 배분과 추세추종이 더욱 중요해진다</strong>.
        수익률이 낮은 시대일수록 하락을 피하는 능력이 복리 성과를 결정한다.
      </ColumnCallout>

      {/* ─── 마무리 ─── */}
      <ColumnMythFact
        myth="미국 S&P 500에만 투자하면 앞으로도 연 10%는 된다"
        fact="주요 기관들은 향후 10년 4~7%를 전망한다. 신흥시장·에너지 인프라 분산이 선택이 아닌 필수가 되는 시대다."
      />

      <ColumnWarningCard
        title="예측은 방향 감각, 진입은 추세로"
        example="달리오도, 그랜텀도 '언제'는 모른다. 그들도 시장 타이밍은 예측하지 않는다"
      >
        이 칼럼에서 소개한 예측들은 방향 감각을 제공한다.
        신흥시장이 유망하고, 에너지가 병목이며, 미국 주식이 고평가됐다는 판단은
        투자 철학을 세우는 데 도움이 된다.<br /><br />
        하지만 실제 진입과 청산 타이밍은 다른 문제다.
        가장 뛰어난 거시 분석가들도 '언제'는 맞추지 못한다.<br /><br />
        <strong>200일 이동평균이 여전히 가장 신뢰할 수 있는 진입 신호다.</strong>
        신흥시장이 아무리 유망해도, 200MA 아래에서 진입하면 손실이다.
      </ColumnWarningCard>

      <ColumnTipBox title="추세추종자에게의 의미">
        • 신흥시장 ETF(EEM, VWO 등)가 200MA 위에 있을 때만 보유한다<br />
        • 에너지 인프라 섹터(전력망, SMR 관련)의 추세 확인 후 편입을 고려한다<br />
        • 미국 주식 비중이 과열 신호를 보일 때 현금·채권·금 비중을 높인다<br />
        • 국가 모멘텀 ETF 전략으로 자연스럽게 신흥국 상위 진입 시 편입된다
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
