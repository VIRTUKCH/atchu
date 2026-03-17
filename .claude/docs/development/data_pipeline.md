# 데이터 프로세싱 파이프라인

> 이 문서는 EODHD API에서 시장 데이터를 수집하여 프론트엔드에 표시하기까지의 전체 데이터 흐름을 기술합니다.

## 전체 파이프라인 개요

```
┌──────────────────────────────────────────────────────────────────────┐
│                         EODHD API                                    │
│   https://eodhd.com/api/eod/{SYMBOL}?api_token=...&fmt=csv          │
└──────────────────────────────────┬───────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  1단계: CSV 다운로드 (pipeline.sh)                                   │
│  - tickers/*.json에서 종목 목록 읽기 (18개 파일, ~185 종목)          │
│  - 병렬 다운로드 (MAX_JOBS=6)                                        │
│  - 변경 감지 (cmp) → 실제 갱신된 종목만 추적                        │
│  출력: data/csv/{TICKER}.US_all.csv                                  │
└──────────────────────────────────┬───────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  2단계: 후처리 (lib/snapshot.sh + lib/notify.sh)                     │
│  ┌─────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ generate_summary_   │  │ generate_      │  │ 추세 변화 감지   │  │
│  │ snapshot.mjs        │  │ landing_data   │  │ (inline Node.js) │  │
│  │ → snapshot/*.json   │  │ .mjs           │  │ → trend/*.json   │  │
│  │   이동평균/추세/    │  │ → landing_     │  │   trend_md/*.md  │  │
│  │   교차전략/수익률   │  │   data.json    │  │                  │  │
│  └─────────────────────┘  └────────────────┘  └──────────────────┘  │
└──────────────────────────────────┬───────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  3단계: 프론트엔드 빌드 (vercel build --prod)                        │
│  - VERCEL_TOKEN 있으면 vercel build, 없으면 npm run build            │
│  - Vite import.meta.glob으로 JSON을 빌드 타임에 번들에 포함          │
│  - Fetch/API 호출 없음 (정적 임포트)                                 │
│  출력: .vercel/output/ (prebuilt 아티팩트)                           │
└──────────────────────────────────┬───────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────────┐
│  4단계: Vercel 배포 (prebuilt)                                       │
│  npx --yes vercel deploy --prebuilt --prod                           │
│  - 서버 측 재빌드 없이 빌드 아티팩트만 업로드                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 1단계: CSV 데이터 수집

### 진입점

```
02_fe_react/data/scripts/pipeline.sh
```

이 스크립트가 전체 파이프라인의 진입점이며, 6개의 라이브러리를 소싱합니다:

```bash
source "${SCRIPT_DIR}/lib/common.sh"      # 공통 설정, 로그, 웹훅
source "${SCRIPT_DIR}/lib/tickers.sh"     # 종목 목록 읽기
source "${SCRIPT_DIR}/lib/download.sh"    # CSV 다운로드, 병렬 처리
source "${SCRIPT_DIR}/lib/snapshot.sh"    # 스냅샷 JSON 생성
source "${SCRIPT_DIR}/lib/notify.sh"      # 추세 알림, 일간 서머리
source "${SCRIPT_DIR}/lib/deploy.sh"      # 빌드, Vercel 배포, git push
```

### 실행 순서

```
1. init_runtime()                    # 경로, 환경변수, RUN_ID 초기화
2. setup_logging()                   # 로그 파일 설정 (logs/cron_YYYY-MM-DD.log)
3. acquire_lock()                    # flock으로 중복 실행 방지
4. load_env_file()                   # .env에서 API 토큰 로드
5. cleanup_orphans()                 # 이전 실행의 미정리 임시 디렉토리 제거
6. read_tickers()                    # tickers/*.json에서 종목 목록 추출
7. process_ticker()                  # 종목별 병렬 다운로드 (MAX_JOBS=6)
8. summarize_updates()               # 변경 사항 집계
9. run_snapshot_generation()         # 후처리: 스냅샷 JSON 생성
10. run_landing_data_generation()    # 랜딩 페이지 데이터 생성
11. generate_trend_notifications_file()  # 추세 변화 감지 JSON 생성
12. run_front_build()                # Vite 빌드 (또는 vercel build --prod)
13. deploy_to_vercel()               # Vercel 배포 (prebuilt)
14. send_all_notifications()         # Discord 알림 (배포 완료 후 발송)
```

### lib/common.sh — 공통 설정

| 항목 | 값 |
|------|-----|
| MARKET_TZ | America/New_York |
| ROOT_DIR | `02_fe_react/data` |
| FRONT_DIR | `02_fe_react` |
| TICKERS_DIR | `data/tickers` |
| OUT_DIR | `data/csv` |
| LOG_DIR | `data/logs` |
| MAX_JOBS | 6 |

주요 함수:
- `send_webhook()` — Discord 관리자 채널 알림
- `send_daily_summary_webhook()` — 일간 리포트 Discord 전송
- `send_trend_notification_webhook()` — 추세 변화 Discord 전송

### lib/tickers.sh — 종목 목록 읽기

`data/tickers/*.json` (18개 파일)에서 `jq`로 `.ticker` 필드를 추출합니다.

**티커 소스 파일 목록:**

| 파일 | 타입 | 예시 |
|------|------|------|
| us_major_index.json | 미국 대표 지수 | SPY, QQQ, DIA |
| sector.json | 섹터 | XLK, XLF, XLV, XLE, XLB, XLC, XLI, XLP, XLU, XLY, VNQ, SMH, CIBR, IGV |
| country.json | 국가 (13 서브타입) | EWJ, INDA, EWY 등 15종목 |
| bond.json | 채권 | TLT, IEF, SHY, HYG |
| commodity.json | 원자재 (7 서브타입) | GLD, SLV, USO, DBC, CPER, DBA 등 7종목 |
| growth.json | 성장 | VUG, IWF |
| value.json | 밸류 | IVE, VTV |
| quality.json | 퀄리티 | QUAL, SPLV |
| dividend.json | 배당 | SCHD, VYM |
| low_volatility.json | 저변동성 | USMV |
| small_mid_cap.json | 중소형 | IWM |
| leverage.json | 레버리지 | TQQQ, UPRO, SOXL, USD |
| inverse.json | 인버스 | SH, SQQQ |
| single_stock.json | S&P 상위 100 | AAPL, MSFT, NVDA 등 100종목 |
| equal_weight.json | 동일가중 | RSP |
| fear.json | 공포지수 | VIX, VIXY |
| fx.json | 외환 | — |
| other.json | 기타 | — |

각 JSON 파일의 구조:

```json
{
  "type": "섹터",
  "items": [
    {
      "asset_type": "섹터",
      "asset_subtype": "미국 반도체 섹터 ETF",
      "ticker": "SMH",
      "type": "반도체",
      "name": "VanEck Semiconductor ETF",
      "name_ko": "반도체 섹터",
      "business_area": "반도체 설계·장비·제조",
      "type_reason": "GICS 반도체 섹터 ETF",
      "heatmap_label": "반도체",
      "short_description": "반도체 섹터 대표 ETF. AI·데이터센터 수요에 민감.",
      "trend_following": { "suitability": "...", "reason": "..." },
      "trend_profile": { "volatility_level": "...", "whipsaw_risk": "..." },
      "portfolio_role": { "role_summary": "...", "overlap_notes": "..." },
      "rule_suggestions": { ... },
      "tags": ["반도체", "AI", "기술", "ETF", "섹터"]
    }
  ]
}
```

| 필드 | 용도 |
|------|------|
| `name_ko` | 한글 이름. 배지, 검색, 히트맵에 사용 |
| `business_area` | 뭐하는 회사/ETF인지 한 마디 |
| `type_reason` | 이 타입에 속하는 이유 |
| `heatmap_label` | 히트맵 타일 라벨 (짧게) |
| `tags` | 검색 키워드 배열 |

**타입 구조:** 파일-레벨 `type`(예: "섹터")은 히트맵 그룹핑에 사용(`heatmap_group`), item-level `type`(예: "반도체")은 추세 강도에서 개별 바로 표시됩니다. item-level `type`이 없으면 파일-레벨 `type`이 사용됩니다.

### lib/download.sh — 병렬 다운로드

**핵심 함수: `process_ticker(ticker, result_file)`**

1. 심볼 매핑: `AAPL` → `AAPL.US`
2. API 호출: `https://eodhd.com/api/eod/${symbol}?api_token=${EODHD_API_TOKEN}&fmt=csv`
3. 임시 파일에 다운로드
4. 형식 검증 (Date 헤더 확인, 빈 파일 거부)
5. 기존 파일과 `cmp` 비교 → 변경 시에만 교체
6. 상태 파일에 결과 기록: `updated` / `unchanged` / `invalid` / `failed`
7. 실패 시 3회 재시도 (1초 간격)

**출력 파일:**

```
data/csv/{TICKER}.US_all.csv
```

**CSV 형식:**

```csv
Date,Open,High,Low,Close,Adjusted_close,Volume
2020-01-02,296.56,299.00,295.65,298.81,271.7464,48575972
2020-01-03,297.15,300.58,296.50,297.43,270.4915,36396558
...
```

---

## 2단계: 후처리 파이프라인

CSV 변경이 감지되면 `lib/snapshot.sh`와 `lib/notify.sh`의 함수들이 순서대로 실행됩니다.

### 실행 순서

```
1. run_snapshot_generation()               # 스냅샷 JSON 생성 (lib/snapshot.sh)
2. run_landing_data_generation()           # 랜딩 페이지 데이터 생성 (lib/snapshot.sh)
3. generate_trend_notifications_file()     # 추세 변화 감지 JSON 생성 (lib/notify.sh)
4. run_front_build()                       # Vite 빌드 (lib/deploy.sh)
5. deploy_to_vercel()                      # Vercel 배포 (lib/deploy.sh)
6. send_all_notifications()               # Discord 알림 — 배포 완료 후 발송 (lib/notify.sh)
```

### 2-1. generate_summary_snapshot.mjs — 스냅샷 생성

**파일:** `02_fe_react/data/scripts/generate_summary_snapshot.mjs`

**입력:** `data/csv/*.csv` (185개 파일)

**계산 내용:**

| 지표 | 설명 |
|------|------|
| movingAverage200 | 200일 이동평균선 |
| percentDiff200 | 현재가와 200일 이동평균선의 괴리율 (%) |
| percentChangeFromPreviousClose | 전일 대비 등락률 |
| percentChange5d/21d/63d/252d/1260d | 기간별 수익률 (5일/1개월/3개월/1년/5년) |
| trendHolding | 200일 이동평균선 위/아래 연속 일수 |
| crossingHistory | 2가지 교차 전략의 백테스트 수익률 |

**2가지 교차 전략:**

| 키 | 모드 | 설명 |
|----|------|------|
| 200 | cross | 200일선 교차 (가격이 MA200을 상향/하향 돌파할 때 진입/청산) |
| 200-20of16 | hold_20of16 | 200일선 + 최근 20일 중 16일 이상 위에 있을 때 진입 (앗추 필터) |

**출력 JSON 구조:**

```json
{
  "version": 1,
  "generated_at": "2026-02-19T22:00:53.890Z",
  "tickers": {
    "SPY.US": {
      "snapshot": {
        "close": 600.12,
        "previousClose": 598.45,
        "percentChangeFromPreviousClose": 0.279,
        "percentChange5d": -1.2,
        "percentChange21d": 3.5,
        "percentChange63d": 5.1,
        "percentChange252d": 12.3,
        "percentChange1260d": 85.2,
        "movingAverage200": 560.8,
        "percentDiff200": 7.01,
        "isAtchuQualified200": true,
        "open": 599.0,
        "high": 601.5,
        "low": 598.0,
        "volume": 48575972,
        "dataDateMarket": "2026-02-19"
      },
      "trendHolding": {
        "items": [
          { "label": "200일선", "days": 300, "direction": "up" }
        ]
      },
      "crossingHistory": {
        "annualizedMap": {
          "200": 13.1,
          "200-20of16": 10.9
        }
      }
    },
    "SPY": { /* .US 없는 버전도 동일 데이터로 중복 저장 */ }
  }
}
```

**생성되는 파일들:**

| 파일 | 설명 |
|------|------|
| `summary_snapshots.json` | 최신 스냅샷 (이동평균/추세/교차전략/수익률 포함) |

### 2-2. generate_landing_data.mjs — 랜딩 페이지 데이터

**파일:** `02_fe_react/data/scripts/generate_landing_data.mjs`

랜딩 페이지에서 사용하는 사전 계산 데이터를 생성합니다. Vite 빌드 전에 실행되어야 합니다.

**생성 내용:**

| 항목 | 설명 |
|------|------|
| chart.items | SPY 2020-01-01 이후 차트 포인트 (date, close, MA200) |
| crossings | SPY 200-20of16 교차 이벤트 (date, direction, close) |
| cagr | NVDA, AAPL, TSLA, MSFT 4개 종목의 200-20of16 CAGR |

**출력 JSON 구조:**

```json
{
  "v": 1,
  "generated_at": "2026-02-19T22:01:00.000Z",
  "chart": {
    "items": [
      { "d": "2020-01-02", "c": 271.75, "m": 250.30 }
    ]
  },
  "crossings": [
    { "d": "2020-06-08", "dir": "up", "c": 319.45 },
    { "d": "2022-04-11", "dir": "down", "c": 445.60 }
  ],
  "cagr": {
    "NVDA": 45.2,
    "AAPL": 18.5,
    "TSLA": 25.3,
    "MSFT": 20.1
  }
}
```

**출력:** `summary/landing_data.json`

### 2-3. 추세 변화 감지 (lib/notify.sh 내 inline Node.js)

`generate_trend_notifications_file()` 함수에서 inline Node.js로 실행됩니다. 알림 발송은 `send_all_notifications()` 래퍼에서 Vercel 배포 완료 후 호출됩니다.

**규칙:** 최근 20거래일 중 16일 이상 200일 이동평균선 위에 있으면 "추세 보유"

**감지 대상:** 최근 5거래일의 진입/이탈 이벤트

**티커 메타데이터:** `readTickerMeta()` 함수가 tickers/*.json에서 티커별 `type`/`asset_type`을 읽어 Map으로 보유. Discord 메시지에 티커 옆 한글 타입명 표기에 사용.

**출력 JSON:**

```json
{
  "generatedAt": "2026-02-19T22:01:05.000Z",
  "recentTradingDates": ["2026-02-19", "2026-02-18", "2026-02-17"],
  "rules": [
    {
      "key": "200-16/20",
      "shortLabel": "200일선 + 16/20",
      "entries": [
        { "date": "2026-02-19", "tickers": ["VUG", "IWF"] }
      ],
      "exits": [
        { "date": "2026-02-18", "tickers": ["XLE"] }
      ]
    }
  ]
}
```

**Discord 메시지 포맷:**

```
# 추세 변화 알림 (최근 5거래일)

## 추세 진입 감지
- VUG (성장) — 200일 추세 진입
- IWF (성장) — 200일 추세 진입

## 추세 이탈 감지
- XLE (에너지) — 200일 추세 이탈

자세히 보기: https://atchu-fe.vercel.app/market_overview
```

**파일:** `summary/trend/trend_notifications.json`, `summary/trend_md/trend_notifications.md`

### 2-4. 일간 요약 (lib/notify.sh 내 bash)

`send_daily_snapshot_summary()` 함수에서 생성됩니다. 알림 발송은 `send_all_notifications()` 래퍼에서 Vercel 배포 완료 후 호출됩니다.

내용:
- 시장 온도 (전체 상승/하락 종목 수 및 비율)
- 대표 3대 지수 (SPY, QQQ, DIA) 변동률
- 타입별 강세/약세 분리 (평균 등락률 + 상승/하락 종목 수)

**Discord 메시지 포맷:**

```
# 일간 시장 리포트 (2026-02-19)

시장 온도: 185개 종목 중 120개 상승 (65%)
▸ SPY +0.28% | QQQ -0.15% | DIA +0.45%

## 오늘의 강세
1. 성장 +0.82% (3 상승 / 0 하락)

## 오늘의 약세
1. 원자재 -1.20% (1 상승 / 6 하락)

자세히 보기: https://atchu-fe.vercel.app/market_overview
```

**파일:** `summary/daily_md/daily_summary.md`, `summary/daily_md/YYYY-MM-DD_daily_summary.md`

Discord 웹훅으로 1800자 단위로 분할 전송됩니다.

---

## 3단계: 프론트엔드 데이터 소비

### 데이터 로딩 방식 — Vite 정적 임포트

프론트엔드는 **API 호출이나 Fetch를 사용하지 않습니다.** Vite의 `import.meta.glob`을 사용하여 빌드 타임에 JSON 파일을 번들에 포함합니다.

**파일:** `02_fe_react/src/utils/dataLoaders.js`

```javascript
// CSV 원본 (lazy 로딩)
const csvModules = import.meta.glob("../../data/csv/*.csv", {
  query: "?raw", import: "default"
});

// 최신 스냅샷 (빌드 시 포함)
const latestSnapshotModules = import.meta.glob(
  "../../data/summary/snapshot/summary_snapshots.json",
  { eager: true, import: "default" }
);

// 추세 알림 (날짜별 + 최신)
const datedTrendNotificationModules = import.meta.glob(
  "../../data/summary/trend/*_trend_notifications.json",
  { eager: true, import: "default" }
);
const latestTrendNotificationModules = import.meta.glob(
  "../../data/summary/trend/trend_notifications.json",
  { eager: true, import: "default" }
);

// 티커 설정
const tickerModules = import.meta.glob(
  "../../data/tickers/*.json",
  { eager: true, import: "default" }
);
```

내보내는 값:

| export | 설명 |
|--------|------|
| `csvModules` | CSV 파일 경로 → 내용 매핑 (lazy) |
| `tickerModules` | 티커 설정 JSON 전체 |
| `latestSnapshotPayload` | 최신 일간 스냅샷 (summary_snapshots.json) |
| `latestTrendNotificationPayload` | 최신 추세 알림 (날짜별 중 최신, 없으면 trend_notifications.json 폴백) |

### App.jsx — 초기화 흐름

```
1. buildLocalTickers(tickerModules)
   - 18개 tickers/*.json을 모듈 직접 순회 방식으로 병합
   - item-level `type` + 파일-level `heatmap_group` 매핑
   - 50개 타입 우선순위로 중복 제거:
     미국대표지수 > 채권 > 성장/밸류/저변동성/퀄리티/배당/모멘텀 >
     기술/에너지/금융/헬스케어/산업/소재/유틸리티/필수소비재/임의소비재/통신/부동산 >
     반도체/사이버보안/소프트웨어 >
     글로벌/선진국/신흥국/일본/한국/대만/중국/인도/브라질/유럽/호주/캐나다/멕시코 >
     중소형/동일가중 >
     금/은/원유/천연가스/원자재 종합/구리/농산물 >
     외환/레버리지/인버스/공포/기타 > S&P 상위 100

2. buildMockTickers(localTickers)
   - 프론트엔드에서 사용할 형식으로 변환 → overviewTickers

3. createAppDataAdapters({ latestSnapshotPayload, csvModules })
   - loadLocalDetailAnalytics: 개별 종목 상세 분석 로드
   - getLocalListAnalytics: 목록 화면용 분석 데이터
   - getLocalSnapshot: 특정 종목 스냅샷 조회

4. usePageModels({ ... })
   - 각 페이지에 필요한 모델 구성

5. useRouteModel({ ... })
   - 라우트 기반으로 적절한 모델 매핑
```

### MarketOverviewPage.jsx — 전일 시장 조회 화면

**파일:** `02_fe_react/src/pages/MarketOverviewPage.jsx`

Props로 `latestSnapshotPayload`, `overviewTickers`, `latestTrendNotificationPayload`, `onTypeSelect`를 받습니다.

#### 화면 구성 요소

**1) 히트맵 (MarketHeatmap 컴포넌트)**
- `02_fe_react/src/components/market/MarketHeatmap.jsx`
- 내부 `buildOverviewData()` 함수로 타일 데이터 생성
- 핵심 지수(SPY, QQQ, DIA), 스타일 요약, 섹터/채권/국가/원자재/중소형/레버리지/S&P 상위 100 타일 렌더링

**2) 시장 상태 — 추세 강도 (MainMarketStatusGrid 컴포넌트)**
- `02_fe_react/src/components/main/MainMarketStatusGrid.jsx`
- item-level `type`별로 200일선 위에 있는 종목 비율을 바 그래프로 표시
- **제외 타입:** 인버스, 공포, 레버리지, 외환, 기타 (시장 방향성을 왜곡하므로 추세 강도 계산에서 제외)

**3) 최근 추세 진입/이탈**
- `latestTrendNotificationPayload`에서 최근 5거래일의 이벤트 표시
- 규칙별로 진입(초록)/이탈(빨강) 종목 나열
- 배지에 한글 이름(`name_ko`) 표시, 클릭 시 해당 종목 상세 페이지로 이동

### MarketHeatmap.jsx — 히트맵 렌더링

**파일:** `02_fe_react/src/components/market/MarketHeatmap.jsx`

#### buildOverviewData(snapshotPayload, localUniverse) — 내부 함수

티커별 200일선 괴리율(`percentDiff200`)을 `heatmapGroup`(파일-레벨 타입) 기준으로 그룹핑하여 타일 데이터를 생성합니다.

**히트맵 라벨:** 각 티커의 `heatmap_label` 필드에서 가져옴 (하드코딩 없음).

**반환 값:**

```javascript
{
  coreTickers,        // SPY, QQQ, DIA (maDist, isAtchuQualified, trendDays 포함)
  styleSummary,       // 성장/밸류/퀄리티/저변동성/배당 평균
  bondTiles,          // 채권 타일
  sectorTiles,        // 섹터 타일
  countryTiles,       // 국가 타일
  commodityTiles,     // 원자재 타일
  smallMidTiles,      // 중소형 타일
  singleStockTiles,   // S&P 상위 100 타일
  leverageTiles       // 레버리지 타일
}
```

---

## 생성 파일 전체 목록

```
data/
├── csv/                                    # EODHD에서 받은 원본 CSV
│   ├── SPY.US_all.csv
│   ├── QQQ.US_all.csv
│   └── ... (185개)
│
├── summary/
│   ├── snapshot/                           # 스냅샷 JSON (이동평균/추세/수익률)
│   │   └── summary_snapshots.json          # 최신 스냅샷
│   │
│   ├── landing_data.json                   # 랜딩 페이지 사전 계산 데이터
│   │
│   ├── trend/                              # 추세 변화 (JSON)
│   │   ├── trend_notifications.json        # 최신
│   │   └── YYYY-MM-DD_trend_notifications.json
│   │
│   ├── trend_md/                           # 추세 변화 (Markdown)
│   │   ├── trend_notifications.md          # 최신
│   │   └── YYYY-MM-DD_trend_notifications.md
│   │
│   ├── daily_md/                           # 일간 요약 (Markdown)
│   │   ├── daily_summary.md                # 최신
│   │   └── YYYY-MM-DD_daily_summary.md
│   │
├── tickers/                                # 종목 설정 (18개 JSON)
│   ├── us_major_index.json
│   ├── sector.json
│   ├── country.json
│   └── ...
│
├── logs/                                   # 실행 로그
│   └── cron_YYYY-MM-DD.log
│
└── scripts/                                # 실행 스크립트
    ├── pipeline.sh                         # 메인 진입점 (전체 파이프라인 오케스트레이터)
    ├── generate_summary_snapshot.mjs       # CSV → 스냅샷 JSON 변환
    ├── generate_landing_data.mjs           # 랜딩 페이지 데이터 생성
    └── lib/
        ├── common.sh                       # 공통 설정, 로그, 웹훅
        ├── tickers.sh                      # 종목 목록 읽기
        ├── download.sh                     # CSV 다운로드, 병렬 처리
        ├── snapshot.sh                     # 스냅샷 생성, 랜딩 데이터, node/npm 탐색
        ├── notify.sh                       # 추세 알림, 일간 서머리
        └── deploy.sh                       # 빌드, Vercel 배포, git push
```

---

## 환경변수

`.env` 파일에 필요한 변수:

| 변수 | 용도 |
|------|------|
| `EODHD_API_TOKEN` | EODHD API 인증 토큰 |
| `DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL` | 관리자 채널 Discord 웹훅 |
| `DISCORD_ATCHU_DAILY_SUMMARY_WEBHOOK_URL` | 일간 리포트 Discord 웹훅 |
| `DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL` | 추세 변화 Discord 웹훅 |
| `VERCEL_TOKEN` | Vercel 배포 토큰 |

---

## 실행 주기

- cron 작업으로 일 1회, 미국 장 마감 후 실행 (추정)
- 중복 실행 방지: `flock` 사용
- 로그: `data/logs/cron_YYYY-MM-DD.log`
- 전체 소요 시간: 약 7~10분 (다운로드 3~5분 + 후처리 2~3분 + 빌드/배포 2분)

---

## 데이터 품질 보장

| 검증 항목 | 방법 |
|----------|------|
| CSV 형식 | Date 헤더 확인, 빈 파일 거부 |
| 중복 방지 | `cmp`로 기존 파일과 비교 |
| 다운로드 실패 | 기존 파일 유지, 3회 재시도 |
| 가격 보정 | `Adjusted_close` 사용 (배당/분할 반영) |
| 이동평균 | null 검증 후 계산 |
