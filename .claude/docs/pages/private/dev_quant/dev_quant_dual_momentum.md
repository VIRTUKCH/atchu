# 듀얼 모멘텀 4변형 — /_dev_quant/dm-*

## 전략 개요

**듀얼 모멘텀(Dual Momentum)** — Gary Antonacci가 "Dual Momentum Investing"에서 체계화한 전략.
두 가지 모멘텀 필터를 결합하여 "강한 자산에 투자하되, 전체 시장이 약하면 현금/채권으로 대피"하는 구조.

### 왜 "듀얼(Dual)"인가

| 모멘텀 유형 | 질문 | 역할 |
|------------|------|------|
| **상대모멘텀** (Relative) | 어느 자산이 가장 강한가? | 자산 선택 |
| **절대모멘텀** (Absolute) | 이 자산이 무위험(T-Bill)보다 나은가? | 위험 관리 |

두 필터를 순차 적용: 상대모멘텀으로 **승자**를 고르고, 절대모멘텀으로 **투자 여부**를 결정한다.

---

## 4변형 요약

| ID | 이름 | 자산 유니버스 | 룩백 | 최대 보유 | 방어 자산 | 핵심 규칙 |
|----|------|-------------|------|----------|----------|----------|
| `gem` | GEM (원조) | SPY, EFA | 12개월 | 1개 | AGG | SPY vs EFA 상대모멘텀 → 승자 vs BIL 절대모멘텀 |
| `adm` | ADM (가속) | SPY, EFA | 1+3+6개월 합산 | 1개 | TLT | 가속 점수 기반, 둘 다 음수면 장기채 대피 |
| `cdm` | CDM (복합) | SPY, EFA, LQD, HYG, VNQ, GLD, TLT | 12개월 | 4개 (모듈당 1) | BIL | 4모듈(주식·크레딧·부동산·스트레스) × 25% 독립 판단 |
| `sector` | Sector (섹터) | XLB, XLC, XLE, XLF, XLI, XLK, XLP, XLU, XLV, XLY | 12개월 | 4개 | BIL | 상위 4섹터 → 각각 BIL 대비 절대모멘텀 필터 |

**공통**: 월 1회 리밸런싱 (월말 평가), 2티어 전략 (전문가 검증)

---

## 변형별 상세

### GEM — Global Equities Momentum (원조)

**저자**: Gary Antonacci

**알고리즘**:
1. SPY, EFA 각각 12개월 수익률 계산
2. **상대모멘텀**: `spyRet >= efaRet` → 승자 = SPY, 아니면 EFA
3. **절대모멘텀**: 승자 수익률 > BIL 수익률 → 승자에 100% 투자
4. 승자 수익률 ≤ BIL → AGG(종합채권) 100% 대피

**포트폴리오**: 항상 단일 자산 100% (SPY or EFA or AGG)

### ADM — Accelerating Dual Momentum (가속)

**저자**: Gary Antonacci (변형)

**알고리즘**:
1. SPY, EFA 각각 **가속 모멘텀 점수** 계산: `score = 1M수익률 + 3M수익률 + 6M수익률`
2. 둘 다 점수 < 0 → TLT(장기채) 100% 대피 (방어)
3. 아니면 점수가 더 높은 자산에 100% 투자

**핵심 차이**: GEM의 12개월 단일 룩백 대신 단기 추세(1M+3M+6M) 합산 → 추세 전환 시 더 빠르게 반응

### CDM — Composite Dual Momentum (복합)

**저자**: Gary Antonacci (변형)

**알고리즘**:
1. 4개 모듈, 각 25% 비중:
   - **주식**: SPY vs EFA (12M 수익률 상위)
   - **크레딧**: LQD vs HYG (12M 수익률 상위)
   - **부동산**: VNQ (단일)
   - **스트레스**: GLD vs TLT (12M 수익률 상위)
2. 각 모듈 독립적으로 듀얼 모멘텀 판단:
   - 모듈 승자의 12M 수익률 > BIL → 승자에 25% 투자
   - 아니면 해당 25%를 BIL(초단기채)로 대체
3. 전 모듈이 BIL이면 방어 모드

**핵심 차이**: 자산군별 분산 (주식·채권·부동산·대체자산 독립 판단)

### Sector — 섹터 듀얼 모멘텀

**저자**: Gary Antonacci (변형)

**알고리즘**:
1. 미국 10개 섹터(XLB, XLC, XLE, XLF, XLI, XLK, XLP, XLU, XLV, XLY) 12개월 수익률 계산
2. **상대모멘텀**: 상위 4개 섹터 선정
3. **절대모멘텀**: 각 섹터 수익률 > BIL → 해당 섹터에 25% 투자, 아니면 BIL 25%
4. 상위 4개 모두 BIL 이하면 방어 모드

**포트폴리오**: 최대 4섹터 × 25% 동일비중, 현금 대체 메커니즘 내장

---

## 티커 대체 (Substitution)

| 원본 | 대체 | 이유 |
|------|------|------|
| SCZ | EFA | SCZ(소형 선진국) 데이터 부족 → EFA(선진국 대형) 대체, 백테스트 기간 확보 |
| REM | VNQ | REM(모기지 리츠) 데이터 부족 → VNQ(미국 부동산 전체) 대체, 범용성 우수 |

---

## 시그널 JSON 구조

**경로**: `data/summary/dm/dm_signal.json`

```json
{
  "generatedAt": "2026-03-24T...",
  "variants": {
    "gem": {
      "signal": { "mode": "invested|defensive", "rebalanceDate": "2026-02-28", "winner": "SPY" },
      "comparison": [{ "ticker": "SPY", "nameKo": "S&P 500", "return12m": 25.8 }, ...],
      "portfolio": { "allocations": [{ "ticker": "SPY", "nameKo": "S&P 500", "weight": 100 }] },
      "backtest": {
        "startDate": "...", "endDate": "...",
        "gem": { "cagr": ..., "mdd": ..., "sharpe": ..., "maxAnnualLoss": ... },
        "spy": { "cagr": ..., "mdd": ..., "sharpe": ... },
        "sixtyForty": { "cagr": ..., "mdd": ..., "sharpe": ... },
        "defensiveRatio": 0.42,
        "equityCurve": [{ "date": "...", "gem": 1.0, "spy": 1.0, "sixtyForty": 1.0 }, ...]
      },
      "history": [{ "date": "...", "mode": "invested", "allocations": [...] }, ...]
    },
    "adm": {
      "signal": { "mode": "...", "rebalanceDate": "...", "topAsset": "SPY" },
      "ranking": [{ "ticker": "SPY", "nameKo": "...", "score1m": ..., "score3m": ..., "score6m": ..., "totalScore": ..., "selected": true }],
      "portfolio": { ... },
      "backtest": { ... },
      "history": [...]
    },
    "cdm": {
      "signal": { "mode": "...", "rebalanceDate": "..." },
      "modules": [{ "name": "주식", "candidates": ["SPY","EFA"], "winner": "SPY", "winnerReturn12m": ..., "bilReturn12m": ..., "result": "SPY", "weight": 25 }, ...],
      "portfolio": { ... },
      "backtest": { ... },
      "history": [...]
    },
    "sector": {
      "signal": { "mode": "...", "rebalanceDate": "..." },
      "ranking": [{ "ticker": "XLK", "nameKo": "기술", "return12m": ..., "aboveBil": true, "rank": 1, "selected": true }, ...],
      "portfolio": { ... },
      "backtest": { ... },
      "history": [...]
    }
  }
}
```

---

## 데이터 파이프라인

| 스크립트 | 역할 |
|---------|------|
| `generate_dm_signal.mjs` | CSV → 4변형 시그널 + 백테스트(CAGR/MDD/샤프) + 에쿼티 커브 + 히스토리 → `dm_signal.json` |

**실행**: `pipeline.sh` 내에서 자동 호출

**프로세스**:
1. CSV → 월말 종가(Adjusted_close) 추출
2. 기준월(직전 월말) 결정
3. 4변형 각각: 현재 시그널 계산 + 전체 기간 백테스트
4. 벤치마크 동시 계산: SPY B&H, 60/40 B&H
5. `dm_signal.json` 출력

---

## 프론트엔드

### 페이지 컴포넌트

| 컴포넌트 | 경로 | 역할 |
|---------|------|------|
| `DualMomentumPage.jsx` | `src/pages/` | variant prop 기반 상세 페이지 (gem/adm/cdm/sector) |
| `DmEquityCurveChart.jsx` | `src/components/dm/` | SVG 3선 에쿼티 커브 (전략/SPY/60-40) |
| `dmDataLoaders.js` | `src/utils/` | `import.meta.glob` eager → `dmSignalPayload` export |

### VARIANT_CONFIG (DualMomentumPage.jsx)

```javascript
const VARIANT_CONFIG = {
  gem:    { label: "듀얼 모멘텀 GEM", short: "GEM", curveKey: "gem", author: "Gary Antonacci", type: "comparison" },
  adm:    { label: "듀얼 모멘텀 ADM", short: "ADM", curveKey: "adm", author: "Gary Antonacci (변형)", type: "ranking" },
  cdm:    { label: "듀얼 모멘텀 CDM", short: "CDM", curveKey: "cdm", author: "Gary Antonacci (변형)", type: "modules" },
  sector: { label: "듀얼 모멘텀 섹터", short: "Sector", curveKey: "sector", author: "Gary Antonacci (변형)", type: "sectorRanking" },
};
```

`type` 필드로 변형별 UI 분기:
- `comparison` — SPY vs EFA 12M 비교 테이블
- `ranking` — 가속 점수 랭킹 테이블 (1M+3M+6M)
- `modules` — 4모듈별 독립 판단 표시
- `sectorRanking` — 10개 섹터 순위 테이블

### 페이지 섹션 구성

1. **SignalBadge** — 투자(초록) / 방어(파랑) 뱃지 + 변형별 상세 설명
2. **PortfolioSection** — 현재 포트폴리오 (ticker-pill 칩)
3. **ReturnsSection** — 기간별 수익률 (1M~5Y)
4. **변형별 상세** — comparison/ranking/modules/sectorRanking 테이블
5. **BacktestSection** — 성과 요약 (CAGR/MDD/샤프/방어비율) + 비교 테이블 (전략 vs SPY vs 60/40)
6. **DmEquityCurveChart** — 에쿼티 커브 3선 SVG 차트
7. **HistorySection** — 최근 36개월 리밸런싱 타임라인

---

## 라우트

```jsx
<Route path="/_dev_quant/dm-gem" element={<BentoLayout><PasswordGate><DualMomentumPage variant="gem" /></PasswordGate></BentoLayout>} />
<Route path="/_dev_quant/dm-adm" element={<BentoLayout><PasswordGate><DualMomentumPage variant="adm" /></PasswordGate></BentoLayout>} />
<Route path="/_dev_quant/dm-cdm" element={<BentoLayout><PasswordGate><DualMomentumPage variant="cdm" /></PasswordGate></BentoLayout>} />
<Route path="/_dev_quant/dm-sector" element={<BentoLayout><PasswordGate><DualMomentumPage variant="sector" /></PasswordGate></BentoLayout>} />
<Route path="/_dev_quant/dual-momentum" element={<Navigate to="/_dev_quant/dm-gem" replace />} />
```

---

## 설정 (quantItems.js)

4개 항목, 모두 `status: "active"`, `tier: 2`:

```javascript
{ id: "dm-gem",    path: "/_dev_quant/dm-gem",    label: "듀얼 모멘텀 GEM",  curveKey: "gem",    tier: 2 },
{ id: "dm-adm",    path: "/_dev_quant/dm-adm",    label: "듀얼 모멘텀 ADM",  curveKey: "adm",    tier: 2 },
{ id: "dm-cdm",    path: "/_dev_quant/dm-cdm",    label: "듀얼 모멘텀 CDM",  curveKey: "cdm",    tier: 2 },
{ id: "dm-sector", path: "/_dev_quant/dm-sector", label: "듀얼 모멘텀 섹터", curveKey: "sector", tier: 2 },
```

---

## 상태

구현 완료
