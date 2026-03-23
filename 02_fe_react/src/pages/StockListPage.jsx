import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import EtfSummaryCard from "../components/etf/EtfSummaryCard";
import TypeFilter from "../components/etf/TypeFilter";
import {
  stockTickerMetaMap,
  stockSnapshotMap,
  toRecentShape,
  getStockListAnalytics
} from "../utils/stockDataLoaders";
import {
  tickerModules as etfTickerModules,
  latestSnapshotPayload as etfSnapshotPayload
} from "../utils/dataLoaders";
import {
  buildLocalTickers,
  buildMockTickers,
  buildLocalListAnalyticsMap,
  getLocalListAnalyticsByMap
} from "../utils/tickerMeta";
import { toRecentShape as etfToRecentShape } from "../utils/appDataAdapters";
import { isStaleCloseByUsMarketDate } from "../utils/marketDate";
import "../styles/index-etf.css";

// --- ETF 데이터 빌드 (빌드 시 eager load) ---
const etfLocalTickers = buildLocalTickers(etfTickerModules);
const etfTickers = buildMockTickers(etfLocalTickers);
const etfSnapshotMap = (() => {
  const map = {};
  const tickers = etfSnapshotPayload?.tickers;
  if (tickers && typeof tickers === "object") {
    Object.entries(tickers).forEach(([key, val]) => {
      map[key.toUpperCase()] = val?.snapshot || null;
    });
  }
  return map;
})();
const etfListAnalyticsMap = buildLocalListAnalyticsMap(etfSnapshotPayload);
const etfTickerMetaMap = new Map(
  etfTickers
    .filter((item) => item?.ticker)
    .map((item) => [item.ticker.toUpperCase(), item])
);

// --- 정렬 옵션 ---
const STOCK_SORT_OPTIONS = [
  { value: "sector", label: "섹터별" },
  { value: "atchu", label: "앗추" },
  { value: "full_align", label: "정배열" },
  { value: "atchu_aligned", label: "앗추+정배열" },
  { value: "align_days_desc", label: "정배열 오래된순" },
  { value: "cagr_align_desc", label: "정배열 수익률순" },
  { value: "cagr_atchu_align_desc", label: "앗추+정배열 수익률순" },
  { value: "ma200_desc", label: "이격률 높은순" },
  { value: "ma200_asc", label: "이격률 낮은순" },
  { value: "cagr_desc", label: "수익률 높은순" },
  { value: "mdd_asc", label: "MDD 낮은순" },
];

const ETF_SORT_OPTIONS = [
  { value: "type", label: "분류별" },
  { value: "atchu", label: "앗추" },
  { value: "full_align", label: "정배열" },
  { value: "atchu_aligned", label: "앗추+정배열" },
  { value: "align_days_desc", label: "정배열 오래된순" },
  { value: "ma200_desc", label: "이격률 높은순" },
  { value: "ma200_asc", label: "이격률 낮은순" },
  { value: "cagr_desc", label: "수익률 높은순" },
  { value: "mdd_asc", label: "MDD 낮은순" },
];

// GICS 11개 섹터
const SECTOR_ORDER = [
  "기술", "헬스케어", "금융", "산업재", "임의소비재",
  "필수소비재", "통신", "에너지", "유틸리티", "부동산", "소재"
];
const sectorRank = new Map(SECTOR_ORDER.map((s, i) => [s, i]));

// ETF 10개 자산군
const ETF_GROUP_ORDER = [
  "미국 대표 지수", "스타일", "배당", "섹터", "국가",
  "채권", "원자재", "중소형", "레버리지·인버스", "기타"
];
const etfGroupRank = new Map(ETF_GROUP_ORDER.map((g, i) => [g, i]));

const CAGR_STRATEGY_LABEL_MAP = {
  200: "200일선",
  "200-20of16": "앗추 필터",
  "full_align": "정배열",
  "atchu_full_align": "앗추+정배열"
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

function SortDropdown({ sortMode, setSortMode, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  const currentLabel = options.find((o) => o.value === sortMode)?.label || options[0]?.label;
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
            {options.map((opt) => (
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

// --- 탭 세그먼트 컨트롤 ---
function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="stock-tab-bar">
      <button
        type="button"
        className={`stock-tab-btn ${activeTab === "stock" ? "active" : ""}`}
        onClick={() => onTabChange("stock")}
      >
        개별주
      </button>
      <button
        type="button"
        className={`stock-tab-btn ${activeTab === "etf" ? "active" : ""}`}
        onClick={() => onTabChange("etf")}
      >
        ETF
      </button>
    </div>
  );
}

export default function StockListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "stock";
  const activeTab = tabParam === "etf" ? "etf" : "stock";

  // 개별주 탭 상태
  const sectorParam = searchParams.get("sector") || "ALL";
  const subParam = searchParams.get("sub") || "ALL";
  const [selectedSector, setSelectedSector] = useState(sectorParam);
  const [selectedSubSector, setSelectedSubSector] = useState(subParam);
  useEffect(() => {
    setSelectedSector(sectorParam);
    setSelectedSubSector(subParam);
  }, [sectorParam, subParam]);

  // ETF 탭 상태
  const typeParam = searchParams.get("type") || "ALL";
  const [selectedEtfType, setSelectedEtfType] = useState(typeParam);
  useEffect(() => {
    setSelectedEtfType(typeParam);
  }, [typeParam]);

  const defaultSort = activeTab === "etf" ? "type" : "sector";
  const [sortMode, setSortMode] = useState(defaultSort);
  const [tickerQuery, setTickerQuery] = useState("");

  // 탭 전환 시 상태 초기화
  const handleTabChange = (tab) => {
    const params = new URLSearchParams();
    if (tab === "etf") params.set("tab", "etf");
    setSearchParams(params);
    setTickerQuery("");
    setSortMode(tab === "etf" ? "type" : "sector");
    setSelectedSector("ALL");
    setSelectedSubSector("ALL");
    setSelectedEtfType("ALL");
  };

  // ========== 개별주 데이터 ==========
  const allStockTickers = useMemo(() =>
    Array.from(stockTickerMetaMap.keys()).sort(),
    []
  );

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

  // ========== ETF 데이터 ==========
  const allEtfTickers = useMemo(() =>
    etfTickers
      .filter((item) => item?.ticker)
      .map((item) => item.ticker.toUpperCase()),
    []
  );

  const etfAvailableTypes = useMemo(() => {
    const types = Array.from(new Set(etfTickers.map((item) => item?.group).filter(Boolean)));
    return types.sort((a, b) => {
      const aR = etfGroupRank.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bR = etfGroupRank.get(b) ?? Number.MAX_SAFE_INTEGER;
      return aR - bR;
    });
  }, []);

  const etfTickerGroupMap = useMemo(() =>
    new Map(allEtfTickers.map((t) => [t, etfTickerMetaMap.get(t)?.group || "기타"])),
    [allEtfTickers]
  );

  const handleEtfTypeSelect = (type) => {
    setSelectedEtfType(type);
  };

  // ========== 요약 바 ==========
  const trendSummary = useMemo(() => {
    if (activeTab === "etf") {
      const total = allEtfTickers.length;
      const activeCount = allEtfTickers.filter(
        (t) => etfSnapshotMap[t]?.isAtchuQualified200 === true
      ).length;
      return { total, activeCount, label: "ETF" };
    }
    const total = allStockTickers.length;
    const activeCount = allStockTickers.filter(
      (t) => stockSnapshotMap[t]?.isAtchuQualified200 === true
    ).length;
    return { total, activeCount, label: "S&P 500" };
  }, [activeTab, allStockTickers, allEtfTickers]);

  const normalizedQuery = tickerQuery.trim().toUpperCase();

  // ========== 필터링 ==========
  const filteredTickers = useMemo(() => {
    if (activeTab === "etf") {
      return allEtfTickers
        .filter((ticker) => {
          if (selectedEtfType === "ALL") return true;
          return etfTickerGroupMap.get(ticker) === selectedEtfType;
        })
        .filter((ticker) => {
          if (!normalizedQuery) return true;
          if (ticker.includes(normalizedQuery)) return true;
          const meta = etfTickerMetaMap.get(ticker);
          if (meta?.name && meta.name.toUpperCase().includes(normalizedQuery)) return true;
          if (meta?.nameKo && meta.nameKo.includes(tickerQuery.trim())) return true;
          if (Array.isArray(meta?.tags) && meta.tags.some((tag) => String(tag).includes(tickerQuery.trim()))) return true;
          return false;
        });
    }
    return allStockTickers
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
      });
  }, [activeTab, allStockTickers, allEtfTickers, selectedSector, selectedSubSector, selectedEtfType, normalizedQuery, tickerQuery, etfTickerGroupMap]);

  // ========== 정렬 ==========
  const getSnapshot = (ticker) =>
    activeTab === "etf" ? etfSnapshotMap[ticker] : stockSnapshotMap[ticker];

  const getAnalytics = (ticker) =>
    activeTab === "etf"
      ? getLocalListAnalyticsByMap(etfListAnalyticsMap, ticker)
      : getStockListAnalytics(ticker);

  const getRecentShape = (ticker) =>
    activeTab === "etf"
      ? etfToRecentShape(etfSnapshotMap[ticker])
      : toRecentShape(stockSnapshotMap[ticker]);

  const getMeta = (ticker) =>
    activeTab === "etf" ? etfTickerMetaMap.get(ticker) : stockTickerMetaMap.get(ticker);

  const baseRank = useMemo(
    () => new Map(filteredTickers.map((value, index) => [value, index])),
    [filteredTickers]
  );

  const list = useMemo(() => {
    if (!filteredTickers.length) return [];
    let tickers = [...filteredTickers];

    // 필터링 (조건 미충족 종목 제거)
    if (sortMode === "atchu") {
      tickers = tickers.filter((t) => getSnapshot(t)?.isAtchuQualified200);
    } else if (sortMode === "full_align" || sortMode === "align_days_desc") {
      tickers = tickers.filter((t) => getSnapshot(t)?.maAlignment === "full");
    } else if (sortMode === "atchu_aligned") {
      tickers = tickers.filter((t) => {
        const snap = getSnapshot(t);
        return snap?.isAtchuQualified200 && snap?.maAlignment === "full";
      });
    }

    // 2차 정렬 함수
    const bySecondary = (a, b) => {
      if (activeTab === "stock") {
        const aRank = stockTickerMetaMap.get(a)?.rank ?? 9999;
        const bRank = stockTickerMetaMap.get(b)?.rank ?? 9999;
        return aRank - bRank;
      }
      return (baseRank.get(a) ?? 0) - (baseRank.get(b) ?? 0);
    };

    return tickers.sort((a, b) => {
      // 기본 분류순
      if (sortMode === "sector") {
        const aSector = sectorRank.get(stockTickerMetaMap.get(a)?.group) ?? 999;
        const bSector = sectorRank.get(stockTickerMetaMap.get(b)?.group) ?? 999;
        if (aSector !== bSector) return aSector - bSector;
        return bySecondary(a, b);
      }
      if (sortMode === "type") {
        const aGroup = etfGroupRank.get(etfTickerGroupMap.get(a)) ?? 999;
        const bGroup = etfGroupRank.get(etfTickerGroupMap.get(b)) ?? 999;
        if (aGroup !== bGroup) return aGroup - bGroup;
        return bySecondary(a, b);
      }

      // 필터형 정렬 (이미 필터링됨) → 시가총액/기본순
      if (sortMode === "atchu" || sortMode === "full_align" || sortMode === "atchu_aligned") {
        return bySecondary(a, b);
      }

      // 정배열 오래된순
      if (sortMode === "align_days_desc") {
        const aDays = getSnapshot(a)?.maAlignmentDays ?? 0;
        const bDays = getSnapshot(b)?.maAlignmentDays ?? 0;
        if (aDays !== bDays) return bDays - aDays;
        return bySecondary(a, b);
      }

      // 값 기반 정렬
      const getVal = (ticker) => {
        if (sortMode === "ma200_desc" || sortMode === "ma200_asc") {
          return getSnapshot(ticker)?.percentDiff200 ?? null;
        }
        if (sortMode === "cagr_desc") {
          return getBestOverallCagrInfo(getAnalytics(ticker)).value;
        }
        if (sortMode === "cagr_align_desc") {
          return getAnalytics(ticker)?.crossingHistory?.annualizedMap?.["full_align"] ?? null;
        }
        if (sortMode === "cagr_atchu_align_desc") {
          return getAnalytics(ticker)?.crossingHistory?.annualizedMap?.["atchu_full_align"] ?? null;
        }
        if (sortMode === "mdd_asc") {
          return getAnalytics(ticker)?.crossingHistory?.mddMap?.["200-20of16"] ?? null;
        }
        return null;
      };
      const aVal = getVal(a);
      const bVal = getVal(b);
      if (aVal === null && bVal === null) return bySecondary(a, b);
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (sortMode === "ma200_asc") return aVal - bVal || bySecondary(a, b);
      if (sortMode === "mdd_asc") return bVal - aVal || bySecondary(a, b);
      return bVal - aVal || bySecondary(a, b);
    });
  }, [filteredTickers, sortMode, activeTab, baseRank, etfTickerGroupMap]);

  const currentSortOptions = activeTab === "etf" ? ETF_SORT_OPTIONS : STOCK_SORT_OPTIONS;

  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">관리자 추세 조회</div>
          {trendSummary.total > 0 && (
            <p className="panel-description">
              {trendSummary.label} {trendSummary.total}개 중{" "}
              <strong style={{ color: trendSummary.activeCount / trendSummary.total > 0.5 ? "#16a34a" : "#dc2626" }}>
                {trendSummary.activeCount}개
              </strong>{" "}
              {activeTab === "etf" ? "ETF가" : "종목이"} 앗추 필터 통과
            </p>
          )}
        </div>
      </div>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      {activeTab === "stock" ? (
        <SectorGroupFilter
          sectorGroups={sectorGroups}
          selectedSector={selectedSector}
          selectedSubSector={selectedSubSector}
          onSelectSector={handleSectorSelect}
          onSelectSub={handleSubSelect}
        />
      ) : (
        <TypeFilter
          types={etfAvailableTypes}
          selectedType={selectedEtfType}
          onSelect={handleEtfTypeSelect}
          getTypeLabel={(type) => type}
        />
      )}
      <div className="ticker-search-wrap">
        <input
          type="text"
          className="ticker-search-input"
          placeholder={activeTab === "etf" ? "ETF 검색 (예: SPY, QQQ)" : "종목 검색 (예: AAPL, Apple)"}
          value={tickerQuery}
          onChange={(e) => setTickerQuery(e.target.value)}
        />
      </div>
      <SortDropdown sortMode={sortMode} setSortMode={setSortMode} options={currentSortOptions} />
      <div className="index-grid type-filter-gap">
        {list.map((ticker) => {
          const payload = getRecentShape(ticker);
          const analytics = getAnalytics(ticker);
          const snapshot = getSnapshot(ticker);
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
              cagrAlignment={analytics?.crossingHistory?.annualizedMap?.["full_align"] ?? null}
              mddAlignment={analytics?.crossingHistory?.mddMap?.["full_align"] ?? null}
              cagrAtchuAlign={analytics?.crossingHistory?.annualizedMap?.["atchu_full_align"] ?? null}
              mddAtchuAlign={analytics?.crossingHistory?.mddMap?.["atchu_full_align"] ?? null}
              dataStartDate={snapshot?.dataStartDate ?? null}
              isStaleClose={closeStatus.isStaleClose}
              marketStatusLabel={closeStatus.statusLabel}
              maAlignment={payload?.ma_alignment}
              maAlignmentDays={payload?.ma_alignment_days}
              meta={getMeta(ticker)}
              to={activeTab === "etf" ? `/_etf/${ticker}` : `/_stocks/${ticker}`}
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
