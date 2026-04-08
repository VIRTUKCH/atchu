import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/bento.css";
import "../styles/report.css";
import MainMarketStatusGrid from "../components/main/MainMarketStatusGrid";
import StockHeatmap from "../components/market/StockHeatmap";
import {
  stockSnapshotPayload,
  stockTrendNotificationPayload,
  stockOverviewTickers,
  stockTickerMetaMap
} from "../utils/stockDataLoaders";
import {
  latestTrendNotificationPayload,
  privateTickerModules,
  latestSnapshotPayload
} from "../utils/dataLoaders";

// 레버리지·인버스 private 티커 메타 (모듈 레벨, 1회 빌드)
const privateTickerMeta = (() => {
  const map = new Map();
  Object.values(privateTickerModules).forEach((mod) => {
    const items = Array.isArray(mod) ? mod : (mod?.items || []);
    items.forEach((item) => {
      if (item?.ticker) map.set(item.ticker.toUpperCase(), item);
    });
  });
  return map;
})();

const PRIVATE_GROUP_DEFS = [
  { typeKey: "레버리지",     label: "지수·섹터 레버리지" },
  { typeKey: "인버스",       label: "지수·섹터 인버스" },
  { typeKey: "개별주레버리지", label: "개별주 레버리지" },
  { typeKey: "개별주인버스",  label: "개별주 인버스" },
];

const privateTickersByGroup = (() => {
  const groups = Object.fromEntries(PRIVATE_GROUP_DEFS.map((g) => [g.typeKey, []]));
  privateTickerMeta.forEach((item) => {
    if (groups[item.type]) groups[item.type].push(item);
  });
  return groups;
})();

const PERIOD_TABS = [
  { key: "ma200", label: "이격률" },
  { key: "1d", label: "일간" },
  { key: "5d", label: "주간" },
  { key: "21d", label: "1개월" },
  { key: "63d", label: "3개월" },
  { key: "252d", label: "1년" },
  { key: "1260d", label: "5년" }
];

// GICS 11개 섹터 (서브섹터는 각 섹터 내부에서 관리)
const SECTOR_ORDER = [
  "기술", "헬스케어", "금융", "산업재", "임의소비재",
  "필수소비재", "통신", "에너지", "유틸리티", "부동산", "소재"
];
const SECTOR_ORDER_MAP = Object.fromEntries(SECTOR_ORDER.map((s, i) => [s, i]));

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return `${parts[1]}-${parts[2]}`;
};

export default function StockOverviewPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("ma200");
  const snapshotTickersData = stockSnapshotPayload?.tickers || {};

  // 섹터별 추세 강도 (서브섹터 포함)
  const sectorStatusItems = useMemo(() => {
    const sectorMap = {};
    stockOverviewTickers.forEach((item) => {
      const group = item.group;
      const subGroup = item.subGroup;
      if (!group) return;
      if (!sectorMap[group]) sectorMap[group] = { qualified: 0, total: 0, diffSum: 0, diffCount: 0, subs: {} };
      const tickerKey = String(item.ticker || "").toUpperCase();
      const snap = snapshotTickersData[tickerKey]?.snapshot;
      if (!snap) return;
      sectorMap[group].total += 1;
      if (snap.isAtchuQualified200 === true) sectorMap[group].qualified += 1;
      const diff200 = snap.percentDiff200;
      if (typeof diff200 === "number" && isFinite(diff200)) {
        sectorMap[group].diffSum += diff200;
        sectorMap[group].diffCount += 1;
      }
      // 서브섹터 집계
      if (subGroup) {
        if (!sectorMap[group].subs[subGroup]) sectorMap[group].subs[subGroup] = { qualified: 0, total: 0, diffSum: 0, diffCount: 0 };
        sectorMap[group].subs[subGroup].total += 1;
        if (snap.isAtchuQualified200 === true) sectorMap[group].subs[subGroup].qualified += 1;
        if (typeof diff200 === "number" && isFinite(diff200)) {
          sectorMap[group].subs[subGroup].diffSum += diff200;
          sectorMap[group].subs[subGroup].diffCount += 1;
        }
      }
    });
    return Object.entries(sectorMap)
      .map(([type, data]) => {
        const avgDiff200 = data.diffCount > 0 ? +(data.diffSum / data.diffCount).toFixed(2) : null;
        const subSectors = Object.entries(data.subs)
          .map(([name, s]) => ({
            name,
            above: s.qualified,
            total: s.total,
            avgDiff200: s.diffCount > 0 ? +(s.diffSum / s.diffCount).toFixed(2) : null,
          }))
          .sort((a, b) => {
            const pctA = a.total > 0 ? a.above / a.total : 0;
            const pctB = b.total > 0 ? b.above / b.total : 0;
            return pctB - pctA;
          });
        return [type, { above: data.qualified, total: data.total, avgDiff200, subSectors }];
      })
      .filter(([, data]) => data.total > 0)
      .sort((a, b) => {
        const pctA = a[1].total > 0 ? a[1].above / a[1].total : 0;
        const pctB = b[1].total > 0 ? b[1].above / b[1].total : 0;
        return pctB - pctA;
      });
  }, [snapshotTickersData]);

  // 전체 시장 폭 요약
  const marketBreadth = useMemo(() => {
    let total = 0;
    let qualified = 0;
    sectorStatusItems.forEach(([, data]) => {
      total += data.total;
      qualified += data.above;
    });
    return { total, qualified, pct: total > 0 ? Math.round((qualified / total) * 100) : 0 };
  }, [sectorStatusItems]);

  const { recentTradingDates, rules } = stockTrendNotificationPayload || {};

  const { allEntries, allExits } = useMemo(() => {
    const entries = [];
    const exits = [];
    (rules || []).forEach((rule) => {
      (rule.entries || []).forEach((e) => {
        (e.tickers || []).forEach((t) => entries.push({ ticker: t, date: e.date, isPrivate: false }));
      });
      (rule.exits || []).forEach((e) => {
        (e.tickers || []).forEach((t) => exits.push({ ticker: t, date: e.date, isPrivate: false }));
      });
    });
    // 레버리지·인버스 admin 신호 합산
    (latestTrendNotificationPayload?.rules || []).forEach((rule) => {
      (rule.adminEntries || []).forEach((e) => {
        (e.tickers || []).forEach((t) => {
          const type = privateTickerMeta.get(t.toUpperCase())?.type || "";
          const isInverse = type.includes("인버스");
          entries.push({ ticker: t, date: e.date, isPrivate: true, isInverse });
        });
      });
      (rule.adminExits || []).forEach((e) => {
        (e.tickers || []).forEach((t) => {
          const type = privateTickerMeta.get(t.toUpperCase())?.type || "";
          const isInverse = type.includes("인버스");
          exits.push({ ticker: t, date: e.date, isPrivate: true, isInverse });
        });
      });
    });
    entries.sort((a, b) => b.date.localeCompare(a.date));
    exits.sort((a, b) => b.date.localeCompare(a.date));
    return { allEntries: entries, allExits: exits };
  }, [rules]);

  // 섹션5: 레버리지·인버스 현황 (그룹별 정렬 — 진입 먼저)
  const privateTrendGroups = useMemo(() => {
    const snapshotTickers = latestSnapshotPayload?.tickers || {};
    return PRIVATE_GROUP_DEFS.map(({ typeKey, label }) => {
      const items = (privateTickersByGroup[typeKey] || []).map((meta) => {
        const ticker = meta.ticker.toUpperCase();
        const snap = snapshotTickers[ticker]?.snapshot || null;
        const isQualified = snap?.isAtchuQualified200 ?? null;
        const maDist = Number.isFinite(Number(snap?.percentDiff200)) ? Number(snap.percentDiff200) : null;
        return { ticker, nameKo: meta.name_ko || meta.ticker, businessArea: meta.business_area || "", isQualified, maDist, snap };
      });
      items.sort((a, b) => {
        if (a.isQualified === b.isQualified) return a.ticker.localeCompare(b.ticker);
        if (a.isQualified === true) return -1;
        if (b.isQualified === true) return 1;
        return 0;
      });
      return { typeKey, label, items };
    });
  }, []);

  const dateRangeLabel = useMemo(() => {
    if (recentTradingDates && recentTradingDates.length > 0) {
      const sorted = [...recentTradingDates].sort();
      return `${formatShortDate(sorted[0])} ~ ${formatShortDate(sorted[sorted.length - 1])}`;
    }
    return null;
  }, [recentTradingDates]);

  const badgeLabel = (t) => {
    const key = t.toUpperCase();
    const stockMeta = stockTickerMetaMap.get(key);
    if (stockMeta?.nameKo) return `${t}(${stockMeta.nameKo})`;
    const privMeta = privateTickerMeta.get(key);
    if (privMeta?.name_ko) return `${t}(${privMeta.name_ko})`;
    return t;
  };

  return (
    <div className="market-overview-page">
      {/* 시장 폭 요약 */}
      <div className="bento-card">
        <div className="bento-card-title">S&P 500 시장 폭</div>
        <div className="bento-card-subtitle">
          {marketBreadth.total}개 종목 중{" "}
          <strong style={{ color: marketBreadth.pct >= 50 ? "#16a34a" : "#dc2626" }}>
            {marketBreadth.qualified}개 ({marketBreadth.pct}%)
          </strong>{" "}
          앗추 필터 통과
        </div>
      </div>

      {/* 최근 신호 */}
      <div className="bento-card">
        <div className="bento-card-title">
          최근 신호
          <span
            className="info-tooltip"
            data-tooltip="최근 20거래일 중 16일 이상 200일선 위에 있을 때 '진입', 이 조건을 벗어나면 '이탈'입니다."
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
              <div className="trend-column-header entry">진입 ({allEntries.length})</div>
              {allEntries.length === 0 ? (
                <div className="trend-column-empty">없음</div>
              ) : (
                <div className="trend-column-list">
                  {allEntries.map((item) => (
                    <Link key={`${item.ticker}-${item.date}-${item.isPrivate}`} to={`/_dev_trend_list/${item.ticker}`} className={`trend-signal-item entry${item.isPrivate ? " private" : ""}`}>
                      <span className="trend-signal-item-name">
                        {item.isPrivate && <span className={`private-badge${item.isInverse ? " inv" : ""}`}>{item.isInverse ? "INV" : "LVG"}</span>}
                        {badgeLabel(item.ticker)}
                      </span>
                      <span className="trend-signal-item-date">{formatShortDate(item.date)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="trend-signal-column">
              <div className="trend-column-header exit">이탈 ({allExits.length})</div>
              {allExits.length === 0 ? (
                <div className="trend-column-empty">없음</div>
              ) : (
                <div className="trend-column-list">
                  {allExits.map((item) => (
                    <Link key={`${item.ticker}-${item.date}-${item.isPrivate}`} to={`/_dev_trend_list/${item.ticker}`} className={`trend-signal-item exit${item.isPrivate ? " private" : ""}`}>
                      <span className="trend-signal-item-name">
                        {item.isPrivate && <span className={`private-badge${item.isInverse ? " inv" : ""}`}>{item.isInverse ? "INV" : "LVG"}</span>}
                        {badgeLabel(item.ticker)}
                      </span>
                      <span className="trend-signal-item-date">{formatShortDate(item.date)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 섹터별 추세 강도 */}
      <div className="bento-card">
        <div className="bento-card-title">섹터별 추세 강도</div>
        <div className="bento-card-subtitle">
          앗추 필터를 통과한 종목 비율로 섹터별 추세를 파악합니다
        </div>
        <MainMarketStatusGrid
          items={sectorStatusItems}
          onTypeSelect={(type) => {
            const el = document.querySelector(`[data-heatmap-group="${type}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onSubSelect={(sector, sub) => {
            const el = document.querySelector(`[data-heatmap-group="${sector}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>

      {/* 레버리지·인버스 현황 */}
      <div className="bento-card">
        <div className="bento-card-title">레버리지·인버스 현황</div>
        <div className="bento-card-subtitle">앗추 필터 통과 여부 기준 · 진입 중인 항목 먼저 표시</div>
        <div className="leverage-groups">
          {privateTrendGroups.map(({ typeKey, label, items }) => (
            <div key={typeKey} className="leverage-group">
              <div className="leverage-group-label">{label}</div>
              <div className="leverage-group-items">
                {items.map((item) => (
                  <Link
                    key={item.ticker}
                    to={`/_dev_trend_list/${item.ticker}`}
                    className={`leverage-item${item.isQualified === true ? " qualified" : item.maDist !== null && item.maDist >= 0 ? " caution" : " not-qualified"}`}
                  >
                    <span className={`leverage-status-badge${item.isQualified === true ? " in" : item.maDist !== null && item.maDist >= 0 ? " caution" : " out"}`}>
                      {item.isQualified === true ? "통과" : item.maDist !== null && item.maDist >= 0 ? "대기" : "이탈"}
                    </span>
                    <span className="leverage-item-name">{item.ticker}</span>
                    <span className="leverage-item-desc">{item.nameKo}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시장 히트맵 */}
      <div className="bento-card">
        <div className="bento-card-title">S&P 500 히트맵</div>
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
        <StockHeatmap
          snapshotPayload={stockSnapshotPayload}
          overviewTickers={stockOverviewTickers}
          periodKey={selectedPeriod}
          baseLinkPath="/_dev_trend_list"
        />
      </div>
    </div>
  );
}
