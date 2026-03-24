/**
 * 퀀트 전략 항목 단일 원천 (Single Source of Truth)
 *
 * QuantHubPage 목록과 각 전략 상세 페이지가 이 데이터를 공유한다.
 */
export const QUANT_STRATEGIES = [
  {
    id: "baa-a",
    path: "/_dev_quant/baa-a",
    label: "BAA-A (Aggressive)",
    description: "G4 top 1 집중 투자 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
    curveKey: "aggressive",
  },
  {
    id: "baa-b",
    path: "/_dev_quant/baa-b",
    label: "BAA-B (Balanced)",
    description: "G12 top 6 분산 투자 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
    curveKey: "balanced",
  },
  {
    id: "haa",
    path: "/_dev_quant/haa",
    label: "HAA (Hybrid Asset Allocation)",
    description:
      "TIPS 모멘텀 필터 + 듀얼 모멘텀 top 4 분산 — BAA 저자의 간소화 후속작",
    status: "active",
    curveKey: "haa",
  },
  {
    id: "faber-sector",
    path: "/_dev_quant/faber-sector",
    label: "Faber 섹터 모멘텀",
    description: "3개월 수익률 상위 3 섹터 + 10개월 SMA 트렌드 필터 — Meb Faber 방식",
    status: "active",
    curveKey: "faberSector",
  },
  {
    id: "dual-momentum",
    path: "/_dev_quant/dual-momentum",
    label: "듀얼 모멘텀",
    description: "상대모멘텀(어느 섹터?) + 절대모멘텀(지금 투자할 때?) — Gary Antonacci 방식",
    status: "coming_soon",
    curveKey: null,
  },
  {
    id: "business-cycle",
    path: "/_dev_quant/business-cycle",
    label: "경기순환 섹터 로테이션",
    description: "경기 4국면(회복→호황→둔화→침체)별 강세 섹터 매핑 — Sam Stovall 방식",
    status: "coming_soon",
    curveKey: null,
  },
  {
    id: "risk-parity",
    path: "/_dev_quant/risk-parity",
    label: "리스크 패리티 / All Weather",
    description:
      "위험 기여도 균등 배분 — 경제 4계절 대응 정적 포트폴리오 (Ray Dalio)",
    status: "coming_soon",
    curveKey: null,
  },
  {
    id: "trend-following",
    path: "/_dev_quant/trend-following",
    label: "트렌드 팔로잉 / CTA",
    description:
      "자산군별 시계열 모멘텀 롱/숏 — 위기 시 역상관 수익 (crisis alpha)",
    status: "coming_soon",
    curveKey: null,
  },
  {
    id: "multi-factor",
    path: "/_dev_quant/multi-factor",
    label: "멀티팩터 QVM",
    description:
      "Quality + Value + Momentum 결합 종목 선별 — AQR 시장중립 방식",
    status: "coming_soon",
    curveKey: null,
  },
];

/** id로 전략 메타 데이터를 찾는 헬퍼 */
export function getQuantMeta(id) {
  return QUANT_STRATEGIES.find((s) => s.id === id);
}
