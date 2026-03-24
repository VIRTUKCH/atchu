# 멀티팩터 QVM — /_dev_quant/multi-factor

## 전략 개요

| 항목 | 내용 |
|------|------|
| **대표** | AQR Capital, DFA (Dimensional), Finominal |
| **유형** | 팩터 기반 종목 선별 (Factor Investing) |
| **리밸런싱** | 월 또는 분기 1회 |
| **핵심 아이디어** | Quality + Value + Momentum 3가지 팩터를 결합해 종목 선별 |
| **특징** | 학술적으로 가장 많이 검증된 팩터들의 조합 |

## 3가지 팩터

### Quality (수익성)
| 지표 | 설명 |
|------|------|
| ROE | 자기자본이익률 |
| ROA | 총자산이익률 |
| Gross Profit / Assets | 총이익/총자산 (Novy-Marx) |
| 부채비율 | 재무 안정성 |

- **논리**: 높은 수익성 기업은 장기적으로 시장을 outperform
- **2024 현황**: GFC 이후 알파 소멸 추세. 크라우딩으로 연 -4.9% 헤드윈드 (Man Group 분석)
- **전망**: 향후 10년은 이전 10년보다 생산적일 가능성 높음

### Value (저평가)
| 지표 | 설명 |
|------|------|
| PER | 주가수익비율 (낮을수록 저평가) |
| PBR | 주가순자산비율 |
| EV/EBITDA | 기업가치/영업이익 |
| FCF Yield | 잉여현금흐름 수익률 |

- **논리**: 저평가 종목은 장기적으로 고평가 종목을 outperform (Fama-French)
- **2017-2023**: 심각한 부진 ("팩터 투자의 겨울")
- **2024-2025**: 국제 시장에서 회복 조짐

### Momentum (추세)
| 지표 | 설명 |
|------|------|
| 12-1 Month Return | 최근 12개월 수익률 (최근 1개월 제외) |
| 52주 신고가 근접도 | 신고가에 가까울수록 강한 모멘텀 |

- **논리**: 오르는 주식은 계속 오르고, 내리는 주식은 계속 내리는 경향
- **2024**: 미국·선진국·이머징 모두에서 **최고 성과 팩터** (상위 96%)
- **위험**: 급격한 반전(momentum crash)에 취약

## 결합의 힘 — 왜 QVM인가

- 각 팩터는 **다른 시기에 작동**: Value는 회복기, Momentum은 추세기, Quality는 침체기
- 결합 시 **상호 보완**: 한 팩터가 부진할 때 다른 팩터가 보상
- AQR 연구: 균등 배분 4팩터(Value, Momentum, Quality, Low Beta) 포트폴리오 → 지속적 양의 수익

## 구현 방식의 중요성 — 업계 최대 교훈

### 롱숏 (시장중립) — 작동함
- AQR Equity Market Neutral Fund (QMNIX): **2024년 사상 최고 수익**
- 롱: 팩터 점수 상위 종목 매수 / 숏: 하위 종목 매도
- 높은 팩터 노출, 시장 베타 0

### 롱온리 ETF — 대부분 실패
- 10개 대형 멀티팩터 ETF 중 **단 1개(OMFL)만 초과수익** (2015년 이후)
- 원인: 낮은 팩터 노출 (0.9 베타 → 거의 인덱스 추종), 숏 부재
- "팩터 투자가 죽었다"는 비판의 진짜 원인은 ETF 구현의 한계

### 개인 투자자의 딜레마
- 롱숏 펀드: 수수료 높고 접근 제한 (적격투자자 자격 필요)
- 롱온리 ETF: 접근 쉬우나 팩터 프리미엄 추출 어려움
- **현실적 대안**: DFA 펀드, AVUV/AVDV (Avantis) 등 팩터 노출 높은 ETF 활용

## 팩터 크라우딩 문제 (2024-2025)

- Mag-7에 헤지펀드 순노출 21% 집중 (2024 중반)
- Quality 팩터 크라우딩 → 진입 밸류에이션 2.7% 상승, 청산 시 2.2% 하락
- 2025년 4월 "de-crowding" 가속화
- **교훈**: 인기 있는 팩터일수록 크라우딩 위험 증가

## 한계점

1. **구현이 전부**: 같은 팩터라도 롱숏 vs 롱온리 결과 천차만별
2. **알파 소멸**: 전략 공개 후 초과수익 감소 (특히 Quality)
3. **크라우딩**: 동일 팩터에 자금 집중 → 밸류에이션 왜곡
4. **개인 투자자 접근성**: 진정한 팩터 프리미엄은 롱숏으로만 추출 가능
5. **레짐 의존**: Value는 10년간 부진 가능, Momentum crash 위험

## 구현 상태 — Phase 1: QVML ETF 추적 (완료)

### 접근 방식
개별주 펀더멘탈 데이터(ROE, PER 등) 없이는 기관 수준의 QVM 스코어링 불가.
→ S&P가 이미 스코어링을 완료한 QVML ETF를 추적하는 방식 채택 (ALLW 패턴).

### 파일 구성
| 파일 | 용도 |
|------|------|
| `data/tickers/qvm.json` | QVML 티커 메타 (hidden) |
| `data/scripts/generate_qvm_signal.mjs` | QVML+SPY 월말 종가 → 성과 지표 |
| `data/summary/qvm/qvm_signal.json` | 신호 JSON 출력 |
| `src/utils/qvmDataLoaders.js` | eager 데이터 로더 |
| `src/pages/QvmPage.jsx` | 상세 페이지 |
| `src/components/qvm/QvmEquityCurveChart.jsx` | 에쿼티 커브 차트 |

### JSON 출력 구조
```json
{
  "strategy": { "name", "author", "type", "rebalancing", "etf", "expenseRatio", "holdings", "methodology" },
  "factorDefinitions": { "quality", "value", "momentum" },
  "performance": { "qvml": { "cagr", "mdd", "sharpe", "totalReturn" }, "spy": {...} },
  "equityCurve": [{ "date", "qvml", "spy" }],
  "latestClose": { "date", "price", "monthReturn" },
  "dataMonths": N
}
```

### 페이지 구조
1. 기간별 수익률 (1M~5Y)
2. QVML ETF 정보 (운용사, 보수, 종목 수, 리밸런싱)
3. 왜 멀티팩터인가 (단일 팩터 한계 → 결합 → AQR 통합 교훈)
4. S&P QVM 스코어링 방법론 (Quality/Value/Momentum 정의)
5. 성과 요약 + 벤치마크 비교 + 에쿼티 커브
6. 멀티팩터 ETF의 현실 (롱숏 vs 롱온리)
7. 한계점 + 면책 조항

## Phase 2: DIY QVM — QVM-EW + QVM-MOM (구현 완료)

### 두 변형
| | QVM-EW | QVM-MOM |
|---|---|---|
| 배분 | QUAL/VLUE/MTUM 33% 균등 | 12-1M 모멘텀 순위 50/30/20 |
| 추세 필터 | 없음 (항상 투자) | 10개월 SMA, 탈락 시 BIL 대체 |
| CAGR | 12.84% | 9.40% |
| MDD | -25.92% | **-15.13%** |
| Sharpe | 0.893 | **0.908** |
| 기간 | 2013-08 ~ 2026-02 (139개월) | 동일 |

### 파일 구성
| 파일 | 용도 |
|------|------|
| `data/scripts/generate_qvm_diy_signal.mjs` | EW+MOM 신호 생성 + 백테스트 |
| `data/summary/qvm/qvm_diy_signal.json` | 신호 JSON |
| `src/utils/qvmDiyDataLoaders.js` | eager 데이터 로더 |
| `src/pages/QvmDiyPage.jsx` | variant prop 기반 상세 페이지 |
| `src/components/qvm/QvmDiyEquityCurveChart.jsx` | 에쿼티 커브 차트 |

### 3검 비교 결과 (2021-07 ~ 2026-02, QVML 존재 기간)
- **QVML(기관 통합)**: CAGR 12.25%, MDD -22.84% — 종목 수준에서 Q+V+M 스코어링
- **QVM-EW(단순 혼합)**: 비슷한 수익, 약간 더 높은 MDD
- **QVM-MOM(적극 로테이션)**: 낮은 수익이지만 MDD 크게 감소, Sharpe 유사

## 참고 자료

- [Factor Investing Is Dead, Long Live Factor Investing (Finominal)](https://insights.finominal.com/research-factor-investing-is-dead-long-live-factor-investing/)
- [Questioning Quality (Man Group)](https://www.man.com/insights/questioning-quality)
- [Crowded spaces and anomalies (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S0378426625001992)
- [Dynamics of Factor Crowding (SSRN)](https://papers.ssrn.com/sol3/Delivery.cfm/5023380.pdf?abstractid=5023380&mirid=1)
- [Quality Value Momentum Strategy (Quant Investing)](https://www.quant-investing.com/blog/quality-value-momentum-the-best-strategy-you-have-never-heard-of)
