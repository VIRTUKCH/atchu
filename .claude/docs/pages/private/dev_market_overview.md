# 개발자 마켓 뷰 — 개인 투자 도구

## 접근 방법

- 테마 토글(다크/라이트) 3초 안에 5번 전환 → 상단 네비에 2개 탭 노출:
  - **"관리자 추세 조회"** → `/_dev_trend_list` 직행
  - **"관리자 시장 개요"** → `/_dev_market_overview` 직행
- DevPage(`/_dev`) 허브는 유지하되, 상단 네비에서 바로 접근 가능
- 일반 사용자에게 절대 노출되지 않음. 네비게이션·사이트맵·SEO 모두 제외

## 이 기능의 목적

채호님 개인 투자용. 추세추종 자산(3000만원)과 별도로 개별주(1000만원)를 운용할 때 **"지금 어떤 종목이 추세 안에 있고, 어떤 섹터가 주도하는가"**를 파악한다.

앗추의 "개별주는 다루지 않는다" 철학은 유지. 이 페이지는 제품에 포함되지 않고, README에도 언급하지 않는다.

> Discord 알림에서 ETF 추세 신호와 함께 개별주 신호도 오면, 자연스럽게 주도주를 파악할 수 있다.

---

## 페이지 구성 (3개)

| 경로 | 페이지 | 역할 |
|------|--------|------|
| `/_dev_market_overview` | 개별주 시장 개요 | "지금 S&P 500 전체가 어떤 상태인가?" |
| `/_dev_trend_list` | 개별주 추세 조회 | "구체적으로 어떤 종목이 추세 안에 있나?" |
| `/_dev_trend_list/:ticker` | 개별주 상세 | "이 종목의 차트와 백테스트 결과는?" |

---

## /_dev_market_overview — 개별주 시장 개요

### 이 페이지의 역할

ETF 시장 개요(`/market_overview`)의 개별주 버전. S&P 500 전체의 추세 건강도를 한눈에 파악한다.

**답하는 질문:**
- "S&P 500 중 몇 퍼센트가 추세 안에 있나?" → 시장 폭
- "어느 섹터/산업이 강하고 약한가?" → 섹터별·산업별 추세 강도
- "최근에 뭐가 바뀌었나?" → 최근 진입/이탈 신호
- "개별 종목별로는?" → S&P 500 히트맵

### 유입 경로

- Discord 관리자 채널 알림 하단 링크 (`/_dev_trend_list`)
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
- 각 아이템: 티커(회사명) + 날짜(MM-DD). 클릭 시 `/_dev_trend_list/:ticker` 상세 이동
- 변화 없으면 "최근 5거래일 변동 없음"
- **500종목이라 진입/이탈이 많을 수 있음**: 목록이 길어지면 max-height + 스크롤 처리

---

### 섹션 3. 섹터별 추세 강도

MainMarketStatusGrid 재사용. **앗추 필터 통과 비율이 높은 순으로 정렬.**

#### 서브섹터 표시 항목

각 서브섹터 셀에 3가지 정보 표시:
- **이름** (서브섹터명)
- **통과 카운트** (x/y — 앗추 필터 통과 수 / 전체)
- **평균 이격률** — 해당 서브섹터 소속 종목들의 200일선 대비 평균 이격률(%)
  - 양수(+): 초록, 음수(-): 빨강
  - 데이터 소스: `stock_snapshots.json`의 `percentDiff200`
  - 섹터 레벨에서도 평균 이격률 집계 (향후 활용)

#### 다크모드 가독성

서브섹터 텍스트는 다크모드에서 충분히 밝고 선명하게 표시:
- 이름: `rgba(220, 225, 245, 0.92)` (밝은 흰색 계열)
- 카운트: `rgba(200, 210, 240, 0.7)`
- 이격률: 초록 `#4ade80` / 빨강 `#f87171`

#### 섹터 분류 (GICS 11개 — 각 섹터에 서브섹터)

모든 섹터를 GICS 11개 원본대로 사용하고, 각 섹터 안에 서브섹터를 둔다.
기존에 독립 섹터였던 반도체·바이오텍은 각각 기술·헬스케어의 서브섹터로 통합.

| 섹터 | 종목 수 | 서브섹터 수 |
|------|--------|-----------|
| 산업재 | 79 | 5 |
| 금융 | 76 | 4 |
| 기술 | 71 | 4 |
| 헬스케어 | 60 | 5 |
| 임의소비재 | 48 | 5 |
| 필수소비재 | 36 | 4 |
| 유틸리티 | 31 | 3 |
| 부동산 | 31 | 4 |
| 소재 | 26 | 4 |
| 통신 | 23 | 4 |
| 에너지 | 22 | 4 |

#### 전체 서브섹터 매핑 (46개)

##### 기술 (71종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 소프트웨어 | 20 | Application Software, Systems Software | MSFT, CRM, ADBE, CRWD, NOW, PANW |
| 반도체 | 19 | Semiconductors, Semiconductor Materials & Equipment | NVDA, AMD, AVGO, INTC, AMAT |
| 하드웨어 | 23 | Technology Hardware, Communications Equipment, Electronic Equipment/Components/Mfg | AAPL, DELL, CSCO, ANET, APH |
| IT서비스 | 9 | IT Consulting, Internet Services, Technology Distributors | ACN, IBM, GDDY |

##### 헬스케어 (60종목 → 5개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 의료기기 | 20 | Health Care Equipment, Health Care Supplies | ABT, BSX, ISRG, MDT, SYK |
| 바이오텍 | 8 | Biotechnology | ABBV, AMGN, GILD, REGN, VRTX |
| 생명과학 | 8 | Life Sciences Tools & Services | DHR, TMO, A, IQV, MTD |
| 제약 | 7 | Pharmaceuticals | LLY, JNJ, MRK, PFE, BMY |
| 헬스케어서비스 | 17 | HC Services, Managed HC, HC Distributors/Facilities/Technology | UNH, CI, CVS, HCA, MCK |

##### 금융 (76종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 은행 | 13 | Diversified Banks, Regional Banks | JPM, BAC, WFC, GS, MS |
| 보험 | 23 | P&C Insurance, Insurance Brokers, Life/Health/Multi-line, Reinsurance | BRK-B, AIG, AON, MET, CB |
| 자산운용 | 19 | Asset Management, Investment Banking & Brokerage, Multi-Sector Holdings | BLK, SCHW, AMP, APO, ARES |
| 핀테크 | 21 | Financial Exchanges & Data, Transaction & Payment, Consumer Finance | V, MA, PYPL, CME, ICE |

##### 산업재 (79종목 → 5개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 항공우주/방산 | 12 | Aerospace & Defense | BA, GE, RTX, LMT, GD |
| 기계/장비 | 24 | Industrial Machinery, Electrical Components, Construction Machinery, Heavy Electrical, Farm Machinery | CAT, HON, EMR, ETN, DE |
| 건설 | 12 | Building Products, Construction & Engineering | JCI, CARR, EME, BLDR, PWR |
| 운송 | 13 | Air Freight, Rail, Airlines, Cargo/Passenger Ground | UPS, FDX, UNP, DAL, UBER |
| 비즈니스서비스 | 18 | Environmental/Facilities, HR, Diversified Support, Research, Trading, Conglomerates, Data Processing | WM, ADP, CTAS, VRSK, URI |

##### 임의소비재 (48종목 → 5개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 여행/레저 | 11 | Hotels/Resorts/Cruise Lines, Casinos & Gaming | BKNG, ABNB, HLT, MAR, LVS |
| 외식 | 6 | Restaurants | MCD, SBUX, CMG, DPZ, DRI |
| 유통 | 12 | Broadline/Home Improvement/Auto/Apparel/Specialty/Electronics Retail | AMZN, HD, LOW, TJX, ORLY |
| 자동차/주거 | 8 | Automobile Manufacturers, Automotive Parts, Homebuilding | TSLA, GM, F, DHI, LEN, NVR |
| 패션/라이프 | 11 | Apparel/Luxury, Footwear, Consumer Electronics, Distributors, Leisure, Homefurnishing | NKE, LULU, DECK, GRMN, WSM |

##### 필수소비재 (36종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 식품 | 14 | Packaged Foods, Agricultural Products, Food Distributors | PEP (식품부문), HRL, GIS, ADM, SYY |
| 유통 | 6 | Consumer Staples Retail, Food Retail | WMT, COST, TGT, KR |
| 음료 | 7 | Soft Drinks, Distillers & Vintners, Brewers | KO, PEP, MNST, STZ |
| 생활용품 | 9 | Household Products, Personal Care, Tobacco | PG, CL, KMB, MO, PM |

##### 에너지 (22종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 탐사/생산 | 10 | Oil & Gas E&P | COP, EOG, PXD, DVN, FANG |
| 정유/운송 | 7 | O&G Refining & Marketing, Storage & Transportation | MPC, PSX, KMI, WMB |
| 서비스/장비 | 3 | O&G Equipment & Services | SLB, HAL, BKR |
| 통합석유 | 2 | Integrated Oil & Gas | XOM, CVX |

##### 통신 (23종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 미디어 | 10 | Movies & Entertainment, Broadcasting, Publishing | DIS, NFLX, WBD, FOX |
| 인터넷/플랫폼 | 6 | Interactive Media & Services, Cable & Satellite | GOOG, META, CMCSA, CHTR |
| 게임/광고 | 4 | Interactive Home Entertainment, Advertising | EA, TTWO, TTD, OMC |
| 통신사 | 3 | Integrated/Wireless Telecommunication | T, VZ, TMUS |

##### 유틸리티 (31종목 → 3개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 전력 | 15 | Electric Utilities | NEE, DUK, SO, CEG, AEP |
| 복합유틸리티 | 12 | Multi-Utilities | D, SRE, WEC, ED, DTE |
| 독립발전/기타 | 4 | Independent Power, Gas Utilities, Water Utilities | NRG, AES, AWK, ATO |

##### 부동산 (31종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 주거 | 7 | Multi-Family/Single-Family Residential REITs | EQR, AVB, MAA, ESS |
| 상업 | 8 | Retail/Office/Industrial REITs | SPG, PLD, O, BXP |
| 인프라 | 5 | Telecom Tower REITs, Data Center REITs | AMT, CCI, EQIX, DLR |
| 특수/서비스 | 11 | HC REITs, Self-Storage, Hotel, Timber, Other, RE Services | WELL, PSA, VICI, CBRE, IRM |

##### 소재 (26종목 → 4개 서브섹터)

| 서브섹터 | 수 | GICS Sub-Industry | 대표 |
|---------|---|-------------------|------|
| 화학 | 10 | Specialty/Commodity Chemicals, Industrial Gases | LIN, APD, SHW, ECL, DD |
| 포장 | 6 | Paper & Plastic Packaging, Metal/Glass Containers | PKG, AVY, IP, BALL |
| 건자재/농화학 | 6 | Construction Materials, Fertilizers | VMC, MLM, CRH, CF, CTVA |
| 금속/광업 | 4 | Steel, Copper, Gold | NUE, STLD, FCX, NEM |

#### 데이터 구조

`sp500.json`에 `subType` 필드 추가 — 모든 종목에 서브섹터 부여:
```json
{
  "ticker": "NVDA",
  "type": "기술",
  "subType": "반도체",
  "sector": "Information Technology",
  "industry": "Semiconductors"
}
```

- `type`: GICS 11개 섹터 (기술, 헬스케어, 금융, 산업재, 임의소비재, 필수소비재, 에너지, 통신, 유틸리티, 부동산, 소재)
- `subType`: 서브섹터 (46개). 모든 종목에 부여

#### UI 반영

**폰트 사이즈 원칙** (CLAUDE.md 반응형 규칙 준수):
- 모든 텍스트 최소 15px(모바일) ~ 18px(PC)
- 패턴: `clamp(15px, calc(12.4px + 0.7vw), 18px)`
- 서브섹터 이름·숫자도 예외 없이 15px+ 적용
- 10~13px 같은 작은 폰트는 사용하지 않음

**섹터별 추세 강도 카드** (와이드 레이아웃):
- 각 섹터: 가로 전체 너비 1행 (이름 + 바 + 비율 + 카운트)
- 서브섹터: 하단에 5등분 그리드로 표시. 이름 + 숫자(x/y)만 표시 (바 없음)
  - 서브섹터가 5개 미만이면 나머지 칸은 비워둠
- 클릭 → `/_dev_trend_list?sector=기술` 이동
- ETF용 기존 4열 그리드는 유지 (subSectors 유무로 자동 분기)

**히트맵**:
- 섹터 → 서브섹터 2단계 구조. 섹터별 블록 안에 서브섹터 소제목으로 구분
- 시각화 방식은 별도 검토 필요 (트리맵, 아코디언, 중첩 히트맵 등)

**리스트 페이지**:
- 섹터 필터 선택 시 해당 섹터의 서브섹터 필터 칩이 추가 표시

#### 정렬 기준

앗추 필터 통과 비율(%) 내림차순.
개발자가 "지금 어디가 가장 강한가"를 빠르게 파악하려면 강한 순서대로 봐야 한다.

#### 세분화 결정 기록

- v1: 반도체/바이오텍만 독립 섹터로 분리 (13개 섹터)
- **v2 (현재)**: GICS 11개 섹터 원본 + 전체 서브섹터 46개 도입
  - 반도체 → 기술의 서브섹터, 바이오텍 → 헬스케어의 서브섹터
  - `sp500.json`의 `type`: GICS 섹터명, `subType`: 서브섹터명
  - industry(GICS Sub-Industry) → subType 매핑 테이블은 프론트엔드 config에 관리

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

**2단계 계층**: 섹터(11개) → 서브섹터(46개). 앗추 필터 통과 비율 높은 섹터부터 표시.

각 서브섹터 내 정렬:
- **이격률 모드**: 진입 → 주의 → 하락, 각 그룹 내 이격률 내림차순
- **기간별 모드**: 수익률 내림차순

#### 타일 디자인

ETF 히트맵과 동일한 타일 구조:
- heatmap_label (티커) — 개별주는 티커가 곧 식별자
- ticker (동일)
- 수치 (%)
- 앗추 배지 (진입/주의/하락)
- ▲/▼ N일째(X/20) — 방향 아이콘(▲ 200일선 위 / ▼ 200일선 아래) + 추세 유지 기간

**차이점**: 종목 수가 ~500개로 많으므로 타일 크기를 더 작게 하거나, 섹터별로 접기/펼치기(아코디언) 지원 고려.

#### 시각화 방식 검토

현재: 플랫 히트맵 (섹터별 그룹, 타일 나열)
503종목 + 46개 서브섹터를 효과적으로 보여주려면 시각화 방식 재검토 필요.

**후보:**
- **트리맵 (finviz 스타일)**: 섹터 → 서브섹터 → 종목 중첩 사각형. 크기=시가총액, 색상=추세/수익률. 한눈에 강/약 파악
- **아코디언 히트맵**: 현재 구조 유지하되 섹터를 접기/펼치기. 펼치면 서브섹터별 그룹 표시
- **서브섹터 카드 + 상세 드릴다운**: 섹터별 추세 강도 카드를 서브섹터까지 확장. 카드 클릭 시 해당 서브섹터 종목만 표시

→ 결정 보류. 구현 시 사용자와 논의.

---

## /_dev_trend_list — 개별주 추세 조회

→ **상세 기획: [`dev_trend_list.md`](dev_trend_list.md)**

섹터(11개) + 서브섹터(46개) 2단계 필터, 검색, 정렬. EtfSummaryCard 재사용.

---

## /_dev_trend_list/:ticker — 개별주 상세

→ **상세 기획: [`dev_trend_detail.md`](dev_trend_detail.md)**

차트(MA50/MA200 2선), 골든크로스/데드크로스 배지, 교차 이력, 전략 비교, 심화 지표.

---

## 데이터 구조

### sp500.json 필드

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "name_ko": "Apple Inc.",
  "asset_type": "개별주",
  "type": "기술",
  "subType": "하드웨어",
  "sector": "Information Technology",
  "industry": "Technology Hardware, Storage & Peripherals",
  "short_description": "아이폰·맥·에어팟 등 소비자 전자제품 및 서비스",
  "heatmap_label": "AAPL"
}
```

- `type`: GICS 섹터 한글명 (11개)
- `subType`: 서브섹터 한글명 (46개) — industry → subType 매핑은 프론트엔드 config 또는 sp500.json 직접 기재
- `short_description`: 한 줄 한국어 설명. 주요 종목은 개별 작성, 나머지는 industry 기반 자동 생성
- `sector`: GICS 원본 영문 섹터명
- `industry`: GICS Sub-Industry 영문 (`fetch_sp500_tickers.mjs`에서 GitHub CSV 캡처)

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

### 완료
- ~~섹터별 추세 강도 정렬~~ ✅
- ~~히트맵 GICS 섹터 그룹핑~~ ✅
- ~~sp500.json industry/subType/short_description/rank 필드~~ ✅
- ~~반도체→기술, 바이오텍→헬스케어 통합~~ ✅
- ~~섹터 추세 강도 카드 와이드 레이아웃 + 서브섹터~~ ✅
- ~~히트맵 서브섹터 소제목 구분~~ ✅
- ~~리스트 페이지 그룹형 필터 (섹터+서브섹터 한 화면)~~ ✅
- ~~서브섹터 클릭 → `/_dev_trend_list?sector=X&sub=Y` 이동~~ ✅
- ~~기본 정렬: 섹터 내 시가총액순 (rank 필드)~~ ✅
- ~~상단 네비: "관리자 추세 조회" / "관리자 시장 개요" 탭 분리~~ ✅
- ~~골든크로스/데드크로스 (MA50/MA200): 차트 2선 + 카드 배지~~ ✅

### 향후
- 히트맵 시각화 방식 재검토 (트리맵, 아코디언 등)
- 시장 폭 히스토리 차트 (날짜별 앗추 필터 통과율 추이)

### 유지보수
- S&P 500 구성종목 변경 시 `fetch_sp500_tickers.mjs` 재실행 → subType 매핑 확인

---

**관련 페이지 기획:** [`dev_trend_list.md`](dev_trend_list.md) (/_dev_trend_list 리스트) | [`dev_trend_detail.md`](dev_trend_detail.md) (/_dev_trend_list/:ticker 상세)
**관련 컴포넌트:** `StockOverviewPage`, `StockListPage`, `StockDetailPage`, `stockDataLoaders.js`
**관련 파이프라인:** `pipeline_stock.sh`, `generate_stock_snapshot.mjs`, `fetch_sp500_tickers.mjs`
