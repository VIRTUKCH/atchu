import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/bento.css";
import "../styles/report.css";
import MainMarketStatusGrid from "../components/main/MainMarketStatusGrid";
import MarketHeatmap from "../components/market/MarketHeatmap";


const PERIOD_TABS = [
  { key: "ma200", label: "이격률" },
  { key: "1d", label: "일간" },
  { key: "5d", label: "주간" },
  { key: "21d", label: "1개월" },
  { key: "63d", label: "3개월" },
  { key: "252d", label: "1년" },
  { key: "1260d", label: "5년" }
];

const DISCORD_URL =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

const DAY_OF_WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];

const formatDateLabel = (dateStr) => {
  if (!dateStr) return dateStr;
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${dateStr} (${DAY_OF_WEEK_KO[date.getDay()]})`;
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return `${parts[1]}-${parts[2]}`;
};

const scrollToHeatmapGroup = (type) => {
  const el = document.querySelector(`[data-heatmap-group="${type}"], [data-heatmap-group-alt="${type}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function MarketOverviewPage({
  latestSnapshotPayload,
  overviewTickers,
  latestTrendNotificationPayload,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("ma200");
  const snapshotTickersData = latestSnapshotPayload?.tickers || {};

  // 추세 강도 계산 (앗추 필터 통과 기준, 기간 탭과 무관)
  const TREND_EXCLUDE_GROUPS = new Set(["레버리지", "인버스", "기타"]);
  const typeStatusItems = useMemo(() => {
    const typeMap = {};
    (overviewTickers || []).forEach((item) => {
      const group = item.group;
      if (!group || TREND_EXCLUDE_GROUPS.has(group)) return;
      if (!typeMap[group]) typeMap[group] = { qualified: 0, total: 0 };
      const tickerKey = String(item.ticker || "").toUpperCase();
      const snap = snapshotTickersData[tickerKey]?.snapshot;
      if (!snap) return;
      typeMap[group].total += 1;
      if (snap.isAtchuQualified200 === true) typeMap[group].qualified += 1;
    });

    return Object.entries(typeMap)
      .map(([type, data]) => [
        type,
        { above: data.qualified, total: data.total }
      ])
      .filter(([, data]) => data.total > 0);
  }, [latestSnapshotPayload, overviewTickers]);

  const { recentTradingDates, rules } = latestTrendNotificationPayload || {};

  // 최근 신호에서 제외할 티커 Set (기존 JSON 호환 안전망 — 레버리지·인버스)
  const excludedSignalTickers = useMemo(() => {
    const set = new Set();
    (overviewTickers || []).forEach((item) => {
      if (TREND_EXCLUDE_GROUPS.has(item.group))
        set.add(String(item.ticker || "").toUpperCase());
    });
    return set;
  }, [overviewTickers]);

  // 최근 신호: 전체 룰의 진입/이탈을 날짜+티커로 평탄화
  const { allEntries, allExits } = useMemo(() => {
    const entries = [];
    const exits = [];
    (rules || []).forEach((rule) => {
      (rule.entries || []).forEach((e) => {
        (e.tickers || []).forEach((t) => {
          if (!excludedSignalTickers.has(String(t).toUpperCase()))
            entries.push({ ticker: t, date: e.date });
        });
      });
      (rule.exits || []).forEach((e) => {
        (e.tickers || []).forEach((t) => {
          if (!excludedSignalTickers.has(String(t).toUpperCase()))
            exits.push({ ticker: t, date: e.date });
        });
      });
    });
    // 최신 날짜 먼저
    entries.sort((a, b) => b.date.localeCompare(a.date));
    exits.sort((a, b) => b.date.localeCompare(a.date));
    return { allEntries: entries, allExits: exits };
  }, [rules, excludedSignalTickers]);

  // 날짜 범위 라벨
  const dateRangeLabel = useMemo(() => {
    if (recentTradingDates && recentTradingDates.length > 0) {
      const sorted = [...recentTradingDates].sort();
      return `${formatShortDate(sorted[0])} ~ ${formatShortDate(sorted[sorted.length - 1])}`;
    }
    return null;
  }, [recentTradingDates]);

  // ticker → metadata 룩업맵
  const tickerMetaMap = useMemo(() => {
    const m = {};
    (overviewTickers || []).forEach((item) => {
      if (item.ticker) m[item.ticker.toUpperCase()] = item;
    });
    return m;
  }, [overviewTickers]);
  const badgeLabel = (t) => {
    const meta = tickerMetaMap[t.toUpperCase()];
    return meta?.nameKo ? `${t}(${meta.nameKo})` : t;
  };

  const GOLD_TICKERS = new Set(["SPY", "QQQ", "DIA"]);
  const isGold = (t) => GOLD_TICKERS.has(t.toUpperCase());

  return (
    <div className="market-overview-page">
      {/* ① 최근 신호 */}
      <div className="bento-card">
        <div className="bento-card-title">
          최근 신호
          <span
            className="info-tooltip"
            data-tooltip="최근 20거래일 중 16일 이상 200일선 위에 있을 때 '진입', 이 조건을 벗어나면 '이탈'입니다. 앗추 필터 기반 신호입니다."
          >?</span>
        </div>
        <div className="bento-card-subtitle">
          {`최근 5거래일 앗추 필터 진입·이탈 변화${dateRangeLabel ? ` · ${dateRangeLabel}` : ''}`}
        </div>
        {allEntries.length === 0 && allExits.length === 0 ? (
          <div className="trend-no-change">최근 5거래일 변동 없음</div>
        ) : (
          <div className="trend-signal-columns">
            <div className="trend-signal-column">
              <div className="trend-column-header entry">진입</div>
              {allEntries.length === 0 ? (
                <div className="trend-column-empty">없음</div>
              ) : (
                <div className="trend-column-list">
                  {allEntries.map((item) => (
                    <Link key={`${item.ticker}-${item.date}`} to={`/trend_list/${item.ticker}`} className={`trend-signal-item entry${isGold(item.ticker) ? " gold" : ""}`}>
                      <span className="trend-signal-item-name">{badgeLabel(item.ticker)}</span>
                      <span className="trend-signal-item-date">{formatShortDate(item.date)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="trend-signal-column">
              <div className="trend-column-header exit">이탈</div>
              {allExits.length === 0 ? (
                <div className="trend-column-empty">없음</div>
              ) : (
                <div className="trend-column-list">
                  {allExits.map((item) => (
                    <Link key={`${item.ticker}-${item.date}`} to={`/trend_list/${item.ticker}`} className={`trend-signal-item exit${isGold(item.ticker) ? " gold" : ""}`}>
                      <span className="trend-signal-item-name">{badgeLabel(item.ticker)}</span>
                      <span className="trend-signal-item-date">{formatShortDate(item.date)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* A: 최근 신호 인라인 면책 */}
        <p className="trend-signal-disclaimer">
          앗추 필터 상태 변화를 나타냅니다. 매수·매도를 권유하지 않으며, 투자 결정의 책임은 본인에게 있습니다.
        </p>
      </div>

      {/* Discord 알림 CTA */}
      {DISCORD_URL && (
        <div className="bento-card discord-cta-card">
          <div className="discord-cta-text">
            <div className="discord-cta-title">매일 아침 추세 알림</div>
            <div className="discord-cta-desc">
              앗추 필터 신호가 바뀔 때 디스코드로 알려드립니다
            </div>
          </div>
          <a
            className="discord-cta-button"
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
          >
            디스코드 입장하기
          </a>
        </div>
      )}

      {/* ③ 추세 강도 */}
      <div className="bento-card">
        <div className="bento-card-title">추세 강도</div>
        <div className="bento-card-subtitle">
          앗추 필터를 통과한 ETF 비율로 자산군별 추세를 한눈에 파악합니다
        </div>
        <MainMarketStatusGrid items={typeStatusItems} onTypeSelect={scrollToHeatmapGroup} />
      </div>

      {/* ④ 시장 히트맵 + 기간별 비교 탭 */}
      <div className="bento-card">
        <div className="bento-card-title">시장 히트맵</div>
        <div className="heatmap-period-tabs">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`heatmap-period-tab${selectedPeriod === tab.key ? " active" : ""}`}
              onClick={() => setSelectedPeriod(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <MarketHeatmap
          snapshotPayload={latestSnapshotPayload}
          overviewTickers={overviewTickers || []}
          periodKey={selectedPeriod}
        />
      </div>

      {/* B: 페이지 하단 전체 면책 */}
      <p className="market-overview-disclaimer">
        본 서비스는 투자 참고용 데이터이며, 매수·매도를 권유하지 않습니다.<br />
        과거 추세 기반 지표이며, 미래 결과를 보장하지 않습니다.<br />
        실제 거래 시 세금·수수료·슬리피지로 인해 결과가 달라질 수 있습니다.<br />
        투자 결정과 책임은 전적으로 본인에게 있습니다.
      </p>
    </div>
  );
}
