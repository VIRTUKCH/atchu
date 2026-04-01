# 관리자 추세 조회 — /_dev_trend_list

## 이 페이지의 역할

S&P 500 개별주 + ETF 85개를 **하나의 통합 리스트**로 보여주는 개발자 전용 페이지. 총 ~588개.

**답하는 질문:**
- "어떤 종목이 앗추 필터를 통과하고 있나?"
- "기술 섹터 중 반도체는 어떤가?"
- "이격률이 높은/낮은 종목은?"
- "ETF 중에서 골든크로스인 건 뭐가 있지?"
- "채권/원자재 ETF의 앗추 필터 상태는?"

---

## 유입 경로

- 상단 네비 "관리자 추세 조회" 탭 (devMode 활성 시)
- `/_dev_market_overview` 섹터 추세 강도 카드 클릭 → `/_dev_trend_list?sector=기술`
- `/_dev_market_overview` **서브섹터 클릭** → `/_dev_trend_list?sector=기술&sub=반도체`
- Discord 관리자 채널 알림 하단 링크

---

## 페이지 구조

| 순서 | 영역 | 설명 |
|------|------|------|
| 0 | 요약 바 | "전체 588개 중 {M}개 앗추 필터 통과" |
| 1 | **최상위 필터** | [전체] [개별주] [ETF] — TypeFilter 재사용 |
| 2 | 하위 필터 | 개별주: SectorGroupFilter / ETF: TypeFilter(자산군) |
| 3 | 검색 | 티커명 또는 회사명 (예: AAPL, SPY, 애플) |
| 4 | 정렬 | 통합 옵션 8개 |
| 5 | 카드 그리드 | EtfSummaryCard 재사용 |

---

## 필터 구조

### 최상위 필터 (TypeFilter)

```
[전체]  [개별주]  [ETF]
```

- **전체** (기본): 588개 모두 표시
- **개별주**: S&P 500 ~503개만 → 하위에 SectorGroupFilter 노출
- **ETF**: 85개만 → 하위에 자산군 TypeFilter 노출

### 개별주 하위 필터 (SectorGroupFilter)

GICS 11개 섹터 + 46개 서브섹터 그룹 레이아웃.

```
기술          [소프트웨어] [반도체] [하드웨어] [IT서비스]
헬스케어      [바이오텍] [제약] [의료기기] [헬스케어서비스] [생명과학]
금융          [은행] [보험] [자산운용] [핀테크]
...
```

### ETF 하위 필터 (TypeFilter)

```
[전체] [미국 대표 지수] [스타일] [배당] [섹터] [국가] [채권] [원자재] [중소형] [레버리지·인버스] [기타]
```

> **레버리지·인버스 포함**: 공개 추세 조회(`/trend_list`)에서는 제외되지만, 이 관리자 페이지에서는 `[레버리지·인버스]` 통합 필터 버튼으로 확인 가능. ETF JSON 파일이 `data/tickers/private/`에 별도 저장됨.
>
> `[레버리지·인버스]` 버튼은 두 종류를 통합해서 보여준다:
> - **지수·섹터 레버리지·인버스**: TQQQ, SOXL, SQQQ 등 — `leverage.json` / `inverse.json`
> - **개별주 레버리지·인버스**: TSLL(Tesla 2x), NVDL(Nvidia 2x), AAPU(Apple 2x), MSFU(MSFT 2x), AMZU, METU, GGLL, ORCU 등 Direxion·GraniteShares 단일종목 ETF — `stock_leverage.json` / `stock_inverse.json`
>
> 카드에는 기초자산 정보 표시 (예: "TSLL · Tesla 2x Bull"). 모두 일간 리셋 구조 — 장기 보유 시 decay 주의.

---

## 상세 페이지 연결

| 종목 유형 | 카드 클릭 → | 비고 |
|-----------|------------|------|
| 개별주 | `/_dev_trend_list/:ticker` | 개발자 전용 상세 |
| ETF | `/_dev_trend_list/:ticker` | 개발자 전용 상세 (공개 상세보다 더 많은 정보 표시) |

개발자 상세 페이지에서는 ETF도 개별주와 동일한 레이아웃으로 심화 데이터를 보여준다. 공개 상세 페이지(`/trend_list/:ticker`)는 일반 사용자 전용으로 유지.

---

## 고정 티커 (최상단 핀)

모든 정렬 모드에서 아래 3개 대표 지수 ETF가 항상 최상단에 고정된다.

```
PINNED_TICKERS = ["SPY", "QQQ", "DIA"]
```

- 시장 전체를 대표하는 벤치마크이므로, 어떤 정렬 기준에서도 최우선 노출
- 고정 티커 간 순서: SPY → QQQ → DIA (고정)
- 고정 티커 이후에 일반 정렬 규칙이 적용됨

## 정렬 옵션 (통합)

| 값 | 라벨 | 1차 기준 | 2차 기준 |
|---|---|---|---|
| `group` | 분류별 | 개별주: 섹터순 → 시총순, ETF: 자산군순 → 파일순 | 개별주 먼저, ETF 뒤 |
| `atchu` | 앗추 | 앗추 필터 통과만 | 개별주=시총순, ETF=기본순 |
| `golden_cross` | 골든크로스 | 골든크로스(MA50 > MA200)만 | 동일 |
| `gc_days_desc` | 골든크로스 오래된순 | 골든크로스만 + goldenCrossDays 내림 | 동일 |
| `cagr_gc_desc` | 골든크로스 수익률순 | golden_cross CAGR 내림 | 동일 |
| `ma200_desc` | 이격률 높은순 | percentDiff200 내림 | 동일 |
| `ma200_asc` | 이격률 낮은순 | percentDiff200 오름 | 동일 |
| `cagr_desc` | 수익률 높은순 | 최적 CAGR 내림 | 동일 |
| `mdd_asc` | MDD 낮은순 | MDD 오름 | 동일 |

> 모든 정렬에서 PINNED_TICKERS가 최상단, 이후 위 규칙 적용.

---

## 데이터 로드 전략

### 초기 로드 최적화

- **기본 필터: ETF** — 페이지 진입 시 ETF 85개만 렌더링 (개별주 503개는 탭 클릭 전까지 렌더링하지 않음)
- 모든 데이터(ETF + 개별주 스냅샷)는 빌드 시 eager load로 번들에 포함되어 있으므로, 네트워크 요청은 없음
- 렌더링 비용이 병목: 588개 카드를 한 번에 그리면 ~1초 소요 → ETF만 먼저 보여줘서 체감 속도 개선
- 개별주 탭 클릭 시 이미 메모리에 있는 데이터로 즉시 렌더링 (추가 fetch 없음)

### 상세 페이지 데이터 로드

| 종목 유형 | 로드 방식 | 비고 |
|-----------|----------|------|
| ETF | `buildCsvAnalytics(csvText)` — 번들된 CSV에서 동기 로드 | `appDataAdapters.loadLocalDetailAnalytics` |
| 개별주 | `fetch(/csv_stock/{TICKER}.US_all.csv)` — on-demand | `stockDataLoaders.loadStockDetailAnalytics` |

ETF CSV는 빌드에 포함 (즉시), 개별주 CSV는 `public/csv_stock/`에서 fetch (네트워크 1회).

### 데이터 소스

| | 개별주 | ETF |
|---|---|---|
| 티커 메타 | `sp500.json` | `tickers/*.json` (10개) |
| 스냅샷 | `stock_snapshots.json` | `summary_snapshots.json` |
| 이평선 | MA50/200 | MA50/200 |
| 전략 | 3개 (200일선, 앗추, 골든크로스) | 3개 (동일) |
| CSV | `public/csv_stock/` (on-demand) | `data/csv/` (번들) |

### 중복 처리

S&P 500과 ETF는 별도 유니버스. 만약 동일 티커가 양쪽에 있으면 개별주 버전 우선.

---

## 관련 컴포넌트

- `StockListPage.jsx` — 페이지 본체 + 통합 필터/정렬
- `EtfSummaryCard.jsx` — 카드 (개별주/ETF 공용)
- `TypeFilter.jsx` — 최상위 필터 + ETF 자산군 필터
- `stockDataLoaders.js` — 개별주 데이터 로더
- `appDataAdapters.js` — ETF 데이터 로더
