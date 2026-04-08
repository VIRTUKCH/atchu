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

| 환경변수 | 채널 | 용도 |
|---------|------|------|
| `DISCORD_ATCHU_ADMIN_CHANNEL_WEBHOOK_URL` | 관리자 채널 | 파이프라인 상태 메시지 |
| `DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL` | 개발자 추세 채널 | 레버리지·인버스 + 개별주 추세 변화 신호 |

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

## 알림 2. 개발자 추세 변화 신호

### 목적

공개 채널에서 제외된 모든 티커의 앗추 필터 진입/이탈 신호를 관리자에게만 전달한다.

### 발송 대상 및 조건

**2-A. 레버리지·인버스 ETF** (`notify.sh`에서 전송)
- 최근 5거래일 내 앗추 필터(200일, 16/20 규칙) 진입 또는 이탈이 1건이라도 있을 때만 발송
- 티커 소스: `data/tickers/private/leverage.json`, `inverse.json`, `stock_leverage.json`, `stock_inverse.json`

**2-B. S&P 500 개별주** (`pipeline_stock.sh`에서 전송)
- 최근 5거래일 내 앗추 필터(200일) 진입 또는 이탈이 1건이라도 있을 때만 발송
- 1800자 초과 시 자동 청크 분할 전송

### 메시지 포맷

**레버리지·인버스:**
```
[YYYY/MM/DD HH:MM:SS] # [관리자] 레버리지·인버스 추세 변화 (최근 5거래일)

## 추세 진입
- TQQQ (기술) — 03/13
- TSLL (Tesla 2x Bull) — 03/13

## 추세 이탈
- SQQQ (기술) — 03/13
- NVDD (Nvidia 1x Bear) — 03/13
```
> `send_webhook()` 경유 → timestamp 자동 부착

**개별주:**
```
# [개별주] 추세 변화 알림 (최근 5거래일)

## 추세 진입 감지 (앗추 필터 200일)
- AAPL (Apple Inc.) — 03/13

## 추세 이탈 감지 (앗추 필터 200일)
- TSLA (Tesla, Inc.) — 03/13

자세히 보기: https://atchu-fe.vercel.app/_stocks

※ 참고용 지표이며 투자 조언이 아닙니다.
```
> `send_webhook()` 경유 → timestamp 자동 부착

### 공개 알림과의 차이

| 항목 | 공개 채널 | 개발자 채널 |
|------|----------|------------|
| 대상 티커 | 레버리지·인버스·개별주 제외 | 레버리지·인버스 + 개별주 |
| 면책 문구 | 포함 | 개별주 알림에만 포함 |
| 발송 채널 | `DISCORD_ATCHU_NEW_TREND_NOTIFICATION_WEBHOOK_URL` | `DISCORD_ATCHU_DEV_TREND_WEBHOOK_URL` |

---

## 기술 구현

### 코드 위치

| 파일 | 역할 |
|------|------|
| `02_fe_react/data/scripts/lib/common.sh` | `send_webhook()` — 관리자 채널 전송 유틸, timestamp 포맷 처리 |
| `02_fe_react/data/scripts/lib/notify.sh` | `send_trend_change_notifications()` — 레버리지·인버스 adminBody 생성 및 전송 |
| `02_fe_react/data/scripts/pipeline_stock.sh` | `generate_stock_trend_notifications_file()` — 개별주 알림 JSON 생성 및 관리자 채널 전송 |

### 실행 흐름

```
pipeline.sh
  → send_all_notifications()
      → notify "[RUN_ID] NOTIFICATIONS START"
      → send_daily_snapshot_summary()
          → notify "[RUN_ID] DAILY SUMMARY SENT | date=..."
      → send_trend_change_notifications()
          → (공개 채널) send_trend_notification_webhook()  → notify "[RUN_ID] TREND NOTIFY SENT"
          → (관리자 채널) notify "${admin_body}"            # 레버리지·인버스, 변화 있을 때만
      → notify "[RUN_ID] NOTIFICATIONS DONE"
  → pipeline_stock.sh                                      # ETF 완료 후 자동 호출
      → generate_stock_trend_notifications_file()
          → (관리자 채널) send_webhook "${chunk}"         # 개별주, 변화 있을 때만, 청크 분할
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
- [x] S&P 500 개별주 추세 변화 신호 — 변화 있을 때만 발송, 1800자 청크 분할
