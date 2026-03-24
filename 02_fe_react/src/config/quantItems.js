/**
 * 퀀트 전략 항목 단일 원천 (Single Source of Truth)
 *
 * QuantHubPage 목록과 각 전략 상세 페이지가 이 데이터를 공유한다.
 * 티어 순 정렬: 1티어(기관 검증) → 2티어(전문가 검증) → 3티어(연구 단계)
 */
export const QUANT_STRATEGIES = [
  /* ── 1티어 (기관 검증) — 대형 기관이 수십~수백조 직접 운용 ── */
  {
    id: "risk-parity",
    path: "/_dev_quant/risk-parity",
    label: "리스크 패리티 / All Weather",
    description:
      "위험 기여도 균등 배분 — 경제 4계절 대응 정적 포트폴리오 (Ray Dalio)",
    status: "active",
    curveKey: "allw",
    tier: 1,
    tierLabel: "1티어 (기관 검증)",
    warning: "⚠️ 데이터 짧음 주의",
  },
  {
    id: "trend-following",
    path: "/_dev_quant/trend-following",
    label: "트렌드 팔로잉 / CTA",
    description:
      "9개 자산군 앗추 필터 + 동일 비중 — 월가 방법론의 개인 투자자용 간소화",
    status: "active",
    curveKey: "trend",
    tier: 1,
    tierLabel: "1티어 (기관 검증)",
  },
  {
    id: "multi-factor",
    path: "/_dev_quant/multi-factor",
    label: "멀티팩터 QVM",
    description:
      "Quality + Value + Momentum 결합 종목 선별 — AQR 시장중립 방식",
    status: "coming_soon",
    curveKey: null,
    tier: 1,
    tierLabel: "1티어 (기관 검증)",
  },

  /* ── 2티어 (전문가 검증) — 업계 전문가 체계화, 소규모 펀드 운용 ── */
  {
    id: "faber-sector",
    path: "/_dev_quant/faber-sector",
    label: "Faber 섹터 모멘텀",
    description: "3개월 수익률 상위 3 섹터 + 10개월 SMA 트렌드 필터 — Meb Faber 방식",
    status: "active",
    curveKey: "faberSector",
    tier: 2,
    tierLabel: "2티어 (전문가 검증)",
  },
  {
    id: "dm-gem",
    path: "/_dev_quant/dm-gem",
    label: "듀얼 모멘텀 GEM",
    description:
      "미국 vs 선진국 상대모멘텀 + T-Bill 절대모멘텀 — Gary Antonacci 원조",
    status: "active",
    curveKey: "gem",
    tier: 2,
    tierLabel: "2티어 (전문가 검증)",
  },
  {
    id: "dm-adm",
    path: "/_dev_quant/dm-adm",
    label: "듀얼 모멘텀 ADM",
    description:
      "가속 모멘텀(1M+3M+6M) 기반 미국/선진국 선택 — 단기 추세 반영 강화",
    status: "active",
    curveKey: "adm",
    tier: 2,
    tierLabel: "2티어 (전문가 검증)",
  },
  {
    id: "dm-cdm",
    path: "/_dev_quant/dm-cdm",
    label: "듀얼 모멘텀 CDM",
    description:
      "주식·크레딧·부동산·스트레스 4모듈 분산 — 자산군별 독립 판단",
    status: "active",
    curveKey: "cdm",
    tier: 2,
    tierLabel: "2티어 (전문가 검증)",
  },
  {
    id: "dm-sector",
    path: "/_dev_quant/dm-sector",
    label: "듀얼 모멘텀 섹터",
    description:
      "미국 10개 섹터 상위 4 + T-Bill 절대모멘텀 필터",
    status: "active",
    curveKey: "sector",
    tier: 2,
    tierLabel: "2티어 (전문가 검증)",
  },
  {
    id: "business-cycle",
    path: "/_dev_quant/business-cycle",
    label: "경기순환 섹터 로테이션",
    description: "경기 4국면(회복→호황→둔화→침체)별 강세 섹터 매핑 — Sam Stovall 방식",
    status: "active",
    curveKey: "businessCycle",
    tier: 2,
    tierLabel: "2티어 (전문가 검증)",
  },

  /* ── 3티어 (연구 단계) — 학술 프리프린트, 기관 검증 미확인 ── */
  {
    id: "baa-a",
    path: "/_dev_quant/baa-a",
    label: "BAA-A (Aggressive)",
    description: "G4 top 1 집중 투자 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
    curveKey: "aggressive",
    tier: 3,
    tierLabel: "3티어 (연구 단계)",
  },
  {
    id: "baa-b",
    path: "/_dev_quant/baa-b",
    label: "BAA-B (Balanced)",
    description: "G12 top 6 분산 투자 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
    curveKey: "balanced",
    tier: 3,
    tierLabel: "3티어 (연구 단계)",
  },
  {
    id: "haa",
    path: "/_dev_quant/haa",
    label: "HAA (Hybrid Asset Allocation)",
    description:
      "TIPS 모멘텀 필터 + 듀얼 모멘텀 top 4 분산 — BAA 저자의 간소화 후속작",
    status: "active",
    curveKey: "haa",
    tier: 3,
    tierLabel: "3티어 (연구 단계)",
  },
];

/** id로 전략 메타 데이터를 찾는 헬퍼 */
export function getQuantMeta(id) {
  return QUANT_STRATEGIES.find((s) => s.id === id);
}
