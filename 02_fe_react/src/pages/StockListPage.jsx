import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import EtfSummaryCard from "../components/etf/EtfSummaryCard";
import {
  stockTickerMetaMap,
  stockSnapshotMap,
  toRecentShape,
  getStockListAnalytics
} from "../utils/stockDataLoaders";
import { isStaleCloseByUsMarketDate } from "../utils/marketDate";
import "../styles/index-etf.css";

const SORT_OPTIONS = [
  { value: "sector", label: "섹터별" },
  { value: "ma200_desc", label: "이격률 높은순" },
  { value: "ma200_asc", label: "이격률 낮은순" },
  { value: "cagr_desc", label: "수익률 높은순" },
  { value: "mdd_asc", label: "MDD 낮은순" },
];

// GICS 11개 섹터 (반도체/바이오텍은 각각 기술/헬스케어의 서브섹터)
const SECTOR_ORDER = [
  "기술", "헬스케어", "금융", "산업재", "임의소비재",
  "필수소비재", "통신", "에너지", "유틸리티", "부동산", "소재"
];
const sectorRank = new Map(SECTOR_ORDER.map((s, i) => [s, i]));

const CAGR_STRATEGY_LABEL_MAP = {
  200: "200일선",
  "200-20of16": "앗추 필터"
};

function getBestOverallCagrInfo(analytics) {
  if (!analytics?.crossingHistory?.annualizedMap) return { value: null, period: null };
  const map = analytics.crossingHistory.annualizedMap;
  let best = { value: null, period: null };
  for (const [period, value] of Object.entries(map)) {
    if (value === null || value === undefined) continue;
    if (best.value === null || Number(value) > Number(best.value)) {
      best = { value: Number(value), period };
    }
  }
  return best;
}

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
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label || "섹터별";
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

// 섹터 → 서브섹터 그룹형 필터
function SectorGroupFilter({ sectorGroups, selectedSector, selectedSubSector, onSelectSector, onSelectSub }) {
  return (
    <div className="sector-group-filter">
      <button
        type="button"
        className={`type-button ${selectedSector === "ALL" ? "active" : ""}`}
        onClick={() => onSelectSector("ALL")}
      >
        전체
      </button>
      <div className="sector-group-list">
        {sectorGroups.map(({ sector, subSectors }) => {
          const isSectorSelected = selectedSector === sector;
          return (
            <div key={sector} className={`sector-group-row ${isSectorSelected ? "selected" : ""}`}>
              <button
                type="button"
                className={`sector-group-name ${isSectorSelected && selectedSubSector === "ALL" ? "active" : ""}`}
                onClick={() => onSelectSector(sector)}
              >
                {sector}
              </button>
              <div className="sector-group-subs">
                {subSectors.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className={`sector-sub-chip ${isSectorSelected && selectedSubSector === sub ? "active" : ""}`}
                    onClick={() => onSelectSub(sector, sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StockListPage() {
  const [searchParams] = useSearchParams();
  const sectorParam = searchParams.get("sector") || "ALL";
  const subParam = searchParams.get("sub") || "ALL";
  const [selectedSector, setSelectedSector] = useState(sectorParam);
  const [selectedSubSector, setSelectedSubSector] = useState(subParam);

  useEffect(() => {
    setSelectedSector(sectorParam);
    setSelectedSubSector(subParam);
  }, [sectorParam, subParam]);
  const [sortMode, setSortMode] = useState("sector");
  const [tickerQuery, setTickerQuery] = useState("");

  const allTickers = useMemo(() =>
    Array.from(stockTickerMetaMap.keys()).sort(),
    []
  );

  // 섹터 → 서브섹터 그룹 데이터
  const sectorGroups = useMemo(() => {
    const map = {};
    stockTickerMetaMap.forEach((meta) => {
      if (!meta.group) return;
      if (!map[meta.group]) map[meta.group] = new Set();
      if (meta.subGroup) map[meta.group].add(meta.subGroup);
    });
    return SECTOR_ORDER
      .filter((s) => map[s])
      .map((sector) => ({
        sector,
        subSectors: Array.from(map[sector]).sort()
      }));
  }, []);

  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setSelectedSubSector("ALL");
  };

  const handleSubSelect = (sector, sub) => {
    setSelectedSector(sector);
    setSelectedSubSector(sub);
  };

  const trendSummary = useMemo(() => {
    const total = allTickers.length;
    const activeCount = allTickers.filter(
      (t) => stockSnapshotMap[t]?.isAtchuQualified200 === true
    ).length;
    return { total, activeCount };
  }, [allTickers]);

  const normalizedQuery = tickerQuery.trim().toUpperCase();

  const filteredTickers = useMemo(() =>
    allTickers
      .filter((ticker) => {
        const meta = stockTickerMetaMap.get(ticker);
        if (selectedSector !== "ALL" && meta?.group !== selectedSector) return false;
        if (selectedSubSector !== "ALL" && meta?.subGroup !== selectedSubSector) return false;
        return true;
      })
      .filter((ticker) => {
        if (!normalizedQuery) return true;
        if (ticker.includes(normalizedQuery)) return true;
        const meta = stockTickerMetaMap.get(ticker);
        if (meta?.name && meta.name.toUpperCase().includes(normalizedQuery)) return true;
        if (meta?.nameKo && meta.nameKo.includes(tickerQuery.trim())) return true;
        return false;
      }),
    [allTickers, selectedSector, selectedSubSector, normalizedQuery, tickerQuery]
  );

  const list = useMemo(() => {
    if (!filteredTickers.length) return [];
    return [...filteredTickers].sort((a, b) => {
      if (sortMode === "sector") {
        const aSector = sectorRank.get(stockTickerMetaMap.get(a)?.group) ?? 999;
        const bSector = sectorRank.get(stockTickerMetaMap.get(b)?.group) ?? 999;
        if (aSector !== bSector) return aSector - bSector;
        // 같은 섹터 내에서 시가총액 순위(rank)로 정렬
        const aCapRank = stockTickerMetaMap.get(a)?.rank ?? 9999;
        const bCapRank = stockTickerMetaMap.get(b)?.rank ?? 9999;
        return aCapRank - bCapRank;
      }
      const getVal = (ticker) => {
        if (sortMode === "ma200_desc" || sortMode === "ma200_asc") {
          return stockSnapshotMap[ticker]?.percentDiff200 ?? null;
        }
        if (sortMode === "cagr_desc") {
          const analytics = getStockListAnalytics(ticker);
          return getBestOverallCagrInfo(analytics).value;
        }
        if (sortMode === "mdd_asc") {
          const analytics = getStockListAnalytics(ticker);
          return analytics?.crossingHistory?.mddMap?.["200-20of16"] ?? null;
        }
        return null;
      };
      const aVal = getVal(a);
      const bVal = getVal(b);
      if (aVal === null && bVal === null) return a.localeCompare(b);
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (sortMode === "ma200_asc") return aVal - bVal;
      if (sortMode === "mdd_asc") return bVal - aVal;
      return bVal - aVal;
    });
  }, [filteredTickers, sortMode]);

  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">개별주 추세 조회</div>
          {trendSummary.total > 0 && (
            <p className="panel-description">
              S&P 500 {trendSummary.total}개 중{" "}
              <strong style={{ color: trendSummary.activeCount / trendSummary.total > 0.5 ? "#16a34a" : "#dc2626" }}>
                {trendSummary.activeCount}개
              </strong>{" "}
              종목이 앗추 필터 통과
            </p>
          )}
        </div>
      </div>
      <SectorGroupFilter
        sectorGroups={sectorGroups}
        selectedSector={selectedSector}
        selectedSubSector={selectedSubSector}
        onSelectSector={handleSectorSelect}
        onSelectSub={handleSubSelect}
      />
      <div className="ticker-search-wrap">
        <input
          type="text"
          className="ticker-search-input"
          placeholder="종목 검색 (예: AAPL, Apple)"
          value={tickerQuery}
          onChange={(e) => setTickerQuery(e.target.value)}
        />
      </div>
      <SortDropdown sortMode={sortMode} setSortMode={setSortMode} />
      <div className="index-grid type-filter-gap">
        {list.map((ticker) => {
          const snapshot = stockSnapshotMap[ticker];
          const payload = toRecentShape(snapshot);
          const analytics = getStockListAnalytics(ticker);
          const closeStatus = isStaleCloseByUsMarketDate(null, payload?.data_date_market);
          const holdingItems = analytics?.trendHolding?.items || [];
          const holding200 = holdingItems.find((item) => item.label === "200일선");
          const bestCagr = getBestOverallCagrInfo(analytics);
          const mddValue = bestCagr.period != null
            ? analytics?.crossingHistory?.mddMap?.[bestCagr.period] ?? null
            : null;
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
              holdingDays={{ two_hundred: holding200?.days ?? null }}
              holdingDirection={{ two_hundred: holding200?.direction ?? null }}
              isAtchuQualified={snapshot?.isAtchuQualified200 ?? null}
              aboveDays200={snapshot?.aboveDays200 ?? null}
              cagrFinal={bestCagr.value}
              cagrFinalLabel={
                bestCagr.period != null
                  ? CAGR_STRATEGY_LABEL_MAP[bestCagr.period] || String(bestCagr.period)
                  : null
              }
              mddFinal={mddValue}
              dataStartDate={snapshot?.dataStartDate ?? null}
              isStaleClose={closeStatus.isStaleClose}
              marketStatusLabel={closeStatus.statusLabel}
              maAlignment={payload?.ma_alignment}
              meta={stockTickerMetaMap.get(ticker)}
              to={`/_stocks/${ticker}`}
            />
          );
        })}
      </div>
      {list.length === 0 && (
        <div className="panel-subtitle">조건에 맞는 종목이 없습니다.</div>
      )}
      {list.length > 0 && (
        <p className="index-etf-page-disclaimer">
          ※ 표시된 수익률(연평균 수익률, CAGR)은 과거 역사적 데이터 백테스트 기준이며, 미래 수익을 보장하지 않습니다. 본 서비스는 투자 조언을 제공하지 않으며, 투자 결정과 그에 따른 책임은 전적으로 본인에게 있습니다.
        </p>
      )}
    </section>
  );
}
