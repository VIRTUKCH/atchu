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
  ColumnFlowCard,
  ColumnCompareTable,
  ColumnCompareRow,
  ColumnWarningCard,
  ColumnMythFact,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  {
    value: "~9%",
    label: "연간 alpha",
    desc: "이평선 거리(MAD) 기반 개별 종목 포트폴리오 — Avramov et al. (2021)",
  },
  {
    value: "7% 미만",
    label: "수익 주도 거래 비율",
    desc: "전체 거래 중 소수 대형 추세가 누적 수익을 좌우 — Zarattini et al. (2024)",
  },
  {
    value: "8/10",
    label: "위기 방어 성공",
    desc: "주요 위기 10건 중 추세추종이 양의 수익을 기록한 횟수 — AQR (2017)",
  },
];

const INVESTORS = [
  {
    name: "폴 튜더 존스",
    nameEn: "Paul Tudor Jones",
    title: "튜더 인베스트먼트 설립자 · 순자산 ~$74억",
    quote: "200일 이동평균선 아래에 있는 주식을 사거나 보유하지 마라.",
    quoteEn: "Don't buy or hold stocks below the 200-day moving average.",
    highlight:
      "투자의 핵심 비결은 '어떻게 전부 잃지 않을 것인가'라고 말함. Tony Robbins 인터뷰에서 200일선을 모든 판단 기준으로 사용한다고 밝힘.",
  },
  {
    name: "마크 미너비니",
    nameEn: "Mark Minervini",
    title: "미국 투자 챔피언십 우승자 · SEPA 전략 창시자",
    quote:
      "현재 주가가 150일 및 200일 SMA 위에 있어야 하고, 200일 SMA가 최소 1개월 이상 상승 추세여야 한다.",
    quoteEn:
      "The stock must be above the 150-day and 200-day SMA, and the 200-day SMA must be trending up for at least one month.",
    highlight:
      "트렌드 템플릿(Trend Template): 50일 > 150일 > 200일 이동평균 정렬을 종목 진입의 필수 조건으로 사용. 200일선 상승은 지속적인 기관 매수 관심을 반영한다고 설명.",
  },
  {
    name: "스탠 와인스타인",
    nameEn: "Stan Weinstein",
    title:
      "스테이지 분석 창시자 · 《Secrets for Profiting in Bull and Bear Markets》 저자",
    quote:
      "Stage 2(상승)에서만 매수하라. 주가가 200일선 위로 올라서야 진입할 자격이 있다.",
    quoteEn:
      "Only buy in Stage 2. A stock must be above its 200-day moving average to qualify for purchase.",
    highlight:
      "4단계 스테이지 분석: 기반 형성 → 상승(매수) → 분배(매도 준비) → 하락(매도). 원래 30주 이동평균을 사용했으나, 최근 200일선(40주)으로 전환. 더 많은 트레이더와 기관이 추적하는 선이기 때문.",
  },
  {
    name: "윌리엄 오닐",
    nameEn: "William O'Neil",
    title: "Investor's Business Daily 설립자 · CANSLIM 전략 창시자",
    quote:
      "주식의 4분의 3이 전체 시장 방향을 따른다. 시장 추세 확인이 최우선이다.",
    quoteEn:
      "Three out of four stocks follow the market's overall direction. Confirming the market trend comes first.",
    highlight:
      "CANSLIM의 'M'(Market Direction): 주요 지수가 200일 이동평균선 위에 있을 때만 신규 포지션 진입. 시장이 하락 추세면 아무리 좋은 종목이라도 매수를 보류.",
  },
];

const meta = getFaqMeta("/individual_stock_ma200");

export default function IndividualStockMa200Page() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      <ColumnCallout label="이 칼럼이 던지는 질문">
        앗추 필터(200일선 + 16/20 규칙)는 원래 S&P 500 지수와 섹터 ETF의 추세를
        판단하는 도구입니다. 그런데 이 필터를{" "}
        <strong>개별주에도 적용</strong>하면 어떨까요?
        지수에서 검증된 전략이 개별 종목에서도 의미가 있는지,
        학술 찬반과 투자자 실무 원칙을 모두 짚어봅니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 학술 연구 ── */}
      <ColumnSectionTitle>학술 연구는 뭐라고 말하는가</ColumnSectionTitle>

      <ColumnResearchCard
        source="Review of Financial Economics"
        year="2021"
        title="Moving Average Distance as a Predictor of Equity Returns"
        author="Avramov, Kaplanski, Subrahmanyam"
        stat="연간 alpha ~9%"
      >
        단기(21일)와 장기(200일) 이동평균선 간 거리(MAD)가{" "}
        <strong>개별 종목</strong> 수익률을 cross-section에서 예측한다는
        연구입니다. 1977~2018년 데이터에서 MAD 최상위 10분위는 월 1.92%,
        최하위는 월 0.84%를 기록했습니다. 2001~2015년 기간에 모멘텀과 52주
        신고가 효과가 사라졌지만{" "}
        <strong>MAD 효과는 여전히 유의</strong>했습니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="SSRN"
        year="2024"
        title="Does Trend-Following Still Work on Stocks?"
        author="Zarattini, Pagani, Wilcox"
        stat="66,000건+ 시뮬레이션 거래"
      >
        1950~2024년 미국 상장 전체 종목 대상, 생존 편향을 제거한 연구입니다.{" "}
        <strong>전체 거래의 7% 미만</strong>이 누적 수익성을 주도했습니다.
        대부분의 거래는 소규모 손실이지만, 소수의 대형 추세가 전체 성과를
        결정합니다. 2005~2024년 아웃오브샘플에서도 유효했습니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Journal of Portfolio Management"
        year="2017"
        title="A Century of Evidence on Trend-Following Investing"
        author="Hurst, Ooi, Pedersen (AQR)"
        stat="1880년~2016년, 67개 시장"
      >
        1880년 이후 <strong>모든 10년 단위에서</strong> 추세추종이 양의 평균
        수익률을 달성했습니다. 60/40 포트폴리오 최대 낙폭 상위 10개 위기 중{" "}
        <strong>8개에서 양의 수익</strong>을 기록했습니다. 경기침체, 전쟁, 고금리,
        저금리 — 모든 매크로 환경에서 유효했다는 점이 핵심입니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="SSRN"
        year="2007"
        title="A Quantitative Approach to Tactical Asset Allocation"
        author="Mebane T. Faber"
        stat="200,000+ 다운로드"
      >
        10개월(약 200일) 이동평균선 하나만으로 1900년 이후{" "}
        <strong>지수</strong> 대상 백테스트를 수행했습니다. 수익률은
        Buy &amp; Hold와 유사하되 최대 드로다운은 약 50% 감소. 단, 이 연구는
        지수와 자산군이 대상이며 개별 종목을 직접 다루지는 않습니다.
      </ColumnResearchCard>

      {/* ── 반론 ── */}
      <ColumnCallout label="반론: 교차 신호 자체는 효과가 미미하다">
        트레이더이자 연구자인 Adam Grimes는 광범위한 정량 분석을 통해 반론을
        제시합니다. 200일선 교차 자체는 향후 방향성을 예측하지 못하며, 200일이
        193일이나 204일보다 특별하지 않다는 것입니다.{" "}
        <strong>
          최근 20년 데이터에서는 200일선 위/아래 수익률 차이가 거의 사라졌다
        </strong>
        고 지적합니다. 핵심은 '교차를 매매 신호로 쓰는 것'과 '추세 확인
        도구로 쓰는 것'의 차이입니다.
      </ColumnCallout>

      {/* ── 개별 종목에서 의미 있는 경우 ── */}
      <ColumnSectionTitle>개별 종목에서 의미 있는 경우</ColumnSectionTitle>

      <ColumnCallout label="대형주는 '작은 지수'처럼 행동한다">
        S&P100 종목은 시가총액이 수천억 달러에 달하는 초대형주입니다. AAPL,
        MSFT, AMZN 같은 기업은 사업이 수십 개 세그먼트로 분산되어 있습니다.{" "}
        <strong>
          이런 대형주의 가격 흐름은 소형주보다 지수에 가깝게 움직이며,
          이평선 신호의 노이즈가 상대적으로 적습니다.
        </strong>
      </ColumnCallout>

      <ColumnCallout label="모멘텀 효과는 개별 종목에서도 유효하다">
        1993년 Jegadeesh &amp; Titman 이후 30년간 수많은 논문이 확인했습니다.
        최근 3~12개월 강세인 주식은 이후에도 강세 경향이 있습니다. 200일
        이동평균선 위에 있다는 것은 장기 모멘텀이 유지 중이라는 신호입니다.{" "}
        <strong>모멘텀 효과 자체가 개별 종목 단위에서 검증된 현상입니다.</strong>
      </ColumnCallout>

      <ColumnCallout label="리스크 관리 도구로서의 가치">
        200일선 전략의 본질은 수익 극대화가 아니라 치명적 손실의 회피입니다.
        S&P500 백테스트에서 샤프비율은 0.704로 Buy &amp; Hold(0.471)를 크게
        앞섰습니다.{" "}
        <strong>
          개별 종목에서도 200일선 이탈은 GE(-80%), 인텔(-70%) 같은 구조적
          하락을 조기에 인지하는 참고 데이터가 됩니다.
        </strong>
      </ColumnCallout>

      {/* ── 전설적 투자자 ── */}
      <ColumnSectionTitle>전설적 투자자들의 종목 필터링 원칙</ColumnSectionTitle>

      <ColumnCallout label="공통점: 200일선 아래 종목은 매수하지 않는다">
        아래 4명의 투자자는 서로 다른 전략을 사용하지만, 한 가지 원칙에서
        일치합니다. <strong>200일 이동평균선 아래에 있는 종목은 매수 대상에서
        제외</strong>한다는 것입니다. 차이점은 '얼마나 엄격한 조건을 추가하느냐'
        뿐입니다.
      </ColumnCallout>

      <ColumnCardList>
        {INVESTORS.map((inv) => (
          <ColumnPersonCard key={inv.nameEn} name={inv.name} sub={inv.title}>
            <ColumnQuote en={inv.quoteEn}>"{inv.quote}"</ColumnQuote>
            <ColumnHighlight>{inv.highlight}</ColumnHighlight>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      {/* ── 앗추 필터 ── */}
      <ColumnSectionTitle>앗추 필터가 추가하는 것</ColumnSectionTitle>

      <ColumnCallout label="단순 200일선 교차의 문제">
        위 투자자들이 공통으로 사용하는 '200일선 위/아래' 기준은 강력하지만,
        한 가지 약점이 있습니다. 횡보장에서 가격이 200일선을 자주 오르내리면{" "}
        <strong>가짜 신호(채찍질, whipsaw)</strong>가 반복됩니다. 1960년 이후
        S&P 500 기준 200일선 단순 교차 매매의 승률은 28%에 불과합니다.
      </ColumnCallout>

      <ColumnFlowCard
        title="앗추 필터로 종목 확인"
        step={{
          icon: "🔍",
          label: "200일선 + 16/20 필터 체크",
          sub: "매수 전, 해당 종목의 최근 20거래일 중 16일 이상 200일선 위에 있었는지 확인",
        }}
        branches={[
          {
            label: "16일 이상 (추세 유효)",
            text: "매수 후보로 검토 가능. 장기 상승 추세가 안정적으로 유지 중.",
            variant: "good",
          },
          {
            label: "15일 이하 (추세 약화)",
            text: "매수 보류, 관망. 추세가 불안정하거나 이탈 중.",
            variant: "bad",
          },
        ]}
      />

      <ColumnCompareTable
        columns={["비교 항목", "단순 200일선 교차", "앗추 16/20 필터"]}
        rows={[
          [
            "횡보장 대응",
            { value: "가짜 신호 반복" },
            { value: "20일 확인 → 노이즈 제거", highlight: true },
          ],
          [
            "매매 빈도",
            { value: "연 수십 회 (잦은 교차)" },
            { value: "크게 감소", highlight: true },
          ],
          [
            "심리적 부담",
            { value: "매일 신호 확인 필요" },
            { value: "실질 추세 변화만 확인", highlight: true },
          ],
          [
            "거래 비용",
            { value: "수수료·세금 누적" },
            { value: "매매 횟수 감소 → 비용 절감", highlight: true },
          ],
          [
            "승률 (S&P 500 기준)",
            { value: "~28%" },
            { value: "노이즈 필터링으로 개선", highlight: true },
          ],
        ]}
      />

      <ColumnCompareRow
        left={{
          label: "단순 200일선 교차",
          value: "승률 28%",
          sub: "횡보장에서 매매 신호 남발, 거래의 70%가 손실",
          variant: "bad",
        }}
        right={{
          label: "앗추 16/20 필터",
          value: "노이즈 감소",
          sub: "20일 중 16일 기준으로 추세를 확인, 잦은 교차를 무시",
          variant: "good",
        }}
        period="개별 종목에서 필터가 더 중요한 이유"
      />

      {/* ── 지수 vs 개별 종목 ── */}
      <ColumnSectionTitle>지수 vs 개별 종목: 200일선 전략 특성 비교</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["특성", "지수 (S&P500)", "개별 종목 (S&P100 구성주)"]}
        rows={[
          [
            "노이즈 수준",
            { value: "낮음", highlight: true },
            { value: "중간~높음" },
          ],
          [
            "휩소 빈도",
            { value: "연 2~4회", highlight: true },
            { value: "연 4~8회" },
          ],
          [
            "실적 이벤트 영향",
            { value: "거의 없음", highlight: true },
            { value: "분기별 변동" },
          ],
          [
            "구조적 하락 리스크",
            { value: "극히 낮음 (자동 교체)", highlight: true },
            { value: "있음 (GE, 인텔)" },
          ],
          [
            "학술 연구 근거",
            { value: "Faber 논문 (100년+)", highlight: true },
            { value: "Avramov 2021 (alpha ~9%)", highlight: true },
          ],
          [
            "장기 우상향 전제",
            { value: "성립 (95년 데이터)", highlight: true },
            { value: "개별 기업 의존" },
          ],
        ]}
      />

      {/* ── 한계와 주의점 ── */}
      <ColumnSectionTitle>한계와 주의점</ColumnSectionTitle>

      <ColumnWarningCard
        title="실적 발표일 전후 급변"
        example="예: 메타(META) 2022년 2월 -26%, 엔비디아(NVDA) 2024년 실적 발표 후 +16%. 이평선 신호와 무관한 이벤트."
      >
        개별 종목은 분기마다 실적 발표가 있고, 하루 만에 10~30% 급등·급락이
        가능합니다. 이동평균선은 점진적 추세 변화를 포착하는 도구이며, 이런
        급변 이벤트에는 대응하지 못합니다.
      </ColumnWarningCard>

      <ColumnWarningCard
        title="구조적 하락에서 '반등 기대'의 위험"
        example="예: GE는 2017~2018년 200일선 아래로 하락 후 3년간 -80%. 인텔은 2022년 이후 -70%."
      >
        지수는 부진한 종목이 자동으로 제외되고 성장 종목이 편입됩니다. 하지만
        개별 종목은 사업 모델 자체가 무너지면 영구적으로 회복하지 못할 수
        있습니다. 200일선 이탈을 참고할 수는 있으나, '언젠가 반등하겠지'라는
        기대와는 구분해야 합니다.
      </ColumnWarningCard>

      <ColumnWarningCard
        title="필터 통과 ≠ 좋은 종목"
        example="예: 추세가 좋았던 종목이 사업 모델 변화로 급락하는 경우."
      >
        앗추 필터는 <strong>현재 추세 상태</strong>만 확인합니다. 기업의 재무
        건전성, 경쟁력, 밸류에이션은 별도로 판단해야 합니다. 추세가 좋다고 해서
        사업 기반이 탄탄하다는 뜻은 아닙니다.
      </ColumnWarningCard>

      {/* ── 통설 vs 사실 ── */}
      <ColumnMythFact
        myth="200일선은 지수에만 효과적이고 개별 종목에는 무의미하다"
        fact="Avramov et al. (2021) 연구는 개별 종목 단위에서 이평선 거리(MAD)가 수익률을 예측하며 연간 alpha ~9%를 냈음을 보여줍니다. 다만 노이즈가 더 크므로 단순 교차 대신 필터링이 필요합니다."
      />

      <ColumnMythFact
        myth="추세 필터만 적용하면 개별주 매매에서 항상 이긴다"
        fact="추세 필터는 승률을 높이는 도구가 아닙니다. 핵심 가치는 '치명적 손실을 피하는 리스크 관리'입니다. Zarattini et al. (2024) 연구에서도 전체 거래의 7% 미만이 수익을 주도했습니다 — 대부분의 거래는 소규모 손실입니다."
      />

      {/* ── 활용 팁 ── */}
      <ColumnTipBox icon="💡" title="개별 종목 앗추 필터 활용 팁">
        1. 지수(S&P500) 추세를 먼저 확인하세요. 지수가 하락 추세면 대부분의
        개별 종목도 하락합니다.
        <br />
        2. 개별 종목은 보조 확인용으로 활용하세요. 지수는 상승인데 특정 종목만
        하락 추세라면 해당 종목에 개별 악재가 있을 수 있습니다.
        <br />
        3. 실적 발표 전후 2주는 추세 데이터 해석에 주의하세요. 일시적 급변은
        추세 전환이 아닐 수 있습니다.
        <br />
        4. 앗추의 16/20 필터가 적용된 데이터를 기준으로 판단하면 단순 교차 대비
        휩소를 줄일 수 있습니다.
      </ColumnTipBox>

      {/* ── 결론 ── */}
      <ColumnCallout label="결론: 매매 신호가 아닌, 매수 전 안전 확인">
        200일 이동평균선을 개별 종목의 <strong>매매 신호</strong>로 사용하는 것은
        학술적 근거가 약합니다. 교차 매매의 승률은 28%에 불과합니다.
        그러나 <strong>추세 확인·리스크 관리 도구</strong>로 활용하는 것은
        Avramov et al. (2021)의 개별 종목 연구와 30년간의 모멘텀 연구가
        뒷받침합니다.
        {"\n\n"}
        폴 튜더 존스, 마크 미너비니, 스탠 와인스타인, 윌리엄 오닐 — 서로 다른
        전략을 쓰지만 모두 같은 원칙을 공유합니다:{" "}
        <strong>200일선 아래 종목은 건드리지 않는다.</strong> 앗추 필터는 여기에
        16/20 규칙을 더해 횡보장의 가짜 신호까지 걸러냅니다.
      </ColumnCallout>

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
