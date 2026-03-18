# CLAUDE.md

## 프로젝트 개요
앗추(Atchu) — 섹터·국가·채권·원자재·중소형주 ETF 등 85개 자산의 추세추종 데이터 서비스. React + Vite 프론트엔드, EODHD API 기반 CSV 데이터 파이프라인. 한국어 서비스.

## 필수 명령어
- **빌드**: `NODE_OPTIONS="--max-old-space-size=8192" vite build` (CSV 데이터 크기 때문에 8GB 필수, 사용자 요청 시에만 실행)
- **파이프라인**: `02_fe_react/data/scripts/pipeline.sh`

## 워크플로우
- `README.md`는 제품 전략의 원천. 기획 판단 시 항상 참고
- 작업 완료 후 `.claude/docs/CHANGELOG.md`에 기록
- 커밋 전에 `.claude/docs/` 내 관련 `.md` 파일과 `README.md` 최신화

### 반드시 사용자에게 물어볼 것
- 새로운 기능/기획 방향 결정 (플랜 모드 사용)
- 아키텍처 변경 (새 라이브러리 도입, 디렉터리 구조 변경)
- docker, 배포 등 외부 서비스 실행
- .env 또는 시크릿 관련 변경
- git force push, reset --hard 등 파괴적 git 작업
- 에러 3회 이상 반복 시

### 자동 커밋
- 하나의 기능/버그 수정이 완료되면 자동으로 커밋한다 (사용자에게 묻지 않음)
- 큰 변경 전에도 커밋하여 롤백 포인트 확보
- 커밋 메시지는 한국어로, 변경 내용을 간결하게 요약
- `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` 항상 포함

## 반응형 폰트/크기 규칙
- **패턴**: `clamp(모바일px, calc(기준px + Xvw), PC_px)` — 미디어 쿼리 없이 fluid scaling
- **기준**: 모바일 최소 15px, PC 최소 18px (iPhone SE 375px ~ PC 1440px 기준)
- **예시**: `font-size: clamp(15px, calc(12.4px + 0.7vw), 18px)` — 375px→15px, 1440px→18px 선형 보간

## 실행 규칙
- 독립적인 작업은 항상 최대 병렬로 서브 에이전트를 사용하여 처리
- 웹 검색은 `/search` 스킬 사용
- 새 칼럼 페이지 작성 시 `components/column/` (25개)의 재사용 UI 컴포넌트를 최대한 활용할 것

## 디렉터리 구조
```
README.md                — 제품 기획서 (서비스 정의, 페르소나, 가치 제안, 설득 방법, 기능, 제약)
01_proxy_nginx/          — Nginx 프록시
02_fe_react/
  src/                   — React 프론트 (pages/ components/ utils/ hooks/ config/ routes/ styles/)
  data/scripts/          — 데이터 파이프라인 스크립트 (git 추적)
  data/tickers/          — 티커 메타 JSON 10개 (git 추적)
  data/tickers_stock/    — 개별주(S&P 500) 티커 메타 (git 추적)
  data/csv|summary|logs/ — 런타임 데이터 (git 제외)
  data/csv_stock/        — 개별주 CSV (런타임, git 제외)
  public/csv_stock/      — 개별주 CSV 정적 에셋 (on-demand fetch용)
.claude/docs/
  pages/                 — 페이지별 기획 (타겟 사용자, 유입 경로, 보여줄 것, CTA). README는 이유(why), pages/*.md는 구체적 구현 설계(what/how)
    landing.md           — 랜딩 (/)
    trend_list.md        — 추세 조회 (/index_etf)
    trend_detail.md      — 추세 조회 상세 (/index_etf/:ticker)
    market_overview.md   — 시장 개요 (/market_overview)
    faq.md               — FAQ (/faq) — 앗추 핵심 전략
    columns.md           — 칼럼 (/more) — 시장 이해 배경지식
    dev_market_overview.md — 개발자 마켓 뷰 (/_stocks_overview, /_stocks, /_stocks/:ticker)
  law_risk/              — 법적 리스크 (자본시장법, 금소법, EODHD 라이선스)
  marketing/             — 마케팅 (채널 전략, YouTube Shorts)
  development/           — 개발 (데이터 파이프라인 기술 문서)
  tax/                   — 세금 및 사업자 등록
  operations/            — 운영 (이용약관, 비용 관리, 유료화, 보안)
  CHANGELOG.md           — 작업 기록
  solo_developer_checklist.md — 1인 개발자 체크리스트 (6개 영역 인덱스)
```

## 개발자 마켓 뷰 (비공개)
개발자가 S&P 500 개별주 시장을 보기 위한 별도 툴. 앗추 제품과 분리된 개인 투자 도구.
일반 사용자에게 절대 노출되지 않는다. README에 언급하지 않는다.
기획 상세: `.claude/docs/pages/dev_market_overview.md`

### 진입 방법
다크모드/라이트모드 토글을 **3초 안에 5번** 전환 → 상단 네비에 "관리자" 탭 → DevPage(비밀번호) → 개별주 페이지 링크

### 페이지 목록
- `/_dev` — 관리자 허브 (개별주 페이지 진입점)
- `/_stocks_overview` — 개별주 시장 개요 (시장 폭, 섹터별 추세 강도, 히트맵, 최근 신호)
- `/_stocks` — 개별주 추세 조회 리스트 (섹터 필터, 검색, 정렬)
- `/_stocks/:ticker` — 개별주 상세 (차트, 교차이력, CAGR/MDD)

### 기술 구현
- 개별주 CSV는 빌드에 번들하지 않고 `public/csv_stock/`에 정적 에셋으로 배치 → 상세 페이지에서 `fetch()`로 on-demand 로드
- 테마 토글 연타 감지: `AppTopNav.jsx`의 `handleThemeToggle`에서 3초 내 5회 감지 → sessionStorage에 devMode 저장
- 파이프라인: `pipeline.sh` → `pipeline_stock.sh` (ETF 처리 후 자동 호출, 같은 cron)
- **섹터 구조**: GICS 11개 섹터 + 46개 서브섹터 (sp500.json의 `type`/`subType` 필드)
