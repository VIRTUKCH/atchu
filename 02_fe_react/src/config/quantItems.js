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
    id: "sector",
    path: "/_dev_quant/sector",
    label: "섹터 로테이션",
    description: "GICS 섹터 모멘텀 기반 배분 전략",
    status: "coming_soon",
    curveKey: null,
  },
];

/** id로 전략 메타 데이터를 찾는 헬퍼 */
export function getQuantMeta(id) {
  return QUANT_STRATEGIES.find((s) => s.id === id);
}
