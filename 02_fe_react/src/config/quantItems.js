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
    id: "faber-sector",
    path: "/_dev_quant/faber-sector",
    label: "Faber 섹터 모멘텀",
    description: "3개월 수익률 상위 3 섹터 + 10개월 SMA 트렌드 필터 — Meb Faber 방식",
    status: "coming_soon",
    curveKey: null,
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
];

/** id로 전략 메타 데이터를 찾는 헬퍼 */
export function getQuantMeta(id) {
  return QUANT_STRATEGIES.find((s) => s.id === id);
}
