# FAQ — /faq

## 모바일 기준 디바이스

iPhone SE (375×667) 기준으로 디자인한다. 이 화면에서 잘리거나 깨지면 안 된다.

## 폰트 크기 원칙

- **모바일 최소 폰트: 15px**. 모든 텍스트는 모바일(375px)에서 15px 이상이어야 한다.
- **PC 최소 폰트: 18px**. 모든 텍스트는 PC(769px 이상)에서 18px 이상이어야 한다. PC 화면은 넓어서 여백이 많고 글씨가 상대적으로 작아 보인다.
- **구현**: `clamp(모바일px, calc(기준px + Xvw), PC_px)` 패턴 사용. `calc()`로 선형 보간하여 모바일~PC 전 구간에서 부드럽게 스케일링.
- **계산 공식**:
  - `vw계수 = (PC_px - 모바일px) / (maxViewport - minViewport) × 100`
  - `기준px = 모바일px - (vw계수 / 100 × minViewport)`
  - 기본 뷰포트: minViewport = 375px (iPhone SE), maxViewport = 1440px
- **예시**: `clamp(15px, calc(12.4px + 0.7vw), 18px)` — 375px→15px, 1440px→18px 선형 보간.
- **왜 calc()가 필요한가**: `clamp(15px, 1.8vw, 18px)` 처럼 vw만 쓰면 375px에서 1.8vw=6.75px → min 15px 고정. 834px까지 스케일링이 시작되지 않아 fluid 효과 없음.
- **숫자/데이터**: 강조 숫자는 PC 기준 30px 이상.
- 항상 PC·모바일(iPhone SE) 양쪽에서 최종 확인할 것.

---

## 역할

앗추의 핵심 전략과 직접 관련된 질문·답변. 서비스 핵심 로직에 대한 설명. 중요도가 높은 칼럼이라고 봐도 된다.

---

## 이 페이지에 오는 사람

**유입 경로:**
- 랜딩/추세 조회 등 기본 페이지에서 심화 링크 클릭
- 핵심 가치 테이블의 심화 칼럼 링크 직접 클릭
- SEO (앗추 전략 관련 검색)

**방문 목적:**
- "이 서비스가 뭔지, 전략이 맞는지" 확인하러 온 사람
- "앗추 필터가 진짜 효과 있나?" 검증하러 온 사람

**관련 페르소나:**
- 기준 없는 매매자 — 앗추 필터가 자기 문제를 해결해주는지 확인
- 근거 요구자 — 전략의 근거를 직접 확인하고 싶음
- 퀀트 입문자 — 200일선 매매의 원리를 이해하고 싶음
- MDD 경시자 — MDD가 왜 중요한지, 수익률만 보면 안 되는 이유

> FAQ는 초보자~중급자 모두 타겟.

---

## 이 페이지에서 보여줄 것

- 앗추 필터란? 왜 200일선인가?
- 하락장에서는 어떻게 되나?
- Buy & Hold 대비 장점은?
- 개별주에도 적용되나?
- MDD가 왜 중요한가? (수익률 vs 리스크 조정 수익)

**핵심 오해 포인트 → FAQ 매핑:**

| 오해 | 커버 FAQ |
|------|----------|
| 추세 좋을 때 진입하면 안전하다 | `/atchu_strategy` |
| 200일선 돌파 = 수익 확정 | `/atchu_strategy` |
| 추세추종이 Buy & Hold보다 수익률 높다 | `/why_mdd_matters` |
| 개별주에도 똑같이 통한다 | `/individual_stock_ma200` |

---

## 다음 행동 유도

**메인 CTA:** Discord 가입 (각 FAQ 하단 "추세 알림 받기")
**보조 CTA:** 관련 칼럼 교차 추천 (`ColumnBackLink`)

---

## 현재 구현 상태

- FAQ 10개 완료

**관련 컴포넌트:** `FaqPage`, `components/column/` (25개 UI 컴포넌트)

---

## FAQ 데이터 관리

FAQ 항목의 제목·설명은 **`config/faqItems.js`** 에서 단일 관리한다 (Single Source of Truth).

- `FaqPage.jsx` 목록 → `FAQ_ITEMS` 배열에서 `label`, `description` 사용
- 각 FAQ 페이지의 `ColumnHero` → `getFaqMeta(path)`로 `label`, `heroDesc` 참조
- **제목을 바꾸면 목록과 페이지가 동시에 바뀐다.** 두 곳을 따로 수정할 필요 없음.

```
config/faqItems.js        ← 단일 원천
  ├── FaqPage.jsx         ← label, description 사용
  └── 각 FAQ 페이지       ← getFaqMeta(path) → label, heroDesc 사용
```

---

## FAQ 9개 항목 일람

> 아래 목록은 참고용. 실제 데이터는 `config/faqItems.js`가 원천.

| # | 제목 | 경로 | 파일 |
|---|------|------|------|
| 1 | 앗추 필터가 무엇인가요? | `/atchu_strategy` | AtchuStrategyPage.jsx |
| 2 | 왜 하필 200일선인가? | `/moving_average_history` | MovingAverageHistoryPage.jsx |
| 3 | 이동평균선, 그래서 뭔데? | `/what_is_moving_average` | WhatIsMovingAveragePage.jsx |
| 4 | 앗추 필터, 근거가 있는 것인가요? | `/moving_average_faq` | MovingAverageFaqPage.jsx |
| 5 | 앗추 필터, 개별주에도 사용해도 되나요? | `/individual_stock_ma200` | IndividualStockMa200Page.jsx |
| 6 | 앗추 필터 이미 통과했는데, 중간에 올라타도 될까요? | `/atchu_filter_sell_criteria` | AtchuFilterSellCriteriaPage.jsx |
| 7 | 하락 뉴스가 나왔는데, 앗추 필터는 괜찮다고 합니다 | `/holding_conviction` | HoldingConvictionPage.jsx |
| 8 | 앗추 필터도 만능은 아닙니다 | `/spy_qqq_decline_rotation` | SpyQqqDeclineRotationPage.jsx |
| 9 | 수익률이 높아도 비중이 작으면 의미 없습니다 | `/why_mdd_matters` | WhyMddMattersPage.jsx |
| 10 | 아직 벌어야 할 돈이 많은데, MDD는 조금 덜 봐도 되나요? | `/can_you_handle_mdd` | CanYouHandleMddPage.jsx |
