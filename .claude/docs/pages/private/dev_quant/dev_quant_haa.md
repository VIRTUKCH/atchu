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
- `momentum = ((p0/p1 - 1) + (p0/p3 - 1) + (p0/p6 - 1) + (p0/p12 - 1)) / 4 × 100`

### 2. 카나리아 필터 — TIPS 모멘텀
- **TIP(물가연동채권 ETF)** 모멘텀이 양수 → 공격 모드
- TIP 모멘텀이 음수 → 방어 모드 (전액 채권/현금)
- BAA의 4개 카나리아(SPY, EEM, EFA, AGG) 대신 TIP 단일 지표 사용 → 간소화

### 3. 공격 모드
- 공격 유니버스: SPY, EFA, EEM, VNQ, DBC, GLD, TLT (7개)
- 모멘텀 상위 **4개** 자산에 각 25% 균등 배분
- 단, 개별 자산 모멘텀이 음수이면 해당 비중은 현금(BIL)으로 대체

### 4. 방어 모드
- 전액 IEF(중기채)에 투자
- IEF 모멘텀이 음수면 BIL(초단기채)로 대체

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
| 카나리아 | SPY, EEM, EFA, AGG (4개) | TIP (1개) |
| 모멘텀 가중치 | 13612W (12:4:2:1) | 균등 평균 |
| 공격 선택 수 | A: 1개 / B: 6개 | 4개 |
| 공격 BIL 대체 | 없음 | 개별 모멘텀 < 0 → BIL |
| 방어 방식 | top 3 × 33.3% + BIL 치환 | IEF 100% (또는 BIL) |
| 과적합 위험 | 높음 (3개 전략 결합) | 낮음 (단순 구조) |
| 세금 효율 | 최악 | 보통 |

## 한계점

1. **TIPS 데이터**: 실제 TIPS는 1997년 이후 존재. 이전 데이터는 시뮬레이션
2. **세금 비효율**: 월간 리밸런싱으로 54%가 단기 자본이득
3. **최근 TIPS 필터 유효성**: 지난 10년간 감소 추세
4. **주식-채권 동반 하락**: 2022년처럼 상관관계 붕괴 시 방어 모드도 손실 가능

---

## 페이지 구조 — HAA 상세 (`/_dev_quant/haa`)

| 순서 | 섹션 | 답하는 질문 | 컴포넌트 |
|------|------|------------|----------|
| 0 | ← 퀀트 엿보기 | 네비게이션 | `ColumnBackLink` |
| 1 | 기간별 수익률 | "최근 성과는?" | `ColumnStatGrid` |
| 2 | 현재 신호 | "공격인가 방어인가?" | 인라인 배지 |
| 3 | 이번 달 포트폴리오 | "뭘 사야 하나?" | `ColumnCompareTable` |
| 4 | 카나리아 모멘텀 | "왜 이 모드인가?" | `ColumnKeyFact` (TIP 1개) |
| 5 | 공격 유니버스 순위 | "각 자산의 강약은?" | `ColumnCompareTable` |
| 6 | 백테스트 성과 | "이 전략이 얼마나 좋은가?" | `ColumnStatGrid` + `HaaEquityCurveChart` |
| 7 | 리밸런싱 히스토리 | "과거에 어떻게 배분했나?" | `ColumnTimeline` |
| 8 | 경고 | 투자 판단 책임 | `ColumnWarningCard` |

---

## 라우트

```jsx
<Route path="/_dev_quant/haa" element={<BentoLayout><PasswordGate><HaaQuantPeekPage /></PasswordGate></BentoLayout>} />
```

HAA는 단일 전략 (BAA처럼 aggressive/balanced 변형 없음) → variant prop 불필요.

---

## 데이터 출처

| 데이터 | 파일 경로 | 로딩 방식 | 갱신 주기 |
|--------|----------|-----------|----------|
| HAA 신호·배분 | `data/summary/haa/haa_signal.json` | `import.meta.glob` eager | 매일 (pipeline.sh) |
| HAA 전용 티커 메타 | `data/tickers/haa.json` | 파이프라인 전용 | 수동 |
| ETF CSV (계산용) | `data/csv/*.US_all.csv` | 프론트 미사용 (파이프라인 전용) | 매일 |

---

## haa_signal.json 출력 구조

```json
{
  "generatedAt": "2026-03-24T05:00:00.000Z",
  "signal": {
    "mode": "offensive",
    "rebalanceDate": "2026-02-27",
    "canaryPositive": true
  },
  "canary": [
    { "ticker": "TIP", "nameKo": "물가연동 국채", "momentum": 2.35 }
  ],
  "offensiveRanking": [
    { "ticker": "GLD", "nameKo": "금", "momentum": 8.91, "selected": true, "replacedByBil": false },
    { "ticker": "SPY", "nameKo": "S&P 500", "momentum": 5.12, "selected": true, "replacedByBil": false }
  ],
  "defensiveInfo": {
    "ticker": "IEF", "nameKo": "중기 국채", "momentum": 0.5, "replacedByBil": false
  },
  "portfolios": {
    "haa": {
      "mode": "offensive",
      "allocations": [
        { "ticker": "GLD", "nameKo": "금", "weight": 25, "momentum": 8.91, "replacedByBil": false },
        { "ticker": "SPY", "nameKo": "S&P 500", "weight": 25, "momentum": 5.12, "replacedByBil": false },
        { "ticker": "EFA", "nameKo": "선진국 (EAFE)", "weight": 25, "momentum": 3.44, "replacedByBil": false },
        { "ticker": "EEM", "nameKo": "신흥국 (MSCI)", "weight": 25, "momentum": 1.20, "replacedByBil": false }
      ]
    }
  },
  "backtest": {
    "startDate": "2007-03-30",
    "endDate": "2026-02-27",
    "haa": { "cagr": 10.5, "mdd": -12.3, "sharpe": 1.2, "maxAnnualLoss": -5.1 },
    "benchmarkSpy": { "cagr": 11.4, "mdd": -46.32, "sharpe": 0.774 },
    "benchmark6040": { "cagr": 8.25, "mdd": -29.69, "sharpe": 0.843 },
    "defensiveRatio": 0.42,
    "equityCurve": [
      { "date": "2007-03-30", "haa": 1, "spy": 1, "sixtyForty": 1 }
    ]
  },
  "history": [
    { "date": "2026-02-27", "mode": "offensive", "haa": [{ "ticker": "GLD", "weight": 25 }] }
  ]
}
```

---

## 컴포넌트 매핑

| 컴포넌트 | 파일 | 용도 |
|----------|------|------|
| `HaaQuantPeekPage` | `src/pages/HaaQuantPeekPage.jsx` | HAA 상세 페이지 |
| `HaaEquityCurveChart` | `src/components/haa/HaaEquityCurveChart.jsx` | 누적 수익률 SVG 차트 |
| `haaDataLoaders` | `src/utils/haaDataLoaders.js` | haa_signal.json eager 로딩 |

column 컴포넌트 재사용: `ColumnBackLink`, `ColumnKeyFact`, `ColumnKeyFactGrid`, `ColumnCompareTable`, `ColumnCallout`, `ColumnStatGrid`, `ColumnWarningCard`, `ColumnTimeline`, `ColumnTimelineItem`

---

## 구현 체크리스트

- [x] 기획 문서 상세화
- [x] 파이프라인: `generate_haa_signal.mjs`
- [x] 데이터: `data/summary/haa/haa_signal.json` (파이프라인 생성)
- [x] 티커 메타: `data/tickers/haa.json`
- [x] 데이터 로더: `src/utils/haaDataLoaders.js`
- [x] 상세 페이지: `src/pages/HaaQuantPeekPage.jsx`
- [x] 차트: `src/components/haa/HaaEquityCurveChart.jsx`
- [x] 설정: `quantItems.js` HAA → active
- [x] 허브: `QuantHubPage.jsx` HAA 분기 추가
- [x] 라우트: `AppRoutes.jsx` HAA 라우트 추가
- [x] pipeline.sh HAA 블록 추가

## 참고 자료

- [HAA 원본 논문 (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4346906)
- [Allocate Smartly — HAA](https://allocatesmartly.com/hybrid-asset-allocation/)
- [Price Action Lab — HAA OOS Performance](https://www.priceactionlab.com/Blog/hybrid-asset-allocation/)
- [HAA Strategy Revisited](https://nlxfinance.wordpress.com/2024/03/07/the-haa-strategy-revisited/)

---

**관련 페이지 기획:** [dev_quant_index.md](dev_quant_index.md) (퀀트 허브 공통)
**관련 파이프라인:** `generate_haa_signal.mjs`, `pipeline.sh`
