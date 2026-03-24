# Faber 섹터 모멘텀 — /_dev_quant/faber-sector

## 전략 원작자

Mebane Faber (Cambria Investment Management 창립자)
- 논문: "Relative Strength Strategies for Investing" (SSRN, 2010)
- French-Fama 10 Industry Portfolios (1926~2009) 학술 데이터 기반
- 특정 ETF를 지정하지 않음 — ETF 매핑은 실무 구현자의 판단

## 핵심 규칙

1. **유니버스**: 10개 섹터 ETF (XLB, XLE, XLF, XLI, XLK, XLP, VNQ, XLU, XLV, XLY)
   - **XLC(통신, 2018~) 제외**: 논문의 "Telecommunications"은 옛 통신사이며, 2018년 XLC(Meta·Alphabet 흡수)와 성격이 다름. 제외 시 백테스트 7년→20년+로 확장
   - **VNQ(부동산, 2004~)**: XLRE(2015~) 대신 사용 — 동일 섹터, 데이터 10년+ 더 김
2. **모멘텀 순위**: 최근 3개월 수익률(ROC) 기준으로 10개 섹터 순위 매김
3. **포트폴리오**: 상위 3개 섹터에 동일비중(33.3%) 투자
4. **트렌드 필터**: S&P 500(SPY)이 10개월 SMA 아래이면 전 포지션 청산 → 현금 대피
5. **리밸런싱**: 월 1회 (월말 종가 기준)

## 참고 성과 (논문/백테스트)

| 지표 | 수치 | 비고 |
|------|------|------|
| CAGR | ~13.94% | 1928-2009, Quantpedia (논문 원본) |
| MDD | -46.29% | 트렌드 필터 미적용 시 |
| Sharpe | 0.54 | |
| 매수보유 대비 승률 | ~70% | 80년+ 기간 |

## 우리 구현 백테스트 (2005-06 ~ 2026-02)

| 지표 | Faber 10섹터 | SPY B&H |
|------|-------------|---------|
| CAGR | 8.94% | 10.86% |
| MDD | -22.53% | -50.78% |
| Sharpe | 0.794 | — |
| 현금 비율 | 19% | — |

- 2008 금융위기 포함 — SPY -50.78%일 때 Faber -22.53%로 방어
- 수익률은 SPY 대비 낮지만, MDD 절반 이하로 위험조정 수익 우수

## 구현

### 파이프라인
- `data/scripts/generate_faber_signal.mjs` → `data/summary/faber/faber_signal.json`
- `pipeline.sh`에서 HAA 다음에 자동 호출

### 페이지 구조
1. ← 퀀트 엿보기 (ColumnBackLink)
2. 기간별 수익률 (ColumnStatGrid)
3. 트렌드 필터 — SPY vs 10M SMA 상태 + 투자/현금 배지
4. 이번 달 포트폴리오 — top 3 chip + allocation bar
5. 섹터 모멘텀 순위 — 10개 섹터 3M ROC 테이블
6. 유니버스 구성 — XLC 제외 이유, VNQ 대체 설명
7. 백테스트 성과 — CAGR/MDD/Sharpe + equity curve 차트
8. 리밸런싱 히스토리 — 36개월 타임라인
9. 면책조항

### 데이터 흐름
```
CSV (ETF 일봉) → generate_faber_signal.mjs → faber_signal.json
  → faberDataLoaders.js (import.meta.glob eager)
  → FaberSectorPage.jsx + QuantHubPage.jsx (카드)
```

## 상태

구현 완료 — 2026-03-24
