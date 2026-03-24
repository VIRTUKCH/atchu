# 퀀트 엿보기 — /_dev_quant

## 접근 방법

- DevPage(`/_dev`) 허브 → "퀀트 엿보기" 카드 클릭
- 직접 URL 입력 (`/_dev_quant`)
- PasswordGate + BentoLayout 적용
- 일반 사용자에게 절대 노출되지 않음. 네비게이션·사이트맵·SEO 모두 제외

## 이 페이지의 목적

채호님 개인 투자 의사결정 보조 도구.
**여러 퀀트 전략**의 현재 신호와 포트폴리오 배분을 한눈에 확인한다.

**답하는 질문:**
- "내 전략들이 지금 각각 뭐라고 하고 있나?"
- "이번 달에 구체적으로 어떤 ETF를 사야 하나?"
- "왜 이런 판정이 나왔나?"

앗추의 공개 제품과 완전히 분리된 개인 도구. README에 언급하지 않는다.

## 유입 경로

- DevPage(`/_dev`) 허브 → "퀀트 엿보기" 카드 클릭
- 직접 URL (`/_dev_quant`)

---

## 전략 목록

| 전략 | 라우트 | 기획 문서 | 상태 |
|------|--------|----------|------|
| BAA-A (Aggressive) | `/_dev_quant/baa-a` | [dev_quant_baa_a.md](dev_quant_baa_a.md) | 구현 완료 |
| BAA-B (Balanced) | `/_dev_quant/baa-b` | [dev_quant_baa_b.md](dev_quant_baa_b.md) | 구현 완료 |
| 섹터 로테이션 | `/_dev_quant/sector` | [dev_quant_sector.md](dev_quant_sector.md) | 기획 중 |

---

## 페이지 구조 — 허브 → 전략 상세

```
/_dev_quant              → 퀀트 허브 (전략 카드 리스트 + 수익률 요약)
/_dev_quant/baa-a        → BAA Aggressive 상세
/_dev_quant/baa-b        → BAA Balanced 상세
/_dev_quant/sector       → 섹터 로테이션 전략 상세 (예정)
/_dev_quant/...          → 추후 전략 추가 가능
```

### 왜 허브 → 상세 구조인가

- FAQ 패턴(`faqItems.js` → `FaqPage` → 상세 페이지)과 동일한 검증된 패턴
- 전략이 추가될 때마다 설정 배열에 한 줄만 추가하면 허브에 자동 노출
- 각 전략의 상세 페이지는 독립적으로 설계 가능 (BAA와 섹터 전략은 UI가 완전히 다를 수 있음)

---

## 퀀트 허브 (`/_dev_quant`) — "내 전략들이 뭐라고 하나?"

### 목적

등록된 모든 퀀트 전략을 카드 리스트로 보여준다. 각 카드에는 **현재 신호 요약**이 표시되어 상세 페이지에 들어가지 않아도 핵심 정보를 알 수 있다.

### 레이아웃 — 추세 조회 카드 패턴

추세 조회 리스트처럼 통계 박스를 **카드 전체 너비**로 가로 길게 배치. 포트폴리오+수익률은 상단 2열, 통계는 하단 full-width.

```
PC:
┌──────────────────────────────────────────────────────────────┐
│ [BAA-A (Aggressive)]                                         │ head
│ G4 top 1 집중 투자 — 카나리아 모멘텀 기반 공격/방어 전환       │
│ [공격] 2026-02 월말 기준                                      │
├─────────────────────────────┬────────────────────────────────┤
│ 현재 포트폴리오              │  기간별 수익률                  │
│ ┌─────────────────────────┐ │  ┌────────┬────────┬────────┐ │
│ │ EFA 선진국 (EAFE) 100%  │ │  │   5Y   │   3Y   │   1Y   │ │
│ └─────────────────────────┘ │  │ +25.8% │ +21.8% │ +7.3%  │ │
│                              │  ├────────┼────────┼────────┤ │
│                              │  │   6M   │   3M   │   1M   │ │
│                              │  │ +18.5% │ +9.0%  │ +4.6%  │ │
│                              │  └────────┴────────┴────────┘ │
├──────────────────────────────┴───────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ CAGR                                          +9.72%    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ MDD                                           -13.6%    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 샤프비율                                        0.987   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 방어 비율                                         56%   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 데이터 시작                                  2008-05-30~│ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

모바일 (540px 이하):
상단 2열 → 1열 스택. 통계 박스는 동일하게 full-width.
```

### 전략 카드 구성

**Head** (최우선 식별)

| 요소 | 설명 |
|------|------|
| **전략 이름** | `ticker-pill` 스타일 배지 (예: "BAA-A (Aggressive)") |
| **한줄 설명** | 전략 특성 요약 |
| **신호 뱃지** | 공격(초록) / 방어(파랑) / 준비 중(회색) |
| **기준일** | "2026-02 월말 기준" |

**Top** (포트폴리오 + 수익률, 2열 가로 배치)

| 요소 | 설명 |
|------|------|
| **현재 포트폴리오** | chip 레이아웃 (가로 wrap). 티커 + 한글명 + 비중%를 한 chip에. BAA-A 1개, BAA-B 6개(2행) |
| **기간별 수익률** | 3열 × 2행 그리드 박스 (5Y, 3Y, 1Y, 6M, 3M, 1M). 순수 USD 기준 |

**Bottom** (통계 박스, full-width 가로 길게 — 추세 조회 우측 박스 패턴)

| 요소 | 데이터 경로 | 왜 필요한가 |
|------|-----------|------------|
| **CAGR** | `backtest.{variant}.cagr` | 장기 수익 |
| **MDD** | `backtest.{variant}.mdd` | 위험 수준 |
| **샤프비율** | `backtest.{variant}.sharpe` | 위험조정 수익 |
| **방어 비율** | `backtest.defensiveRatio` | 전략 성격 |
| **데이터 기간** | `backtest.startDate` | 몇 년 검증됐는지 |

### UI 상세 가이드

#### 수익률 그리드 (`quant-returns-grid`)

- **레이아웃**: 3열 × 2행 (6개 박스: 5Y, 3Y, 1Y, 6M, 3M, 1M)
- **박스 크기**: `padding: 14px 12px`, 충분히 크게 터치 가능
- **기간 라벨**: 상단, `clamp(13px~15px)`, muted 색상, `font-weight: 500`
- **수익률 값**: 하단, `clamp(18px~22px)`, `font-weight: 700`, Sora 폰트
- **색상**: 양수 → `var(--accent-green)`, 음수 → `var(--accent-red)`
- **배경**: `var(--panel-2)`, `border: 1px solid var(--line)`, `border-radius: 10px`

#### 통계 박스 (`quant-stats-row`) — full-width 가로 길게

- **추세 조회 우측 박스 패턴**(`index-ma-dl-row`)과 동일
- **카드 전체 너비**를 사용 (2열 그리드 안이 아닌, 카드 하단에 독립 배치)
- `padding: 10px 14px`, `border-radius: 10px`
- 라벨(dt): 좌측, muted, `clamp(15px~18px)`
- 값(dd): 우측, `clamp(16px~20px)`, `font-weight: 700`, Sora 폰트
- CAGR → 양수 초록 / MDD → 빨강 / 나머지 → 기본 ink 색상

#### 반응형

| 요소 | PC (1440px) | 모바일 (375px) |
|------|-------------|----------------|
| `quant-card-top` | 2열 그리드 (1fr 1fr) | 1열 스택 (540px 이하) |
| 수익률 그리드 | 3×2 | 3×2 (유지) |
| 통계 박스 | full-width | full-width (동일) |
| 카드 padding | 20px | 20px |
| 모든 텍스트 | clamp 최대값 | clamp 최소값 |

### 전략 설정 (SSoT)

`src/config/quantItems.js` — FAQ의 `faqItems.js`와 동일한 패턴:

```javascript
export const QUANT_STRATEGIES = [
  {
    id: "baa-a",
    path: "/_dev_quant/baa-a",
    label: "BAA-A (Aggressive)",
    description: "G4 top 1 집중 투자 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
    curveKey: "aggressive",
  },
  {
    id: "baa-b",
    path: "/_dev_quant/baa-b",
    label: "BAA-B (Balanced)",
    description: "G12 top 6 분산 투자 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
    curveKey: "balanced",
  },
  {
    id: "sector",
    path: "/_dev_quant/sector",
    label: "섹터 로테이션",
    description: "GICS 섹터 모멘텀 기반 배분 전략",
    status: "coming_soon",
    curveKey: null,
  },
];
```

### 신호 뱃지 데이터

| 전략 | 뱃지 텍스트 | 뱃지 색상 | JSON 경로 |
|------|-----------|----------|-----------|
| BAA-A | "공격" / "방어" + 수익률 | 초록 / 파랑 | `baa_signal.json → signal.mode` + `backtest.equityCurve` |
| BAA-B | "공격" / "방어" + 수익률 | 초록 / 파랑 | `baa_signal.json → signal.mode` + `backtest.equityCurve` |
| 섹터 | "준비 중" | 회색 | 없음 (하드코딩) |

### 상호작용

- **활성 전략 카드 클릭** → 해당 전략 상세 페이지로 이동 (예: `/_dev_quant/baa`)
- **준비 중 카드** → 클릭 비활성화, 회색 처리

---

## 라우트

```jsx
{/* 퀀트 허브 */}
<Route path="/_dev_quant" element={<BentoLayout><PasswordGate><QuantHubPage /></PasswordGate></BentoLayout>} />

{/* BAA 전략 상세 */}
<Route path="/_dev_quant/baa-a" element={<BentoLayout><PasswordGate><BaaQuantPeekPage variant="aggressive" /></PasswordGate></BentoLayout>} />
<Route path="/_dev_quant/baa-b" element={<BentoLayout><PasswordGate><BaaQuantPeekPage variant="balanced" /></PasswordGate></BentoLayout>} />
<Route path="/_dev_quant/baa" element={<Navigate to="/_dev_quant/baa-a" replace />} />
```

---

## 허브 컴포넌트

| 컴포넌트 | 용도 | Props |
|----------|------|-------|
| `QuantHubPage` | 퀀트 허브 페이지 (전략 카드 리스트) | — |

### CSS

기존 FAQ 카드 스타일(`.more-link-list`, `.more-link-card`) 재사용. 신호 뱃지 추가:

```css
.quant-signal-badge { ... }
.quant-signal-badge--offensive { background: var(--accent-green); }
.quant-signal-badge--defensive { background: var(--accent-blue); }
.quant-signal-badge--coming    { background: var(--line); }
```

---

## 타이포그래피

| 요소 | 모바일 (375px) | PC (1440px) | clamp 값 | 굵기 | 역할 |
|------|---------------|-------------|----------|------|------|
| 허브 제목 | 22px | 28px | `clamp(22px, calc(17.8px + 1.1vw), 28px)` | 700 | 퀀트 엿보기 타이틀 |
| 전략 카드 이름 | 18px | 22px | `clamp(18px, calc(15.2px + 0.75vw), 22px)` | 600 | 전략 이름 |
| 보조 텍스트 | 15px | 16px | `clamp(15px, calc(14.3px + 0.19vw), 16px)` | 400 | 기준일, 부가 설명 |

---

## 데이터 출처 종합

| 데이터 | 파일 경로 | 로딩 방식 | 갱신 주기 |
|--------|----------|-----------|----------|
| BAA 신호·배분 | `data/summary/baa/baa_signal.json` | `import.meta.glob` eager | 매일 (pipeline.sh) |
| BAA 전용 티커 메타 | `data/tickers/baa.json` | `import.meta.glob` eager | 수동 |
| 섹터 신호 (예정) | `data/summary/sector/sector_signal.json` | `import.meta.glob` eager | 매일 (pipeline.sh) |
| ETF CSV (계산용) | `data/csv/*.US_all.csv` | 프론트 미사용 (파이프라인 전용) | 매일 |

---

**관련 페이지 기획:** [dev_market_overview.md](../dev_market_overview.md) (개발자 마켓 뷰)
**관련 컴포넌트:** `QuantHubPage`, `BaaQuantPeekPage`, `BaaSignalBadge`, `BaaPortfolioTab`, `baaDataLoaders.js`
**관련 파이프라인:** `generate_baa_signal.mjs`, `pipeline.sh`
