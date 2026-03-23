# 관리자 추세 조회 — /_stocks

## 이 페이지의 역할

S&P 500 개별주 + ETF 85개를 **탭으로 전환**하며 추세를 통합 조회하는 개발자 전용 페이지.

**답하는 질문:**
- "어떤 종목이 앗추 필터를 통과하고 있나?"
- "기술 섹터 중 반도체는 어떤가?"
- "이격률이 높은/낮은 종목은?"
- "ETF 중에서 정배열인 건 뭐가 있지?"
- "채권/원자재 ETF의 앗추 필터 상태는?"

---

## 유입 경로

- 상단 네비 "관리자 추세 조회" 탭 (devMode 활성 시)
- `/_stocks_overview` 섹터 추세 강도 카드 클릭 → `/_stocks?sector=기술`
- `/_stocks_overview` **서브섹터 클릭** → `/_stocks?sector=기술&sub=반도체`
- Discord 관리자 채널 알림 하단 링크

---

## 페이지 구조

| 순서 | 영역 | 설명 |
|------|------|------|
| 0 | **탭 바** | [개별주] [ETF] — 세그먼트 컨트롤 |
| 1 | 요약 바 | 탭에 따라 다른 텍스트 |
| 2 | 필터 | 개별주: SectorGroupFilter / ETF: TypeFilter |
| 3 | 검색 | 티커명 또는 회사명 (예: AAPL, Apple, SPY) |
| 4 | 정렬 | 양 탭 공통 옵션 (기본 정렬명만 다름) |
| 5 | 카드 그리드 | EtfSummaryCard 재사용. 클릭 → 각 상세 페이지 |

---

## 탭 구조

```
[개별주]  [ETF]        ← 상단 세그먼트 컨트롤
```

| | 개별주 탭 | ETF 탭 |
|---|---|---|
| 종목 수 | ~503 | 85 |
| 필터 UI | SectorGroupFilter (GICS 11 + 서브섹터 46) | TypeFilter (10개 자산군 칩) |
| 기본 정렬 | `sector` (섹터별) | `type` (분류별) |
| 요약 바 | "S&P 500 {N}개 중 {M}개 종목이 앗추 필터 통과" | "ETF {N}개 중 {M}개가 앗추 필터 통과" |
| 카드 클릭 | `/_stocks/:ticker` | `/_etf/:ticker` (개발자 전용) |
| 데이터 소스 | `sp500.json` + `stock_snapshots.json` | `tickers/*.json` + `summary_snapshots.json` |

### 탭 전환 동작

- 검색어 초기화
- 정렬 기본값으로 리셋
- 필터 "전체"로 리셋

---

## 개별주 탭 — 그룹형 필터 (SectorGroupFilter)

섹터와 서브섹터의 관계를 한눈에 보여주는 그룹 레이아웃.

```
[전체]

기술          [소프트웨어] [반도체] [하드웨어] [IT서비스]
헬스케어      [바이오텍] [제약] [의료기기] [헬스케어서비스] [생명과학]
금융          [은행] [보험] [자산운용] [핀테크]
산업재        [항공우주/방산] [기계/장비] [건설] [운송] [비즈니스서비스]
임의소비재    [여행/레저] [외식] [유통] [자동차/주거] [패션/라이프]
필수소비재    [식품] [유통(필수)] [음료] [생활용품]
통신          [미디어] [인터넷/플랫폼] [게임/광고] [통신사]
에너지        [탐사/생산] [정유/운송] [서비스/장비] [통합석유]
유틸리티      [전력] [복합유틸리티] [독립발전/기타]
부동산        [주거] [상업] [인프라] [특수/서비스]
소재          [화학] [포장] [건자재/농화학] [금속/광업]
```

### 클릭 동작

| 대상 | 동작 | URL |
|------|------|-----|
| [전체] 버튼 | 503종목 모두 표시 | `/_stocks` |
| **섹터 이름** (기술, 헬스케어...) | 해당 섹터 전체 | `/_stocks?sector=기술` |
| **서브섹터 칩** (반도체, 바이오텍...) | 해당 서브섹터만 | `/_stocks?sector=기술&sub=반도체` |

### 선택 상태 표시

- 선택된 섹터 행: 배경 하이라이트
- 섹터 이름 active: 섹터 전체 선택 시
- 서브섹터 칩 active: 특정 서브섹터 선택 시

### 섹터 전환 시 서브섹터 초기화

- 다른 섹터 클릭 → 서브섹터 "ALL"로 리셋
- "전체" 클릭 → 모든 필터 해제

---

## ETF 탭 — 자산군 필터 (TypeFilter)

기존 `/index_etf`의 TypeFilter 컴포넌트 재사용. 10개 자산군 칩 1줄.

```
[전체] [미국 대표 지수] [스타일] [배당] [섹터] [국가] [채권] [원자재] [중소형] [레버리지·인버스] [기타]
```

ETF 전체 85개 포함 (레버리지/인버스 포함).

---

## URL 설계

| URL | 표시 내용 |
|-----|----------|
| `/_stocks` | 개별주 탭 (기본), 전체 503종목 |
| `/_stocks?sector=기술` | 개별주 탭, 기술 섹터 |
| `/_stocks?sector=기술&sub=반도체` | 개별주 탭, 기술 > 반도체 |
| `/_stocks?tab=etf` | ETF 탭, 전체 85개 |
| `/_stocks?tab=etf&type=채권` | ETF 탭, 채권 자산군 |

- `tab` 파라미터: 생략 또는 `stock` = 개별주(기본), `etf` = ETF
- `tab=etf` 시 `sector`/`sub` 무시, `type` 사용
- `tab` 없을 때 `type` 무시, `sector`/`sub` 사용
- 시장 개요 페이지 서브섹터 클릭 시 기존 URL 그대로 동작 (`tab` 미지정 = 개별주)

---

## 정렬 옵션 (양 탭 공통)

| 값 | 개별주 라벨 | ETF 라벨 | 1차 기준 | 2차 기준 |
|---|---|---|---|---|
| `sector` / `type` | 섹터별 | 분류별 | 분류 순서 → 시가총액순 | — |
| `atchu` | **앗추** | **앗추** | 앗추 필터 통과 종목만 표시 | 시가총액순 |
| `full_align` | **정배열** | **정배열** | 완전 정배열 종목만 표시 | 시가총액순 |
| `atchu_aligned` | **앗추+정배열** | **앗추+정배열** | 두 조건 동시 충족만 | 시가총액순 |
| `align_days_desc` | **정배열 오래된순** | **정배열 오래된순** | 정배열 유지 일수 내림차순 | 시가총액순 |
| `ma200_desc` | 이격률 높은순 | 이격률 높은순 | 200일선 대비 이격률 내림차순 | 시가총액순 |
| `ma200_asc` | 이격률 낮은순 | 이격률 낮은순 | 200일선 대비 이격률 오름차순 | 시가총액순 |
| `cagr_desc` | 수익률 높은순 | 수익률 높은순 | 최적 CAGR 내림차순 | 시가총액순 |
| `mdd_asc` | MDD 낮은순 | MDD 낮은순 | 최적 기간 MDD 오름차순 | 시가총액순 |

**"앗추"**: 앗추 필터 통과(`isAtchuQualified200`) 종목만 필터링. 시가총액순 정렬.
**"정배열"**: 완전 정배열(`maAlignment === "full"`) 종목만 필터링. 시가총액순 정렬.
**"앗추+정배열"**: 두 조건 동시 충족 종목만 필터링. "가장 건강한 추세".
**"정배열 오래된순"**: 완전 정배열 종목만 필터링 + `maAlignmentDays` 내림차순. 오래 유지된 정배열 = 강한 추세.

**기본 정렬**: 개별주 = "섹터별" (SECTOR_ORDER → 시가총액순), ETF = "분류별" (자산군 순서 → 파일 순서).
개별주의 시가총액순은 `sp500.json`의 `rank` 필드 (1=AAPL, 2=MSFT, ...) 사용.

> **ETF 탭 정배열 정렬**: ETF 파이프라인에 MA50/MA100, maAlignment 데이터 확장이 선행 필요.

---

## 공개 ETF 페이지(`/index_etf`)와의 관계

ETF 탭은 공개 ETF 추세 조회(`/index_etf`)의 **개발자 확장 버전**.

| | 공개 버전 (`/index_etf`) | 개발자 버전 (`/_stocks?tab=etf`) |
|---|---|---|
| 이평선 | MA200만 | MA50 / MA100 / MA200 |
| 전략 | 2개 (200일선, 앗추 필터) | 4개 (+ 정배열, 앗추+정배열) |
| 정배열 인디케이터 | 없음 | 있음 |
| 상세 페이지 | `/index_etf/:ticker` | `/_etf/:ticker` (개발자 전용) |
| 타겟 | 일반 사용자 | 개발자 전용 |

공개 페이지는 변경 없이 유지. 파이프라인 확장으로 스냅샷에 새 필드가 추가되어도 공개 페이지는 기존 필드만 사용.

---

## 카드 내 이평선 정배열 인디케이터

앗추 필터 인디케이터 바로 아래 줄에 동일한 형태(불 + 텍스트)로 표시. 양 탭 공통.

```
● 앗추 필터 적용 중 (20/20일)
● 이평선 정배열                    ← 아래 줄에 별도 표시
```

| maAlignment | 텍스트 | 불 + 글자 색상 |
|-------------|--------|--------------|
| `"full"` | `이평선 정배열` | 초록 |
| `"partial"` | `이평선 부분 정배열` | 노랑 |
| `"reverse"` | `이평선 역배열` | 빨강 |

`none` 없음 — full/reverse가 아닌 모든 상태가 `partial`.

데이터 소스:
- 개별주: `stock_snapshots.json`의 `maAlignment` → `toRecentShape()`의 `ma_alignment`
- ETF: `summary_snapshots.json`의 `maAlignment` (파이프라인 확장 후)

---

## 카드 내 전략별 성과

앗추 필터 CAGR/MDD 아래에 정배열, 앗추+정배열 전략 CAGR/MDD를 추가 표시. 양 탭 공통.

### 전략 정의

| 전략 키 | 전략명 | 진입 조건 | 이탈 조건 |
|---------|--------|----------|----------|
| `"200-20of16"` | 앗추 필터 | 20일 중 16일 이상 MA200 위 | 조건 미달 |
| `"full_align"` | 정배열 | price > MA50 > MA100 > MA200 | 하나라도 미충족 |
| `"atchu_full_align"` | 앗추+정배열 | 앗추 필터 AND 완전 정배열 동시 충족 | **둘 중 하나라도** 미충족 |

모든 전략의 비투자 기간은 현금 보유 (수익률 0%) 가정.

### 카드 레이아웃

```
200일선 가격              $246.45
200일선 대비 이격률         +0.62%
200일선 돌파 이후          상향 155일
연평균 수익률 (앗추 필터)    +12.57%
최악의 낙폭 (앗추 필터)     -94.6%
연평균 수익률 (정배열)       +8.23%
최악의 낙폭 (정배열)        -50.9%
연평균 수익률 (앗추+정배열)   +7.15%
최악의 낙폭 (앗추+정배열)    -45.2%
데이터 시작               1980.12.12~
```

### 데이터 소스

개별주:
- `stock_snapshots.json`의 `crossingHistory.annualizedMap["full_align"]` → 정배열 CAGR
- `stock_snapshots.json`의 `crossingHistory.mddMap["full_align"]` → 정배열 MDD
- `stock_snapshots.json`의 `crossingHistory.annualizedMap["atchu_full_align"]` → 앗추+정배열 CAGR
- `stock_snapshots.json`의 `crossingHistory.mddMap["atchu_full_align"]` → 앗추+정배열 MDD

ETF (파이프라인 확장 후):
- `summary_snapshots.json`의 동일 구조 (annualizedMap, mddMap에 full_align, atchu_full_align 키 추가)

리스트 페이지: 스냅샷에서 직접 참조 (CSV 로드 불필요).

---

## 파이프라인 확장 (선행 필요)

ETF 탭에서 정배열 관련 기능을 지원하려면 ETF 파이프라인(`generate_summary_snapshot.mjs`) 확장 필요:

- MA50, MA100 계산 + `percentDiff50`, `percentDiff100` 추가
- `maAlignment`, `maAlignmentDays` 계산 추가
- `crossingHistory`에 `full_align`, `atchu_full_align` 전략 CAGR/MDD 추가
- `generate_stock_snapshot.mjs`의 기존 로직 참조

---

## 관련 컴포넌트

- `StockListPage.jsx` — 페이지 본체 + 탭 전환 + SectorGroupFilter
- `EtfSummaryCard.jsx` — 카드 (양 탭 동일 컴포넌트)
- `TypeFilter.jsx` — ETF 탭 자산군 필터 (기존 컴포넌트 재사용)
- `stockDataLoaders.js` — 개별주 데이터 로더 (`stockTickerMetaMap`, `stockSnapshotMap`)
- `appDataAdapters.js` — ETF 데이터 로더 (`toRecentShape` 확장 필요)

## 관련 데이터

- `sp500.json` — 개별주 티커 메타 (`type`, `subType`, `short_description`, `rank`)
- `stock_snapshots.json` — 개별주 스냅샷
- `tickers/*.json` — ETF 티커 메타 (10개 파일, 10개 자산군)
- `summary_snapshots.json` — ETF 스냅샷 (파이프라인 확장 후 MA50/100, maAlignment 포함)
