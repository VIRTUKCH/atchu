import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const PERIOD_TABS = [
  { key: "ma200", label: "이격률" },
  { key: "1d", label: "일간" },
  { key: "5d", label: "주간" },
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
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("ma200");
  const snapshotTickersData = stockSnapshotPayload?.tickers || {};

  // 섹터별 추세 강도 (서브섹터 포함)
  const sectorStatusItems = useMemo(() => {
    const sectorMap = {};
    stockOverviewTickers.forEach((item) => {
      const group = item.group;
      const subGroup = item.subGroup;
      if (!group) return;
      if (!sectorMap[group]) sectorMap[group] = { qualified: 0, total: 0, subs: {} };
      const tickerKey = String(item.ticker || "").toUpperCase();
      const snap = snapshotTickersData[tickerKey]?.snapshot;
      if (!snap) return;
      sectorMap[group].total += 1;
      if (snap.isAtchuQualified200 === true) sectorMap[group].qualified += 1;
      // 서브섹터 집계
      if (subGroup) {
        if (!sectorMap[group].subs[subGroup]) sectorMap[group].subs[subGroup] = { qualified: 0, total: 0 };
        sectorMap[group].subs[subGroup].total += 1;
        if (snap.isAtchuQualified200 === true) sectorMap[group].subs[subGroup].qualified += 1;
      }
    });
    return Object.entries(sectorMap)
      .map(([type, data]) => {
        const subSectors = Object.entries(data.subs)
          .map(([name, s]) => ({ name, above: s.qualified, total: s.total }))
          .sort((a, b) => {
            const pctA = a.total > 0 ? a.above / a.total : 0;
            const pctB = b.total > 0 ? b.above / b.total : 0;
            return pctB - pctA;
          });
        return [type, { above: data.qualified, total: data.total, subSectors }];
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
        (e.tickers || []).forEach((t) => entries.push({ ticker: t, date: e.date }));
      });
      (rule.exits || []).forEach((e) => {
        (e.tickers || []).forEach((t) => exits.push({ ticker: t, date: e.date }));
      });
    });
    entries.sort((a, b) => b.date.localeCompare(a.date));
    exits.sort((a, b) => b.date.localeCompare(a.date));
    return { allEntries: entries, allExits: exits };
  }, [rules]);

  const dateRangeLabel = useMemo(() => {
    if (recentTradingDates && recentTradingDates.length > 0) {
      const sorted = [...recentTradingDates].sort();
      return `${formatShortDate(sorted[0])} ~ ${formatShortDate(sorted[sorted.length - 1])}`;
    }
    return null;
  }, [recentTradingDates]);

  const badgeLabel = (t) => {
    const meta = stockTickerMetaMap.get(t.toUpperCase());
    return meta?.nameKo ? `${t}(${meta.nameKo})` : t;
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
                    <Link key={`${item.ticker}-${item.date}`} to={`/_stocks/${item.ticker}`} className="trend-signal-item entry">
                      <span className="trend-signal-item-name">{badgeLabel(item.ticker)}</span>
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
                    <Link key={`${item.ticker}-${item.date}`} to={`/_stocks/${item.ticker}`} className="trend-signal-item exit">
                      <span className="trend-signal-item-name">{badgeLabel(item.ticker)}</span>
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
          onTypeSelect={(type) => navigate(`/_stocks?sector=${encodeURIComponent(type)}`)}
          onSubSelect={(sector, sub) => navigate(`/_stocks?sector=${encodeURIComponent(sector)}&sub=${encodeURIComponent(sub)}`)}
        />
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
          baseLinkPath="/_stocks"
        />
      </div>
    </div>
  );
}
