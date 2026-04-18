# CLAUDE.md

## 프로젝트 개요
앗추(Atchu) — 섹터·국가·채권·원자재·중소형주 ETF 등 146개 자산의 추세추종 데이터 서비스. React + Vite 프론트엔드, EODHD API 기반 CSV 데이터 파이프라인. 한국어 서비스.

## 필수 명령어
- **파이프라인**: `02_fe_react/data/scripts/pipeline.sh`
- **빌드**: `02_fe_react/CLAUDE.md` 참조

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
- `Co-Authored-By: Claude [현재 모델명] <noreply@anthropic.com>` 항상 포함 — 모델명은 시스템 컨텍스트에서 확인 (예: `Sonnet 4.6`, `Opus 4.7`)

## 실행 규칙
- 독립적인 작업은 항상 최대 병렬로 서브 에이전트를 사용하여 처리
- 웹 검색이 필요하다고 판단되면 사용자에게 묻지 않고 전역 스킬을 자동 실행
  - 심층·딥 리서치 요청 → `/research`
  - 간단·짧게 알아봐 달라는 요청 → `/search`

## 디렉터리 구조
```
README.md                — 제품 기획서
01_proxy_nginx/          — Nginx 프록시
02_fe_react/             — React 프론트엔드 → CLAUDE.md 참조
  data/scripts/          — 데이터 파이프라인 스크립트 (git 추적)
  data/tickers/          — 티커 메타 JSON 10개 (git 추적)
  data/tickers_stock/    — 개별주(S&P 500) 티커 메타 (git 추적)
  data/csv|summary|logs/ — 런타임 데이터 (git 제외)
  data/csv_stock/        — 개별주 CSV (런타임, git 제외)
  public/csv_stock/      — 개별주 CSV 정적 에셋 (on-demand fetch용)
.claude/docs/            — 기획·운영 문서 → CLAUDE.md 참조
```

## 개발자 비공개 페이지
일반 사용자에게 절대 노출되지 않는다. README에 언급하지 않는다.

**진입 방법**: 다크모드/라이트모드 토글을 **3초 안에 5번** 전환

### 개발자 마켓 뷰
기획: `.claude/docs/pages/private/dev_market_overview.md` / 기술 구현: `02_fe_react/CLAUDE.md`
- `/_dev` — 관리자 허브
- `/_dev_market_overview` — 개별주 시장 개요
- `/_dev_trend_list` — 개별주 추세 조회 리스트
- `/_dev_trend_list/:ticker` — 개별주 상세

### 퀀트 엿보기
기획: `.claude/docs/pages/private/dev_quant/dev_quant_index.md` / 기술 구현: `02_fe_react/CLAUDE.md`
- `/_dev_quant` — 퀀트 허브
- `/_dev_quant/:strategy` — 전략 상세
