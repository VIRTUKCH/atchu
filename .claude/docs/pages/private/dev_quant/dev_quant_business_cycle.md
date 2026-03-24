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

### 국면 판단: 모멘텀 근사 방식

거시경제 지표(ISM PMI, LEI) 대신 시장 가격 데이터만 사용:

```
SPY 6개월 수익률  →  주식 모멘텀 (양수=상승, 음수=하락)
IEF/SHY 비율 6개월 변화  →  금리 방향 (비율↑ = 금리↓, 비율↓ = 금리↑)

              금리 하락(↓)         금리 상승(↑)
주식 상승(↑)   회복기 (Early)       호황기 (Mid)
주식 하락(↓)   침체기 (Recession)   둔화기 (Late)
```

### 리밸런싱
- 월 1회 (월말 기준, 기존 파이프라인과 동일 주기)

## 유니버스

핵심 8개 섹터 ETF: XLK, XLF, XLV, XLY, XLP, XLE, XLI, XLU

## 다른 전략과의 차이

| 비교 | Faber 섹터 모멘텀 | 듀얼 모멘텀 | 경기순환 로테이션 |
|------|-----------------|-----------|----------------|
| 신호 | 가격 모멘텀 | 가격 모멘텀 + 현금 필터 | 모멘텀 근사 (주식+금리) |
| 매매 빈도 | 월 1회 | 월 1회 | 월 1회 |
| 강점 | 단순, 검증 기간 최장 | 하락장 방어 | 직관적, 스토리 있음 |

## 백테스트 성과 (2003-01 ~ 2026-02)

| 전략 | CAGR | MDD | Sharpe |
|------|------|-----|--------|
| 경기순환 로테이션 | 9.55% | -40.54% | 0.67 |
| SPY B&H | 11.43% | -50.78% | 0.829 |
| 60/40 B&H | 8.28% | -32.32% | — |

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
