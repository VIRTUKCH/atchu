# 리스크 패리티 / All Weather — /_dev_quant/risk-parity

## 전략 개요

| 항목 | 내용 |
|------|------|
| **저자** | Ray Dalio (Bridgewater Associates) |
| **유형** | 정적 자산배분 (Strategic Asset Allocation) |
| **리밸런싱** | 분기 또는 연 1회 |
| **핵심 아이디어** | 달러가 아닌 **위험 기여도**를 균등 배분. 경제의 4가지 계절에 모두 대응 |
| **특징** | 액티브 판단 불필요, 규칙 기반 정적 배분 |

## 전략 로직

### 경제 4계절 매트릭스

| | 성장 상승 | 성장 하락 |
|---|---------|---------|
| **인플레 상승** | 주식, 원자재, 금 | 물가연동채, 금, 원자재 |
| **인플레 하락** | 주식, 채권 | 채권 |

### Dalio의 All Weather 배분

| 자산 | 비중 | ETF | 역할 |
|------|------|-----|------|
| 미국 주식 | 30% | VTI/SPY | 성장 |
| 장기 국채 (20Y+) | 40% | TLT | 디플레/침체 방어 |
| 중기 국채 (7-10Y) | 15% | IEF | 안정성 |
| 금 | 7.5% | GLD | 인플레 헤지 |
| 원자재 | 7.5% | DBC/GSG | 인플레 헤지 |

### 리스크 패리티의 원리
- 주식 60%/채권 40%의 전통 포트폴리오는 **위험의 90%가 주식에 집중**
- 리스크 패리티는 각 자산의 위험 기여도를 균등하게 → 채권 비중 증가
- Dalio: "5개의 좋은 비상관 수익 흐름을 위험 균형으로 조합하면 수익은 유지, 위험은 80% 감소"

## 최근 동향 (2024-2025)

- **2025년 3월**: State Street + Bridgewater → **SPDR Bridgewater All Weather ETF (ALLW)** 출시
  - 비용: 0.85%/년
  - 레버리지: ~1.8x (선물 활용)
- 고부채, 비싼 주식, $4,000+ 금 시대에 All Weather 포트폴리오 재조명
- 2022년 주식-채권 동반 하락 이후 "리스크 패리티는 끝났다"는 비판 → 2024-2025 회복

## 장점

1. **단순함**: 매월 판단 불필요, 정해진 비중으로 리밸런싱만
2. **모든 경제 환경 대응**: 특정 레짐에 의존하지 않음
3. **낮은 MDD**: 분산 효과로 전통 포트폴리오 대비 drawdown 감소
4. **낮은 거래 비용**: 리밸런싱 빈도 낮음

## 한계점

1. **금리 상승기 약세**: 2022년 채권 비중 40%가 큰 손실 유발 (장기채 -30%+)
2. **레버리지 필요**: 위험 균등 배분의 기대수익을 높이려면 레버리지가 필요
3. **채권 수익 의존**: 1980~2020년 채권 강세장에서의 성과가 과대평가 가능
4. **주식-채권 상관관계 불안정**: 2022년처럼 양의 상관관계 시 방어 기능 상실

## 구현 계획

- [ ] 파이프라인: `generate_risk_parity_signal.mjs` (정적 배분이므로 단순)
- [ ] 데이터: `data/summary/risk-parity/risk_parity_signal.json`
- [ ] 프론트엔드: 상세 페이지 (배분 비중 파이 차트 + 리밸런싱 히스토리)
- [ ] 특이사항: 다른 전략과 달리 신호(공격/방어)가 없음 → 카드 UI 조정 필요

## 참고 자료

- [Ray Dalio All Weather Portfolio Review (OptimizedPortfolio)](https://www.optimizedportfolio.com/all-weather-portfolio/)
- [Risk Parity Not Performing? Blame the Weather (CAIA)](https://caia.org/blog/2024/01/02/risk-parity-not-performing-blame-weather)
- [Risk Parity Asset Allocation (Quantpedia)](https://quantpedia.com/risk-parity-asset-allocation/)
- [SPDR Bridgewater All Weather ETF](https://www.ssga.com/)
