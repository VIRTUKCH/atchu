# 퀀트 엿보기 — /_quant

## 접근 방법

- DevPage(`/_dev`) 허브 → "퀀트 엿보기" 카드 클릭
- 직접 URL 입력 (`/_quant`)
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
- 직접 URL (`/_quant`)

---

## 전략 목록

| 전략 | 라우트 | 기획 문서 | 상태 |
|------|--------|----------|------|
| BAA (Bold Asset Allocation) | `/_quant/baa` | [baa.md](baa.md) | 구현 완료 |
| 섹터 로테이션 | `/_quant/sector` | [sector.md](sector.md) | 기획 중 |

---

## 페이지 구조 — 허브 → 전략 상세

```
/_quant              → 퀀트 허브 (전략 카드 리스트)
/_quant/baa          → BAA 전략 상세
/_quant/sector       → 섹터 로테이션 전략 상세 (예정)
/_quant/...          → 추후 전략 추가 가능
```

### 왜 허브 → 상세 구조인가

- FAQ 패턴(`faqItems.js` → `FaqPage` → 상세 페이지)과 동일한 검증된 패턴
- 전략이 추가될 때마다 설정 배열에 한 줄만 추가하면 허브에 자동 노출
- 각 전략의 상세 페이지는 독립적으로 설계 가능 (BAA와 섹터 전략은 UI가 완전히 다를 수 있음)

---

## 퀀트 허브 (`/_quant`) — "내 전략들이 뭐라고 하나?"

### 목적

등록된 모든 퀀트 전략을 카드 리스트로 보여준다. 각 카드에는 **현재 신호 요약**이 표시되어 상세 페이지에 들어가지 않아도 핵심 정보를 알 수 있다.

### 레이아웃

FAQ 허브(`FaqPage`)와 동일한 카드 리스트 구조. 단, 각 카드에 **실시간 신호 뱃지**가 추가된다.

```
┌──────────────────────────────────────┐
│  퀀트 엿보기                          │
│  개인 투자 의사결정 보조 도구           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ BAA (Bold Asset Allocation)  │    │
│  │ 전술적 자산배분               │    │
│  │ ┌────────┐                   │    │
│  │ │ 공격 ↗ │  2026-02 월말 기준 │    │
│  │ └────────┘                   │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 섹터 로테이션 (예정)          │    │
│  │ GICS 섹터 모멘텀 기반 배분     │    │
│  │ ┌───────────┐                │    │
│  │ │ 준비 중    │               │    │
│  │ └───────────┘                │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### 전략 카드 구성

| 요소 | 설명 |
|------|------|
| **전략 이름** | "BAA (Bold Asset Allocation)" |
| **한줄 설명** | "전술적 자산배분 — 카나리아 모멘텀 기반 공격/방어 전환" |
| **신호 뱃지** | 전략별 현재 상태 요약 (예: "공격 ↗", "방어 ↘") |
| **기준일** | "2026-02 월말 기준" |
| **상태** | 활성 / 준비 중 |

### 전략 설정 (SSoT)

`src/config/quantItems.js` — FAQ의 `faqItems.js`와 동일한 패턴:

```javascript
export const QUANT_STRATEGIES = [
  {
    id: "baa",
    path: "/_quant/baa",
    label: "BAA (Bold Asset Allocation)",
    description: "전술적 자산배분 — 카나리아 모멘텀 기반 공격/방어 전환",
    status: "active",
  },
  {
    id: "sector",
    path: "/_quant/sector",
    label: "섹터 로테이션",
    description: "GICS 섹터 모멘텀 기반 배분 전략",
    status: "coming_soon",
  }
];
```

### 신호 뱃지 데이터

| 전략 | 뱃지 텍스트 | 뱃지 색상 | JSON 경로 |
|------|-----------|----------|-----------|
| BAA | "공격" / "방어" | 초록 / 파랑 | `baa_signal.json → signal.mode` |
| 섹터 | "준비 중" | 회색 | 없음 (하드코딩) |

### 상호작용

- **활성 전략 카드 클릭** → 해당 전략 상세 페이지로 이동 (예: `/_quant/baa`)
- **준비 중 카드** → 클릭 비활성화, 회색 처리

---

## 라우트

```jsx
{/* 퀀트 허브 */}
<Route path="/_quant" element={<BentoLayout><PasswordGate><QuantHubPage /></PasswordGate></BentoLayout>} />

{/* 전략 상세 */}
<Route path="/_quant/baa" element={<BentoLayout><PasswordGate><BaaQuantPeekPage /></PasswordGate></BentoLayout>} />
<Route path="/_quant/sector" element={<BentoLayout><PasswordGate><SectorStrategyPage /></PasswordGate></BentoLayout>} />
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
