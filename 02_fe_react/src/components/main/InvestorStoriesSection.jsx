import React, { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  {
    id: "basics",
    label: "추세 추종 기초",
    items: [
      { label: "골든 크로스와 데드 크로스의 의미", path: "/golden_dead_cross", description: "50일선과 200일선이 교차할 때 무슨 신호인지, 역사적 성과는 어떤지." },
      { label: "10개월 이평선의 100년 증거 — Mebane Faber 논문", path: "/faber_paper", description: "SSRN 200,000+ 다운로드. 1900년 이후 백테스트로 증명된 단순한 전략." },
    ],
  },
  {
    id: "legends",
    label: "전설적 투자자",
    items: [
      { label: "폴 튜더 존스: '200일선 아래에서는 좋은 일이 없다'", path: "/paul_tudor_jones", description: "1980년부터 45년+ 운용 경력, 누적 5,000%+. 200일선을 모든 판단 기준으로 사용한 트레이더." },
      { label: "스탠 와인스타인: Stage Analysis — 200일선이 강세장과 약세장을 가른다", path: "/stan_weinstein", description: "1988년 추세추종 교과서 저자. 4단계(기저→상승→분배→하락)로 '언제 살지'와 '언제 피할지'를 나눈 시스템." },
      { label: "에드 세이코타: 시스템 트레이딩의 아버지", path: "/ed_seykota", description: "1970년대 컴퓨터 기반 추세추종의 선구자. 철새 비유로 설명한 추세 철학." },
      { label: "제시 리버모어: 추세추종의 원조 (1900년대)", path: "/jesse_livermore", description: "100년 전 월스트리트의 전설. 손절의 중요성과 추세를 거스르지 않는 원칙." },
      { label: "거북이 트레이더: 2주 교육으로 $1.75억 수익", path: "/turtle_trader", description: "1983년 리처드 데니스의 실험. '트레이더는 태어나는 게 아니라 만들어진다'." },
      { label: "마티 슈워츠: 이동평균선이 방향을 바꾼 트레이더", path: "/marty_schwartz", description: "기본분석 실패 후 이평선으로 전환해 성공한 개인 투자자에게 가장 공감되는 스토리." },
      { label: "워런 버핏 vs 5개 헤지펀드: 10년 내기의 결과", path: "/buffett_vs_hedge", description: "2007년 내기. S&P500 인덱스펀드 7.1% vs 헤지펀드 2.2%. 버핏의 유언도 'S&P500'." },
      { label: "잭 보글: '시장 타이밍은 아무도 성공하지 못했다'", path: "/jack_bogle", description: "뱅가드 창시자. 50년 경력에서 일관된 타이밍 성공 사례를 본 적 없다." },
      { label: "하워드 마크스: 사이클을 읽으면 리스크가 보인다", path: "/howard_marks", description: "'맞는 것보다 틀리지 않는 것이 더 중요.' 시장 사이클 현재 위치 파악법." },
    ],
  },
  {
    id: "crisis",
    label: "위기 분석",
    items: [
      { label: "2008년 금융위기: 추세추종이 60% 손실을 막았다", path: "/crisis_2008", description: "S&P500 -55% vs 다중자산 추세추종 -22.4%. CTA 펀드는 Barclay CTA Index 기준 +14%." },
      { label: "2000년 닷컴 버블: 나스닥 -78%, 아마존 -95%", path: "/dotcom_bubble", description: "943일간 하락. 추세 이탈 신호가 있었다면 어떻게 달랐을까." },
      { label: "2020년 코로나 폭락: 개인투자자 42%가 손실본 이유", path: "/covid_crash", description: "87조원 순매수에도 42%가 손실. 역사상 가장 빠른 폭락이자 가장 빠른 회복." },
      { label: "S&P500이 경험한 역사적 최악의 순간들", path: "/sp500_drawdowns", description: "1929 대공황부터 2020년까지. 모든 폭락 이후 신고점을 경신한 100년의 기록." },
      { label: "최고점만 골라서 샀어도 결국 백만장자가 됐다", path: "/bad_timing_still_wins", description: "최악의 타이밍으로 투자해도 장기 보유 시 성공. 복리와 S&P500 장기 상승의 힘." },
    ],
  },
  {
    id: "psychology",
    label: "투자 심리",
    items: [
      { label: "인간 지표: 길거리에서 주식 이야기가 들려오면 팔아라?", path: "/crowd_signal", description: "구두닦이 소년부터 맘카페까지, 100년을 이어온 시장 심리의 패턴. 피터 린치의 칵테일 파티 이론." },
      { label: "개인투자자는 왜 지수를 못 이길까 — DALBAR 연구", path: "/dalbar_research", description: "20년간 개인 평균 연 2.2% vs S&P500 7.1%. 수익률 차이는 종목이 아닌 행동에서 생긴다." },
      { label: "손실을 이득의 2배로 느끼는 뇌 — 손실 회피 심리학", path: "/loss_aversion", description: "카너먼의 전망 이론. -10%의 고통이 +20%의 기쁨과 같은 이유." },
      { label: "공포-탐욕 지수로 읽는 시장 심리", path: "/fear_greed_index", description: "CNN 0~100 척도. 극단적 공포 구간이 역사적으로 최고의 매수 기회인 이유." },
      { label: "폭락장 2주 생존 가이드: 앱 삭제가 최고의 전략인 이유", path: "/bear_market_survival", description: "뇌 트라우마 회복 기간 2주. 정보 차단 → 불안 표현 → 인지 교정 → 주의 전환." },
      { label: "더 많은 정보가 왜 역효과인가", path: "/information_paradox", description: "정보 과다 → 손실 회피 심화 → 소극적 투자. 단순한 시스템이 이기는 역설." },
      { label: "서학개미의 심리: '나만 뒤처질까' 공포가 만든 투자 붐", path: "/overseas_investor_psychology", description: "86%가 노후/집 마련 목표. 20대 60%가 ETF 선택. 공포 기반 투자의 실체." },
    ],
  },
  {
    id: "leverage",
    label: "레버리지",
    items: [
      { label: "추세 추종에 레버리지를 사용하면 안 되나요?", path: "/leverage_faq", description: "추세가 있을 때 레버리지, 없을 때 현금 보유. 변동성 감쇠를 피하는 전략." },
      { label: "UPRO vs TQQQ: 수익도 3배, 손실도 3배", path: "/upro_vs_tqqq", description: "10년 연 30~40% 수익률의 이면. 최대 드로다운 77~82%의 현실." },
      { label: "눈에 보이지 않는 손실: 변동성 감쇠(Volatility Decay)", path: "/volatility_decay", description: "10% 하락 후 11.11% 상승 = 지수는 원점, 2배 레버리지는 마이너스인 이유." },
      { label: "HFEA 전략 완전 해부: UPRO 55% + TMF 45%", path: "/hfea_strategy", description: "인터넷 커뮤니티에서 유명해진 레버리지 포트폴리오 전략의 장단점 분석." },
    ],
  },
  {
    id: "macro",
    label: "거시경제",
    items: [
      { label: "달리오의 올웨더: 40년간 4번만 마이너스", path: "/all_weather_portfolio", description: "주식 30% + 장기채 40% + 중기채 15% + 금 7.5% + 원자재 7.5%. 위험 기반 분산의 원리." },
      { label: "달리오가 경고하는 '13번째 대규모 부채 사이클'", path: "/debt_cycle", description: "역사상 13번 반복된 빅 사이클의 5단계. 2025년 현재 어디에 있는가." },
      { label: "섹터 로테이션: 경제 사이클에 따라 승자가 바뀐다", path: "/sector_rotation", description: "초기 회복엔 기술주, 확장기엔 에너지/금융, 후기엔 방어주, 침체엔 채권/금." },
      { label: "어느 나라가 오를지 예측하지 마라 — 국가 모멘텀 ETF 전략", path: "/country_momentum", description: "54년 백테스트 연 13.09% vs MSCI World 10.34%. Faber·AQR 논문이 지지하는 국가 로테이션 전략." },
      { label: "공포지수(VIX)가 80을 넘을 때 무슨 일이 생기나", path: "/vix_explained", description: "역사적 VIX 스파이크와 이후 12개월 수익률 데이터." },
      { label: "왜 S&P500인가: 95년 데이터의 증거", path: "/why_sp500", description: "1930년부터 약 200배, 배당 재투자 시 약 10,000배. 모든 위기를 극복하고 신고점을 경신한 이유." },
      { label: "20년에 한 번 오는 거대한 파도 — 슈퍼 사이클", path: "/super_cycle", description: "중국이 원자재를 삼켰고, AI가 반도체를 삼키고 있다. Jim Rogers·Goldman Sachs·NBER 논문으로 읽는 장기 사이클의 메커니즘." },
      { label: "주식 한다면 꼭 알아야 할 개념 — QE(양적완화)·QT(양적긴축)", path: "/qe_qt", description: "2008년부터 2025년까지, 연준 대차대조표 10배 팽창과 수축이 S&P 500에 남긴 흔적. 버냉키·달리오·마크스·그랜썸의 견해." },
      { label: "미국 경제를 움직이는 5개의 톱니바퀴 — 연준·재무부·은행·기업·가계", path: "/us_economy_players", description: "GDP = C+I+G+NX. 5개 행위자가 어떻게 연결되어 주식시장을 만드는지 — 버냉키·달리오 학술 근거로 읽는 미국 경제의 큰 그림." },
      { label: "연준 의장 5인이 미국 경제를 결정했다", path: "/fed_chairs", description: "볼커의 금리 21.5%부터 파월의 11회 금리 인상까지. 차기 의장 케빈 워시의 QT + 금리 인하 동시 시행 논쟁과 전문가 견해." },
      { label: "거인들이 바라본 2030: 주식시장 대전환 청사진", path: "/giants_prediction", description: "머스크의 에너지 병목, 달리오의 신흥시장 우위, 그랜텀의 미국 고평가 경고. 저명한 투자자와 기관들이 예측하는 앞으로 10년의 대변화." },
      { label: "금리는 주가의 중력이다 — 버핏이 말한 '중력'의 의미", path: "/interest_rate", description: "\"금리는 자산에 중력과 같다\" — 버핏. DCF·Fed Model·볼커 쇼크·2022년 Fed 인상까지. 금리-주가 관계의 이론·역사·전략 총정리." },
    ],
  },
  {
    id: "advanced",
    label: "전략 심화",
    items: [
      { label: "Buy-and-Hold vs 추세추종: 누가 더 나은가", path: "/buy_hold_vs_trend", description: "CAGR은 유사하거나 낮을 수 있으나 MDD 50% 감소. 버틸 수 있는 전략이 이기는 전략." },
      { label: "적립식 vs 일시투자: 과학은 뭐라고 말하나", path: "/dca_vs_lump_sum", description: "약 68%의 기간에서 일시투자가 우수. 하지만 개인에겐 적립식이 심리적 안정을 제공." },
      { label: "피터 린치의 경고: '상위 30일을 놓치면 수익이 반토막'", path: "/peter_lynch_warning", description: "1997년 $100,000 투자. 최고 상승 30일만 놓쳤을 때 $153,792 vs 보유 시 $341,722." },
      { label: "모멘텀 효과: 강세주는 왜 계속 강세인가", path: "/momentum_effect", description: "최근 3~12개월 강세주가 향후도 강세. 미국에선 유효, 한국에선 역행이 더 효과적." },
      { label: "CTA 헤지펀드: 위기에 강한 시스템 투자의 원조", path: "/cta_funds", description: "닷컴·금융위기·코로나 당시 다른 펀드가 하락할 때 CTA 펀드는 어땠는가." },
      { label: "분산투자의 과학: 왜 185개를 추적하는가", path: "/diversification_science", description: "상관성 없는 자산들이 함께 상승할 때 추세 강도가 극대화되는 원리." },
      { label: "샤프 비율과 소르티노 비율: 리스크 조정 수익률의 이해", path: "/risk_adjusted_return", description: "단순 수익률 비교의 함정. 하락 변동성만 패널티로 주는 소르티노가 추세추종 평가에 적합." },
      { label: "개별 종목에도 앗추 필터를 적용해도 되나요?", path: "/individual_stock_ma200", description: "지수에서 검증된 200일선 전략을 개별 종목에도 활용할 수 있는지, 학술 연구와 투자자 원칙으로 살펴봅니다." },
      { label: "경제 사이클을 예측하지 마라 — 섹터 모멘텀 ETF 전략", path: "/sector_momentum", description: "1920년대 이후 100년 데이터. S&P500 대비 연 5.4% 초과, 샤프 비율 4배. 예측 없이 신호만 따라간다." },
      { label: "앗추 필터를 매도 기준으로?", path: "/atchu_filter_sell_criteria", description: "보유 종목 매도 판단에 활용하는 방법과 선물에서의 한계." },
      { label: "SPY·QQQ가 약할 때, 다른 자산에서 기회를 찾을 수 있을까?", path: "/spy_qqq_decline_rotation", description: "2022년 에너지 +64% vs QQQ -33%. 100년 데이터가 보여주는 섹터·국가 로테이션의 조건과 한계." },
    ],
  },
];

export default function InvestorStoriesSection() {
  const [activeId, setActiveId] = useState("all");

  const displayed = activeId === "all"
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id === activeId);

  return (
    <>
      <div className="column-category-bar">
        <button
          className={`column-category-chip${activeId === "all" ? " active" : ""}`}
          onClick={() => setActiveId("all")}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`column-category-chip${activeId === cat.id ? " active" : ""}`}
            onClick={() => setActiveId(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {displayed.map((cat) => (
        <div key={cat.id} style={{ marginBottom: "8px" }}>
          {activeId === "all" && (
            <div className="more-section-label">{cat.label}</div>
          )}
          <div className="more-link-list">
            {cat.items.map((item) => (
              <Link key={item.path} to={item.path} className="more-link-card">
                <div className="more-link-label">{item.label}</div>
                <div className="more-link-desc">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
