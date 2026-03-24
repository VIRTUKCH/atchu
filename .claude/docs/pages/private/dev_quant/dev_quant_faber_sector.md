# Faber 섹터 모멘텀 — /_dev_quant/faber-sector

## 전략 원작자

Mebane Faber (Cambria Investment Management 창립자)
- 논문: "Relative Strength Strategies for Investing" (SSRN)
- 1920년대~현재, 80년+ French-Fama 데이터로 검증

## 핵심 규칙

1. **유니버스**: 미국 11개 GICS 섹터 ETF (XLB, XLC, XLE, XLF, XLI, XLK, XLP, XLRE, XLU, XLV, XLY)
2. **모멘텀 순위**: 최근 3개월 수익률(ROC) 기준으로 11개 섹터 순위 매김
3. **포트폴리오**: 상위 3개 섹터에 동일비중(33.3%) 투자
4. **트렌드 필터**: S&P 500(SPY)이 10개월 SMA 아래이면 전 포지션 청산 → 현금/단기채 대피
5. **리밸런싱**: 월 1회 (월말 종가 기준)

## 참고 성과 (논문/백테스트)

| 지표 | 수치 | 비고 |
|------|------|------|
| CAGR | ~13.94% | 1928-2009, Quantpedia |
| MDD | -46.29% | 트렌드 필터 미적용 시 |
| Sharpe | 0.54 | |
| 매수보유 대비 승률 | ~70% | 80년+ 기간 |

- 트렌드 필터(10개월 SMA) 적용 시 MDD 대폭 감소
- 2001-2002, 2008 약세장 회피 실증

## 상태

기획 중 — 데이터 파이프라인 및 상세 페이지 미구현
