# Discord 알림 — 개발자(관리자) 전용

> 일반 사용자용 Discord 알림은 [discord_alert.md](../discord_alert.md) 참조.
> 이 문서는 **관리자 채널**로만 전송되는 알림을 다룬다.

---

## 이 알림의 역할

파이프라인 실행 상태와 **공개 채널에서 제외된 모든 비공개 티커의 추세 신호**를 관리자에게 전달한다.
일반 사용자에게는 절대 노출되지 않는다.

> **원칙**: 공개 서비스에서 숨겨진 티커(레버리지·인버스 ETF 전체)와 S&P 500 개별주 추세 신호 모두 이 관리자 채널 하나로 수신한다.

**신호 대상:**
- 지수·섹터 레버리지 ETF (TQQQ, UPRO, SOXL 등)
- 지수·섹터 인버스 ETF (SQQQ, SDS, SOXS 등)
- 단일종목 레버리지 ETF (TSLL, NVDL, AAPU, MSFU 등)
- 단일종목 인버스 ETF (TSLS, NVDD, AAPD, MSFD 등)
- **S&P 500 개별주** (앗추 필터 200일 기준, `pipeline_stock.sh`에서 전송)

---

## 발송 채널

| 환경변수 | 알림 유형 |
|---------|----------|
| `DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL` | **시스템 알림** (파이프라인 상태) + **신호 알림** (추세 변화) |

두 유형은 성격이 다르지만 같은 채널로 수신한다.
- **시스템 알림**: `[타임스탬프] 이벤트명` 형식, 파이프라인 실행 흐름 추적용
- **신호 알림**: `# [관리자] 추세 변화 알림` 형식, 투자 판단용 추세 신호

> 이전에 사용하던 `DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL`(시스템 알림 전용)은 제거되었다.

---

## 알림 1. 파이프라인 상태 메시지

### 발송 조건

파이프라인 실행 중 각 단계마다 자동 발송. 상태 메시지 형식은 모두 동일.

### 메시지 포맷

```
[YYYY/MM/DD HH:MM:SS] {메시지}
```

> `notify()`가 RUN_ID 접두어(`[YYYYMMDD-HHMMSS-PID]`)를 제거하고 사람이 읽기 좋은 timestamp로 교체 후 `DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL`로 전송.

### 발송되는 메시지 목록

| 메시지 | 발송 시점 |
|--------|----------|
| `PIPELINE START` | 파이프라인 시작 (pipeline.sh) |
| `NOTIFICATIONS START` | Discord 알림 발송 시작 |
| `DAILY SUMMARY SENT \| date=YYYY-MM-DD` | 일간 리포트 발송 성공 |
| `TREND NOTIFY SENT` | 추세 변화 알림 발송 성공 |
| `TREND NOTIFY FAIL \| reason=webhook_post_error` | 추세 변화 알림 발송 실패 |
| `NOTIFICATIONS DONE` | Discord 알림 발송 완료 |

### 예시

```
[2026/03/13 16:35:12] PIPELINE START
[2026/03/13 16:38:45] NOTIFICATIONS START
[2026/03/13 16:38:46] DAILY SUMMARY SENT | date=2026-03-13
[2026/03/13 16:38:47] TREND NOTIFY SENT
[2026/03/13 16:38:48] NOTIFICATIONS DONE
```

---

## 알림 2. 개발자 추세 변화 신호

### 목적

공개 채널에서 제외된 모든 티커의 앗추 필터 진입/이탈 신호를 관리자에게만 **하나의 메시지**로 전달한다.

### 발송 대상 및 조건

레버리지·인버스 ETF와 S&P 500 개별주 신호를 **합쳐서 한 번에** `pipeline_stock.sh`에서 전송한다.

- 최근 5거래일 내 앗추 필터(200일, 16/20 규칙) 진입 또는 이탈이 1건이라도 있을 때만 발송
- 레버리지·인버스 소스: `data/tickers/private/leverage.json`, `inverse.json`, `stock_leverage.json`, `stock_inverse.json`
- 개별주 소스: `data/tickers_stock/sp500.json`
- 1800자 초과 시 자동 청크 분할 전송

### 메시지 포맷

```
# [관리자] 추세 변화 알림 (최근 5거래일)

## 레버리지·인버스 추세 진입
- TQQQ (기술) — 03/13
- TSLL (Tesla 2x Bull) — 03/13

## 레버리지·인버스 추세 이탈
- SQQQ (기술) — 03/13
- NVDD (Nvidia 1x Bear) — 03/13

## 개별주 추세 진입
- AAPL (Apple Inc.) — 03/13

## 개별주 추세 이탈
- TSLA (Tesla, Inc.) — 03/13

자세히 보기: https://atchu-fe.vercel.app/_stocks

※ 참고용 지표이며 투자 조언이 아닙니다.
```
> `send_dev_trend_webhook()` 직접 호출 (timestamp 없음)

변화 없는 섹션(레버리지·인버스 또는 개별주)은 해당 섹션 자체를 생략한다.

### 공개 알림과의 차이

| 항목 | 공개 채널 | 개발자 채널 |
|------|----------|------------|
| 대상 티커 | 레버리지·인버스·개별주 제외 | 레버리지·인버스 + 개별주 |
| 발송 시점 | ETF 파이프라인 완료 후 | 개별주 파이프라인 완료 후 (통합) |
| 발송 채널 | `DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL` | `DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL` |

---

## 기술 구현

### 코드 위치

| 파일 | 역할 |
|------|------|
| `02_fe_react/data/scripts/lib/common.sh` | `notify()` — 파이프라인 상태 메시지 전송 (`DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL`) |
| `02_fe_react/data/scripts/lib/notify.sh` | `send_trend_change_notifications()` — 레버리지·인버스 adminMarkdownBody 생성·저장 (전송 안 함) |
| `02_fe_react/data/scripts/pipeline_stock.sh` | `generate_stock_trend_notifications_file()` — 개별주 + 레버리지·인버스 통합 메시지 생성 및 전송 (`DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL`) |

### 실행 흐름

```
pipeline.sh
  → send_all_notifications()
      → notify "[RUN_ID] NOTIFICATIONS START"
      → send_daily_snapshot_summary()
          → notify "[RUN_ID] DAILY SUMMARY SENT | date=..."
      → send_trend_change_notifications()
          → (공개 채널) send_trend_notification_webhook()  → notify "[RUN_ID] TREND NOTIFY SENT"
          → adminMarkdownBody를 trend_notifications.json에 저장만 (전송 안 함)
      → notify "[RUN_ID] NOTIFICATIONS DONE"
  → pipeline_stock.sh                                      # ETF 완료 후 자동 호출
      → generate_stock_trend_notifications_file()
          → trend_notifications.json에서 adminMarkdownBody 읽기 (레버리지·인버스)
          → 개별주 신호와 합쳐서 통합 메시지 생성
          → (관리자 채널) send_dev_trend_webhook "${chunk}"  # 변화 있을 때만, 청크 분할
```

### `notify()` 동작 방식

```bash
# RUN_ID 접두어 제거 후 timestamp 추가
message="$(sed -E 's/^\[[0-9]{8}-[0-9]{6}-[0-9]+\][[:space:]]*//' <<< "$message")"
stamped="[$(date '+%Y/%m/%d %H:%M:%S')] ${message}"
# DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL로 POST
```

추세 통합 알림(`combined_body`)은 `pipeline_stock.sh`에서 `send_dev_trend_webhook()`으로 직접 전송하므로 timestamp가 붙지 않는다.

---

## 현재 구현 상태

**시스템 알림** (파이프라인 상태 추적)
- [x] PIPELINE START / NOTIFICATIONS START·DONE / DAILY SUMMARY SENT / TREND NOTIFY SENT·FAIL

**신호 알림** (추세 변화)
- [x] 레버리지·인버스 + 개별주 추세 변화 신호 통합 — 변화 있을 때만 발송, 1800자 청크 분할
- [x] 통합 메시지 포맷 (`# [관리자] 추세 변화 알림 ...`)

**채널**
- [x] 두 유형 모두 `DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL` 단일 채널로 수신
