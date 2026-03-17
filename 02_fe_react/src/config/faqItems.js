/**
 * FAQ 항목 단일 원천 (Single Source of Truth)
 *
 * FaqPage 목록과 각 FAQ 페이지의 ColumnHero가 이 데이터를 공유한다.
 * 제목을 바꾸면 목록과 페이지가 동시에 바뀐다.
 */
export const FAQ_ITEMS = [
  {
    path: "/atchu_strategy",
    label: "앗추 필터가 무엇인가요?",
    description: "감정이 기준이 되면 진다. 앗추 필터의 철학과 16/20 규칙.",
    heroDesc: "감정이 기준이 되면 진다. 앗추 필터는 누구나 따라할 수 있는 단순하고 검증된 매매 기준입니다.",
  },
  {
    path: "/moving_average_history",
    label: "왜 하필 200일선인가?",
    description: "단기 이평선 대신 200일선을 쓰는 이유. 매매 횟수를 줄여 삶과 투자의 균형을 찾는 앗추의 철학.",
    heroDesc: "직관이 아닙니다. 1950년 이후 70년 데이터가 검증한 숫자입니다.",
  },
  {
    path: "/what_is_moving_average",
    label: "이동평균선, 그래서 뭔데?",
    description: "단기·중기·장기 이평선의 역할과 지지선·저항선으로 읽는 법.",
    heroDesc: "주가의 노이즈를 걷어내고 진짜 추세를 보여주는 가장 단순하면서 강력한 도구.",
  },
  {
    path: "/moving_average_faq",
    label: "앗추 필터, 근거가 있는 것인가요?",
    description: "폴 튜더 존스, 에드 세이코타 등 전설적 투자자들이 이동평균선을 핵심 도구로 사용하는 이유.",
    heroDesc: "단순해 보이는 이 지표를 수십 년간 활용해온 투자자들이 있습니다. 그들이 직접 한 말을 모아봤습니다.",
  },
  {
    path: "/individual_stock_ma200",
    label: "앗추 필터, 개별주에도 사용해도 되나요?",
    description: "지수에는 효과적인 200일선 전략. 개별 종목에도 같은 논리가 통할까? 학술 연구 찬반과 앗추 활용법.",
    heroDesc: "지수에서 검증된 200일선 전략을 개별 종목에도 활용할 수 있는지, 학술 연구와 투자자 원칙으로 살펴봅니다.",
  },
  {
    path: "/atchu_filter_sell_criteria",
    label: "앗추 필터 이미 통과했는데, 중간에 올라타도 될까요?",
    description: "보유 종목 매도 판단에 활용하는 방법과 선물에서의 한계.",
    heroDesc: "앗추 필터 돌파 때 못 샀다. 근데 이 종목, 200일선 위에서 잘 가고 있다. 지금 들어가도 될까? 그리고 들어갔다면 언제 나와야 할까?",
  },
  {
    path: "/holding_conviction",
    label: "하락 뉴스가 나왔는데, 앗추 필터는 괜찮다고 합니다",
    description: "앗추 필터에 이탈 신호가 없다면, 하락 뉴스는 소음일 수 있습니다. 보유에 대한 확신을 갖는 근거.",
    heroDesc: "앗추 필터에 이탈 신호가 없다면, 작은 하락 뉴스는 소음일 수 있습니다.",
  },
  {
    path: "/spy_qqq_decline_rotation",
    label: "앗추 필터도 만능은 아닙니다",
    description: "대세 하락장에서 앗추 필터의 한계를 솔직하게. 모든 자산이 200일선 아래면 현금이 답입니다.",
    heroDesc: "대세 하락장에서 앗추 필터는 어디까지 작동하고, 어디서부터 한계가 있는지 솔직하게 이야기합니다.",
  },
  {
    path: "/why_mdd_matters",
    label: "수익률이 높아도 비중이 작으면 의미 없습니다",
    description: "수익률 10%여도 소액이면 의미 없다. MDD를 줄여야 비중을 높일 수 있고, 비중이 높아야 실질 수익금이 의미 있다.",
    heroDesc: "수익률이 아무리 좋아도, 넣은 돈이 적으면 실질 수익금은 의미가 없습니다. 왜 큰 돈을 넣지 못하는지, 어떻게 하면 넣을 수 있는지 이야기합니다.",
  },
  {
    path: "/can_you_handle_mdd",
    label: "아직 벌어야 할 돈이 많은데, MDD는 조금 덜 봐도 되나요?",
    description: "-55% 하락을 버틸 수 있다고 생각하지만, 실제로는 공포에 팔게 됩니다. DALBAR 데이터가 증명합니다.",
    heroDesc: "아직 젊고 시간이 많으니 MDD는 괜찮다? 데이터는 다른 이야기를 합니다.",
  },
];

/** path로 FAQ 메타 데이터를 찾는 헬퍼 */
export function getFaqMeta(path) {
  return FAQ_ITEMS.find((item) => item.path === path);
}
