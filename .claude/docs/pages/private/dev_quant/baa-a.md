# BAA-A (Aggressive) — `/_quant/baa-a`

> 상위 문서: [퀀트 허브 index.md](index.md)
> 관련: [BAA-B (Balanced)](baa-b.md)

## 전략 요약

BAA(Bold Asset Allocation)는 Wouter Keller가 2022년 발표한 전술적 자산배분 전략.
**Aggressive** 변형은 공격 모드에서 G4 유니버스 top 1에 100% 집중 투자한다.

### 포트폴리오 규칙

- **공격 모드**: G4 유니버스(SPY, QQQ, EFA, AGG) 중 상대 모멘텀 1위 → 100% 배분
- **방어 모드**: 방어 유니버스 top 3 → 각 33.3% (BIL 대체 적용)

### 성과 (백테스트)

- CAGR: ~9.7%
- MDD: ~-13.6%
- 집중 투자로 변동성이 크지만 수익률도 높음

---

## 페이지 구조

| 순서 | 섹션 | 답하는 질문 |
|------|------|------------|
| 0 | ← 퀀트 엿보기 | 네비게이션 |
| 1 | 수익률 요약 | "최근 성과는?" (1Y, 6M, 3M, 1M, MTD) |
| 2 | 현재 신호 | "공격인가 방어인가?" |
| 3 | 이번 달 포트폴리오 | "뭘 사야 하나?" |
| 4 | 카나리아 모멘텀 | "왜 이 모드인가?" |
| 5 | 유니버스별 모멘텀 순위 | "각 자산의 강약은?" |
| 6 | 백테스트 성과 | "이 전략이 얼마나 좋은가?" |
| 7 | 리밸런싱 히스토리 | "과거에 어떻게 배분했나?" |

---

## 수익률 표시

허브 카드와 상세 페이지 모두에 표시. 순수 USD 기준 (환율 반영 없음).

| 기간 | 계산 방법 |
|------|----------|
| 1Y | `equityCurve` 현재 / 12개월 전 - 1 |
| 6M | `equityCurve` 현재 / 6개월 전 - 1 |
| 3M | `equityCurve` 현재 / 3개월 전 - 1 |
| 1M | `equityCurve` 현재 / 1개월 전 - 1 |
| MTD | 파이프라인에서 별도 계산 (일별 데이터 필요, 추후 추가) |

equity curve 키: `aggressive`

---

## 데이터 출처

`baa_signal.json`의 `backtest.equityCurve[]` 배열에서 `aggressive` 값 사용.

```json
{ "date": "2026-02-27", "aggressive": 5.189, "balanced": 4.301, "spy": 6.793, "sixtyForty": 4.084 }
```

---

## 컴포넌트

기존 `BaaQuantPeekPage`를 `variant="aggressive"` prop으로 호출. 공유 섹션(카나리아, 순위)은 동일하게 표시하되, 포트폴리오·수익률·히스토리는 Aggressive만 표시.

---

**참고 논문:** [Keller, W.J. (2022). Bold Asset Allocation (BAA)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4166845)
