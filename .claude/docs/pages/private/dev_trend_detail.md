# 개별주 상세 — /_dev_trend_list/:ticker

## 이 페이지의 역할

`/_dev_trend_list`에서 카드를 클릭했을 때 진입하는 개발자 전용 상세 페이지. 개별 종목의 차트, 교차 이력, 전략 비교를 보여준다.

> **원칙**: 공개 서비스에서 숨겨진 티커(개별주, 레버리지·인버스 ETF 전부)는 이 페이지에서 상세를 볼 수 있다.

**처리하는 티커 유형:**
- S&P 500 개별주 (AAPL, NVDA 등) — CSV on-demand fetch
- 레버리지·인버스 ETF (TQQQ, SOXL, TSLL, NVDL 등) — CSV 번들 로드 (ETF 방식)

**답하는 질문:**
- "이 종목이 지금 추세 안에 있나?"
- "언제 진입했고 언제 이탈했나?"
- "이 전략이 실제로 효과가 있었나?"
- "차트로 직접 보고 싶다"

---

## 유입 경로

- `/_dev_trend_list` 리스트에서 카드 클릭
- `/_dev_market_overview` 히트맵/신호에서 종목 클릭

---

## 페이지 구조

| 순서 | 컴포넌트 | 내용 |
|---|---|---|
| 1 | EtfSummaryCard | 현재가, 이격률, 앗추 필터 상태, **골든크로스/데드크로스 배지**, CAGR, MDD |
| 2 | PriceTrendChart (3M 일봉) | 최근 3개월 캔들 + MA50/MA200 + **거래량 서브차트** |
| 3 | PriceTrendChart (1Y 주봉) | 최근 1년 캔들 + MA50/MA200 + **거래량 서브차트** |
| 4 | PriceTrendChart (5Y 월봉) | 최근 5년 캔들 + MA50/MA200 + **거래량 서브차트** |
| 5 | StrategyComparisonCard | 매수후보유 vs 200일선 vs 앗추 필터 비교 |
| 6 | TrendCrossingHistoryCard | 200일선 돌파 이력 테이블 |
| 7 | **MonthlyReturnsHeatmap** | **월별 수익률 히트맵** (ETF 상세와 동일, CSV 기반) |
| 8 | AdvancedMetricsCard | 샤프비율, 소르티노, 승률, 평균보유일수 |

---

## 종목 유형별 차이

| | 공개 ETF (`/trend_list/:ticker`) | S&P 500 개별주 (`/_dev_trend_list/:ticker`) | 레버리지·인버스 ETF (`/_dev_trend_list/:ticker`) |
|---|---|---|---|
| CSV 로딩 | 빌드 시 번들 | `public/csv_stock/`에서 `fetch()` on-demand | 빌드 시 번들 (ETF 방식) |
| 이평선 | MA200 1개 | **MA50 + MA200 2개** | **MA50 + MA200 2개** |
| 크로스 배지 | 없음 | 골든크로스/데드크로스 표시 | 골든크로스/데드크로스 표시 |
| 메타데이터 | `trend_following.suitability` 배지 | sp500.json의 `short_description` | `stock_leverage/inverse.json`의 `short_description` + `underlying` (기초자산) |
| 노출 범위 | 공개 | 개발자 전용 | 개발자 전용 (초보자 보호) |

---

## 골든크로스 / 데드크로스

### 차트 구성

| 라인/요소 | 색상 | CSS 클래스 |
|------|------|-----------|
| 종가 | 파랑 (기존) | `.chart-close` |
| MA50 | 초록 `#16a34a` / 다크 `#4ade80` | `.chart-ma50` |
| MA200 | 주황 `#b45309` / 다크 `#facc15` | `.chart-ma200` |
| 거래량 바 (상승) | 빨강 `#d6473b` opacity 0.5 / 다크 `#f87171` | `.chart-volume-up` |
| 거래량 바 (하락) | 파랑 `#1d5bff` opacity 0.5 / 다크 `#60a5fa` | `.chart-volume-down` |

- 범례는 MA50 데이터가 있을 때만 조건부 표시.
- 거래량 서브차트는 `PriceTrendChart`의 `showVolume={true}` prop으로 활성화 (관리자 전용).
- 공개 ETF 상세 페이지(`/trend_list/:ticker`)에는 `showVolume` 미전달 → 기존 동작 유지.
- 거래량 y축: 최대값(M/B/K 포맷)과 절반값 2개 포인트 표시.
- 캔들 방향(시가 대비 종가)에 따라 상승/하락 색상 자동 적용.

### 카드 크로스 인디케이터 (goldenCross)

앗추 필터 인디케이터와 동일한 형태: **불(dot) + 텍스트**. 앗추 필터 바로 아래 줄에 표시.

```
● 앗추 필터 적용 중 (20/20일)     ← 기존 (1행)
● 골든크로스                       ← 신규 (2행, 별도 줄)
```

| 값 | 조건 | 텍스트 | 불 + 글자 색상 |
|---|------|--------|--------------|
| `"golden"` | MA50 > MA200 | `골든크로스` | 초록 (앗추 active와 동일) |
| `"dead"` | MA200 > MA50 | `데드크로스` | 빨강 (앗추 inactive와 동일) |

위치: `.atchu-filter-indicator` 아래에 별도 `.golden-cross-indicator` div

### 골든크로스 전략 거래 내역

TrendCrossingHistoryCard에 **"골든크로스"** 탭 추가 (기존 "200일선" / "앗추 필터" 옆).

**전략 정의:**

| | 조건 |
|---|------|
| **진입 (매수)** | MA50 > MA200 (골든크로스 달성) |
| **이탈 (매도)** | MA200 > MA50 (데드크로스) |

**탭 구조:**
```
[200일선] [앗추 필터] [골든크로스]    ← 3개 탭
```

**거래 내역 테이블 (기존과 동일 구조):**

| 날짜 | 액션 | 가격(매매 수익률) |
|------|------|-----------------|
| 26/01/15 | 매수 | $247.99 |
| 26/03/10 | 매도 | $232.15 (-6.4%) |

**통계 행**: 연 매매 빈도, 상승/하락 신호 수, CAGR, MDD

### StrategyComparisonCard 확장

| 전략 | 연평균 수익률 | MDD | 연 매매 빈도 |
|------|-------------|-----|------------|
| 매수 후 보유 | 8.5% | -50.2% | — |
| 200일선 | 17.65% | -91.06% | 3.2회 |
| 앗추 필터 | 12.57% | -94.6% | 2.8회 |
| 골든크로스 | 8.23% | -50.9% | 4.1회 |

### 데이터 소스

- `crossingHistory.periods`에 `"golden_cross"` 포함 → 탭 자동 생성
- `crossingHistory.periodLabels`:
  - `"golden_cross"` = `"골든크로스"`
- `crossingHistory.items`에서 `period` 필터링 → 각 전략 거래 내역
- `crossingHistory.annualizedMap[key]` → CAGR
- `crossingHistory.mddMap[key]` → MDD

### 학술적 근거

- **골든크로스 (Golden Cross)**: MA50이 MA200 위로 교차하면 강세 신호, 아래로 교차(데드크로스)하면 약세 신호. 시장에서 가장 널리 사용되는 추세 확인 기법
- **Brock, Lakonishok, LeBaron (1992)**: 이동평균 교차 전략이 DJIA에서 통계적으로 유의미한 수익률 달성 (매수 신호 후 수익률 > 무조건적 수익률)
- **핵심 가치**: 수익 극대화가 아닌 **위험 관리** (MDD 축소, 데드크로스 시 신속 이탈)

---

## 관련 컴포넌트

- `StockDetailPage.jsx` — 페이지 본체
- `EtfSummaryCard.jsx` — 요약 카드 (ETF와 공유, `goldenCross` prop 추가)
- `PriceTrendChart.jsx` — 가격 차트 (ma50/ma200 2선)
- `StrategyComparisonCard.jsx` — 전략 비교
- `TrendCrossingHistoryCard.jsx` — 교차 이력
- `AdvancedMetricsCard.jsx` — 심화 지표

## 관련 데이터

- `stock_snapshots.json` — 스냅샷 (movingAverage50/200, goldenCross, CAGR, MDD)
- `public/csv_stock/{TICKER}.US_all.csv` — 종목별 CSV (on-demand fetch)
- `csvAnalytics.js` — CSV → 차트/분석 데이터 변환 (PERIODS [50, 200])
- `stockDataLoaders.js` — 스냅샷 → UI shape 변환 (`toRecentShape`)
