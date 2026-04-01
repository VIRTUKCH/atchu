# Discord 알림 — 개발자(관리자) 전용

> 일반 사용자용 Discord 알림은 [discord_alert.md](../discord_alert.md) 참조.
> 이 문서는 **관리자 채널**로만 전송되는 알림을 다룬다.

---

## 이 알림의 역할

파이프라인 실행 상태와 공개 채널에서 제외된 레버리지·인버스 ETF 추세 신호를 관리자에게 전달한다.
일반 사용자에게는 절대 노출되지 않는다.

---

## 발송 채널

| 환경변수 | 채널 |
|---------|------|
| `DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL` | 관리자 전용 채널 (유일) |

모든 관리자 알림은 이 채널 하나로 전송된다.

---

## 알림 1. 파이프라인 상태 메시지

### 발송 조건

파이프라인 실행 중 각 단계마다 자동 발송. 상태 메시지 형식은 모두 동일.

### 메시지 포맷

```
[YYYY/MM/DD HH:MM:SS] {메시지}
```

> `send_webhook()`이 RUN_ID 접두어(`[YYYYMMDD-HHMMSS-PID]`)를 제거하고 사람이 읽기 좋은 timestamp로 교체한다.

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

## 알림 2. 레버리지·인버스 추세 변화 신호

### 목적

공개 채널에서 제외된 레버리지·인버스 ETF의 앗추 필터 진입/이탈 신호를 관리자에게만 전달한다.
방향성 왜곡과 초보자 보호를 위해 공개 채널에서는 완전 제외.

### 발송 조건

- 최근 5거래일 내 레버리지·인버스 티커의 앗추 필터(200일, 16/20 규칙) 진입 또는 이탈이 **1건이라도 있을 때만** 발송
- 변화가 없으면 발송하지 않음

### 티커 소스

`02_fe_react/data/tickers/private/` 디렉터리의 JSON 파일들 (inverse.json, leverage.json).
공개 tickers/ 와 분리되어 있으며 git 추적 제외 대상이 아님.

### 메시지 포맷

```
[YYYY/MM/DD HH:MM:SS] # [관리자] 레버리지·인버스 추세 변화 (최근 5거래일)

## 추세 진입
- TQQQ (기술) — 03/13
- SOXL (반도체) — 03/12

## 추세 이탈
- SQQQ (기술) — 03/13
```

> `send_webhook()`을 통해 전송되므로 앞에 timestamp가 자동으로 붙는다.
> `adminMarkdownBody`가 빈 문자열이면 발송하지 않는다.

### 공개 알림과의 차이

| 항목 | 공개 채널 | 관리자 채널 |
|------|----------|------------|
| 대상 티커 | 레버리지·인버스 제외 | 레버리지·인버스만 |
| 면책 문구 | 포함 | 없음 |
| 발송 채널 | `DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL` | `DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL` |

---

## 기술 구현

### 코드 위치

| 파일 | 역할 |
|------|------|
| `02_fe_react/data/scripts/lib/common.sh` | `send_webhook()` — 관리자 채널 전송 유틸, timestamp 포맷 처리 |
| `02_fe_react/data/scripts/lib/notify.sh` | `send_trend_change_notifications()` — 레버리지·인버스 adminBody 생성 및 전송 |

### 실행 흐름

```
send_all_notifications()
  → notify "[RUN_ID] NOTIFICATIONS START"
  → send_daily_snapshot_summary()
      → notify "[RUN_ID] DAILY SUMMARY SENT | date=..."
  → send_trend_change_notifications()
      → (공개 채널) send_trend_notification_webhook()  → notify "[RUN_ID] TREND NOTIFY SENT"
      → (관리자 채널) notify "${admin_body}"            # 변화 있을 때만
  → notify "[RUN_ID] NOTIFICATIONS DONE"
```

### `send_webhook()` 동작 방식

```bash
# RUN_ID 접두어 제거 후 timestamp 추가
message="$(sed -E 's/^\[[0-9]{8}-[0-9]{6}-[0-9]+\][[:space:]]*//' <<< "$message")"
stamped="[$(date '+%Y/%m/%d %H:%M:%S')] ${message}"
```

레버리지·인버스 알림(`admin_body`)은 `# [관리자]...`로 시작하므로 RUN_ID 제거 패턴과 매칭되지 않아 그대로 전송된다.

---

## 현재 구현 상태

- [x] 파이프라인 상태 메시지 (PIPELINE START / NOTIFICATIONS START·DONE / DAILY SUMMARY SENT / TREND NOTIFY SENT·FAIL)
- [x] 레버리지·인버스 추세 변화 신호 — 변화 있을 때만 발송
- [x] 레버리지·인버스 알림 메시지 포맷 (`# [관리자] ...`)
