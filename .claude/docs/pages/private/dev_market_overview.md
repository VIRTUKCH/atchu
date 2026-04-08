# 개발자 마켓 뷰 — 개인 투자 도구

## 접근 방법

- 테마 토글(다크/라이트) 3초 안에 5번 전환 → 상단 네비에 2개 탭 노출:
  - **"관리자 추세 조회"** → `/_dev_trend_list` 직행
  - **"관리자 시장 개요"** → `/_dev_market_overview` 직행
- DevPage(`/_dev`) 허브는 유지하되, 상단 네비에서 바로 접근 가능
- 일반 사용자에게 절대 노출되지 않음. 네비게이션·사이트맵·SEO 모두 제외

## 이 기능의 목적

채호님 개인 투자용. 추세추종 자산(3000만원)과 별도로 개별주(1000만원)를 운용할 때 **"지금 어떤 종목이 추세 안에 있고, 어떤 섹터가 주도하는가"**를 파악한다.

> **레버리지·인버스 포함**: 공개 서비스에서는 완전 제외되지만, 이 관리자 전용 기능에서는 레버리지·인버스 ETF도 표시된다 (최근 신호, 히트맵 포함). Discord 관리자 채널에서도 레버리지·인버스 신호를 별도 수신.
>
> **두 종류 모두 포함:**
> - 지수·섹터 레버리지·인버스 ETF (TQQQ, SOXL, SQQQ 등)
> - **개별주 레버리지·인버스 ETF** (TSLL·Tesla 2x, NVDL·Nvidia 2x, AAPU·Apple 2x, MSFU·MSFT 2x, AMZU, METU, GGLL, ORCU 등) — Direxion·GraniteShares 단일종목 ETF

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

**일반 사용자에게 공개되지 않는 모든 티커**의 추세 현황을 한눈에 파악하는 관리자 전용 시장 개요.
S&P 500 개별주 추세 건강도 + 레버리지·인버스 ETF(지수·섹터·개별주) 추세 현황을 통합해서 보여준다.

> **원칙**: 공개 서비스에서 숨겨진 티커는 여기서 전부 보인다. 개별주(S&P 500), 지수/섹터 레버리지·인버스 ETF, 단일종목 레버리지·인버스 ETF — 전부 이 페이지에서 신호 확인 가능.

**답하는 질문:**
- "S&P 500 중 몇 퍼센트가 추세 안에 있나?" → 시장 폭
- "어느 섹터/산업이 강하고 약한가?" → 섹터별·산업별 추세 강도
- "최근에 뭐가 바뀌었나?" → 최근 진입/이탈 신호 (개별주 + 레버리지·인버스 전부)
- "개별 종목별로는?" → S&P 500 히트맵
- "레버리지·인버스 ETF는 지금 추세 안에 있나?" → 레버리지·인버스 현황

### 유입 경로

- Discord 관리자 채널 알림 하단 링크 (`/_dev_trend_list`)
- DevPage 허브 → "개별주 시장 개요" 카드 클릭

### 페이지 구조 — 줌 레벨

| 순서 | 섹션 | 줌 레벨 | 답하는 질문 |
|---|---|---|---|
| 1 | S&P 500 시장 폭 | 전체 (1줄 요약) | "전체 건강도는?" |
| 2 | 최근 신호 | 이벤트 (최근 5거래일) | "최근에 뭐가 바뀌었나?" — 개별주 + 레버리지·인버스 전부 |
| 3 | 섹터별 추세 강도 | GICS 섹터 (11개) | "어느 섹터가 강해?" |
| 4 | S&P 500 히트맵 | 개별 (~500종목) | "구체적으로 어떤 종목이?" |
| 5 | 레버리지·인버스 현황 | 비공개 ETF 전체 | "레버리지·인버스 지금 어때?" |

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

일반 사용자에게 비공개인 **모든 티커**의 최근 5거래일 추세 변화를 보여준다.

**표시 대상:**
- S&P 500 개별주 (~503종) 진입/이탈
- 레버리지·인버스 ETF (지수·섹터 기반: TQQQ, SOXL 등) 진입/이탈
- 단일종목 레버리지·인버스 ETF (TSLL, NVDL, AAPU 등) 진입/이탈

**구조:**
- 좌우 2열: 진입 / 이탈. 각 열 헤더에 개수 표시 ("진입 (12)" / "이탈 (5)")
- 각 아이템: 티커(회사명 또는 기초자산) + 날짜(MM-DD). 클릭 시 `/_dev_trend_list/:ticker` 상세 이동
- 변화 없으면 "최근 5거래일 변동 없음"
- 개별주는 종목 수가 많아 목록이 길어질 수 있음: max-height + 스크롤 처리
- 레버리지·인버스 신호는 시각적으로 구분 (예: 배지 또는 색상 차이) — 구현 시 결정

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

**폰트 사이즈 원칙**:
- 섹터 이름·바·비율·카운트: `clamp(15px, calc(12.4px + 0.7vw), 18px)` (CLAUDE.md 기준)
- 서브섹터 셀: 관리자 전용 정보 밀도 우선 — `clamp(13~14px, ..., 15~16px)` 허용

**섹터별 추세 강도 카드** (와이드 레이아웃):
- 각 섹터: 가로 전체 너비 1행 (이름 + 바 + 비율 + 카운트)
- 서브섹터: 하단에 **최대 3열 그리드**로 표시. 각 서브섹터는 독립된 박스(카드) 형태
  - 박스 내 구성 (세로 스택):
    - 상단: 이름 (굵게 700, 공간 부족 시 말줄임)
    - 하단: 개수(x/y) + diff% — 나란히 표시, diff% 양수 초록·음수 빨강
  - 박스: 배경색으로 영역 구분 (섹터 카드 대비 약간 밝거나 테두리), padding 충분히 확보
- 클릭 → 아래 S&P 500 히트맵 섹션의 해당 섹터 위치로 자동 스크롤 (smooth scroll)
- ETF용 기존 4열 그리드는 유지 (subSectors 유무로 자동 분기)

**히트맵**:
- 섹터 → 서브섹터 2단계 구조. 섹터별 블록 안에 서브섹터 소제목으로 구분
- UI: `/market_overview` 공개 히트맵과 동일 (탭 7개, 타일 색상·구조 통일)

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

**목표: `/market_overview` 공개 히트맵과 UI 동일하게 맞춤.** 컴포넌트는 `StockHeatmap.jsx` (개별주 전용, 기존 ETF 히트맵 영향 없음).

#### 기간별 탭

공개 시장 개요와 동일한 7개 탭:
| 탭 키 | 라벨 |
|---|---|
| `ma200` | 이격률 (기본) |
| `1d` | 일간 |
| `5d` | 주간 |
| `21d` | **1개월** |
| `63d` | 3개월 |
| `252d` | 1년 |
| `1260d` | 5년 |

#### 타일 색상

공개 시장 개요(`market_overview.md`)와 동일:
- **이격률 탭**: 통과(초록) / 대기(주황) / 이탈(파랑). 절대값이 클수록 진한 색
- **기간별 탭**: 상승=초록, 하락=빨강. 절대값이 클수록 진한 색
- **배지(진입/주의/하락)**: 탭과 무관하게 항상 앗추 필터(MA200) 기준

#### 타일 디자인

공개 시장 개요와 동일한 구조, 세로 스택:
1. `[배지] 티커` — 배지 pill 칩 + 영문 티커 (개별주는 한국어명 생략, 티커가 식별자)
2. 수치 — 이격률 탭: `MA200대비 +31.81%`. 기간별 탭: `1개월 +5.2%` (메인) + `MA200대비 +31.81%` (서브 줄)
3. `▲/▼ N일째(X/20)` — 방향 아이콘 + 추세 유지 기간 + 앗추 필터 비율

**그리드**: 모바일 2열, PC 4~5열 (공개 시장 개요와 동일)

#### 그룹핑 및 정렬

**2단계 계층**: 섹터(11개) → 서브섹터(46개). 앗추 필터 통과 비율 높은 섹터부터 표시.

각 서브섹터 내 정렬:
- **이격률 탭**: 통과 → 대기 → 이탈, 각 그룹 내 이격률 내림차순
- **기간별 탭**: 수익률 내림차순

---

### 섹션 5. 레버리지·인버스 현황

일반 사용자에게 공개되지 않는 레버리지·인버스 ETF 전체의 추세 상태를 한눈에 보여준다.

**표시 대상 (4개 소스):**

| 소스 파일 | 내용 | 대표 티커 |
|---|---|---|
| `leverage.json` | 지수·섹터 레버리지 ETF | TQQQ, UPRO, SOXL, TECL |
| `inverse.json` | 지수·섹터 인버스 ETF | SQQQ, SDS, SOXS |
| `stock_leverage.json` | 단일종목 레버리지 ETF | TSLL, NVDL, AAPU, MSFU |
| `stock_inverse.json` | 단일종목 인버스 ETF | TSLS, NVDD, AAPD, MSFD |

**UI 구조 (안):**
- 4개 그룹을 각각 카드 행으로 표시: "지수·섹터 레버리지" / "지수·섹터 인버스" / "개별주 레버리지" / "개별주 인버스"
- 각 티커: 앗추 필터 상태 배지 + 티커명 + 기초자산
  - **통과** (초록): isAtchuQualified200 = true
  - **대기** (주황): 200일선 위이지만 앗추 필터 미통과 (percentDiff200 ≥ 0, isAtchuQualified200 = false)
  - **이탈** (빨강): 200일선 아래 (percentDiff200 < 0)
- 클릭 시 `/_dev_trend_list/:ticker` 상세로 이동
- 정렬: 통과 먼저, 대기 opacity 0.7, 이탈 opacity 0.45

> 이 섹션은 공개 페이지에 절대 노출되지 않는다. 레버리지·인버스는 초보자 보호 원칙에 따라 관리자 전용.

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
- 히트맵 UI 공개 시장 개요와 통일 + 1개월 탭(`21d`) 추가 ← **다음 작업**
- 시장 폭 히스토리 차트 (날짜별 앗추 필터 통과율 추이)

### 유지보수
- S&P 500 구성종목 변경 시 `fetch_sp500_tickers.mjs` 재실행 → subType 매핑 확인

---

**관련 페이지 기획:** [`dev_trend_list.md`](dev_trend_list.md) (/_dev_trend_list 리스트) | [`dev_trend_detail.md`](dev_trend_detail.md) (/_dev_trend_list/:ticker 상세)
**관련 컴포넌트:** `StockOverviewPage`, `StockListPage`, `StockDetailPage`, `stockDataLoaders.js`
**관련 파이프라인:** `pipeline_stock.sh`, `generate_stock_snapshot.mjs`, `fetch_sp500_tickers.mjs`
