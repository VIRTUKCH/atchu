# 섹터 로테이션 — `/_quant/sector` (예정)

> 상위 문서: [퀀트 허브 index.md](index.md)

채호님이 개발 중인 자체 전략. 상세 설계는 전략 정의 후 추가 예정.

## 방향성 (확정 전)

- GICS 섹터 ETF 기반 모멘텀/로테이션 전략
- ETF CSV 데이터 활용 (BAA와 동일한 파이프라인 패턴)
- 상세 설계: 전략 룰이 확정되면 이 문서에 추가

## 예상 구조

BAA와 동일한 패턴:

1. 파이프라인 스크립트 (`generate_sector_signal.mjs`)
2. JSON 출력 (`data/summary/sector/sector_signal.json`)
3. 프론트엔드 상세 페이지 (`SectorStrategyPage.jsx`)
4. 데이터 로더 (`sectorDataLoaders.js`)
5. `quantItems.js`에서 status를 `"active"`로 변경
