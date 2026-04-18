# .claude/docs/

제품 기획 및 운영 문서 모음.
- **왜(why)**: `README.md` (프로젝트 루트)
- **구체적 구현(what/how)**: 이 디렉터리의 각 `.md` 파일

## 폴더 역할

| 폴더/파일 | 역할 |
|-----------|------|
| `pages/` | 페이지별 기획 (타겟 사용자, 유입 경로, 보여줄 것, CTA) |
| `pages/private/` | 비공개 개발자 전용 페이지 기획 (일반 사용자 노출 X) |
| `pages/private/dev_quant/` | 퀀트 전략별 상세 기획 |
| `development/` | 데이터 파이프라인 기술 문서 |
| `law_risk/` | 자본시장법, 금소법, EODHD 라이선스 리스크 |
| `marketing/` | 채널 전략, 커뮤니티 마케팅, YouTube Shorts |
| `operations/` | 이용약관, 비용 관리, 유료화, 보안 |
| `tax/` | 세금 및 사업자 등록 |
| `CHANGELOG.md` | 작업 기록 (작업 완료 후 항상 업데이트) |
| `solo_developer_checklist.md` | 1인 개발자 6개 영역 체크리스트 |

## pages/ 파일 목록

### 공개 페이지 (7개)
- `landing.md` — 랜딩 (`/`)
- `trend_list.md` — 추세 조회 (`/trend_list`)
- `trend_detail.md` — 추세 조회 상세 (`/trend_list/:ticker`)
- `market_overview.md` — 시장 개요 (`/market_overview`)
- `faq.md` — FAQ (`/faq`)
- `columns.md` — 칼럼 (`/more`)
- `discord_alert.md` — Discord 알림

### 비공개 개발자 페이지 (pages/private/, 4개)
- `dev_market_overview.md` — 개발자 마켓 뷰 (`/_dev_market_overview`)
- `dev_trend_list.md` — 개별주 추세 조회 (`/_dev_trend_list`)
- `dev_trend_detail.md` — 개별주 상세 (`/_dev_trend_list/:ticker`)
- `dev_discord_alert.md` — 개발자 전용 Discord 알림

### 퀀트 전략 기획 (pages/private/dev_quant/, 11개)
- `dev_quant_index.md` — 퀀트 허브 공통 (페이지 구조, 라우트, UI 가이드)
- `dev_quant_baa_a.md` — BAA-A Aggressive
- `dev_quant_baa_b.md` — BAA-B Balanced
- `dev_quant_haa.md` — HAA
- `dev_quant_faber_sector.md` — Faber 섹터 모멘텀
- `dev_quant_dual_momentum.md` — 듀얼 모멘텀
- `dev_quant_business_cycle.md` — 경기순환 섹터 로테이션
- `dev_quant_risk_parity.md` — 리스크 패리티/All Weather
- `dev_quant_trend_following.md` — CTA 추세 추종
- `dev_quant_multi_factor.md` — 멀티팩터 QVM
- `dev_quant_sector.md` — 섹터 로테이션 (예정)

## 새 문서 추가 기준

| 추가할 내용 | 넣을 위치 |
|-------------|-----------|
| 공개 페이지 기획 | `pages/[페이지명].md` |
| 비공개 개발자 페이지 기획 | `pages/private/dev_[페이지명].md` |
| 퀀트 전략 상세 기획 | `pages/private/dev_quant/dev_quant_[전략명].md` |
| 데이터/파이프라인 기술 | `development/` |
| 법적 리스크 | `law_risk/` |
| 마케팅 채널/콘텐츠 | `marketing/` |
| 운영 정책/비용 | `operations/` |
| 세금/사업자 | `tax/` |
