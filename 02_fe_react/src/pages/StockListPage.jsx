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
const etfTickerSet = new Set(etfTickerMetaMap.keys());

// --- 통합 티커 목록 (stock + ETF, 중복 제거) ---
const allUnifiedTickers = (() => {
  const stockKeys = Array.from(stockTickerMetaMap.keys());
  const etfKeys = Array.from(etfTickerMetaMap.keys()).filter((t) => !stockTickerMetaMap.has(t));
  return [...stockKeys.sort(), ...etfKeys.sort()];
})();

// --- 정렬 옵션 ---
const SORT_OPTIONS = [
  { value: "group", label: "분류별" },
  { value: "atchu", label: "앗추" },
  { value: "golden_cross", label: "골든크로스" },
  { value: "gc_days_desc", label: "골든크로스 오래된순" },
  { value: "cagr_gc_desc", label: "골든크로스 수익률순" },
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
const etfGroupRank = new Map(ETF_GROUP_ORDER.map((g, i) => [g, i + 100]));

// 최상단 고정 티커 (대표 지수 ETF)
const PINNED_TICKERS = ["SPY", "QQQ", "DIA"];
const pinnedRank = new Map(PINNED_TICKERS.map((t, i) => [t, i]));

const CAGR_STRATEGY_LABEL_MAP = {
  200: "200일선",
  "200-20of16": "앗추 필터",
  "golden_cross": "골든크로스"
};

// --- 유틸 ---
function isEtf(ticker) {
  return etfTickerSet.has(ticker) && !stockTickerMetaMap.has(ticker);
}

function getSnapshot(ticker) {
  return isEtf(ticker) ? etfSnapshotMap[ticker] : stockSnapshotMap[ticker];
}

function getAnalytics(ticker) {
  return isEtf(ticker)
    ? getLocalListAnalyticsByMap(etfListAnalyticsMap, ticker)
    : getStockListAnalytics(ticker);
}

function getRecentShape(ticker) {
  return isEtf(ticker)
    ? etfToRecentShape(etfSnapshotMap[ticker])
    : toRecentShape(stockSnapshotMap[ticker]);
}

function getMeta(ticker) {
  return isEtf(ticker) ? etfTickerMetaMap.get(ticker) : stockTickerMetaMap.get(ticker);
}

function getDetailPath(ticker) {
  return isEtf(ticker) ? `/trend_list/${ticker}` : `/_dev_trend_list/${ticker}`;
}

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

// --- 공통 컴포넌트 ---
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

function SectorGroupFilter({ sectorGroups, selectedSector, selectedSubSector, onSelectSector, onSelectSub }) {
  return (
    <div className="sector-group-filter">
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

// --- 메인 ---
export default function StockListPage() {
  const [searchParams] = useSearchParams();
  const sectorParam = searchParams.get("sector") || "ALL";
  const subParam = searchParams.get("sub") || "ALL";

  // 최상위 필터: 전체 / 개별주 / ETF
  const [assetFilter, setAssetFilter] = useState("ALL");
  // 개별주 하위 필터
  const [selectedSector, setSelectedSector] = useState(sectorParam);
  const [selectedSubSector, setSelectedSubSector] = useState(subParam);
  // ETF 하위 필터
  const [selectedEtfType, setSelectedEtfType] = useState("ALL");

  const [sortMode, setSortMode] = useState("group");
  const [tickerQuery, setTickerQuery] = useState("");

  useEffect(() => {
    setSelectedSector(sectorParam);
    setSelectedSubSector(subParam);
    if (sectorParam !== "ALL") setAssetFilter("개별주");
  }, [sectorParam, subParam]);

  // 최상위 필터 타입 목록
  const topLevelTypes = ["개별주", "ETF"];

  const handleTopLevelSelect = (type) => {
    if (type === assetFilter) {
      setAssetFilter("ALL");
    } else {
      setAssetFilter(type);
    }
    setSelectedSector("ALL");
    setSelectedSubSector("ALL");
    setSelectedEtfType("ALL");
  };

  // 개별주 섹터 그룹
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

  // ETF 자산군 목록
  const etfAvailableTypes = useMemo(() => {
    const types = Array.from(new Set(etfTickers.map((item) => item?.group).filter(Boolean)));
    return types.sort((a, b) => {
      const aR = etfGroupRank.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bR = etfGroupRank.get(b) ?? Number.MAX_SAFE_INTEGER;
      return aR - bR;
    });
  }, []);

  const handleEtfTypeSelect = (type) => {
    setSelectedEtfType(type);
  };

  // 요약
  const trendSummary = useMemo(() => {
    const total = allUnifiedTickers.length;
    const activeCount = allUnifiedTickers.filter(
      (t) => getSnapshot(t)?.isAtchuQualified200 === true
    ).length;
    return { total, activeCount };
  }, []);

  const normalizedQuery = tickerQuery.trim().toUpperCase();

  // 필터링
  const filteredTickers = useMemo(() => {
    return allUnifiedTickers
      .filter((ticker) => {
        // 최상위 필터
        if (assetFilter === "개별주" && isEtf(ticker)) return false;
        if (assetFilter === "ETF" && !isEtf(ticker)) return false;
        return true;
      })
      .filter((ticker) => {
        // 하위 필터 (개별주 섹터)
        if (!isEtf(ticker) && assetFilter === "개별주") {
          const meta = stockTickerMetaMap.get(ticker);
          if (selectedSector !== "ALL" && meta?.group !== selectedSector) return false;
          if (selectedSubSector !== "ALL" && meta?.subGroup !== selectedSubSector) return false;
        }
        // 하위 필터 (ETF 자산군)
        if (isEtf(ticker) && assetFilter === "ETF") {
          if (selectedEtfType !== "ALL") {
            const meta = etfTickerMetaMap.get(ticker);
            if (meta?.group !== selectedEtfType) return false;
          }
        }
        return true;
      })
      .filter((ticker) => {
        if (!normalizedQuery) return true;
        if (ticker.includes(normalizedQuery)) return true;
        const meta = getMeta(ticker);
        if (meta?.name && meta.name.toUpperCase().includes(normalizedQuery)) return true;
        if (meta?.nameKo && meta.nameKo.includes(tickerQuery.trim())) return true;
        if (Array.isArray(meta?.tags) && meta.tags.some((tag) => String(tag).includes(tickerQuery.trim()))) return true;
        return false;
      });
  }, [assetFilter, selectedSector, selectedSubSector, selectedEtfType, normalizedQuery, tickerQuery]);

  // 정렬
  const baseRank = useMemo(
    () => new Map(filteredTickers.map((value, index) => [value, index])),
    [filteredTickers]
  );

  const list = useMemo(() => {
    if (!filteredTickers.length) return [];
    let tickers = [...filteredTickers];

    // 조건 필터 (정렬 모드에 따라)
    if (sortMode === "atchu") {
      tickers = tickers.filter((t) => getSnapshot(t)?.isAtchuQualified200);
    } else if (sortMode === "golden_cross" || sortMode === "gc_days_desc") {
      tickers = tickers.filter((t) => getSnapshot(t)?.maAlignment === "golden");
    }

    // 2차 정렬: 개별주=시가총액, ETF=기본순
    const bySecondary = (a, b) => {
      const aIsEtf = isEtf(a);
      const bIsEtf = isEtf(b);
      // ETF를 개별주 뒤로
      if (!aIsEtf && bIsEtf) return -1;
      if (aIsEtf && !bIsEtf) return 1;
      if (!aIsEtf && !bIsEtf) {
        return (stockTickerMetaMap.get(a)?.rank ?? 9999) - (stockTickerMetaMap.get(b)?.rank ?? 9999);
      }
      return (baseRank.get(a) ?? 0) - (baseRank.get(b) ?? 0);
    };

    return tickers.sort((a, b) => {
      // 고정 티커는 항상 최상단
      const aPinned = pinnedRank.has(a);
      const bPinned = pinnedRank.has(b);
      if (aPinned && bPinned) return pinnedRank.get(a) - pinnedRank.get(b);
      if (aPinned) return -1;
      if (bPinned) return 1;

      if (sortMode === "group") {
        const aIsEtf = isEtf(a);
        const bIsEtf = isEtf(b);
        // 개별주 먼저, ETF 나중
        if (!aIsEtf && bIsEtf) return -1;
        if (aIsEtf && !bIsEtf) return 1;
        if (!aIsEtf && !bIsEtf) {
          const aSector = sectorRank.get(stockTickerMetaMap.get(a)?.group) ?? 999;
          const bSector = sectorRank.get(stockTickerMetaMap.get(b)?.group) ?? 999;
          if (aSector !== bSector) return aSector - bSector;
          return (stockTickerMetaMap.get(a)?.rank ?? 9999) - (stockTickerMetaMap.get(b)?.rank ?? 9999);
        }
        // ETF끼리
        const aGroup = etfGroupRank.get(etfTickerMetaMap.get(a)?.group) ?? 999;
        const bGroup = etfGroupRank.get(etfTickerMetaMap.get(b)?.group) ?? 999;
        if (aGroup !== bGroup) return aGroup - bGroup;
        return (baseRank.get(a) ?? 0) - (baseRank.get(b) ?? 0);
      }

      if (sortMode === "atchu" || sortMode === "golden_cross") {
        return bySecondary(a, b);
      }

      if (sortMode === "gc_days_desc") {
        const aDays = getSnapshot(a)?.maAlignmentDays ?? 0;
        const bDays = getSnapshot(b)?.maAlignmentDays ?? 0;
        if (aDays !== bDays) return bDays - aDays;
        return bySecondary(a, b);
      }

      const getVal = (ticker) => {
        if (sortMode === "ma200_desc" || sortMode === "ma200_asc") {
          return getSnapshot(ticker)?.percentDiff200 ?? null;
        }
        if (sortMode === "cagr_desc") {
          return getBestOverallCagrInfo(getAnalytics(ticker)).value;
        }
        if (sortMode === "cagr_gc_desc") {
          return getAnalytics(ticker)?.crossingHistory?.annualizedMap?.["golden_cross"] ?? null;
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
  }, [filteredTickers, sortMode, baseRank]);

  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">관리자 추세 조회</div>
          {trendSummary.total > 0 && (
            <p className="panel-description">
              전체 {trendSummary.total}개 중{" "}
              <strong style={{ color: trendSummary.activeCount / trendSummary.total > 0.5 ? "#16a34a" : "#dc2626" }}>
                {trendSummary.activeCount}개
              </strong>{" "}
              앗추 필터 통과
            </p>
          )}
        </div>
      </div>
      {/* 최상위 필터: 전체 / 개별주 / ETF */}
      <TypeFilter
        types={topLevelTypes}
        selectedType={assetFilter}
        onSelect={handleTopLevelSelect}
        getTypeLabel={(type) => type}
      />
      {/* 개별주 하위 필터 */}
      {assetFilter === "개별주" && (
        <SectorGroupFilter
          sectorGroups={sectorGroups}
          selectedSector={selectedSector}
          selectedSubSector={selectedSubSector}
          onSelectSector={handleSectorSelect}
          onSelectSub={handleSubSelect}
        />
      )}
      {/* ETF 하위 필터 */}
      {assetFilter === "ETF" && (
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
          placeholder="종목 검색 (예: AAPL, SPY, 애플)"
          value={tickerQuery}
          onChange={(e) => setTickerQuery(e.target.value)}
        />
      </div>
      <SortDropdown sortMode={sortMode} setSortMode={setSortMode} />
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
              cagrAtchu={analytics?.crossingHistory?.annualizedMap?.["200-20of16"] ?? null}
              mddAtchu={analytics?.crossingHistory?.mddMap?.["200-20of16"] ?? null}
              cagrAlignment={analytics?.crossingHistory?.annualizedMap?.["golden_cross"] ?? null}
              mddAlignment={analytics?.crossingHistory?.mddMap?.["golden_cross"] ?? null}
              dataStartDate={snapshot?.dataStartDate ?? null}
              isStaleClose={closeStatus.isStaleClose}
              marketStatusLabel={closeStatus.statusLabel}
              maAlignment={payload?.ma_alignment}
              maAlignmentDays={payload?.ma_alignment_days}
              meta={getMeta(ticker)}
              to={getDetailPath(ticker)}
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
