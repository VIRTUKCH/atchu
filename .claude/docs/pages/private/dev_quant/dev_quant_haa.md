# HAA (Hybrid Asset Allocation) — /_dev_quant/haa

## 전략 개요

| 항목 | 내용 |
|------|------|
| **저자** | Wouter J. Keller & JW Keuning (BAA와 동일) |
| **논문** | "Dual and Canary Momentum with Rising Yields/Inflation: Hybrid Asset Allocation (HAA)" (2023, SSRN) |
| **유형** | 전술적 자산배분 (TAA) |
| **리밸런싱** | 월 1회 (월말) |
| **핵심 아이디어** | TIPS 모멘텀을 카나리아 필터로 사용, 듀얼 모멘텀으로 자산 선별 |
| **BAA 대비 개선** | 과적합 위험 감소, 로직 간소화, 백테스트 신뢰도 향상 |

## 전략 로직

### 1. 모멘텀 계산
- 1, 3, 6, 12개월 수익률의 **단순 평균** (BAA의 13612W 가중치 대신 균등 가중)

### 2. 카나리아 필터 — TIPS 모멘텀
- **TIPS(물가연동채권)** 모멘텀이 양수 → 공격 모드
- TIPS 모멘텀이 음수 → 방어 모드 (전액 채권/현금)
- BAA의 4개 카나리아(SPY, EEM, EFA, AGG) 대신 TIPS 단일 지표 사용 → 간소화

### 3. 공격 모드
- 공격 유니버스: SPY, EFA, EEM, VNQ, DBC, GLD, TLT (7개)
- 모멘텀 상위 **4개** 자산에 각 25% 균등 배분
- 단, 개별 자산 모멘텀이 음수이면 해당 비중은 현금(BIL)으로 대체

### 4. 방어 모드
- 전액 IEF(중기채) 또는 BIL(초단기채)에 투자

## Out-of-Sample 성과 (2020~2026.2)

| 지표 | HAA | SPY (Buy & Hold) |
|------|-----|-------------------|
| **연평균 수익률** | 14.5% | 14.9% |
| **MDD** | -5.9% | -23.9% |
| **샤프비율** | 1.73 | 0.88 |
| **변동성** | 8.4% | 16.9% |
| **베타** | 0.27 | 1.00 |

- SPY 대비 수익률은 비슷하나, **변동성 절반, MDD 1/4, 샤프 2배**
- Allocate Smartly 회원 할당 비중 **2위** (14.9%)

## BAA vs HAA 비교

| 항목 | BAA | HAA |
|------|-----|-----|
| 카나리아 | SPY, EEM, EFA, AGG (4개) | TIPS (1개) |
| 모멘텀 가중치 | 13612W (12:4:2:1) | 균등 평균 |
| 공격 선택 수 | A: 1개 / B: 6개 | 4개 |
| 과적합 위험 | 높음 (3개 전략 결합) | 낮음 (단순 구조) |
| 세금 효율 | 최악 | 보통 |

## 한계점

1. **TIPS 데이터**: 실제 TIPS는 1997년 이후 존재. 이전 데이터는 시뮬레이션
2. **세금 비효율**: 월간 리밸런싱으로 54%가 단기 자본이득
3. **최근 TIPS 필터 유효성**: 지난 10년간 감소 추세
4. **주식-채권 동반 하락**: 2022년처럼 상관관계 붕괴 시 방어 모드도 손실 가능

## 구현 계획

- [ ] 파이프라인: `generate_haa_signal.mjs`
- [ ] 데이터: `data/summary/haa/haa_signal.json`
- [ ] 프론트엔드: 상세 페이지 컴포넌트
- [ ] 티커 메타: `data/tickers/haa.json`

## 참고 자료

- [HAA 원본 논문 (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4346906)
- [Allocate Smartly — HAA](https://allocatesmartly.com/hybrid-asset-allocation/)
- [Price Action Lab — HAA OOS Performance](https://www.priceactionlab.com/Blog/hybrid-asset-allocation/)
- [HAA Strategy Revisited](https://nlxfinance.wordpress.com/2024/03/07/the-haa-strategy-revisited/)
