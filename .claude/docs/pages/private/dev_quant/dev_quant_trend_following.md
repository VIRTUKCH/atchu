# 트렌드 팔로잉 / CTA — /_dev_quant/trend-following

## 전략 개요

| 항목 | 내용 |
|------|------|
| **대표** | AQR Capital, Man Group (AHL), Winton |
| **유형** | 시계열 모멘텀 기반 매니지드 퓨처스 (Managed Futures) |
| **리밸런싱** | 일별~주별 (시그널에 따라) |
| **핵심 아이디어** | 자산가격이 이동평균 위면 롱, 아래면 숏. 다수 자산군에 분산 |
| **별명** | "Crisis Alpha" — 주식 급락 시 양의 수익을 내는 유일한 전략 |

## 전략 로직

### 기본 원리
```
IF 가격 > N일 이동평균 → 롱 (매수)
IF 가격 < N일 이동평균 → 숏 (매도) 또는 현금
```

### 자산군 분산
| 자산군 | 대표 시장 | 역할 |
|--------|----------|------|
| 주식 | S&P 500, NASDAQ, EURO STOXX | 성장 추세 포착 |
| 채권 | 미국/독일/일본 국채 | 금리 추세 포착 |
| 통화 | EUR/USD, JPY/USD 등 | 매크로 추세 포착 |
| 원자재 | 원유, 금, 곡물 | 인플레/공급 충격 포착 |

### 시간대 선택 (논문 핵심 발견)
- **시간대 선택이 방법론보다 중요**
- 단기 (20일 MA): 빠른 반응, 높은 거래 비용, 횡보장 whipsaw
- 중기 (50-100일 MA): 균형잡힌 선택
- 장기 (200일 MA): 큰 추세만 포착, 지연 진입
- 최적: 여러 시간대의 **앙상블** (AQR 방식)

## 2024-2025 성과

### AQR (업계 최고 성과)
| 기간 | 수익률 |
|------|--------|
| 2024년 | +11% (Full Vol), Helix +18% |
| H1 2025 | +5.5% (Full Vol), Helix +7.4% |

### 업계 전체 (부진)
| 기간 | 수익률 |
|------|--------|
| H1 2025 SocGen CTA Index | -7.5% |
| H1 2025 SG Trend Index | -10% |

- AQR이 업계 평균을 크게 상회 → 구현 품질이 핵심
- 2025년 트렌드 팔로잉 부진 원인: 미국 관세 정책 on/off로 추세 형성 불가

### Man Group 분석 (2025.4)
- 12개월 롤링 수익률: **-18.6%** (2000년 이후 두 번째 최악)
- 그러나 역사적으로 비슷한 drawdown 후 평균 12개월 수익률: **+9.8%**
- 샤프 0.5, 변동성 10% 전략의 경우 25년 내 -20% drawdown 확률: **~80%**

## Crisis Alpha — 왜 포트폴리오에 필요한가

### 구조적 강점
- 주식 급락 시 **역상관** 수익: 숏 포지션 + 채권 롱 = 위기 시 양의 수익
- **볼록한(convex) 수익 프로필**: 손실은 제한, 이익은 무제한 확장 가능
- 주식과의 장기 상관관계: **~0** (진정한 분산 효과)

### 트렌드 팔로잉의 보호 메커니즘
- **첫 충격에는 취약**: 추세 확인 시간 필요 (1-3개월 지연)
- **지속되는 하락에서 보호**: 2008년, 2022년 등 장기 하락장에서 진가 발휘
- "최고의 보호는 첫 번째 펀치 이후에 온다" (Return Stacked)

## 한계점

1. **횡보장 취약**: 추세 없는 시장에서 반복 손절 (whipsaw)
2. **정책 급변 취약**: 2025년 관세 on/off처럼 추세가 형성되기 전에 반전
3. **구현 난이도**: 선물 거래, 레버리지, 다수 시장 접근 필요
4. **개인 투자자 접근성**: 직접 구현 어려움. ETF(DBMF, CTA, KMLM) 또는 펀드 필요
5. **장기 인내 필수**: 1-2년 손실 후 회복이 일반적 패턴

## 개인 투자자 접근 방법

| 방법 | 대표 상품 | 비용 |
|------|----------|------|
| 매니지드 퓨처스 ETF | DBMF, CTA, KMLM | 0.85-0.90% |
| 간소화 DIY | 주요 자산 3-5개에 SMA 200 필터 적용 | 직접 거래 |
| 포트폴리오 오버레이 | 주식 포트 + 트렌드 ETF 10-20% 배합 | 혼합 |

## 구현 계획

- [ ] 파이프라인: `generate_trend_signal.mjs` (주요 자산군 SMA 기반 신호)
- [ ] 데이터: `data/summary/trend/trend_signal.json`
- [ ] 프론트엔드: 자산군별 추세 방향 + 포지션 맵
- [ ] 특이사항: 롱/숏 개념 → 기존 BAA의 공격/방어와 다른 UI 필요

## 참고 자료

- [Trend Following Strategies: A Practical Guide (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5140633)
- [Man Group — Is This Time Different?](https://www.man.com/insights/is-this-time-different)
- [AQR — Understanding Managed Futures](https://www.aqr.com/-/media/AQR/Documents/Insights/White-Papers/Understanding-Managed-Futures.pdf)
- [AQR H1 2025 Performance — Hedgeweek](https://www.hedgeweek.com/aqr-outpaces-trend-following-peers-with-double-digit-h1-gains/)
- [Return Stacked — Trend Following Through Turmoil](https://www.returnstacked.com/trend-following-through-turmoil-why-the-best-protection-comes-after-the-first-punch/)
