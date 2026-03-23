# 개별주 상세 — /_stocks/:ticker

## 이 페이지의 역할

ETF 상세(`/index_etf/:ticker`)의 개별주 버전. 개별 종목의 차트, 교차 이력, 전략 비교를 보여준다.

**답하는 질문:**
- "이 종목이 지금 추세 안에 있나?"
- "언제 진입했고 언제 이탈했나?"
- "이 전략이 실제로 효과가 있었나?"
- "차트로 직접 보고 싶다"

---

## 유입 경로

- `/_stocks` 리스트에서 카드 클릭
- `/_stocks_overview` 히트맵/신호에서 종목 클릭

---

## 페이지 구조

| 순서 | 컴포넌트 | 내용 |
|---|---|---|
| 1 | EtfSummaryCard | 현재가, 이격률, 앗추 필터 상태, **정배열 배지**, CAGR, MDD |
| 2 | PriceTrendChart (1Y) | 최근 1년 가격 + **MA50(초록)/MA100(노랑)/MA200(주황)** |
| 3 | PriceTrendChart (5Y) | 최근 5년 가격 + MA50/MA100/MA200 |
| 4 | StrategyComparisonCard | 매수후보유 vs 200일선 vs 앗추 필터 비교 |
| 5 | TrendCrossingHistoryCard | 200일선 돌파 이력 테이블 |
| 6 | AdvancedMetricsCard | 샤프비율, 소르티노, 승률, 평균보유일수 |

---

## ETF 상세와의 차이

| | ETF (`/index_etf/:ticker`) | 개별주 (`/_stocks/:ticker`) |
|---|---|---|
| CSV 로딩 | 빌드 시 번들 | `public/csv_stock/`에서 `fetch()` on-demand |
| 이평선 | MA200 1개 | **MA50 + MA100 + MA200 3개** |
| 정배열 배지 | 없음 | 정배열/부분 정배열/역배열 표시 |
| 메타데이터 | `trend_following.suitability` 배지 | ETF 전용 필드 없음 (미표시) |
| 설명 | ticker JSON의 `short_description` | sp500.json의 `short_description` |

---

## 이평선 정배열

### 차트 3개 라인

| 라인 | 색상 | CSS 클래스 |
|------|------|-----------|
| 종가 | 파랑 (기존) | `.chart-close` |
| MA50 | 초록 `#16a34a` / 다크 `#4ade80` | `.chart-ma50` |
| MA100 | 노랑 `#ca8a04` / 다크 `#facc15` | `.chart-ma100` |
| MA200 | 주황 `#6b6f7a` (기존) | `.chart-ma200` |

범례는 MA50/MA100 데이터가 있을 때만 조건부 표시.

### 카드 정배열 인디케이터 (maAlignment)

앗추 필터 인디케이터와 동일한 형태: **불(dot) + 텍스트**. 앗추 필터 바로 아래 줄에 표시.

```
● 앗추 필터 적용 중 (20/20일)     ← 기존 (1행)
● 이평선 정배열                    ← 신규 (2행, 별도 줄)
```

| 값 | 조건 | 텍스트 | 불 + 글자 색상 |
|---|------|--------|--------------|
| `"full"` | price > MA50 > MA100 > MA200 | `이평선 정배열` | 초록 (앗추 active와 동일) |
| `"partial"` | price > MA200 AND MA50 > MA200 | `이평선 부분 정배열` | 노랑 `#ca8a04` / 다크 `#facc15` |
| `"none"` | 위 조건 모두 미충족 | (미표시) | — |
| `"reverse"` | MA200 > MA100 > MA50 > price | `이평선 역배열` | 빨강 (앗추 inactive와 동일) |

위치: `.atchu-filter-indicator` 아래에 별도 `.ma-alignment-indicator` div

### 학술적 근거

- **Han, Yang, Zhou (2016)**: 다중 MA "트렌드 팩터" 월 수익률 1.63% (모멘텀 0.79%의 2배)
- **백테스트 결과** (S&P 500 501종목): 완전 정배열 샤프비율 1.41 (매수후보유 0.45의 3배), MDD -50.9% (BH -72.3%), t-test p < 0.0001
- **핵심 가치**: 수익 극대화가 아닌 **위험 관리** (MDD 축소, 샤프비율 개선)

---

## 관련 컴포넌트

- `StockDetailPage.jsx` — 페이지 본체
- `EtfSummaryCard.jsx` — 요약 카드 (ETF와 공유, `maAlignment` prop 추가)
- `PriceTrendChart.jsx` — 가격 차트 (ma50/ma100/ma200 3선)
- `StrategyComparisonCard.jsx` — 전략 비교
- `TrendCrossingHistoryCard.jsx` — 교차 이력
- `AdvancedMetricsCard.jsx` — 심화 지표

## 관련 데이터

- `stock_snapshots.json` — 스냅샷 (movingAverage50/100/200, maAlignment, CAGR, MDD)
- `public/csv_stock/{TICKER}.US_all.csv` — 종목별 CSV (on-demand fetch)
- `csvAnalytics.js` — CSV → 차트/분석 데이터 변환 (PERIODS [50, 100, 200])
- `stockDataLoaders.js` — 스냅샷 → UI shape 변환 (`toRecentShape`)
