import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import EtfSummaryCard from "../components/etf/EtfSummaryCard";
import TypeFilter from "../components/etf/TypeFilter";
import GuideTour from "../components/main/GuideTour";
import "../styles/index-etf.css";

const SORT_OPTIONS = [
  { value: "type", label: "분류별" },
  { value: "ma200_desc", label: "이격률 높은순" },
  { value: "ma200_asc", label: "이격률 낮은순" },
  { value: "cagr_desc", label: "수익률 높은순" },
  { value: "mdd_asc", label: "MDD 낮은순" },
  { value: "data_old", label: "데이터 오래된순" },
];

function SortDropdown({ sortMode, setSortMode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label || "분류별";

  return (
    <div className="sort-controls">
      <div className="sort-dropdown" ref={ref}>
        <button
          type="button"
          className="sort-dropdown-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="sort-label">정렬</span>
          <span className="sort-dropdown-value">{currentLabel}</span>
          <span className={`sort-dropdown-arrow ${open ? "open" : ""}`}>▾</span>
        </button>
        {open && (
          <ul className="sort-dropdown-menu" role="listbox">
            {SORT_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={sortMode === opt.value}
                className={`sort-dropdown-option ${sortMode === opt.value ? "selected" : ""}`}
                onClick={() => { setSortMode(opt.value); setOpen(false); }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const discordUrl =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

export default function IndexEtfPage({
  pageTitle = "추세 조회",
  model
}) {
  const {
    tickers,
    selectedType,
    toggleType,
    getTypeLabel,
    sortMode,
    setSortMode,
    tickersLoading,
    tickersError,
    snapshotMap,
    toRecentShape,
    getLocalListAnalytics,
    isStaleCloseByUsMarketDate,
    getBestOverallCagrInfo,
    cagrStrategyLabelMap,
    tickerMetaMap
  } = model;
  const trendSummary = useMemo(() => {
    const allTickers = tickers.filter((item) => item?.ticker).map((item) => item.ticker.toUpperCase());
    const total = allTickers.length;
    const activeCount = allTickers.filter((ticker) => snapshotMap[ticker]?.isAtchuQualified200 === true).length;
    return { total, activeCount };
  }, [tickers, snapshotMap]);
  const [tickerQuery, setTickerQuery] = useState("");
  const [showDiscordBanner, setShowDiscordBanner] = useState(
    () => sessionStorage.getItem("atchu_hide_discord_banner") !== "1"
  );
  const dismissDiscordBanner = () => {
    setShowDiscordBanner(false);
    sessionStorage.setItem("atchu_hide_discord_banner", "1");
  };
  const groupOrder = [
    "미국 대표 지수",
    "성장",
    "밸류",
    "퀄리티",
    "저변동성",
    "모멘텀",
    "배당",
    "스타일",
    "섹터",
    "국가",
    "채권",
    "원자재",
    "중소형",
    "레버리지",
    "인버스",
    "기타"
  ];
  const groupRank = new Map(groupOrder.map((value, index) => [value, index]));
  const availableTypes = Array.from(
    new Set(tickers.map((item) => item?.group).filter(Boolean))
  ).sort((a, b) => {
    const aRank = groupRank.has(a) ? groupRank.get(a) : Number.MAX_SAFE_INTEGER;
    const bRank = groupRank.has(b) ? groupRank.get(b) : Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) {
      return aRank - bRank;
    }
    return a.localeCompare(b);
  });
  const displayTypes = availableTypes;
  const effectiveType = selectedType;
  const normalizedQuery = tickerQuery.trim().toUpperCase();
  const tickerGroupMap = useMemo(
    () =>
      new Map(
        tickers
          .filter((item) => item?.ticker)
          .map((item) => [item.ticker.toUpperCase(), item.group || "기타"])
      ),
    [tickers]
  );
  const filteredTickers = useMemo(() =>
    tickers
      .filter((item) => item?.ticker)
      .filter((item) => (effectiveType === "ALL" ? true : item?.group === effectiveType))
      .filter((item) => {
        if (!normalizedQuery) return true;
        const q = normalizedQuery;
        if (String(item?.ticker || "").toUpperCase().includes(q)) return true;
        if (String(item?.name || "").toUpperCase().includes(q)) return true;
        if (String(item?.nameKo || "").includes(tickerQuery.trim())) return true;
        if (Array.isArray(item?.tags) && item.tags.some((tag) => String(tag).includes(tickerQuery.trim()))) return true;
        return false;
      })
      .map((item) => item.ticker.toUpperCase()),
    [tickers, effectiveType, normalizedQuery, tickerQuery]
  );
  const baseRank = useMemo(
    () => new Map(filteredTickers.map((value, index) => [value, index])),
    [filteredTickers]
  );
  const getGroupRankForTicker = (ticker) => {
    const group = tickerGroupMap.get(ticker) || "기타";
    return groupRank.has(group) ? groupRank.get(group) : Number.MAX_SAFE_INTEGER;
  };
  const list = useMemo(() => {
    if (!filteredTickers.length) return [];
    const getSortValue = (ticker) => {
      if (sortMode === "cagr_desc") {
        const analytics = getLocalListAnalytics(ticker);
        const cagrValue = getBestOverallCagrInfo(analytics).value;
        if (cagrValue === null || cagrValue === undefined) return null;
        return Number(cagrValue);
      }
      if (sortMode === "ma200_desc" || sortMode === "ma200_asc") {
        const payload = toRecentShape(snapshotMap[ticker]);
        const diffValue = payload?.percent_difference_from_moving_averages?.two_hundred_day;
        if (diffValue === null || diffValue === undefined) return null;
        return Number(diffValue);
      }
      if (sortMode === "mdd_asc") {
        const analytics = getLocalListAnalytics(ticker);
        const mddValue = analytics?.crossingHistory?.mddMap?.["200-20of16"];
        if (mddValue === null || mddValue === undefined) return null;
        return Number(mddValue);
      }
      if (sortMode === "data_old") {
        const startDate = snapshotMap[ticker]?.dataStartDate;
        if (!startDate) return null;
        return new Date(startDate).getTime();
      }
      return null;
    };
    return [...filteredTickers].sort((a, b) => {
      if (sortMode === "type") {
        const typeRankDiff = getGroupRankForTicker(a) - getGroupRankForTicker(b);
        if (typeRankDiff !== 0) return typeRankDiff;
        return (baseRank.get(a) ?? 0) - (baseRank.get(b) ?? 0);
      }
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      if (aValue === null && bValue === null) return (baseRank.get(a) ?? 0) - (baseRank.get(b) ?? 0);
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (aValue !== bValue) {
        if (sortMode === "ma200_asc" || sortMode === "data_old") return aValue - bValue;
        if (sortMode === "mdd_asc") return bValue - aValue;
        return bValue - aValue;
      }
      return (baseRank.get(a) ?? 0) - (baseRank.get(b) ?? 0);
    });
  }, [filteredTickers, sortMode, baseRank, snapshotMap, getLocalListAnalytics, getBestOverallCagrInfo, toRecentShape]);
  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">{pageTitle}</div>
          {trendSummary.total > 0 && (
            <p className="panel-description">
              현재 {trendSummary.total}개 중{" "}
              <strong style={{ color: trendSummary.activeCount / trendSummary.total > 0.5 ? "#16a34a" : "#dc2626" }}>
                {trendSummary.activeCount}개
              </strong>{" "}
              ETF가 앗추 필터 통과
            </p>
          )}
        </div>
      </div>
      <TypeFilter
          types={displayTypes}
          selectedType={selectedType}
          onSelect={toggleType}
          getTypeLabel={getTypeLabel}
        />
      <div className="ticker-search-wrap">
        <input
          type="text"
          className="ticker-search-input"
          placeholder="티커명 검색 (예: SPY, QQQ)"
          value={tickerQuery}
          onChange={(event) => setTickerQuery(event.target.value)}
        />
      </div>
      <SortDropdown sortMode={sortMode} setSortMode={setSortMode} />
      {tickersLoading && (
        <div className="panel-subtitle">티커 목록을 불러오는 중입니다.</div>
      )}
      {tickersError && (
        <div className="panel-subtitle">티커 목록을 불러오지 못했습니다.</div>
      )}
      <div className="index-grid type-filter-gap">
        {list.map((ticker) => {
          const payload = toRecentShape(snapshotMap[ticker]);
          const localAnalytics = getLocalListAnalytics(ticker);
          const closeStatus = isStaleCloseByUsMarketDate(
            null,
            payload?.data_date_market
          );
          const holdingItems = localAnalytics?.trendHolding?.items || [];
          const holdingMap = {
            two_hundred: holdingItems.find((item) => item.label === "200일선")
          };
          const bestOverallCagr = getBestOverallCagrInfo(localAnalytics);
          const mddValue = bestOverallCagr.period != null
            ? localAnalytics?.crossingHistory?.mddMap?.[bestOverallCagr.period] ?? null
            : null;
          const snapshot = localAnalytics?.snapshot;
          return (
            <EtfSummaryCard
              key={ticker}
              ticker={ticker}
              open={payload?.open}
              high={payload?.high}
              low={payload?.low}
              close={payload?.close}
              changePercent={payload?.percent_change_from_previous_close}
              movingAverages={payload?.moving_averages}
              percentDiffs={payload?.percent_difference_from_moving_averages}
              holdingDays={{
                two_hundred: holdingMap.two_hundred?.days ?? null
              }}
              holdingDirection={{
                two_hundred: holdingMap.two_hundred?.direction ?? null
              }}
              isAtchuQualified={snapshot?.isAtchuQualified200 ?? null}
              aboveDays200={snapshot?.aboveDays200 ?? null}
              cagrFinal={bestOverallCagr.value}
              cagrFinalLabel={
                bestOverallCagr.period !== null && bestOverallCagr.period !== undefined
                  ? cagrStrategyLabelMap[bestOverallCagr.period] ||
                    String(bestOverallCagr.period)
                  : null
              }
              mddFinal={mddValue}
              dataStartDate={snapshot?.dataStartDate ?? null}
              isStaleClose={closeStatus.isStaleClose}
              marketStatusLabel={closeStatus.statusLabel}
              meta={tickerMetaMap.get(ticker)}
              to={`/trend_list/${ticker}`}
            />
          );
        })}
      </div>
      {!tickersLoading && !tickersError && list.length === 0 && (
        <div className="panel-subtitle">조건에 맞는 티커가 없습니다.</div>
      )}
      {list.length > 0 && <GuideTour />}
      {list.length > 0 && (
        <p className="index-etf-page-disclaimer">
          ※ 표시된 수익률(연평균 수익률, CAGR)은 과거 역사적 데이터 백테스트 기준이며, 미래 수익을 보장하지 않습니다. 본 서비스는 투자 조언을 제공하지 않으며, 투자 결정과 그에 따른 책임은 전적으로 본인에게 있습니다.
        </p>
      )}
      {list.length > 0 && (
        <div className="etf-nav-banner">
          <Link to="/market_overview" className="etf-nav-banner-link">
            지금 어떤 섹터가 강한지 한눈에 보기 → 시장 개요
          </Link>
        </div>
      )}
      {showDiscordBanner && discordUrl && (
        <div className="etf-discord-banner">
          <div className="etf-discord-banner-content">
            <span className="etf-discord-banner-text">
              이 추세 신호를 매일 아침 Discord로 받아보세요
            </span>
            <a
              className="etf-discord-banner-btn"
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
            >
              Discord 입장 ↗
            </a>
          </div>
          <button
            type="button"
            className="ghost etf-discord-banner-close"
            onClick={dismissDiscordBanner}
            aria-label="배너 닫기"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
