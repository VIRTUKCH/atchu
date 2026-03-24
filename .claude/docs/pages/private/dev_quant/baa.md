# BAA (Bold Asset Allocation) — `/_quant/baa`

> 상위 문서: [퀀트 허브 index.md](index.md)

## BAA 전략 요약

BAA(Bold Asset Allocation)는 Wouter Keller가 2022년 발표한 전술적 자산배분 전략.
PAA, VAA, DAA의 핵심 개념을 결합하여, 금리 상승기에도 방어 자산으로 현금만 쓰지 않고 원자재·채권을 활용해 수익을 추구한다.

### 13612W 모멘텀 공식

```
13612W = 12 × (p0/p1 - 1) + 4 × (p0/p3 - 1) + 2 × (p0/p6 - 1) + 1 × (p0/p12 - 1)
```

- `p0`: 현재 월말 종가
- `p1`, `p3`, `p6`, `p12`: 각각 1, 3, 6, 12개월 전 월말 종가
- 최근 수익률에 높은 가중치를 부여하는 **빠른 절대 모멘텀** 지표

### 상대 모멘텀 (자산 선택용)

```
상대 모멘텀 = p0 / SMA(13개월)
```

- 13개월 단순이동평균 대비 현재 가격의 비율
- 값이 클수록 강한 자산. 자산 선택 시 이 값으로 순위를 매긴다

### 3개 유니버스

| 유니버스 | 역할 | ETF |
|---------|------|-----|
| **카나리아** (4) | 시장 위험 감지. 하나라도 13612W < 0이면 방어 전환 | SPY, EEM, EFA, AGG |
| **공격 G12** (12) | 공격 모드 시 투자 후보 (Balanced: top 6) | SPY, QQQ, IWM, VGK, EWJ, VWO, VNQ, DBC, GLD, TLT, HYG, LQD |
| **공격 G4** (4) | 공격 모드 시 투자 후보 (Aggressive: top 1) | SPY, QQQ, EFA, AGG |
| **방어** (7) | 방어 모드 시 투자 후보 (top 3, BIL 대체 적용) | TIP, DBC, BIL, IEF, TLT, LQD, AGG |

### 의사결정 흐름

```
매월 말 →
  1. 카나리아 4개의 13612W 모멘텀 계산
  2. 전부 양(+)? → 공격 모드 / 하나라도 음(-)? → 방어 모드
  3-A. 공격: G12 상대 모멘텀 순위 → Balanced top 6 (각 16.7%) / Aggressive: G4 top 1 (100%)
  3-B. 방어: 방어 7개 상대 모멘텀 순위 → top 3 (각 33.3%)
       → 선택된 자산의 상대 모멘텀이 BIL보다 낮으면 BIL로 대체
```

### 주요 성과 (논문 백테스트 1970-2022)

- **BAA Aggressive**: CAGR ~20%, MDD ~-15%
- **BAA Balanced**: CAGR ~15%, MDD ~-12%
- 방어 모드 비율: ~60%
- 벤치마크(SPY B&H) 대비 MDD를 1/3 이하로 줄이면서 수익률은 상회

---

## 페이지 구조 — 줌 레벨

| 순서 | 섹션 | 줌 레벨 | 답하는 질문 | 버전 |
|------|------|---------|------------|------|
| 0 | ← 퀀트 허브로 돌아가기 | 네비게이션 | — | v1 |
| 1 | BAA 현재 신호 | 1줄 요약 | "지금 공격인가 방어인가?" | v1 |
| 2 | 이번 달 포트폴리오 | 현재 배분 | "뭘 사야 하나?" | v1 |
| 3 | 카나리아 모멘텀 | 신호 근거 | "왜 이 모드인가?" | v1 |
| 4 | 유니버스별 모멘텀 순위 | 자산별 상세 | "각 자산의 강약은?" | v1 |
| 5 | 전략 성과 요약 | 백테스트 결과 | "이 전략이 얼마나 좋은가?" | v2 |
| 6 | 월별 리밸런싱 히스토리 | 과거 기록 | "과거에 어떻게 배분했나?" | v2 |

---

## 섹션 1. BAA 현재 신호 — "지금 공격인가 방어인가?"

- **목적**: 가장 중요한 단일 정보. 공격/방어 모드를 즉시 확인
- **레이아웃**: bento 카드 1개. 큰 배지 중앙 정렬
  - 공격 모드: 초록 배경 `var(--accent-green)` + "공격 (Offensive)"
  - 방어 모드: 파랑 배경 `var(--accent-blue)` + "방어 (Defensive)"
  - 리밸런싱 기준일: "2026-02 월말 기준" 표시
- **보조 텍스트**: "카나리아 4개 중 N개 양(+) 모멘텀"
  - 4/4 양: "전원 양(+) → 공격 모드"
  - 3/4 이하: "N개 음(−) → 방어 모드"
- **상호작용**: 없음 (읽기 전용)
- **컴포넌트**: `BaaSignalBadge` (~30줄)

### 데이터 출처

| UI 요소 | 표시 형태 | JSON 경로 |
|---------|----------|-----------|
| 모드 배지 | "공격" / "방어" | `baa_signal.json → signal.mode` |
| 기준일 | "2026-02 월말 기준" | `baa_signal.json → signal.rebalanceDate` |
| 카나리아 양 수 | "4개 중 4개 양(+)" | `baa_signal.json → signal.canaryPositiveCount` |

---

## 섹션 2. 이번 달 포트폴리오 — "뭘 사야 하나?"

- **목적**: 현재 BAA Aggressive와 Balanced의 구체적 배분을 보여준다
- **레이아웃**:
  - 상단 탭 2개: **"Aggressive (G4)"** / **"Balanced (G12)"**
  - 각 탭 내:
    1. `ColumnAllocationBar` — 배분 비율 시각화
    2. `ColumnCompareTable` — 배분 상세 테이블

  **Aggressive** 탭:
  - 공격 모드: G4 top 1 ETF → 100% 배분
  - 방어 모드: 방어 유니버스 top 3 → 각 33.3%

  **Balanced** 탭:
  - 공격 모드: G12 top 6 ETF → 각 16.7%
  - 방어 모드: 방어 유니버스 top 3 → 각 33.3%

- **BIL 대체 규칙**: 방어 모드에서 선택된 자산의 상대 모멘텀이 BIL보다 낮으면 해당 자산을 BIL로 대체. UI에서 취소선 + "→ BIL" 표시
- **상호작용**:
  - 탭 전환
  - ETF 티커 클릭 → `/trend_list/:ticker` 이동 (시스템에 있는 ETF만)
- **컴포넌트**:
  - `BaaPortfolioTab` (~50줄) — 탭 전환 래퍼
  - `ColumnAllocationBar` (재사용)
  - `ColumnCompareTable` (재사용)

### 데이터 출처

| UI 요소 | 표시 형태 | JSON 경로 |
|---------|----------|-----------|
| Aggressive 배분 | 티커 + 비중% | `baa_signal.json → portfolios.aggressive.allocations[]` |
| Balanced 배분 | 티커 + 비중% | `baa_signal.json → portfolios.balanced.allocations[]` |
| 각 자산 모멘텀 | 수치 | `portfolios.*.allocations[].{momentum13612w, relMomentum}` |
| BIL 대체 여부 | 취소선 + "→ BIL" | `portfolios.*.allocations[].replacedByBil` |

---

## 섹션 3. 카나리아 모멘텀 — "왜 이 모드인가?"

- **목적**: 4개 카나리아 자산의 13612W 모멘텀으로 신호 근거를 보여준다
- **레이아웃**: `ColumnKeyFactGrid` + `ColumnKeyFact` × 4
  - PC: 2×2 그리드 / 모바일: 1×4 세로 나열
  - 각 카드: `value` (수치), `variant` (positive/negative), `label` (티커 + 한글명), `desc` (역할)
- **판정 요약**: 그리드 상단에 한 줄 요약
- **컴포넌트**: `ColumnKeyFactGrid`, `ColumnKeyFact` (재사용)

### 데이터 출처

| UI 요소 | JSON 경로 |
|---------|-----------|
| SPY 모멘텀 | `baa_signal.json → canary[0].momentum13612w` |
| EEM 모멘텀 | `baa_signal.json → canary[1].momentum13612w` |
| EFA 모멘텀 | `baa_signal.json → canary[2].momentum13612w` |
| AGG 모멘텀 | `baa_signal.json → canary[3].momentum13612w` |

---

## 섹션 4. 유니버스별 모멘텀 순위 — "각 자산의 강약은?"

- **목적**: 공격/방어 유니버스의 모든 자산을 모멘텀 순으로 나열
- **레이아웃**: bento 카드 2개 (공격 / 방어)

### 공격 유니버스 테이블

`ColumnCompareTable` 재사용:
- `columns`: ["순위", "티커", "이름", "13612W", "상대 모멘텀", "선택"]
- G12 자산 12개를 상대 모멘텀 내림차순 정렬
- "선택" 열: Aggressive면 "A", Balanced면 "B", 둘 다면 "A·B"

### 방어 유니버스 테이블

`ColumnCompareTable` 재사용:
- `columns`: ["순위", "티커", "이름", "상대 모멘텀", "선택", "BIL 대체"]
- 방어 자산 7개를 상대 모멘텀 내림차순 정렬
- 상대 모멘텀 < BIL: `{ bad: true }` — 빨강 표시

---

## 데이터 구조 — baa_signal.json

파이프라인(`generate_baa_signal.mjs`)에서 생성. `data/summary/baa/baa_signal.json`에 저장.

```json
{
  "generatedAt": "2026-03-23T09:00:00Z",
  "signal": {
    "mode": "offensive",
    "rebalanceDate": "2026-02-28",
    "canaryPositiveCount": 4
  },
  "canary": [
    { "ticker": "SPY", "nameKo": "S&P 500", "momentum13612w": 15.23 },
    { "ticker": "EEM", "nameKo": "신흥국", "momentum13612w": 3.45 },
    { "ticker": "EFA", "nameKo": "선진국 (EAFE)", "momentum13612w": 8.12 },
    { "ticker": "AGG", "nameKo": "미국 종합채권", "momentum13612w": -1.02 }
  ],
  "offensiveRanking": [
    { "ticker": "SPY", "nameKo": "S&P 500", "momentum13612w": 15.23, "relMomentum": 1.08, "selectedG4": true, "selectedG12": true }
  ],
  "defensiveRanking": [
    { "ticker": "IEF", "nameKo": "중기 국채", "relMomentum": 1.02, "selected": true, "replacedByBil": false }
  ],
  "portfolios": {
    "aggressive": {
      "mode": "offensive",
      "allocations": [
        { "ticker": "SPY", "nameKo": "S&P 500", "weight": 100, "momentum13612w": 15.23, "relMomentum": 1.08, "replacedByBil": false }
      ]
    },
    "balanced": {
      "mode": "offensive",
      "allocations": [
        { "ticker": "SPY", "nameKo": "S&P 500", "weight": 16.67, "momentum13612w": 15.23, "relMomentum": 1.08, "replacedByBil": false },
        { "ticker": "QQQ", "nameKo": "나스닥 100", "weight": 16.67, "momentum13612w": 12.10, "relMomentum": 1.06, "replacedByBil": false }
      ]
    }
  }
}
```

---

## 필요 ETF — 신규 4종

`data/tickers/baa.json` — BAA 전용 ETF. 공개 페이지에 노출하지 않는다 (`"hidden": true`).

| 티커 | 이름 | 역할 |
|------|------|------|
| EEM | iShares MSCI Emerging Markets ETF | 카나리아 (신흥국) |
| EFA | iShares MSCI EAFE ETF | 카나리아 (선진국) |
| AGG | iShares Core U.S. Aggregate Bond ETF | 카나리아 (종합채권) |
| BIL | SPDR Bloomberg 1-3 Month T-Bill ETF | 방어 대체 기준 (현금성) |

### 공개 페이지 미노출 처리

- `dataLoaders.js`에서 `hidden !== true`인 티커만 공개 목록에 포함
- BAA 전용 로더(`baaDataLoaders.js`)에서는 baa.json 포함 전체 로드

---

## 컴포넌트

| 컴포넌트 | 용도 | Props |
|----------|------|-------|
| `BaaQuantPeekPage` | BAA 전략 상세 페이지 | — |
| `BaaSignalBadge` | 공격/방어 큰 배지 | `mode, rebalanceDate, canaryPositiveCount` |
| `BaaPortfolioTab` | Aggressive/Balanced 탭 전환 | `portfolios, activeTab, onTabChange` |
| `ColumnAllocationBar` | 배분 비율 바 (재사용) | `title, items` |
| `ColumnCompareTable` | 모멘텀 순위표 (재사용) | `columns, rows` |
| `ColumnKeyFactGrid` / `ColumnKeyFact` | 카나리아 그리드 (재사용) | `value, variant, label, desc` |
| `ColumnCallout` | 판정 요약 (재사용) | `children` |
| `ColumnWarningCard` | 투자 면책 고지 (재사용) | `children` |

---

## 타이포그래피

| 요소 | clamp 값 | 굵기 |
|------|----------|------|
| 신호 배지 | `clamp(28px, calc(22.4px + 1.5vw), 36px)` | 700 |
| 카드 타이틀 | `clamp(18px, calc(15.2px + 0.75vw), 22px)` | 600 |
| 모멘텀 수치 | `clamp(20px, calc(15.8px + 1.1vw), 26px)` | 700 |
| 테이블 셀 | `clamp(15px, calc(12.4px + 0.7vw), 18px)` | 400 |

---

## 구현 우선순위

### v1: BAA 데이터 파이프라인

1. `data/tickers/baa.json` 생성 (EEM, EFA, AGG, BIL)
2. `pipeline.sh`에서 baa.json 티커도 CSV 다운로드하도록 수정
3. `generate_baa_signal.mjs` 작성 — CSV → 13612W/SMA13 → 카나리아 판정 → baa_signal.json
4. `pipeline.sh`에 `generate_baa_signal.mjs` 호출 추가
5. `dataLoaders.js`에서 `hidden: true` 티커 필터링

### v2: 백테스트 + 히스토리

- 섹션 5. 전략 성과 요약 (CAGR, MDD, 샤프비율, 누적 수익률 차트)
- 섹션 6. 월별 리밸런싱 히스토리 (ColumnTimeline 재사용)
- `generate_baa_signal.mjs`에 백테스트 로직 추가

### 주의사항

1. **월말 종가 정밀도**: p1, p3, p6, p12는 달력 월말 기준. CSV에서 가장 가까운 거래일의 adjusted close 사용
2. **DBC 히스토리 제한**: DBC는 2006/02 상장. 그 이전 백테스트는 v2에서 결정
3. **리밸런싱 타이밍**: 파이프라인은 매일 실행되지만 BAA 신호는 월말에만 변경
4. **baa.json ETF는 앗추 추세 조회에 노출하지 않음**: `hidden: true` 플래그 필수
5. **허브 카드 신호 로딩**: 모든 전략 JSON을 eager 로드해야 함

---

**참고 논문:** [Keller, W.J. (2022). Relative and Absolute Momentum in Times of Rising/Low Yields: Bold Asset Allocation (BAA)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4166845)
