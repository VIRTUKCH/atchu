# 작업 기록

### 2026-03-24 (80)
- **퀀트 허브: HAA (Hybrid Asset Allocation) 전략 구현**
  - Wouter Keller(2023) 논문 기반. TIP 단일 카나리아 + 균등 평균 모멘텀 + top 4 분산
  - 파이프라인: `generate_haa_signal.mjs` — 신호 생성, 백테스트 (CAGR 9.77%, MDD -9.76%, 샤프 1.128)
  - 프론트엔드: `HaaQuantPeekPage.jsx`, `HaaEquityCurveChart.jsx`, `haaDataLoaders.js`
  - 허브 통합: `QuantHubPage.jsx`에 `getCardDataFromPayload` 공통 함수 도입, HAA 카드 활성화
  - 라우트: `/_dev_quant/haa`
  - 데이터: `data/tickers/haa.json`, `data/summary/haa/haa_signal.json`
  - 기획 문서: `dev_quant_haa.md` 상세화 (JSON 스키마, 페이지 구조, 컴포넌트 매핑)

### 2026-03-24 (79)
- **퀀트 허브: Faber 섹터 모멘텀 전략 구현**
  - 전략: 3개월 ROC 상위 3 섹터 동일비중 + SPY 10개월 SMA 트렌드 필터
  - 파이프라인: `generate_faber_signal.mjs` → `data/summary/faber/faber_signal.json`
  - 페이지: `FaberSectorPage.jsx` — 수익률, 트렌드 필터, 포트폴리오, 11개 섹터 순위, 백테스트 차트, 36개월 히스토리
  - 차트: `FaberEquityCurveChart.jsx` — SVG 3선 (Faber/SPY/60-40)
  - 데이터: `faberDataLoaders.js` (import.meta.glob eager)
  - 설정: `quantItems.js` status → active, `AppRoutes.jsx` 라우트, `QuantHubPage.jsx` 카드 연동
  - 파이프라인: `pipeline.sh` — HAA 다음에 Faber 신호 생성 추가
  - 티커: XLRE(2015~) → VNQ(2004~) 대체 (동일 부동산 섹터, 백테스트 10년+ 추가)
  - 백테스트 결과: CAGR 11.54%, MDD -15.96%, Sharpe 0.894 (2019-03~2026-02)

### 2026-03-24 (78)
- **퀀트 허브: 리서치 기반 4개 전략 카드 추가 (coming_soon)**
  - 웹 리서치: 2024-2025 퀀트 투자 전략 트렌드, 학술 논문, 업계 성과 종합 조사
  - 신규 전략 4개: HAA(Keller 후속작), 리스크 패리티/All Weather(Dalio), 트렌드 팔로잉/CTA(crisis alpha), 멀티팩터 QVM(AQR)
  - `quantItems.js`: 5개 → 9개 전략 (HAA는 BAA 바로 뒤 배치)
  - 기획 문서 생성: `dev_quant_haa.md`, `dev_quant_risk_parity.md`, `dev_quant_trend_following.md`, `dev_quant_multi_factor.md`
  - `dev_quant_index.md`: 전략 목록·라우트 맵 동기화

### 2026-03-24 (77)
- **퀀트 허브: 섹터 로테이션 3대 전략 카드 추가 (coming_soon)**
  - 리서치: 월가 대표 섹터 추세추종 전략 3가지 선정 — Faber 섹터 모멘텀, 듀얼 모멘텀(Antonacci), 경기순환 섹터 로테이션(Stovall)
  - `quantItems.js`: 기존 "섹터 로테이션" 1개 → 3개 전략으로 교체 (모두 coming_soon)
  - 기획 문서 생성: `dev_quant_faber_sector.md`, `dev_quant_dual_momentum.md`, `dev_quant_business_cycle.md`
  - `dev_quant_index.md`: 전략 목록, 라우트 맵, 신호 뱃지 테이블, 코드 블록 동기화

### 2026-03-23 (76)
- **MA100 제거 & 정배열→골든크로스 전환 (파이프라인+프론트+문서)**
  - 배경: 정배열(price>MA50>MA100>MA200) 전략이 501개 개별주 중 96%에서 매수후보유보다 CAGR 열세, 연 5회 휩소. MA100은 가치 없음. 순수 골든크로스(MA50>MA200)가 CAGR 8.62%, 연 0.8회로 우수
  - 파이프라인: generate_stock_snapshot.mjs, generate_summary_snapshot.mjs — MA100 계산 제거, CROSSING_STRATEGIES에서 full_align/atchu_full_align→golden_cross, maAlignment full/partial/reverse→golden/dead
  - 분석: analyze_ma_alignment.mjs — strategyGoldenCross로 대체, 전략 6개→4개
  - 프론트 유틸: csvAnalytics.js(MA100 제거, 골든크로스 신호), stockDataLoaders.js/appDataAdapters.js(MA100 필드 삭제), tickerMeta.js(라벨 매핑)
  - 컴포넌트: PriceTrendChart(차트 3선→2선), EtfSummaryCard(배지 골든크로스/데드크로스 (N일)), EtfSummaryMovingAverages, AdvancedMetricsCard
  - 페이지: StockListPage(정렬 11개→8개), StockDetailPage(탭 4개→3개), IndexEtfDetailPage(주석)
  - CSS: base.css(MA100 스타일 삭제), index-etf.css(golden/dead 색상)
  - 문서: dev_trend_list.md, dev_trend_detail.md, dev_market_overview.md, CLAUDE.md

### 2026-03-23 (75)
- **공개 ETF 상세 페이지 전략 필터링 + 문서 동기화**
  - `IndexEtfDetailPage.jsx`: crossingHistory.periods에서 정배열/앗추+정배열 필터링 (공개 페이지에는 200일선·앗추 필터만 표시)
  - `data_pipeline.md`: ETF 스냅샷 계산 내용에 MA50/100, maAlignment, 4개 전략 문서화
  - `trend_detail.md`: 공개 페이지 전략 표시 범위 명시 (정배열은 개발자 전용)

### 2026-03-23 (74)
- **/_stocks 페이지 통합 리스트 (개별주 + ETF)**
  - ETF 파이프라인 확장: `generate_summary_snapshot.mjs`에 MA50/100, 정배열, full_align/atchu_full_align 전략 추가
  - ETF 데이터 로더 확장: `appDataAdapters.js` toRecentShape에 fifty_day, ma_alignment 추가
  - `StockListPage.jsx` 전면 리라이트 — 588개 통합 리스트, 최상위 필터(전체/개별주/ETF) + 하위 필터(섹터or자산군)
  - ETF 카드 클릭 → 기존 `/index_etf/:ticker` 상세 (별도 개발자 상세 불필요)
  - `/_etf/:ticker` 라우트 삭제, 탭 바 CSS 삭제

### 2026-03-23 (73)
- **기획: /_stocks 페이지에 ETF 탭 추가**
  - `dev_trend_list.md` 재작성 — 개별주/ETF 탭 분리 구조, URL 설계(`tab=etf&type=채권`), 양 탭 공통 정렬 옵션
  - ETF 85개 전체 포함 (레버리지/인버스 포함), TypeFilter 재사용
  - ETF 카드 클릭 → `/_etf/:ticker` (개발자 전용 신규 상세 페이지, 구체 설계는 별도 기획)
  - ETF 파이프라인 확장 필요 명시 (MA50/100, maAlignment, 정배열/앗추+정배열 전략)

### 2026-03-23 (72)
- **퀀트 엿보기 v2: 백테스트 성과 요약 + 월별 히스토리**
  - `generate_baa_signal.mjs`에 백테스트 로직 추가 — 과거 전체 기간 BAA 신호/수익률 계산
  - CAGR, MDD, 샤프비율, 최대 연손실 + SPY B&H/60-40 벤치마크 비교
  - 누적 수익률 곡선 차트 (`BaaEquityCurveChart` SVG 컴포넌트)
  - 최근 36개월 리밸런싱 히스토리 (ColumnTimeline 재사용)
  - `BaaQuantPeekPage`에 섹션 5(성과 요약) + 섹션 6(히스토리) 추가

### 2026-03-23 (71)
- **다중 이평선 정배열 기능 — 개별주 페이지**
  - 백테스트 분석 스크립트 `analyze_ma_alignment.mjs` 신규 (6전략 비교, t-test, 섹터별 분석)
  - 파이프라인: `generate_stock_snapshot.mjs`에 MA50/MA100 + `maAlignment` 필드 추가
  - 차트: `PriceTrendChart`에 MA50(초록)/MA100(노랑)/MA200(주황) 3개 이평선 표시
  - 카드: `EtfSummaryCard`에 정배열/부분 정배열/역배열 배지 추가
  - `csvAnalytics.js`: PERIODS [200] → [50,100,200], chartItems에 ma50/ma100 포함
  - 백테스트 결과: 완전 정배열 샤프비율 1.41 (매수후보유 0.45의 3배), t-test p < 0.0001

### 2026-03-23 (70)
- **퀀트 엿보기 페이지 v1 구현 (`/_dev_quant`)**
  - BAA(Bold Asset Allocation) 전략 신호/포트폴리오/모멘텀 순위를 보여주는 개발자 전용 비공개 페이지
  - 데이터 파이프라인: `generate_baa_signal.mjs` — CSV에서 13612W 모멘텀, SMA13 상대 모멘텀 계산 → `baa_signal.json` 출력
  - `baa.json` 신규 티커 4종 (EEM, EFA, AGG, BIL) — `hidden: true`로 공개 페이지 미노출
  - `tickerMeta.js`에 `hidden` 플래그 필터링 추가
  - `pipeline.sh`에 BAA 신호 생성 단계 추가
  - 프론트엔드: `BaaQuantPeekPage`, `BaaSignalBadge`, `BaaPortfolioTab` + column 컴포넌트 재사용
  - `AppRoutes.jsx`에 `/_dev_quant` 라우트, `DevPage.jsx`에 허브 링크 추가

### 2026-03-23 (69)
- **퀀트 엿보기 페이지 기획 문서 작성 (`/_dev_quant`)**
  - BAA(Bold Asset Allocation) 전략 결과를 확인하는 개발자 전용 비공개 페이지 기획
  - `.claude/docs/pages/private/dev_quant/` 디렉터리 신규 생성 (index.md, baa.md, sector.md)
  - v1 범위: 섹션 4개 (현재 신호 + 포트폴리오 배분 + 카나리아 모멘텀 + 유니버스별 순위)
  - baa_signal.json 스키마 설계, baa.json 티커 파일 구조 설계 (EEM, EFA, AGG, BIL 신규 4종)
  - 기존 column 컴포넌트 8개 재사용, 신규 컴포넌트 2개(BaaSignalBadge, BaaPortfolioTab)

### 2026-03-18 (68)
- **섹터별 추세 강도 가독성 개선 + 평균 이격률 표시**
  - 서브섹터 다크모드 글자색을 더 밝고 선명하게 변경
  - 각 서브섹터에 200일선 대비 평균 이격률(%) 표시 (초록/빨강)
  - StockOverviewPage에서 percentDiff200 섹터/서브섹터별 집계 로직 추가
  - dev_market_overview.md 문서에 서브섹터 표시 항목·다크모드 가독성 규칙 추가

### 2026-03-18 (67)
- **개별주 503종목 한국어 한 줄 설명 추가**
  - sp500.json에 `short_description` 필드 추가
  - 주요 종목(~250개) 개별 작성, 나머지는 GICS Sub-Industry 기반 자동 생성
  - EtfSummaryCard의 "간단한 설명" 영역에 표시

### 2026-03-18 (66)
- **GICS 11개 섹터 + 46개 서브섹터 구조 도입**
  - 반도체 → 기술의 서브섹터, 바이오텍 → 헬스케어의 서브섹터로 통합
  - sp500.json: 503종목 전체에 `subType` 필드 추가 (industry → subType 매핑)
  - 섹터 추세 강도 카드: 서브섹터별 미니 바 표시 (MainMarketStatusGrid)
  - 히트맵: 섹터 내 서브섹터별 소제목 구분 (StockHeatmap)
  - 리스트 페이지: 섹터 선택 시 서브섹터 필터 칩 추가 (StockListPage)
  - SECTOR_ORDER 13개 → 11개로 정리 (GICS 원본)
  - dev_market_overview.md 기획 문서 전면 개편

### 2026-03-18 (65)
- **개별주(S&P 500) 추세추종 기능 추가 — 개발자 전용 비공개**
  - 데이터 파이프라인: `pipeline_stock.sh`, `generate_stock_snapshot.mjs` — 503종목 CSV 다운로드 + 스냅샷/추세 알림 생성
  - `pipeline.sh`에서 ETF 처리 후 자동 호출 (같은 cron)
  - 프론트엔드: `/_stocks` (리스트), `/_stocks/:ticker` (상세) — PasswordGate 보호
  - CSV on-demand fetch (public/csv_stock/ 정적 에셋) — 빌드 메모리 영향 없음
  - EtfSummaryCard 재사용, 섹터별 필터/검색/정렬 지원
  - Discord 알림은 기존 관리자 채널 사용 (`[개별주]` 접두어)
  - `sp500.json`: GitHub datasets에서 자동 생성 (fetch_sp500_tickers.mjs)
  - CLAUDE.md에 개발자 전용 페이지 문서화
- **개별주 시장 개요 페이지 추가 (/_stocks_overview)**
  - S&P 500 시장 폭 요약 (앗추 필터 통과 비율)
  - 최근 5거래일 진입/이탈 신호
  - 섹터별 추세 강도 (MainMarketStatusGrid 재사용)
  - S&P 500 히트맵 (MarketHeatmap 재사용, baseLinkPath prop 추가)

### 2026-03-17 (64)
- **히트맵 타일: 앗추 필터 비율(X/20) 표시 추가**
  - N일째 옆에 (X/20) 형태로 최근 20일 중 200일선 위 일수 표시
  - snapshot의 기존 `aboveDays200` 필드 활용
  - market_overview.md 기획 문서 반영

### 2026-03-16 (63)
- **FAQ 페이지 README 정합성 검토 및 갭 해소**
  - 신규 FAQ #11: "수익률이 높으면 된 거 아닌가요?" (`/why_mdd_matters`) — MDD 중요성 + B&H vs 추세추종 소르티노 비교
  - #9 보강: "현금도 포지션이다" 섹션 추가 (시장 회피자 페르소나 커버)
  - #7 톤 개선: 방어적 → 긍정적 ("하나의 기준에 집중하면 판단이 명확해진다")
  - faq.md 정리: 임시 분석 섹션 제거, 오해 매핑 `/information_paradox` 행 삭제, 11개 항목 일람 최신화

### 2026-03-16 (62)
- **추세 조회 카드에 MDD·데이터 시작일 추가**
  - 스냅샷 파이프라인: `computeStrategyMetrics`로 전략별 MDD 계산, `dataStartDate` 추출
  - 카드 오른쪽 전략 데이터에 앗추 필터 MDD, 데이터 시작년도 표시
  - 정렬 옵션 4→6개 확장: MDD 낮은순, 데이터 오래된순 추가
  - 정렬 라벨 직관화: 분류별, 이격률 높은순/낮은순, 수익률 높은순
  - README, trend_list.md 기획서 반영

### 2026-03-16 (60)
- **전략 비교 카드 분리**: `StrategyComparisonCard` 신규 컴포넌트
  - 기존 `TrendCrossingHistoryCard` 내 비교 영역을 독립 카드로 분리
  - 매수후보유 vs 200일선 vs 앗추 필터 성과 비교 (CAGR, MDD, 매매 빈도, MDD 갱신일)
  - `TrendCrossingHistoryCard`는 순수 돌파 이력 테이블만 담당
  - 미사용 comparison CSS 제거

### 2026-03-16 (59)
- **Discord 알림 기획서 작성**: `.claude/docs/pages/discord_alert.md` 신규 생성 (README에서 참조하던 빈 파일)
- **돌파 이력 비교 영역 개선**:
  - "평균 수익률" → "누적 수익률" 라벨 수정 (실제 계산은 복리 누적)
  - 비교 영역 레이아웃을 가로 늘어짐에서 카드형 세로 배치로 변경
  - 매매 빈도(연 N회) 추가 표시
  - MDD 갱신일 추가 표시

### 2026-03-16 (58)
- **랜딩 페이지 카피/UI 개선**: 전체 섹션 문구 다듬기 + 백테스트 비교 카드형 전환
  - 해결책 섹션: 부제 "투자 전문가라면 기본적으로 사용하는 매매 기준입니다"
  - 전환 문구: "최근 몇 년만 잘된 거 아냐? / SPY만 결과가 좋은 거 아니야?"
  - 신뢰 섹션: 타이틀 "직접 확인해 보셔도 좋습니다"
  - 신뢰 카드: 인물 이름 먼저(크게) + 한국어 인용 + 영어 원문 작게
  - "200일선 매매는 앗추만의 주장이 아닙니다" 별도 강조 박스 분리
  - 앗추 필터 섹션: "200일선 대신 앗추 필터로 매매했다면?" 질문 추가
  - 백테스트 비교: 테이블 → 2x2 카드형 (3x4 단일 그리드), MDD 컬럼 추가
  - 문제 섹션 결론 문구 폰트 확대 (18px → 26px)
  - 테이블 관련 미사용 CSS 정리
- **시장 개요**: 레버리지·인버스 섹션 기본 펼침으로 변경
- **기획 문서 업데이트**: landing.md, market_overview.md (Discord 연계 플로우 추가)

### 2026-03-16 (57)
- **추세 상세 페이지 정보 정리**: README 기준 검토 후 불필요 섹션 제거
  - AssetProfileCard 제거 (사용자 핵심 질문 4가지에 매핑 안 됨)
  - TrendFollowingGuide 제거 (README §5 "과한 정보는 이탈시킨다" 원칙 충돌)
  - trend_detail.md 기획서에서 해당 섹션 및 타이포그래피 테이블 제거
  - 추세 상세/성과 분석 접힘(CollapsibleSection) 제거, 항상 펼침으로 변경
  - EtfDetailHero + TrendStatusBanner → EtfSummaryCard 재사용 (리스트 카드와 동일 UI)
  - EtfSummaryCard에 `to` 미전달 시 Link 대신 div로 렌더링하도록 수정

### 2026-03-15 (56)
- **market_overview.md 재구성**: README 관점으로 전수 검토 후 4가지 수정
  - 시장 온도 섹션 제거 (추세 강도가 상위호환, 앗추 메시지 "어디가 살아있는가"와 불일치)
  - 추세 강도 → 첫 섹션으로 승격, 지표를 "200일선 위 비율" → "앗추 필터 통과 비율"로 변경 (README 5-4 정합)
  - 시장 회피자 페르소나 추가 ("어디도 안 살아있다"도 이 페이지의 역할)
  - "초보자가 이해할 수 있어야 한다" UX 원칙 명시 (README 섹션 5 서두)

### 2026-03-15 (55)
- **타입 분류 체계 재설계**: 47개 소분류 → 10개 대분류
  - JSON 파일 18개 → 10개 통합 (style.json, trading.json 신규, 10개 삭제)
  - 필터 UI: PRIMARY_TYPES/더보기 제거, 10개 대분류 버튼 전체 표시
  - 프론트엔드 전반 group 기준 필터링/정렬로 전환
  - 카드에는 소분류(성장, 반도체, 인도 등) 표시 유지

### 2026-03-15 (54)
- **시장 개요 페이지 개선**: market_overview.md 스펙에 맞춰 구현 보완
  - 기간별 비교 탭 신규 구현 (이격률/일간/주간/1개월/3개월/1년/5년)
  - 기간별 모드: 초록(상승)/빨강(하락) 색상, 수익률순 정렬, 상승/하락 카운트 요약
  - 스타일 타입 평균도 기간별 수치로 전환
  - 코드·문서 내 "종목"→"ETF" 용어 통일
  - 페르소나명 "횡보장 방황자"→"시장 흐름 미파악자" (README 기준 정렬)

### 2026-02-27 (53)
- **README.md 5단계 기획 흐름으로 재편**: 사용자 제안 구조(이게 뭔데? → 누구한테 파는데? → 왜 써야 하는데? → 어떻게 설득하는데? → 구체적으로 뭘 만드는데?)로 전체 재배치
  - §1 서비스 정의: 사용자 직접 작성 예정 (placeholder)
  - §2 페르소나: 기존 §2 + 타겟 스펙트럼 테이블 합침
  - §3 가치 제안: 기존 §1 + "왜 200일선인가" + "왜 데이터 기반인가" 흡수
  - §4 설득 방법: 기존 §3 + "왜 앗추 필터인가 (심화)" 흡수
  - §5 기능: UX 원칙·사용자 여정 한줄 흡수 + 핵심기능 5개
  - "전략적 배경" 독립 섹션 해체 (§3, §4로 분산), "UX 원칙"·"사용자 여정" 독립 섹션 삭제
  - 하단 부록: 기술/제약조건/현재상태 유지

### 2026-02-26 (52)
- **README.md 전체 리라이트**: 사용자가 직접 쓴 내용(페르소나, 타겟 스펙트럼, 200일선/앗추 필터 전략)만 남기고 이전 Claude 세션이 생성한 섹션 제거
  - 신규 추가: `검증해야 할 핵심 가설` 섹션 (욕구/해결책/채널/리텐션)
  - 유지: 핵심 고객, 사용자 여정, 전략적 배경, 제약 조건, 현재 상태
  - 복원: UX 원칙(과한 정보는 이탈시킨다), 데이터 신뢰 + 칼럼 전략
  - 제거: UX 설계 원칙 테이블, 핵심 가치, 포지셔닝, 경쟁 분석, 신뢰 섹션, 성공 지표, Out of Scope, 수익화 전략, P0/P1 액션, 기술 상세(data_pipeline.md와 중복)
  - 핵심 기능은 2~3줄 요약 + pages/*.md 참조 링크로 축약

### 2026-02-26 (51)
- **새 칼럼: "미국 경제를 움직이는 5개의 톱니바퀴 — 연준·재무부·은행·기업·가계"**
  - `UsEconomyPlayersPage.jsx` 신규 생성 (거시경제 카테고리): GDP = C+I+G+NX 케인지안 공식, 5개 행위자 PersonCard (연준·재무부·시중은행·기업·가계), 6단계 자금 순환 StepList, Bernanke & Blinder(AER 1992) 은행 대출 채널·Bernanke & Gertler(NBER 1999) 금융 가속기·Ray Dalio(2013) 경제 기계의 원리 학술 연구 3개, 2020~2024년 사례 타임라인, 5개 지표 모니터링, ColumnMythFact + ColumnWarningCard 마무리
  - `AppRoutes.jsx`: `/us_economy_players` 라우트 추가
  - `InvestorStoriesSection.jsx`: 거시경제 카테고리에 항목 추가

### 2026-02-26 (50)
- **새 칼럼: "금리는 주가의 중력이다 — 버핏이 말한 '중력'의 의미"**
  - `InterestRatePage.jsx` 신규 생성: Warren Buffett "금리는 자산의 중력" 인용, DCF/Gordon Growth Model 할인율 메커니즘, Fed Model, 3가지 경로(할인율·기업이익·대체자산), 버핏·시겔·달리오 ResearchCard 3개, 1970s 스태그플레이션·볼커 쇼크(21.71%)·2022년 Fed 인상(-18.1%) CrisisCard 3개, 금리 수준별 자산 행동 CompareTable, ColumnMythFact × 2, ColumnWarningCard, 추세추종 연결 섹션
  - `AppRoutes.jsx`: `/interest_rate` 라우트 추가 (거시경제 섹션)
  - `InvestorStoriesSection.jsx`: 거시경제 카테고리 마지막 항목으로 추가

### 2026-02-26 (49)
- **새 칼럼: "시장이 무너지기 전에 먼저 무너지는 것들 — 하락장 예측 신호"**
  - `BearMarketSignalsPage.jsx` 신규 생성 (거시경제 카테고리): 웹 검색 32회 기반 포괄적 리서치
  - 7개 카테고리: ①실물 경제(Cass Freight Index·BDI·구리-금 비율) ②금융 시스템(수익률 곡선 역전·고수익채권 스프레드·M2 감소) ③밸류에이션(버핏 지수·CAPE 실러 P/E) ④전설들의 방법론(드러켄밀러·마이클 버리·그랜섬) ⑤센티먼트 역설(마진 부채·AAII·VIX) ⑥경제 선행 지표(Conference Board LEI·샴 룰·ISM PMI 타임라인) ⑦10개 지표 비교 요약표
  - ColumnMythFact + ColumnWarningCard(추세추종 관점 마무리)
  - `AppRoutes.jsx`: `/bear_market_signals` 라우트 추가 (거시경제 섹션)

### 2026-02-26 (48)
- **새 칼럼: "거인들이 바라본 2030: 주식시장 대전환 청사진"**
  - `GiantsPredictionPage.jsx` 신규 생성 (거시경제 카테고리): 일론 머스크 에너지 병목 경고(칩→변압기→전력, xAI 멤피스 1GW), Goldman Sachs 데이터센터 전력 165% 증가 ResearchCard, Ray Dalio 신흥시장 34% 초과수익·60% EM 배치, Jeremy Grantham 밸류에이션 스프레드 8.5%p, Goldman Sachs 2030 신흥시장 35% 비중 전망, 미국 vs 신흥시장 비교표, Morgan Stanley AI $13~16조 가치 추가 분석, Goldman Sachs $19조 선반영 WarningCard, 달리오 빅사이클 Stage 5~6 타임라인, 3대 기관 10년 기대수익률 비교표(Vanguard 2.8~4.8%, Goldman ~6%, JP Morgan 4~5%), ColumnMythFact + ColumnWarningCard + ColumnTipBox로 마무리
  - `AppRoutes.jsx`: `/giants_prediction` 라우트 추가 (거시경제 섹션)
  - `InvestorStoriesSection.jsx`: 거시경제 카테고리에 항목 추가

### 2026-02-26 (47)
- **새 칼럼: "연준 의장 5인이 미국 경제를 결정했다"**
  - `FedChairsPage.jsx` 신규 생성 (거시경제 카테고리): 볼커(금리 21.5%, 인플레 파이터)·그린스펀(마에스트로, 이성적 과열·그린스펀 풋)·버냉키(QE 개척자, 헬리콥터 벤, 노벨상)·옐런(최초 여성 의장, 고용 옹호자)·파월(11회 금리 인상, 공격적 긴축) 5인 타임라인, 레이 달리오·워런 버핏·버냉키(2002) 3개 ResearchCard, 케빈 워시 차기 의장 소개, QT + 금리 인하 동시 시행 FlowCard, Fortune 트릴레마·J.P. Morgan·역사적 선례(2018년 파월 선회) 3개 전문가 카드, ColumnWarningCard + ColumnMythFact로 마무리
  - `AppRoutes.jsx`: `/fed_chairs` 라우트 추가 (거시경제 섹션)
  - `InvestorStoriesSection.jsx`: 거시경제 카테고리에 항목 추가

### 2026-02-26 (46)
- **새 칼럼: "연준이 버튼을 누르면 시장이 반응한다 — 양적완화와 양적긴축"**
  - `QeQtPage.jsx` 신규 생성 (거시경제 카테고리): Ben Bernanke 잭슨홀 연설(2010)·AER(2020), QE1~코로나 QE 4번 타임라인, 포트폴리오 밸런스 효과 4단계 메커니즘, QT1·QT2 역사, QE vs QT 비교표, 레이 달리오·하워드 마크스·제레미 그랜썸 투자자 카드, Tālis Putniņš(Financial Analysts Journal 2020) 학술 연구, ColumnMythFact + ColumnWarningCard로 마무리
  - `AppRoutes.jsx`: `/qe_qt` 라우트 추가 (거시경제 섹션)
  - `InvestorStoriesSection.jsx`: 거시경제 카테고리에 항목 추가

### 2026-02-26 (45)
- **새 칼럼: "CPI가 오르면 주가는 내려간다 — 진실과 오해"**
  - `CpiStockMarketPage.jsx` 신규 생성: Fisher 효과 이론, 4가지 역사적 국면 타임라인(1960년대~2022년), Eugene Fama(1981) · Boudoukh & Richardson(1993) · Jeremy Siegel(1994) 학술 연구 3개, Warren Buffett(1977 Fortune) · Jeremy Siegel 투자자 카드, 인플레이션 수준별 주가 영향 비교표, 할인율 메커니즘 설명, ColumnMythFact + ColumnWarningCard로 마무리
  - `AppRoutes.jsx`: `/cpi_stock_market` 라우트 추가 (거시경제 섹션)

### 2026-02-26 (44)
- **새 칼럼: "인간 지표: 길거리에서 주식 이야기가 들려오면 팔아라?"**
  - `CrowdSignalPage.jsx` 신규 생성: Bernard Baruch 1929년 구두닦이 일화, 1929 대공황 타임라인, 피터 린치 칵테일 파티 4단계 이론, 워런 버핏 역발상 철학, 잡지 표지 역지표(BusinessWeek 1979 + Citigroup 2016 연구), Barber & Odean(2000) · Baker & Wurgler(2006) 학술 근거, ColumnMythFact + ColumnWarningCard + ColumnTipBox로 마무리
  - `AppRoutes.jsx`: `/crowd_signal` 라우트 추가 (투자 심리 섹션)
  - `InvestorStoriesSection.jsx`: 투자 심리 카테고리 첫 번째 항목으로 추가

### 2026-02-26 (43)
- **99_docs/pages/ 신설 — 페이지별 기획 문서 구조 도입**
  - `99_docs/pages/landing.md`: 랜딩 (/) — 타겟 페르소나, 유입 경로, 섹션별 보여줄 것, CTA
  - `99_docs/pages/trend_list.md`: 추세 조회 (/index_etf)
  - `99_docs/pages/trend_detail.md`: 추세 조회 상세 (/index_etf/:ticker)
  - `99_docs/pages/market_overview.md`: 시장 개요 (/market_overview)
  - `99_docs/pages/faq.md`: FAQ (/faq) — 앗추 핵심 전략
  - `99_docs/pages/columns.md`: 칼럼 (/more) — 시장 이해 배경지식
  - `CLAUDE.md`: 디렉터리 구조 + 핵심 규칙에 pages/ 참조 추가
  - `README.md`: 핵심 기능 각 페이지에 `99_docs/pages/` 링크 추가

### 2026-02-26 (42)
- **새 칼럼: "20년에 한 번 오는 거대한 파도 — 슈퍼 사이클"**
  - `SuperCyclePage.jsx` 신규 생성: 역사상 4번의 슈퍼 사이클 타임라인(1906~2014), Jim Rogers·Goldman Sachs Jeff Currie·David Jacks NBER 논문 근거, 슈퍼 사이클별 수혜 섹터·국가 비교표, AI 반도체 슈퍼 사이클과 한국(HBM)·대만(TSMC) 연결, 추세추종 전략 접목
  - `AppRoutes.jsx`: `/super_cycle` 라우트 추가 (거시경제 섹션)
  - `InvestorStoriesSection.jsx`: 거시경제 카테고리에 슈퍼 사이클 항목 추가

### 2026-02-26 (41)
- **README: 2차 피드백 반영 — 성공 지표 벤치마크·수익화 검증 순서**
  - 성공 지표 Phase 1: 보수/중간/낙관 수치 선택 근거 주석 추가 (Mixpanel 2023 B2C 금융 벤치마크)
  - Phase 2 수익화: 가설 A(구독) 우선 검증 → 클릭률 10% 미달 시 B(광고) 전환 순서 명시

### 2026-02-26 (40)
- **README: 기획자 피드백 6가지 반영** — 가치 제안 명확화, 전환 논리 보강, 지표 캘리브레이션, Acquisition 우선순위 조정
  - `README.md` — 핵심 가치 테이블: "고통 | 기능" 2열 → "고통 | 내가 얻는 것 | 앗추의 기능" 3열로 사용자 언어 기준 재작성
  - `README.md` — Out of Scope: 6개 항목 각각에 "왜 현재 버전에서 안 하는가" 이유 추가
  - `README.md` — 포지셔닝: 리딩방→앗추 전환 논리 단락 추가 ("불투명한 추천 vs 투명한 데이터")
  - `README.md` — 성공 지표 Phase 1: 단일 목표 수치 → 보수/중간/낙관 3단계 + 미달 시 대응 액션 테이블
  - `README.md` — Discord 가입 CTA 가치: 즉시/매일/추세 변화 시/독점(웹 전용) 4단계 명시
  - `README.md` — Acquisition P0-A: 텔레그램 P0 지정, SEO/YouTube Shorts P1로 하향 (1인 개발 집중 전략)

### 2026-02-25 (39)
- **새 FAQ 칼럼: "SPY·QQQ가 약할 때, 다른 자산에서 기회를 찾을 수 있을까?"**
  - `SpyQqqDeclineRotationPage.jsx` 신규 생성: O'Neil 3/4 법칙, 2000–2002·2022 실증 사례, Moskowitz & Grinblatt(1999)·Faber(2010)·AQR(2013) 연구, 저명 투자자(오닐·Antonacci·Faber·PTJ) 접근법
  - `FaqPage.jsx`: 새 FAQ 항목 추가 (`/spy_qqq_decline_rotation`)
  - `AppRoutes.jsx`: lazy import + Route 등록
  - `InvestorStoriesSection.jsx`: 전략 심화 카테고리에 칼럼 카드 추가

### 2026-02-25 (38)
- **개별주 앗추 필터 FAQ 2개 → 1개로 병합**: IndividualStockMa200Page + AtchuFilterStockScreenPage 통합
  - `IndividualStockMa200Page.jsx`: 두 페이지 콘텐츠 병합 (학술 논문 4편 + 투자자 4인 + 비교 테이블 통합)
  - `AtchuFilterStockScreenPage.jsx`: 삭제
  - `FaqPage.jsx`: 중복 항목 제거 (atchu_filter_stock_screen)
  - `InvestorStoriesSection.jsx`: 전략 심화에서 individual_stock_ma200으로 교체
  - `AppRoutes.jsx`: AtchuFilterStockScreenPage import + Route 제거

### 2026-02-25 (37)
- **99_docs 기획 문서 일관성 동기화**: README 핵심 고객·핵심 가치 재정의 + 100일선 전면 제거를 99_docs/ 5개 문서에 반영 (총 21건 수정)
  - `planning/discord_notifications.md`: 대상 사용자 정의 갱신, 100일선→200일선, "장기 상승 흐름에 합류"→"추세 진입 감지", "편입"→"진입" 용어 통일
  - `planning/data_strategy.md`: MA100/percentDiff100 참조 제거, Tier 2에서 MA100 행 삭제, 200일선 중심으로 통일
  - `development/data_pipeline.md`: 추세 감지 규칙에서 100일선 제거, JSON 예시 100-16/20 블록 삭제, Discord 메시지 포맷 순화, MarketOverview 100/200 토글→200일선만
  - `law_risk/00_legal_risk_overview.md`: Discord 표현 변경 완료 반영, 개선안 100일→200일
  - `marketing/00_marketing_strategy_overview.md`: 마케팅 표현 규칙 100일→200일

### 2026-02-25 (36)
- **새 FAQ 칼럼: "앗추 필터를 매도 기준으로 써도 될까?"**: 보유 포지션 매도 기준으로서의 앗추 필터 활용
  - `AtchuFilterSellCriteriaPage.jsx`: 학술 논문 4편(Faber 2007, Siegel 2014, Clare et al. 2016, Wilcox 2005/2024) + 투자자 5인(폴 튜더 존스, 에드 세이코타, 스탠 와인스타인, 마틴 츠바이크, 래리 하이트) 인용
  - 개별주·섹터 ETF·국가 ETF에서의 효과 + 선물·레버리지 ETF에서 안 되는 4가지 구조적 이유
  - `AppRoutes.jsx`: `/atchu_filter_sell_criteria` 라우트 추가
  - `FaqPage.jsx`: FAQ 항목 추가
  - `InvestorStoriesSection.jsx`: "전략 심화" 카테고리에 칼럼 등록

### 2026-02-25 (35)
- **레버리지 FAQ → 칼럼 이동**: "추세 추종에 레버리지를 사용하면 안 되나요?" 항목을 FAQ에서 제거하고 칼럼(레버리지 카테고리)으로 이동
  - `FaqPage.jsx`: 레버리지 항목 제거
  - `InvestorStoriesSection.jsx`: 레버리지 카테고리 첫 항목으로 추가
  - `navigation.js`: FAQ_PATHS → COLUMN_PATHS 이동
  - `LeverageFaqPage.jsx`: BackLink를 `/more`로 변경
  - `AppRoutes.jsx`: Route를 레버리지 섹션으로 이동

### 2026-02-25 (34)
- **새 FAQ 컬럼: "상승장에서 뉴스에 흔들리지 않는 법"**: 앗추 필터 이탈 신호 없을 때 보유 확신을 갖는 근거
  - `HoldingConvictionPage.jsx`: 학술 논문 3편(DALBAR QAIB 2025, Barber & Odean 2000, Shefrin & Statman 1985) + 투자자 3인(피터 린치, 워런 버핏, 제시 리버모어) 인용 + J.P. Morgan 데이터
  - 핵심 메시지: 상승장에서 하락 뉴스에 흔들리지 말고, 앗추 필터 신호를 기준으로 판단
  - `FaqPage.jsx`: FAQ 항목 추가 ("너무 정보가 적어요" 뒤)
  - `AppRoutes.jsx`: `/holding_conviction` 라우트 추가

### 2026-02-25 (33)
- **새 칼럼: "앗추 필터로 개별주를 걸러내면 효과가 있을까?"**: FAQ + 칼럼 목록(전략 심화) 등록
  - `AtchuFilterStockScreenPage.jsx`: 학술 논문 3편(Avramov 2021, Zarattini 2024, AQR 2017) + 투자자 4인(폴 튜더 존스, 마크 미너비니, 스탠 와인스타인, 윌리엄 오닐) 인용
  - 앗추 필터(16/20 규칙)를 개별주 종목 스크리너로 활용하는 근거와 한계 분석
  - `AppRoutes.jsx`: `/atchu_filter_stock_screen` 라우트 추가
  - `FaqPage.jsx`: FAQ 항목 추가 ("너무 정보가 적어요" 앞)
  - `InvestorStoriesSection.jsx`: "전략 심화" 카테고리에 칼럼 등록

### 2026-02-25 (32)
- **개발자 전용 숨겨진 페이지 추가**: 비밀 URL (`/_dev`) + SHA-256 비밀번호 게이트로 2중 보호. 네비게이션에 노출되지 않음.
  - `devAuth.js`: Web Crypto API SHA-256 비밀번호 검증 + sessionStorage 세션 관리 (24시간 만료)
  - `PasswordGate.jsx` + `password-gate.css`: 전체 화면 비밀번호 입력 게이트 (다크/라이트 테마 대응)
  - `DevPage.jsx`: 빈 개발자 페이지 (기본 틀, 로그아웃 버튼)
  - `AppRoutes.jsx`: `/_dev` 라우트 추가 (React.lazy 동적 임포트)
  - `pipeline.sh`: 파이프라인 완료 시 관리자 디스코드에 `/_dev` 링크 포함 알림 추가

### 2026-02-24 (31)
- **시장 히트맵 리디자인 — 앗추 필터 중심 UI**: 잦은 매매 지양 철학에 맞게 타일 정보 계층 재편. 단기 등락률 → 보조, MA200 거리 → 주요 숫자. 색상도 연속 그라데이션 → 앗추 상태 3레벨로 교체.
  - **데이터**: `generate_summary_snapshot.mjs`에 `isAtchuQualified200`, `aboveDays200` 추가 (최근 20일 중 200일선 위 일수 ≥ 16일 기준)
  - **`MarketHeatmap.jsx` 전면 개선**:
    - 색상: 빨강/파랑 그라데이션 → 초록(앗추 진입) / 주황(200일 위, 앗추 이탈) / 파랑(200일 아래)
    - 타일 큰 숫자: 기간 등락률 → MA200 거리 (percentDiff200, 항상 고정)
    - 타일 배지: `진입/주의/하락` 상태 배지 추가
    - 타일 보조: 기간 등락률 + 기간 레이블 (기간 탭에 따라 변함)
    - 정렬: 기간 변화율 내림차순 → 앗추 진입 → 주의 → 하락 순, 그룹 내 MA200 거리 내림차순
    - 요약 바: 강자/약자 → 앗추 진입/주의/하락 종목 수 표시
    - 스타일 요약 카드: 타입 내 앗추 진입 비율(≥50%)로 상태 결정
  - **`report.css`**: `.atchu-badge`, `.report-overview-card-sub`, `.report-overview-card-change` 스타일 추가

### 2026-02-24 (30)
- **100일선 전면 제거 — "200일선 + 앗추 필터" 단일 전략으로 통합**: Meb Faber 65년 실증 데이터(Sharpe 0.704 vs 0.471, MDD 50% 감소) 기반으로 200일선이 실증적으로 우수함을 확인. 100일선은 거짓 신호가 많아 앗추 필터 취지(잦은 매매 방지)와 상충. 파이프라인·유틸·컴포넌트·스타일 전계층(15개 파일) 수정.
  - **데이터 파이프라인**: `notify.sh`, `generate_summary_snapshot.mjs`에서 100일 규칙·기간 제거
  - **React 유틸**: `csvAnalytics.js`, `tickerMeta.js`에서 100일 관련 계산·정의 제거
  - **컴포넌트**: `PriceTrendChart`, `TrendSupportCard`, `EtfTrendCards`, `TrendHoldingDaysCard`, `EtfSummaryCard`, `TrendCrossingHistoryCard`에서 100일선 항목 제거
  - **TrendStatusBanner 재설계**: 4레벨(100일/200일 조합) → 3레벨(200일 위치 + 앗추 필터 상태)로 변경
  - **MainMarketStatusGrid**: 100일/200일 토글 버튼 제거, 200일선만 표시
  - **MarketOverviewPage**: `above100` 계산 제거, 툴팁 텍스트 앗추 필터 기반으로 업데이트
  - **CSS**: `.legend-ma100`, `.chart-ma100` 스타일 제거

### 2026-02-24 (29)
- **hold_20of16 판정 O(n) 슬라이딩 윈도우 최적화**: `csvAnalytics.js`의 `isHoldFilterQualified` 및 인라인 20일 루프를 `holdQualifiedCache`로 사전 계산. O(n×20) 반복 루프 6곳 → O(1) 캐시 조회로 개선. AAPL 기준 45ms→27ms (40%↓).

### 2026-02-24 (28)
- **상세 페이지 계산 성능 최적화**: `csvAnalytics.js`의 `averageOf()` 함수를 Prefix Sum(누적합)으로 교체. 이동평균 조회를 O(period) → O(1)로 개선. SPY 기준 ~4천만 번 연산 → ~26만 번으로 약 150배 감소.

### 2026-02-24 (27)
- **프론트엔드 성능 최적화 — 7개 병목 해소**:
  - **Google Fonts 렌더 블로킹 해소**: CSS `@import` → `index.html` `<link>` + `preconnect` 이동 (FCP 200~500ms 개선)
  - **이미지 WebP 변환**: 파비콘 528KB→712B(99.9%↓), OG 썸네일 4.7MB→205KB(96%↓)
  - **Nginx 캐시 헤더 추가**: 해시 에셋 1년 immutable 캐시, 이미지/폰트 30일 캐시, gzip 타입 확장
  - **랜딩 사전 계산 데이터 도입**: CSV 2.2MB + buildCsvAnalytics 5회 → landing_data.json 64KB (LCP 1~3초 단축)
    - `generate_landing_data.mjs` 파이프라인 스크립트 신규 생성
    - LandingRealChart, LandingStockExplore 동기 렌더링으로 전환 (useState/useEffect 제거)
  - **CSS 코드 스플리팅**: 초기 번들에서 ~80KB CSS 제거 (페이지별 lazy import)
  - **IndexEtfPage 메모이제이션**: 필터링+정렬 결과 useMemo 래핑
  - **MarketHeatmap 메모이제이션**: 9개 섹션 정렬 + 통계 계산 useMemo 래핑

### 2026-02-24 (26)
- **골든크로스 칼럼 대폭 확장** (72줄 → ~580줄):
  - SPY 골든크로스/데드크로스 백테스트 차트 추가 (2000년~현재)
  - 백테스트 로직: 50일/200일 SMA 교차 감지, 거래 페어링, CAGR/MDD/승률 계산
  - SVG 차트: 가격선 + 50일선(주황) + 200일선(파랑) + G/D 마커 + 보유 밴드
  - 투자 시뮬레이션 (1000만원 훅) + 거래 내역 테이블
  - 학술 연구 2건 (Faber 2007, S&P DJI 2020) 추가
  - 역사적 사례 타임라인 3개 → 7개 확장 (2001~2023)
  - 전략 비교 테이블, 한계/주의점, 앗추 활용법 섹션 추가
  - CSS: `lc-ma50` 클래스 추가 (라이트/다크 모드)

### 2026-02-24 (25)
- **FAQ 수정**: 달리오 사이클을 FAQ에서 제거(칼럼으로 복귀), 제목 "Q." 접두사 제거
- **FAQ 활성 탭 버그 수정**: `/faq` 및 FAQ 하위 페이지에서 상단 바 "FAQ" 탭이 활성화되도록 navigation.js 수정

### 2026-02-24 (24)
- **칼럼 → FAQ 분리**: 서비스 해설 성격 칼럼 4개를 독립 FAQ 섹션으로 분리
  - 분리 대상: 앗추 필터 해설, 이동평균선이란, 이동평균선 FAQ, 레버리지 FAQ
  - FaqPage.jsx 신규 생성, `/faq` 라우트 추가
  - 상단 네비게이션에 FAQ 탭 추가 (4탭→5탭)
  - InvestorStoriesSection에서 4개 항목 제거, 각 페이지 BackLink를 `/faq`로 변경

### 2026-02-24 (23)
- **Summary JSON 경량화 + 렌더링 최적화** (615KB → 125KB, 79% 감소):
  - 티커 중복 제거: `.US` 접미사 엔트리 삭제 (408→204개)
  - 미사용 필드 6개 삭제: `id`, `movingAverage20/50`, `percentDiff20/50`, `dataTimestampUtc`
  - 부동소수점 소수점 2자리 반올림 (`round2`)
  - JSON 출력 compact화 (pretty-print 제거)
  - 프론트엔드 정리: `appDataAdapters.js`에서 20/50일선 매핑·timestamp 제거, `.US` 폴백 로직 정리
  - 렌더링 최적화: `EtfSummaryCard`·`TickerCard`에 `React.memo` 적용, `sortedRules`·`tickerTypeMap`·`baseRank` useMemo화

### 2026-02-24 (22)
- **"더보기(오늘의 리포트)" 페이지 전체 삭제**:
  - 페이지 삭제: TodayReportPage, TodayReportDetailPage
  - 라우트/네비게이션에서 `/today_report` 탭 제거 (5탭→4탭)
  - 데이터 모델/Hook 정리: usePageModels, useRouteModel, App.jsx에서 todayReportDetailModel 제거
  - dataLoaders.js: 6개 dated snapshot 로딩 로직 + reportDates 제거
  - 파이프라인 정리: generate_summary_snapshot.mjs에서 날짜별/윈도우별 스냅샷 생성 로직 제거 (summary_snapshots.json만 유지)
  - 과거 데이터 삭제: snapshot/ 내 60개+ dated JSON 파일 전부 제거
  - README, data_pipeline.md 문서 동기화

### 2026-02-24 (21)
- **미사용 티커 메타 필드 제거**: 18개 JSON 파일에서 `type_reason`(items), `characteristics`(type_profile) 삭제 — 프론트엔드·파이프라인 어디에서도 미참조

### 2026-02-24 (20)
- **파이프라인 스크립트 구조 개선**:
  - 진입점 리네임: `download_eodhd_csvs.sh` → `pipeline.sh`
  - `pipeline_steps.sh`(719줄) → 역할별 3개 파일로 분리: `snapshot.sh`, `notify.sh`, `deploy.sh`
  - `runtime.sh` → `common.sh`, `download_workers.sh` → `download.sh` 리네임
  - `data_pipeline.md` 문서 동기화

### 2026-02-24 (19)
- **파이프라인 스크립트 리네임**: `postprocess.sh` → `pipeline_steps.sh` (역할 명확화)

### 2026-02-24 (18)
- **일회성 스크립트 삭제**: `enrich_ticker_metadata.mjs` 제거 (티커 메타데이터 보강용 일회성 스크립트, 파이프라인 미연동)

### 2026-02-24 (17)
- **개발자 포트폴리오 + 달리오 사이클 전체 제거**:
  - 파이프라인 스크립트 삭제: `generate_developer_portfolios.mjs`, `generate_dalio_cycle_snapshot.mjs`
  - cron 호출 제거: `postprocess.sh`에서 `run_developer_portfolio_generation`, `run_dalio_cycle_generation` 삭제
  - Discord 웹훅 제거: `runtime.sh`에서 `send_dalio_cycle_webhook` 삭제
  - 페이지 삭제: DeveloperPortfolioPage, DeveloperPortfolioDetailPage, GodGivenOpportunityPage
  - 컴포넌트 삭제: developer/ 디렉터리 전체(3개), StrategyCycleCard
  - 설정/유틸 삭제: developerStrategies.js, developerPortfolioCardRenderer.jsx
  - 라우트/모델/데이터로더에서 관련 코드 일괄 정리
  - 생성된 JSON 데이터 삭제: `data/summary/portfolio/`, `data/summary/cycle/`
  - 유지: DalioCycleGuidePage, AllWeatherPortfolioPage (칼럼 콘텐츠, 데이터 무의존)

### 2026-02-24 (16)
- **상세 페이지 자산 프로필 + 추세추종 가이드 섹션 추가**:
  - `AssetProfileCard.jsx` 신규: 한글명, 영문명, 업종, 요약 설명, 태그 표시
  - `TrendFollowingGuide.jsx` 신규: 추세추종 적합성 뱃지, type_profile(강세/약세 국면), 적합성 근거·운용 참고(접기/펼치기)
  - `EtfDetailHero.jsx`: 티커 옆 한글명 표시 (`SPY · S&P 500`)
  - `tickerMeta.js`: `businessArea`, `typeProfile` 필드 전달 추가
  - `enrich_ticker_metadata.mjs` 실행: 185개 티커에 `business_area`, `type_reason` JSON 반영
  - `detail.css`: 두 신규 컴포넌트 스타일 + 다크모드 대응
  - 법적 리스크 대응: `softenText()` — operation_notes의 "권장" → "고려할 수 있다" 자동 순화

### 2026-02-24 (15)
- **새 칼럼 추가: "개별 종목에 200일선 매매: 합리적인가?"**:
  - `IndividualStockMa200Page.jsx` 신규 생성 — 전략 심화 카테고리
  - 학술 연구 찬반 모두 인용: Avramov 2021 (개별 종목 MAD alpha ~9%), Adam Grimes (교차 신호 효과 미미)
  - Faber 논문(지수), Jegadeesh & Titman(모멘텀), 실적 이벤트 리스크, 구조적 하락 사례(GE, 인텔) 포함
  - 결론: 매매 신호로는 약하나 추세 확인/리스크 관리 도구로는 학술 근거 있음. 앗추 16/20 필터 활용법 안내
  - `AppRoutes.jsx`, `InvestorStoriesSection.jsx` 라우트/목록 등록

### 2026-02-24 (14)
- **미사용 컴포넌트 6개 삭제 + CLAUDE.md 업데이트**:
  - import하는 곳 없는 죽은 컴포넌트 삭제: DeveloperPortfolioTickerCard, DeveloperStrategyResultCard, EtfAnalystBlock, MainReportSummaryCard, MainSectorGrid, MainTypeRankingGrid
  - CLAUDE.md에 칼럼 작성 시 `components/column/` 활용 지침 추가

### 2026-02-24 (13)
- **마우스 중간 클릭(새 탭 열기) 지원**:
  - `button onClick+navigate` / `div role="button" onClick` → React Router `<Link to>` 전환 (15파일)
  - ETF 카드, 히트맵 타일, 추세 신호 뱃지, 날짜 버튼, 뒤로가기 버튼, 브랜드 로고 대상
  - `marketOverview.jsx`: 반복 카드 JSX를 `TickerCard` 컴포넌트로 추출, `navigate` 파라미터 제거
  - CSS: `<a>` 태그 기본 스타일(밑줄, 색상) 리셋 6개 파일에 추가
  - 부모 컴포넌트에서 불필요한 `navigate` prop 전달 정리

### 2026-02-24 (12)
- **종목 상세 버그 수정 + 초보자 용어 일괄 개선**:
  - `TrendHoldingDaysCard.jsx`: direction null일 때 trend-up 오적용 버그 수정, `D+N` → `N일째`
  - `TrendDrawdownCard.jsx`: `Buy And Hold` → `매수 후 보유`, `MDD`/`CAGR` 레이블에 한글 병기
  - `TrendCrossingHistoryCard.jsx`: `진입`/`청산` → `매수`/`매도`, 제목·설명 간결화, `기대 수익률` → `평균 수익률`
  - `EtfDetailHero.jsx`: `[금일 종가 업데이트 미적용]` → `오늘 종가 반영 전`
  - `IndexEtfDetailPage.jsx`: meta 없을 때 안내 메시지 추가, 로딩/에러 문구 초보자 친화적으로 변경

### 2026-02-24 (11)
- **종목 상세 Hero 캔들 SVG 추가**:
  - `EtfDetailHero.jsx`: 가격 옆에 미니 캔들스틱 SVG 표시 (리스트 카드와 동일 방식, 크기 확대)
  - `detail.css`: `.detail-candle` 스타일 추가 (up/down 색상, wick/body)

### 2026-02-24 (10)
- **추세 조회 리스트 정렬 단순화 + 죽은 코드 제거**:
  - `IndexEtfPage.jsx`: 정렬 4개 select → 단일 select (기본순/200일선 위↓/200일선 아래↓/CAGR 높은순)
  - `useIndexEtfControls.js`: sortPeriod, sortMetric, sortOrder state 제거, sortMode만 유지
  - 고아 컴포넌트 3개 삭제: SimpleTrendSummary, EtfEducationPanel, EtfDetailEducationTip
  - `index-etf.css`: 죽은 CSS ~300줄 삭제 (simple-mode, simple-trend, etf-education, detail-education-tip)

### 2026-02-24 (9)
- **종목 상세 Hero 개선 + 불필요 요소 정리**:
  - `EtfDetailHero.jsx`: 추세 적합성 뱃지 추가 (티커 옆 "추세 적합"/"조건부 적합"), OHLC(시가/고가/저가) 표시 추가
  - `IndexEtfDetailPage.jsx`: 페이지 부제 삭제, 하단 추세 적합성 카드 제거 (Hero 뱃지로 대체)
  - `detail.css`: suitability-badge 스타일 + 다크모드 대응
  - `data_strategy.md`: 컴포넌트 배치표 현행화, ETF 풀네임 표시를 향후 개선으로 기록

### 2026-02-24 (8)
- **종목 상세 페이지 전면 재설계: 초보자 3블록 원칙**:
  - `IndexEtfDetailPage.jsx`: Hero + Banner + 차트만 기본 표시, 나머지 5개 카드를 접힘 섹션으로 이동
    - "추세 상세" 접힘: EtfTrendCards + TrendHoldingDaysCard + TrendSupportCard
    - "성과 분석" 접힘: TrendDrawdownCard + TrendCrossingHistoryCard
    - 접힘 섹션 설명을 초보자 언어로 변경 ("과거에 사고 팔았으면 어떤 결과였는지")
  - `TrendStatusBanner.jsx`: 초보자 친화 표현 개선
    - "D+45" → "45일째" (D+ 표기 제거)
    - "200일선 대비" → "200일 평균 대비" (전문 용어 완화)

### 2026-02-24 (7)
- **종목 상세 페이지 UX 개선: 초보자 3초 이해 목표**:
  - `TrendStatusBanner.jsx` 신규: Hero 아래에 4단계 추세 판정 배너 (강한 상승/상승 주의/약한 회복/하락)
    - 100일선+200일선 괴리율 조합으로 판정, 한국어 한 줄 설명 + 유지일수 표시
    - 4색 배경(초록/노랑/주황/빨강) + 다크모드 대응
  - `CollapsibleSection.jsx` 신규: 접기/펼치기 wrapper 컴포넌트
    - TrendDrawdownCard, TrendCrossingHistoryCard, TrendSupportCard 3개를 "성과 분석 (고급)" 블록으로 묶고 기본 접힘
  - 5개 카드 컴포넌트에 `.section-description` 한 줄 설명 추가
    - EtfTrendCards: "현재가가 이동평균선보다 위(+)면 상승, 아래(-)면 하락 추세"
    - TrendHoldingDaysCard: "현재 추세가 며칠째 이어지는지"
    - TrendDrawdownCard: "MDD는 최대 손실폭, CAGR은 연평균 수익률"
    - TrendCrossingHistoryCard: "진입은 매수 시점, 청산은 매도 시점"
    - TrendSupportCard: "16일 이상이면 안정적인 추세"
  - `detail.css`: 배너 4색, 접기 섹션, section-description CSS + 다크모드 + 모바일 반응형

### 2026-02-24 (6)
- **추세 조회 리스트 전면 정리: 초보자 직관성 개선**:
  - `EtfSummaryCard.jsx`: 카드에서 20일선/50일선 제거, 100일/200일만 표시
  - `IndexEtfPage.jsx`: 정렬 옵션에서 20일/50일 제거, 이평선 정렬 시에만 세부 옵션 노출
  - `IndexEtfPage.jsx`: 상단에 맥락 설명 추가 ("관심 종목이 이동평균선 위에 있는지 확인하세요")
  - `IndexEtfPage.jsx`: 시장 개요 배너를 상단에서 하단으로 이동 (첫 방문자 이탈 방지)
  - `TypeFilter.jsx`: 48개 타입 → 주요 8개 기본 노출 + "더보기" 토글로 나머지 펼치기
  - `GuideTour.jsx`: 제거된 `.simple-mode-toggle` 타겟 스텝 삭제, 3단계로 축소

### 2026-02-24 (5)
- **종목 상세 페이지: 컴포넌트 재배치 + 디스코드 유도 버튼 추가**:
  - `IndexEtfDetailPage.jsx`: 초보자 사고 흐름에 맞게 섹션 순서 변경
    - TrendHoldingDaysCard(유지일수)를 이평선 카드 바로 다음으로 올림
    - TrendSupportCard(16/20 규칙)를 돌파 이력 뒤 하단으로 이동
    - 쉬움 → 직관적 → 보통 → 어려움 순으로 난이도 점진적 상승
  - 디스코드 유도 버튼 추가 (면책조항 위, 추세 조회 페이지와 동일 패턴)
    - "이 종목의 추세 변화를 매일 알림으로 받아보세요" → Discord 입장 링크
    - sessionStorage 기반 닫기 상태 유지
  - `data_strategy.md` Step 3: 컴포넌트 배치 테이블 및 디스코드 유도 버튼 기획 반영

### 2026-02-24 (4)
- **랜딩 페이지: Strategy 섹션에 투자자 권위 한 줄 추가**:
  - `LandingStrategySection.jsx`: 200일선 설명과 차트 사이에 권위 블록 삽입
    - "폴 튜더 존스, 마티 슈워츠, 에드 세이코타 — 전설적 투자자들이 수십 년간 동일한 기준을 사용"
    - "왜 200일인가? 칼럼에서 확인 →" 링크 → `/moving_average_history`
  - `landing.css`: `.strategy-trust-strip` 스타일 + 다크모드 대응

### 2026-02-24 (3)
- **가이드 페이지: "앗추만의 이야기가 아닙니다" 신뢰 섹션 추가**:
  - `TrendGuidePage.jsx`: Step 1 아래에 투자자 인용 섹션 삽입
    - 폴 튜더 존스, 마티 슈워츠, Mebane Faber 논문 인용 카드 3장
    - 각 카드에서 해당 칼럼 페이지로 이동 가능
    - 하단 "42개 칼럼에서 더 자세히 알아보기" CTA
  - `guide.css`: 인용 카드 스타일, 다크모드, 반응형(768px) 대응

### 2026-02-24 (2)
- **TODO 재구성: 유입 퍼널 중심으로 전면 개편**:
  - `planning/TODO.md`:
    - P0-최우선: "랜딩→SPY 상세" → "랜딩→리스트→상세→Discord" 퍼널로 변경
    - [G-1] 랜딩 CTA를 리스트 페이지(`/index_etf`)로 연결하도록 변경
    - [G-2] 리스트 페이지 초보자 개선 항목 신설 (추천 영역, 필터 기본값, 정렬 단순화)
    - [G-3] 상세 페이지 첫 방문자 경험 항목 추가 (컨텍스트, 그래프 기본 펼침, 뒤로가기)
    - [G-4] Discord 유입 연결 개선
    - P2.5: 마케팅 채널에 텔레그램 추가, YouTube Shorts 기술 스택 반영
    - P3: 유사투자자문업 등록 정보 반영

### 2026-02-24 (1)
- **마케팅 전략 문서: 실행 로드맵 우선순위 재정렬**:
  - `marketing/00_marketing_strategy_overview.md`:
    - 실행 로드맵: 텔레그램을 Week 2 → Week 1으로 이동 ("쉬운 것부터" 원칙)
    - Week 3~4: Remotion → edge-tts + matplotlib + FFmpeg 반영, MVP 2개 종목(TSLA/NVDA) 명시
    - 논의 진행 상황 체크리스트 업데이트

### 2026-02-23 (6)
- **마케팅 전략 문서: 2단계 성장 전략 및 유사투자자문업 등록 요건 반영**:
  - `marketing/00_marketing_strategy_overview.md`:
    - 수익 모델을 2단계 구조로 변경: Phase 1 무료(유입·리텐션, 디스코드 1000명) → Phase 2 유료화
    - 새 섹션 "1-1. 성장 전략 — 2단계 접근" 추가: 핵심 퍼널, 리텐션 요소, 마일스톤, 무료/유료 기능 분리표
    - 유사투자자문업 등록 요건 상세 추가 (자본금·교육·비용·제약 — 총 50~100만원, 앗추 서비스와 적합성 확인)
    - 핵심 원칙에 "유입 최우선" 추가
    - 구현 우선순위를 "쉬운 것부터" 원칙으로 재정렬 (텔레그램 → X → Threads/Bluesky → YouTube Shorts)

### 2026-02-23 (5)
- **칼럼 42개 전수 검토 — 사실 검증, 면책조항, 수치 통일**:
  - **면책조항 자동 삽입**: `ColumnPage.jsx`에 면책 문구 추가, 42개 칼럼 전체에 자동 적용. `column.css` 스타일 추가.
  - **웹 크롤링 기반 사실 검증 및 수정** (15개 파일):
    - PTJ: 창립연도 1984→1980, "26세" 삭제, "40년+"→"45년+"
    - 뱅가드: 1974→1975, AUM $8조→$10조+
    - 거북이 트레이더: 1,874%→$1.75억, 코벨→커티스 페이스
    - 골든 크로스 2020: 4월→7월, 데드 크로스 통계 전면 재작성
    - 닷컴 버블: 나스닥 고점 1999.12→2000.03
    - DCA vs 일시투자: 뱅가드 연구 78%→약 68%, 4.8%p→약 2.3%p
    - VIX 2008: 80.74→80.86(종가 기준), 불확실 수치 제거
    - CTA 2008: +10.21%→+14% (Barclay CTA Index)
    - S&P500: 7,000배→약 10,000배, "200년"→"95년"
    - 멍거 인용문: 1차 출처 미확인 표기 추가
  - **광고성/선정적 표현 수정**: "앗추와 거북이 전략의 공통점"→"거북이 전략과 이동평균선의 공통점", "앗추 히트맵" 제거, 서비스 홍보 문구를 일반 교육 톤으로 전환
  - **칼럼 간 수치 불일치 통일**: HFEA CAGR "연 25%+"→"연 17~20%" (HfeaStrategy/RiskAdjustedReturn 일치)
  - **InvestorStoriesSection 목록 정합성**: 수정된 칼럼 내용과 제목/설명 동기화 (거북이 수익률, S&P500 "95년", DCA "약 68%", CTA "+14%" 등)

### 2026-02-23 (4)
- **YouTube Shorts 기획 문서 대폭 업데이트 — 시장 분석 및 정책 리스크 반영**:
  - `marketing/01_youtube_shorts_marketing.md`: 전면 재작성
    - M7 종목별 앵커 캐릭터 컨셉 반영 (해당 브랜드를 연상시키는 캐릭터가 뉴스 앵커처럼 이슈 전달)
    - 경쟁 환경 분석 추가: 한국어 종목 전용 투자 유튜브 = 완전 공백 (2026.02 웹 리서치)
    - M7 종목별 검색량/관심도 순위 추가 (TSLA > NVDA >> 나머지)
    - YouTube AI/자동화 정책 대응 섹션 신설 (2025.7 정책 변경, 2026.1 AI 슬롭 16채널 삭제 선례)
    - MVP 범위 조정: 10채널 → 2채널(TSLA/NVDA), "음성+차트"부터 시작 → 캐릭터 점진 디벨롭
    - 기술 스택 경량화: MVP는 edge-tts(무료) + matplotlib + FFmpeg
    - 반자동 워크플로우 도입: 생성 자동 → 사람 검수 → 업로드 (정책 대응)
    - 캐릭터 진화 로드맵 추가 (Phase 1~4: 음성만 → 일러스트 → 립싱크 → 풀 AI 아바타)
    - 브랜드 상표권 주의사항 추가
    - 비용 대폭 절감: MVP $1/월 → $0.20/월
  - `marketing/00_marketing_strategy_overview.md`: YouTube Shorts 섹션 업데이트 (컨셉, 비용, 정책, 논의 진행 상황 반영)

### 2026-02-23 (3)
- **99_docs 용어 통일 — "앗추 전략/지표/스마트 필터" → "앗추 필터"**:
  - `law_risk/00_legal_risk_overview.md`: 표현 개선 표 권장안을 "앗추 필터 (확정)"으로, TODO 항목 완료 처리
  - `planning/landing_page.md`: "앗추 전략 소개" → "앗추 필터 소개", "앗추 전략이면" → "앗추 필터라면", "앗추 전략 연평균" → "앗추 필터 연평균"
  - `planning/TODO.md`: 용어 통일 체크리스트 항목 완료 처리
  - `marketing/00_marketing_strategy_overview.md`: 금지 표현 표 권장안을 "앗추 필터 (확정)"으로

### 2026-02-23 (2)
- **칼럼 페이지 톤 조정 — 홍보성 표현을 기능 설명으로 전환**:
  - 10개 칼럼 페이지 + InvestorStoriesSection에서 "앗추 필터가 진짜 추세만 포착", "버틸 확률이 높아집니다" 등 결과 보장 뉘앙스 제거
  - "데이터를 제공합니다", "시각화하여 제공합니다" 등 데이터 도구 톤으로 전환
  - AtchuStrategyPage: "전략" → "지표" 용어 변경, STATS 및 콜아웃 면책 보강
  - 대상 파일: GoldenDeadCross, TurtleTrader, BuyHoldVsTrend, JackBogle, CtaFunds, OverseasInvestorPsychology, DiversificationScience, SectorRotation, AtchuStrategy, MomentumEffect, InvestorStoriesSection

### 2026-02-23 (1)
- **칼럼 탭 전면 개편 — 40개 칼럼 페이지 추가**:
  - `InvestorStoriesSection.jsx` 전면 개편: 기존 3개 flat 목록 → 7개 카테고리(추세 추종 기초/전설적 투자자/위기 분석/투자 심리/레버리지/거시경제/전략 심화) × 40개 항목 구조로 변경
  - 신규 칼럼 페이지 39개 생성 (`pages/` 디렉토리):
    - **추세 추종 기초**: WhatIsMovingAveragePage, GoldenDeadCrossPage, MovingAverageHistoryPage, FaberPaperPage, AtchuStrategyPage
    - **전설적 투자자**: PaulTudorJonesPage, EdSeykotaPage, JesseLivermorePage, TurtleTraderPage, MartySchwartzPage, BuffettVsHedgePage, JackBoglePage, HowardMarksPage
    - **위기 분석**: Crisis2008Page, DotcomBubblePage, CovidCrashPage, Sp500DrawdownsPage, BadTimingStillWinsPage
    - **투자 심리**: DalbarResearchPage, LossAversionPage, FearGreedIndexPage, BearMarketSurvivalPage, InformationParadoxPage, OverseasInvestorPsychologyPage
    - **레버리지**: UproVsTqqqPage, VolatilityDecayPage, HfeaStrategyPage
    - **거시경제**: AllWeatherPortfolioPage, DebtCyclePage, SectorRotationPage, VixExplainedPage, WhySp500Page
    - **전략 심화**: BuyHoldVsTrendPage, DcaVsLumpSumPage, PeterLynchWarningPage, MomentumEffectPage, CtaFundsPage, DiversificationSciencePage, RiskAdjustedReturnPage
  - `AppRoutes.jsx`: React.lazy import 39개 + Route 39개 추가 (7개 카테고리별 주석으로 구분)
  - 작업 계획: `999_column/` 디렉토리 (README + session_1~5.md)

### 2026-02-22 (6)
- **콤보 전략 3개 제거** (200일 진입+100일 청산, 200일 진입+50일 청산, 100일 진입+50일 청산):
  - 논리적 근거가 약한 비대칭 전략 — 사용자 혼란 유발 우려로 제거
  - `generate_summary_snapshot.mjs`: CROSSING_STRATEGIES에서 combo_cross 3개 및 계산 블록 제거
  - `csvAnalytics.js`: crossingStrategies, 계산 블록, 드로우다운 계산 블록 제거
  - `tickerMeta.js`: cagrStrategyLabelMap에서 combo_cross 라벨 3개 제거

### 2026-02-22 (5)
- **상세 페이지 통합 개선**:
  - `IndexEtfDetailPage.jsx` 삭제 (일반 상세 페이지 제거)
  - `IndexEtfDetailFullPage.jsx` 개선: 제목 `{key} 전체 분석` → `{key} 상세`, "Full" 칩 제거, 쓸모없는 텍스트 메타 섹션 6개 제거 (자세한 정보, 추세 프로필, 포트폴리오 역할, 룰 제안, 시장 메타데이터, 추가 메모)
  - `PerformanceReturnCards.jsx` 신규 생성: 기간별 수익률 카드 (5일/1개월/3개월/1년/5년), EtfDetailHero 아래 배치
  - `AppRoutes.jsx`: `/index_etf/:ticker` → `IndexEtfDetailFullPage`, `/analysis/:ticker` → `/index_etf/:ticker` 리다이렉트

### 2026-02-22 (4)
- **더보기: "추세 추종에 레버리지를 사용하면 안 되나요?" 페이지 추가**:
  - `LeverageFaqPage.jsx` 신규 생성: 추세추종+레버리지 병행 전략 정보 페이지
  - `leverage-faq.css` 신규 생성: 독립 `lvg-` 네임스페이스 스타일
  - 페이지 구성: 결론 → 변동성 감쇠 메커니즘 설명 → 통계(1,061% / 28.6% / 40년+) → 전문가 4인 접근법 (폴 튜더 존스, Wouter Keller VAA/DAA, TQQQ 이평선 전략, Corey Hoffstein Return Stacking) → 흐름 요약 → 리스크 3개 → CTA
  - `AppRoutes.jsx`: `/leverage_faq` 라우트 추가
  - `MorePage.jsx`: MORE_ITEMS에 새 항목 추가

### 2026-02-22 (3)
- **추세 조회 페이지 텍스트 서술적 전환 + 실증 근거 추가**:
  - **법적 리스크 검토**: 투자자문업 미등록 상태에서 평가적 표현("상승 추세", "200일선이 가장 중요", "좋음/주의") 사용 시 자본시장법 위반 소지 확인 → 모두 순수 서술 표현으로 전환
  - **실증 데이터 추가** (EtfEducationPanel 스텝1): 1928년 이후 미국 증시 통계에서 지수가 200일선 위에 있는 날 일평균 +0.09%, 아래에 있는 날 -0.11%, 200일선 아래 변동성 평균 64% 더 높음
  - **면책 문구 추가** (EtfEducationPanel 하단): "과거 역사적 데이터 기준, 미래 수익 보장 없음, 투자 조언 아님"
  - **표현 정제** (5개 파일): "상승 추세"→"200일선 위", "최선의 전략"→"전략별 과거 CAGR", "초록=좋음"→"초록=이평선 위" 등
  - 수정 파일: EtfEducationPanel.jsx, GuideTour.jsx, SimpleTrendSummary.jsx, EtfSummaryCard.jsx, IndexEtfDetailPage.jsx, index-etf.css

### 2026-02-22 (2)
- **랜딩 페이지 초기 로딩 성능 개선**:
  - nginx gzip 압축 추가 (nginx-prod.conf): 59MB 비압축 → 약 8~12MB 전송으로 감소 예상
  - LandingRealChart.jsx: SPY CSV 정적 import → 동적 import (랜딩 초기 번들에서 461KB 제거)
  - LandingStockExplore.jsx: NVDA/AAPL/TSLA/MSFT CSV 4개 정적 import → Promise.all 동적 import (랜딩 초기 번들에서 1.7MB 제거)
  - AppRoutes.jsx: MainPage 제외 10개 페이지 React.lazy + Suspense 적용 (route-based code splitting)
  - vite.config.js: vendor chunk 분리 (react, react-dom, react-router-dom)
  - nginx 적용은 별도 배포 시 반영 필요

### 2026-02-22
- **초보자 온보딩 시스템 (4단계 구현)**:
  - **Phase 1 — 심플 모드**: `useSimpleMode` 훅 신설. 기본값 ON으로 200일선 핵심 정보만 표시. 타입 필터 5개로 축소, 정렬 드롭다운 숨김, 카드에 추세 신호등(초록/빨강) 추가, CAGR 숨김. 상세 페이지에서 `SimpleTrendSummary` 200일선 요약 카드, 복잡한 섹션(TrendDrawdown, CrossingHistory, 메타정보) 숨김.
  - **Phase 2 — 교육 섹션**: `EtfEducationPanel` 3단계 교육(200일선만 보세요, 색상 의미, 유지일수) + 이평선 칩 읽는 법 예시. `EtfDetailEducationTip` 상세 페이지 인라인 팁(추세 카드란?, 그래프 읽는 법).
  - **Phase 3 — 가이드 투어**: `GuideTour` 첫 방문시 4스텝 오버레이(보기 모드→타입 필터→종목 카드→200일선 칩). 순수 React+CSS 구현.
  - **Phase 4 — 온보딩 페이지**: `TrendGuidePage` (/guide) 4단계 독립 교육(200일선 개념, 카드 목업, 상세 팁, SPY CTA). 랜딩 CTA 연결.
  - 수정 파일: App.jsx, usePageModels.js, IndexEtfPage.jsx, IndexEtfDetailPage.jsx, EtfSummaryCard.jsx, AppRoutes.jsx, LandingStockExplore.jsx, LandingDiscordCTA.jsx, index-etf.css
  - 신규 파일: useSimpleMode.js, SimpleTrendSummary.jsx, EtfEducationPanel.jsx, EtfDetailEducationTip.jsx, GuideTour.jsx, TrendGuidePage.jsx, guide-tour.css, guide.css
- **99_docs 디렉터리 재구성**: 6개 카테고리(기획/법적 리스크/마케팅/개발/세금/운영)로 분리. planning/, development/, tax/, operations/ 디렉터리 신설. DATA_PIPELINE→development/, landing_page·discord_notifications→planning/ 이동. tax_and_registration.md, service_operations.md 신규 작성. solo_developer_checklist.md를 인덱스+요약 구조로 재구성.
- **CLAUDE.md 개선**: 문서 인덱스 신설, 디렉터리 힌트 확장.
- **문서 작성**: solo_developer_checklist.md(1인 운영 체크리스트), 마케팅 전략 2건(총괄 + YouTube Shorts), 법적 리스크 분석(자본시장법/금소법/EODHD 라이선스).
- **마케팅 문서에 법적 컴플라이언스 반영**: 용어 변경("신호"→"감지/지표"), 면책 문구 가이드, 유사투자자문업 리스크 명시.

### 2026-02-21
- **데이터 스키마**: 추세 강도 타입 재설계(heatmap_group 분리), S&P 100 확장(20→100→185종목), 티커 메타데이터 보강(name_ko, business_area, heatmap_label, tags 등), 하드코딩 라벨 제거.
- **랜딩 페이지**: 카피/UX 3차 개선(문제 제시 카드, 전략 섹션, HowItWorks), 라이트 모드 CSS 변수화, 모바일 최적화, 1000만원 훅 동적 생성.
- **시장 개요**: 히트맵 리디자인(플랫 레이아웃, 색상 강화), 정보 구조 재구성(시장 온도→추세 신호→강도→히트맵 순), UI 2차 개선(툴팁, 카드 레이아웃).
- **사용자 여정**: 랜딩→추세 조회→시장 개요 흐름 구축, 초보자 가이드/Discord 배너 추가.
- **Discord 알림**: 메시지 개선(시장 온도, 한글 타입명, 방향별 그룹핑), 파이프라인 순서 수정(배포 완료 후 알림).
- **향후 숙제**: B&H vs 추세추종 리스크 지표 비교(소르티노 비율 등) 구현 필요.

### 2026-02-20
- 랜딩 페이지(다크/라이트, 실제 차트, 카피), 시장 개요 3+1 섹션 재구성.

### 2026-02-18
- 모바일 햄버거 메뉴, MCP 정리.

### 2026-02-16
- src/ 전면 리팩터링(pages/utils/config/hooks/routes/styles 분리), 모바일 UI 개선.

### 2026-02-14
- AI 리포트(Gemini), 주말 리포트(5개 기간), 시장 개요 히트맵, 스크립트 lib 분리.

### 2026-02-13
- tickers 타입별 파일 분리, 스냅샷 생성 파이프라인, 상세 미청산 포지션 로직.

### 2026-02-10
- 추세 조회/상세 페이지 구현, CSV 기반 이평선/돌파 계산, cron 파이프라인.

### 2026-02-08
- EODHD 전환, docker-compose에서 DB/BE/AI 제거, nginx+프론트만 유지.
