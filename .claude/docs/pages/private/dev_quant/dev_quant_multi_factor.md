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

## 구현 계획

- [ ] 파이프라인: S&P 500 종목의 Quality/Value/Momentum 스코어 계산
- [ ] 데이터: `data/summary/multi-factor/qvm_signal.json`
- [ ] 프론트엔드: 팩터별 상위/하위 종목 리스트 + 팩터 성과 차트
- [ ] 특이사항: 개별주 데이터 필요 → `csv_stock/` 활용 가능

## 참고 자료

- [Factor Investing Is Dead, Long Live Factor Investing (Finominal)](https://insights.finominal.com/research-factor-investing-is-dead-long-live-factor-investing/)
- [Questioning Quality (Man Group)](https://www.man.com/insights/questioning-quality)
- [Crowded spaces and anomalies (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S0378426625001992)
- [Dynamics of Factor Crowding (SSRN)](https://papers.ssrn.com/sol3/Delivery.cfm/5023380.pdf?abstractid=5023380&mirid=1)
- [Quality Value Momentum Strategy (Quant Investing)](https://www.quant-investing.com/blog/quality-value-momentum-the-best-strategy-you-have-never-heard-of)
