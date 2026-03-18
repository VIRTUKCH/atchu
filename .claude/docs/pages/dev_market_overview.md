# 개발자 마켓 뷰 — 개인 투자 도구

## 접근 방법

- 테마 토글(다크/라이트) 3초 안에 5번 전환 → 상단 네비에 "관리자" 탭 노출
- 관리자 탭 → DevPage(비밀번호) → 개별주 시장 개요 / 개별주 추세 조회 링크
- 일반 사용자에게 절대 노출되지 않음. 네비게이션·사이트맵·SEO 모두 제외

## 이 기능의 목적

채호님 개인 투자용. 추세추종 자산(3000만원)과 별도로 개별주(1000만원)를 운용할 때 **"지금 어떤 종목이 추세 안에 있고, 어떤 섹터가 주도하는가"**를 파악한다.

앗추의 "개별주는 다루지 않는다" 철학은 유지. 이 페이지는 제품에 포함되지 않고, README에도 언급하지 않는다.

> Discord 알림에서 ETF 추세 신호와 함께 개별주 신호도 오면, 자연스럽게 주도주를 파악할 수 있다.

---

## 페이지 구성 (3개)

| 경로 | 페이지 | 역할 |
|------|--------|------|
| `/_stocks_overview` | 개별주 시장 개요 | "지금 S&P 500 전체가 어떤 상태인가?" |
| `/_stocks` | 개별주 추세 조회 | "구체적으로 어떤 종목이 추세 안에 있나?" |
| `/_stocks/:ticker` | 개별주 상세 | "이 종목의 차트와 백테스트 결과는?" |

---

## /_stocks_overview — 개별주 시장 개요

### 이 페이지의 역할

ETF 시장 개요(`/market_overview`)의 개별주 버전. S&P 500 전체의 추세 건강도를 한눈에 파악한다.

**답하는 질문:**
- "S&P 500 중 몇 퍼센트가 추세 안에 있나?" → 시장 폭
- "어느 섹터/산업이 강하고 약한가?" → 섹터별·산업별 추세 강도
- "최근에 뭐가 바뀌었나?" → 최근 진입/이탈 신호
- "개별 종목별로는?" → S&P 500 히트맵

### 유입 경로

- Discord 관리자 채널 알림 하단 링크 (`/_stocks`)
- DevPage 허브 → "개별주 시장 개요" 카드 클릭

### 페이지 구조 — 줌 레벨

| 순서 | 섹션 | 줌 레벨 | 답하는 질문 |
|---|---|---|---|
| 1 | S&P 500 시장 폭 | 전체 (1줄 요약) | "전체 건강도는?" |
| 2 | 최근 신호 | 이벤트 (최근 5거래일) | "최근에 뭐가 바뀌었나?" |
| 3 | 섹터별 추세 강도 | GICS 섹터 (11개) | "어느 섹터가 강해?" |
| 4 | S&P 500 히트맵 | 개별 (~500종목) | "구체적으로 어떤 종목이?" |

---

### 섹션 1. S&P 500 시장 폭

- bento 카드 1개. 타이틀 "S&P 500 시장 폭"
- 전체 종목 중 앗추 필터 통과 수 + 비율 (%) 표시
- 50% 이상이면 초록, 미만이면 빨강
- **용도**: 시장 전체 건강도를 숫자 하나로 파악. "70% 통과면 강세장, 30%면 약세장"

**왜 503개인가?**
S&P 500 지수는 500개 "기업"이지만, 듀얼 클래스 주식(GOOG/GOOGL, FOX/FOXA, NWS/NWSA) 때문에 종목 수는 503개다. 실질적으로 500개 기업을 추적하는 것이므로 문제 없음. UI에는 "S&P 500"으로 표시.

---

### 섹션 2. 최근 신호

- ETF 시장 개요의 "최근 신호" 섹션과 동일 구조
- 좌우 2열: 진입 / 이탈. 각 열 헤더에 개수 표시 ("진입 (12)" / "이탈 (5)")
- 각 아이템: 티커(회사명) + 날짜(MM-DD). 클릭 시 `/_stocks/:ticker` 상세 이동
- 변화 없으면 "최근 5거래일 변동 없음"
- **500종목이라 진입/이탈이 많을 수 있음**: 목록이 길어지면 max-height + 스크롤 처리

---

### 섹션 3. 섹터별 추세 강도

MainMarketStatusGrid 재사용. **앗추 필터 통과 비율이 높은 순으로 정렬.**

#### GICS 섹터 (11개)

| 섹터 | 종목 수 (대략) | 설명 |
|------|-------------|------|
| 기술 (Information Technology) | ~71 | 소프트웨어, 반도체, 하드웨어, IT서비스 |
| 헬스케어 (Health Care) | ~60 | 바이오텍, 제약, 의료기기, 헬스케어 서비스 |
| 금융 (Financials) | ~76 | 은행, 보험, 자산운용, 핀테크 |
| 임의소비재 (Consumer Discretionary) | ~48 | 유통, 자동차, 레저, 의류, 호텔 |
| 통신 (Communication Services) | ~23 | 미디어, 인터넷, 통신, 게임 |
| 산업재 (Industrials) | ~79 | 항공우주, 방산, 운송, 기계, 건설 |
| 필수소비재 (Consumer Staples) | ~36 | 식품, 음료, 생활용품, 유통 |
| 에너지 (Energy) | ~22 | 석유, 가스, 에너지 장비 |
| 유틸리티 (Utilities) | ~31 | 전력, 가스, 수도, 신재생 |
| 부동산 (Real Estate) | ~31 | 리츠, 부동산 개발 |
| 소재 (Materials) | ~26 | 화학, 건자재, 금속, 포장 |

#### 정렬 기준

기존: SECTOR_ORDER 고정 순서 → **변경: 앗추 필터 통과 비율(%) 내림차순**

이유: 개발자가 "지금 어디가 가장 강한가"를 빠르게 파악하려면 강한 순서대로 봐야 한다.

#### 서브섹터 (산업별) 세분화 — 향후 고려

기술 섹터가 71개로 너무 크다. "기술 38%"라는 숫자만으로는 소프트웨어가 강한지 반도체가 강한지 알 수 없다.

**GICS Sub-Industry 데이터 활용:**
GitHub 데이터셋의 `GICS Sub-Industry` 컬럼을 `sp500.json`에 추가하면 세분화 가능.

기술 섹터 예시 (12개 서브인더스트리):
- Application Software (14종목) — CRM, ADBE, ORCL, NOW ...
- Semiconductors (14종목) — NVDA, AMD, AVGO, QCOM ...
- Systems Software (6종목) — MSFT, PANW, CRWD, FTNT ...
- Technology Hardware (9종목) — AAPL, DELL, HPQ ...
- Semiconductor Equipment (5종목) — AMAT, KLAC, LRCX ...
- Communications Equipment (5종목) — CSCO, MSI ...
- 기타 6개 ...

**구현 방안:**
1. `fetch_sp500_tickers.mjs`에서 GICS Sub-Industry 캡처 → `sp500.json`에 `industry` 필드 추가
2. 섹터별 추세 강도 카드를 클릭하면 해당 섹터의 서브인더스트리별 추세 강도를 펼쳐서 보여줌 (아코디언)
3. 또는 별도 "산업별 추세 강도" 섹션을 섹터 아래에 배치

**당장은 안 해도 되지만**, 데이터(`industry` 필드)는 미리 넣어두는 게 좋다.

---

### 섹션 4. S&P 500 히트맵

#### 현재 문제

MarketHeatmap 컴포넌트는 ETF용으로 설계되어 있다:
- "핵심 지수" (SPY, QQQ, DIA), "스타일" (성장, 밸류, 퀄리티, 저변동성), "배당" 등 ETF 전용 그룹핑 사용
- `buildOverviewData()`가 ETF 메타데이터의 `heatmap_group` 필드를 기준으로 그룹핑
- 개별주 데이터에는 이 필드가 없으므로 "추적 자산" 그룹에 아무것도 안 뜨고, ETF 그룹만 빈 채로 표시됨

#### 해결 방향

개별주용 히트맵은 **GICS 섹터별 그룹핑**을 사용해야 한다.

**방안 A: MarketHeatmap을 범용화**
- `buildOverviewData()`가 `heatmap_group` 대신 `group` (또는 `type`) 필드를 fallback으로 사용하도록 수정
- 그룹 순서를 props로 받을 수 있게 함
- 장점: 컴포넌트 하나로 ETF/개별주 모두 커버. 단점: 기존 ETF 히트맵에 영향 줄 수 있음

**방안 B: 개별주 전용 히트맵 컴포넌트**
- `StockHeatmap.jsx` 신규 생성. MarketHeatmap의 핵심 로직(색상, 타일, 정렬)만 복사하고 그룹핑을 GICS 섹터 기반으로 구현
- 장점: ETF 히트맵에 영향 없음. 단점: 코드 중복

**방안 C: MarketHeatmap에 그룹 설정 prop 추가** (추천)
- `groupConfig` prop으로 그룹 순서와 라벨을 외부에서 주입
- ETF: 기존 하드코딩된 그룹 순서 사용 (기본값)
- 개별주: GICS 섹터 순서를 prop으로 전달
- 장점: 최소 수정, 기존 코드 안전. 단점: prop이 하나 더 늘어남

#### 히트맵 그룹핑 (개별주)

GICS 섹터 11개로 그룹핑. 앗추 필터 통과 비율 높은 섹터부터 표시.

각 섹터 내 정렬:
- **이격률 모드**: 진입 → 주의 → 하락, 각 그룹 내 이격률 내림차순
- **기간별 모드**: 수익률 내림차순

#### 타일 디자인

ETF 히트맵과 동일한 타일 구조:
- heatmap_label (티커) — 개별주는 티커가 곧 식별자
- ticker (동일)
- 수치 (%)
- 앗추 배지 (진입/주의/하락)
- N일째(X/20)

**차이점**: 종목 수가 ~500개로 많으므로 타일 크기를 더 작게 하거나, 섹터별로 접기/펼치기(아코디언) 지원 고려.

---

## /_stocks — 개별주 추세 조회

### 이 페이지의 역할

ETF 추세 조회(`/index_etf`)의 개별주 버전. S&P 500 전체 종목의 추세 상태를 리스트로 확인한다.

### 유입 경로

- DevPage 허브 → "개별주 추세 조회" 카드 클릭
- `/_stocks_overview` 히트맵에서 종목 클릭 후 뒤로가기
- Discord 관리자 채널 알림 하단 링크

### 페이지 구조

- **요약 바**: "S&P 500 {N}개 중 {M}개 종목이 앗추 필터 통과"
- **섹터 필터**: 11개 GICS 섹터 칩 (전체 / 기술 / 헬스케어 / ...)
- **검색**: 티커명 또는 회사명 검색 (예: AAPL, Apple)
- **정렬**: 섹터별 / 이격률 높은순 / 이격률 낮은순 / 수익률 높은순 / MDD 낮은순
- **카드 그리드**: EtfSummaryCard 재사용. 각 카드 클릭 → `/_stocks/:ticker`

### ETF 추세 조회와의 차이

| | ETF (`/index_etf`) | 개별주 (`/_stocks`) |
|---|---|---|
| 종목 수 | 85개 | ~503개 |
| 분류 기준 | 자산군(10개) | GICS 섹터(11개) |
| CSV 로딩 | 빌드 시 번들 | on-demand fetch |
| 타겟 | 일반 사용자 | 개발자 전용 |
| 네비게이션 | 상단 탭 노출 | 숨김 |

---

## /_stocks/:ticker — 개별주 상세

### 이 페이지의 역할

ETF 상세(`/index_etf/:ticker`)와 동일한 구조. 개별 종목의 차트, 교차 이력, 전략 비교를 보여준다.

### 유입 경로

- `/_stocks` 리스트에서 카드 클릭
- `/_stocks_overview` 히트맵/신호에서 종목 클릭

### 페이지 구조

| 순서 | 컴포넌트 | 내용 |
|---|---|---|
| 1 | EtfSummaryCard | 현재가, 이격률, 앗추 필터 상태, CAGR, MDD |
| 2 | PriceTrendChart (1Y) | 최근 1년 가격 + 200일선 차트 |
| 3 | PriceTrendChart (5Y) | 최근 5년 가격 + 200일선 차트 |
| 4 | StrategyComparisonCard | 매수후보유 vs 200일선 vs 앗추 필터 비교 |
| 5 | TrendCrossingHistoryCard | 200일선 돌파 이력 테이블 |
| 6 | AdvancedMetricsCard | 샤프비율, 소르티노, 승률, 평균보유일수 |

### ETF 상세와의 차이

- CSV 로딩: `public/csv_stock/`에서 `fetch()`로 on-demand 로드 (번들 X)
- 메타데이터: `trend_following.suitability` 등 ETF 전용 필드 없음 (배지 미표시)
- `short_description` 없음 (회사 설명 대신 티커만 표시)

---

## 데이터 구조

### sp500.json 필드

현재:
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "name_ko": "Apple Inc.",
  "asset_type": "개별주",
  "type": "기술",
  "sector": "Information Technology",
  "heatmap_label": "AAPL"
}
```

추가 필요:
```json
{
  "industry": "Technology Hardware; Storage & Peripherals"
}
```

`industry` 필드는 `fetch_sp500_tickers.mjs`에서 GitHub CSV의 `GICS Sub-Industry` 컬럼을 캡처하여 추가.

---

## 데이터 흐름

```
pipeline.sh (cron)
  → [ETF 처리] → [개별주 처리 (pipeline_stock.sh)]
    → ~503종목 CSV 다운로드 (EODHD API, 병렬 6 job)
    → generate_stock_snapshot.mjs → stock_snapshots.json
    → 추세 알림 생성 → stock_trend_notifications.json
    → CSV → public/csv_stock/ 복사 (정적 에셋)
    → Discord 관리자 채널 알림 (진입/이탈 + 링크)
  → 프론트 빌드 (stock_snapshots.json은 번들 포함, CSV는 public/)
  → Vercel 배포
```

### 프론트엔드 데이터 로딩

| 데이터 | 로딩 방식 | 사용처 |
|--------|---------|-------|
| `stock_snapshots.json` | `import.meta.glob` eager | 리스트, 개요 |
| `stock_trend_notifications.json` | `import.meta.glob` eager | 개요 (최근 신호) |
| `sp500.json` (티커 메타) | `import.meta.glob` eager | 리스트, 개요 |
| 개별 종목 CSV | `fetch()` on-demand | 상세 페이지만 |

---

## 구현 우선순위 (TODO)

### 즉시 수정
1. **섹터별 추세 강도 정렬**: 고정 순서 → 앗추 필터 통과 비율 내림차순
2. **히트맵 그룹핑 수정**: ETF 그룹핑 → GICS 섹터별 그룹핑 (방안 C: groupConfig prop)
3. **sp500.json에 industry 필드 추가**: fetch_sp500_tickers.mjs 수정 → 재생성

### 향후 고려
- 섹터 클릭 시 `/_stocks?sector=기술` 필터 연동
- 서브섹터(산업별) 추세 강도 아코디언
- 시장 폭 히스토리 차트 (날짜별 앗추 필터 통과율 추이)
- S&P 500 구성종목 변경 시 `fetch_sp500_tickers.mjs` 재실행

---

**관련 컴포넌트:** `StockOverviewPage`, `StockListPage`, `StockDetailPage`, `stockDataLoaders.js`
**관련 파이프라인:** `pipeline_stock.sh`, `generate_stock_snapshot.mjs`, `fetch_sp500_tickers.mjs`
