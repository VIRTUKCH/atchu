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
  law_risk/              — 법적 리스크 (자본시장법, 금소법, EODHD 라이선스)
  marketing/             — 마케팅 (채널 전략, YouTube Shorts)
  development/           — 개발 (데이터 파이프라인 기술 문서)
  tax/                   — 세금 및 사업자 등록
  operations/            — 운영 (이용약관, 비용 관리, 유료화, 보안)
  CHANGELOG.md           — 작업 기록
  solo_developer_checklist.md — 1인 개발자 체크리스트 (6개 영역 인덱스)
```

## 개발자 전용 비공개 페이지
일반 사용자에게 노출되지 않는 비밀번호 보호 페이지. 네비게이션 바에 없음, URL 직접 접근만 가능.
- `/_dev` — 개발자 대시보드
- `/_stocks` — 개별주(S&P 500) 추세 조회 리스트
- `/_stocks/:ticker` — 개별주 상세 (차트, 교차이력, CAGR/MDD)

개별주 CSV는 빌드에 번들하지 않고 `public/csv_stock/`에 정적 에셋으로 배치 → 상세 페이지에서 `fetch()`로 on-demand 로드.
