# 02_fe_react

## 빌드
```bash
NODE_OPTIONS="--max-old-space-size=8192" vite build
```
CSV 데이터 번들 크기 때문에 8GB 필수. 사용자 요청 시에만 실행.

## 반응형 폰트/크기 규칙
- **패턴**: `clamp(모바일px, calc(기준px + Xvw), PC_px)` — 미디어 쿼리 없이 fluid scaling
- **기준**: 모바일 최소 15px, PC 최소 18px (iPhone SE 375px ~ PC 1440px 기준)
- **예시**: `font-size: clamp(15px, calc(12.4px + 0.7vw), 18px)` — 375px→15px, 1440px→18px 선형 보간

## src/ 디렉터리 구조
```
src/
  App.jsx / main.jsx / styles.css
  pages/
    [기능명]Page.jsx      — 18개 공개 페이지
    columns/             — 50개 칼럼 페이지
  components/
    common/              — 범용 공유 컴포넌트 (JsonLd 등)
    layout/              — 전역 레이아웃 (AppTopNav, AppSidebar, AppFooter, AppDiscordBanner)
    column/              — 칼럼 재사용 UI 26개 (신규 칼럼 작성 시 최대한 활용)
    etf/                 — ETF 관련 (15개: EtfSummaryCard, PriceTrendChart 등)
    trend/               — 추세 조회 관련
    market/              — 시장 개요 관련 (MarketHeatmap, StockHeatmap)
    landing/             — 랜딩 페이지 관련 (9개)
    main/                — 메인 페이지 관련
    auth/                — 인증 (PasswordGate)
    baa/ haa/ faber/ dm/ qvm/ quant/ allw/ business-cycle/  — 퀀트 전략별
  hooks/
  utils/                 — 19개 유틸 함수
  config/
  routes/
  styles/
```

### 컴포넌트 배치 기준
| 상황 | 폴더 |
|------|------|
| 여러 페이지에서 쓰는 범용 UI | `common/` |
| 네비/푸터/배너 등 레이아웃 | `layout/` |
| 칼럼 페이지 전용 재사용 UI | `column/` |
| 특정 퀀트 전략 전용 | `baa/`, `haa/`, `faber/`, `dm/`, `qvm/`, `allw/`, `business-cycle/` |
| 기능/섹션 전용 | `trend/`, `market/`, `etf/`, `landing/`, `main/` |
| 새 퀀트 전략 추가 시 | 전략명으로 새 서브폴더 생성 |

## 개발자 비공개 페이지 — 기술 구현

### 개별주 CSV
- 빌드에 번들하지 않고 `public/csv_stock/`에 정적 에셋으로 배치
- 상세 페이지에서 `fetch()`로 on-demand 로드

### 테마 토글 연타 감지
- `AppTopNav.jsx`의 `handleThemeToggle`에서 3초 내 5회 감지
- 감지 후 `sessionStorage`에 `devMode` 저장

### 파이프라인
- `pipeline.sh` → `pipeline_stock.sh` (ETF 처리 후 자동 호출, 같은 cron)

### GICS 섹터 구조
- 11개 섹터 + 46개 서브섹터
- `sp500.json`의 `type` / `subType` 필드로 구분

### 퀀트 전략 목록 (15개)
BAA-A, BAA-B, HAA, Faber 섹터 모멘텀, 듀얼 모멘텀(GEM/ADM/CDM/섹터), 경기순환 섹터 로테이션, 리스크 패리티/All Weather, CTA(동일가중/CAGR가중), 멀티팩터 QVM(QVM/QVM-EW/QVM-MOM)
