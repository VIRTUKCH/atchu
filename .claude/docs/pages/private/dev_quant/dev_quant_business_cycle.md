# 경기순환 섹터 로테이션 — /_dev_quant/business-cycle

## 전략 원작자

Sam Stovall (S&P Global 수석 전략가)
- 저서: "S&P's Guide to Sector Investing"
- Fidelity, Schwab, Goldman 등 대형 증권사 리서치의 표준 참조 모델

## 핵심 규칙

### 경기 4국면 → 강세 섹터 매핑

| 경기 국면 | 강세 섹터 | ETF | 비중 |
|-----------|----------|-----|------|
| **회복기** (Early Cycle) | 금융, 산업재 | XLF, XLI | 각 50% |
| **호황기** (Mid Cycle) | 기술, 경기소비재 | XLK, XLY | 각 50% |
| **둔화기** (Late Cycle) | 에너지, 헬스케어, 필수소비재 | XLE, XLV, XLP | 각 33.3% |
| **침체기** (Recession) | 유틸리티, 헬스케어, 필수소비재 | XLU, XLV, XLP | 각 33.3% |

### 국면 판단: SPY 13612W 가중 모멘텀

BAA 전략에서 검증된 13612W 모멘텀 공식으로 판단:

```
mom = 12×(1M수익) + 4×(3M수익) + 2×(6M수익) + 1×(12M수익)
mom_prev = 전월 기준 동일 계산

              mom 상승 중(↑)         mom 하락 중(↓)
mom > 0       호황기 (Mid)           둔화기 (Late)
mom < 0       회복기 (Early)         침체기 (Recession)
```

- **회복기**: 모멘텀 아직 음수지만 바닥 찍고 올라오는 중
- **호황기**: 모멘텀 양수이고 계속 상승
- **둔화기**: 모멘텀 양수지만 꺾이기 시작
- **침체기**: 모멘텀 음수이고 계속 하락

### 리밸런싱
- 월 1회 (월말 기준, 기존 파이프라인과 동일 주기)

## 유니버스

핵심 8개 섹터 ETF: XLK, XLF, XLV, XLY, XLP, XLE, XLI, XLU

## 다른 전략과의 차이

| 비교 | Faber 섹터 모멘텀 | 듀얼 모멘텀 | 경기순환 로테이션 |
|------|-----------------|-----------|----------------|
| 신호 | 가격 모멘텀 (3M ROC) | 가격 모멘텀 + 현금 필터 | 13612W 레벨 + 방향 |
| 매매 빈도 | 월 1회 | 월 1회 | 월 1회 |
| 강점 | 단순, 검증 기간 최장 | 하락장 방어 | 직관적, 경기순환 스토리 |

## 백테스트 성과 (2000-01 ~ 2026-02, 314개월)

| 전략 | CAGR | MDD | Sharpe |
|------|------|-----|--------|
| 경기순환 로테이션 | 9.32% | -45.23% | 0.639 |
| SPY B&H | 8.2% | -50.78% | 0.601 |
| 60/40 B&H | 6.25% | -32.32% | — |

국면 분포: 회복기 7%, 호황기 42%, 둔화기 32%, 침체기 19%

## 구현 파일

| 파일 | 역할 |
|------|------|
| `data/scripts/generate_business_cycle_signal.mjs` | 파이프라인 스크립트 |
| `data/summary/business-cycle/business_cycle_signal.json` | 신호 JSON 출력 |
| `src/utils/businessCycleDataLoaders.js` | JSON 로더 |
| `src/pages/BusinessCyclePage.jsx` | 상세 페이지 |
| `src/components/business-cycle/BusinessCycleEquityCurveChart.jsx` | 등비곡선 차트 |

## 상태

구현 완료 — 파이프라인 + 상세 페이지 + 허브 카드 통합
