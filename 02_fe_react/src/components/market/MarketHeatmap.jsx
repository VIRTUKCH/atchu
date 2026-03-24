import React, { useMemo } from "react";
import { Link } from "react-router-dom";

/* ── 기간별 비교를 위한 스냅샷 필드 매핑 ── */
const PERIOD_SNAPSHOT_KEYS = {
  "1d": "percentChangeFromPreviousClose",
  "5d": "percentChange5d",
  "63d": "percentChange63d",
  "252d": "percentChange252d",
  "1260d": "percentChange1260d"
};

const buildOverviewData = (snapshotPayload, localUniverse = []) => {
  const getPayloadTicker = (ticker) =>
    snapshotPayload?.tickers?.[ticker] || null;
  const getMaDistByTicker = (ticker) => {
    const raw = getPayloadTicker(ticker)?.snapshot?.percentDiff200;
    if (raw === null || raw === undefined) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  };
  const getIsAtchuQualifiedByTicker = (ticker) => {
    const raw = getPayloadTicker(ticker)?.snapshot?.isAtchuQualified200;
    return raw === true || raw === false ? raw : null;
  };
  const getAboveDays200ByTicker = (ticker) => {
    const raw = getPayloadTicker(ticker)?.snapshot?.aboveDays200;
    if (raw === null || raw === undefined) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  };
  const getTrendDaysByTicker = (ticker) => {
    const data = getPayloadTicker(ticker);
    const items = data?.trendHolding?.items;
    if (!items || items.length === 0) return null;
    const target = items.find((i) => i.label === "200일선") || items[items.length - 1];
    if (!target || target.days === null || target.days === undefined) return null;
    return { days: Number(target.days), direction: target.direction };
  };
  const coreTickers = ["SPY", "QQQ", "DIA"].map((ticker) => {
    const meta = localUniverse.find((item) => String(item.ticker || "").toUpperCase() === ticker);
    return {
      ticker,
      maDist: getMaDistByTicker(ticker),
      isAtchuQualified: getIsAtchuQualifiedByTicker(ticker),
      aboveDays200: getAboveDays200ByTicker(ticker),
      trendDays: getTrendDaysByTicker(ticker),
      label: String(meta?.heatmap_label || meta?.heatmapLabel || "").trim(),
      nameKo: meta?.name_ko || meta?.nameKo || ""
    };
  });
  const styleTypes = ["성장", "밸류", "퀄리티", "저변동성", "배당"];
  const styleSummary = styleTypes.map((type) => {
    const tickersInType = localUniverse
      .filter((item) => item?.type === type)
      .map((item) => String(item.ticker || "").toUpperCase());
    const maDistValues = tickersInType
      .map((ticker) => getMaDistByTicker(ticker))
      .filter((value) => value !== null);
    const avgMaDist =
      maDistValues.length > 0
        ? maDistValues.reduce((sum, value) => sum + Number(value), 0) / maDistValues.length
        : null;
    const qualifiedCount = tickersInType.filter((t) => getIsAtchuQualifiedByTicker(t) === true).length;
    const validQualCount = tickersInType.filter((t) => getIsAtchuQualifiedByTicker(t) !== null).length;
    const qualifiedRatio = validQualCount > 0 ? qualifiedCount / validQualCount : null;
    const isAtchuQualified = qualifiedRatio !== null
      ? (avgMaDist !== null && avgMaDist >= 0 ? qualifiedRatio >= 0.5 : false)
      : null;
    return {
      type,
      tickers: tickersInType,
      maDist: avgMaDist,
      qualifiedRatio,
      isAtchuQualified
    };
  });
  const getOverviewLabel = (item) => {
    if (!item) return "";
    return String(item.heatmapLabel || item.heatmap_label || "").trim();
  };
  const buildTypeTiles = (groupName) =>
    localUniverse
      .filter((item) => item?.heatmapGroup === groupName)
      .map((item) => {
        const ticker = String(item.ticker || "").toUpperCase();
        return {
          ticker,
          maDist: getMaDistByTicker(ticker),
          isAtchuQualified: getIsAtchuQualifiedByTicker(ticker),
          aboveDays200: getAboveDays200ByTicker(ticker),
          trendDays: getTrendDaysByTicker(ticker),
          label: getOverviewLabel(item),
          nameKo: item.name_ko || item.nameKo || ""
        };
      })
      .filter((item, index, arr) => arr.findIndex((v) => v.ticker === item.ticker) === index);
  return {
    coreTickers,
    styleSummary,
    bondTiles: buildTypeTiles("채권"),
    smallMidTiles: buildTypeTiles("중소형"),
    sectorTiles: buildTypeTiles("섹터"),
    countryTiles: buildTypeTiles("국가"),
    commodityTiles: buildTypeTiles("원자재"),
    leverageTiles: buildTypeTiles("레버리지·인버스")
  };
};

const formatOverviewPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  const num = Number(value);
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
};

const collectHeatValues = (groups) =>
  groups
    .flat()
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

const getHeatScale = (values) => {
  const positives = values.filter((value) => value > 0);
  const negatives = values.filter((value) => value < 0).map((value) => Math.abs(value));
  return {
    maxPositive: positives.length ? Math.max(...positives) : 0,
    maxNegative: negatives.length ? Math.max(...negatives) : 0
  };
};

const getAtchuHeatStyle = (maDist, isAtchuQualified, scale) => {
  if (maDist === null || maDist === undefined || Number.isNaN(Number(maDist))) {
    return undefined;
  }
  const num = Number(maDist);
  const baseAlpha = 0.18;
  const maxAlpha = 0.72;
  let alpha, bg;
  if (num >= 0) {
    const denom = scale.maxPositive > 0 ? scale.maxPositive : 1;
    const ratio = Math.min(Math.max(num / denom, 0), 1);
    alpha = baseAlpha + ratio * (maxAlpha - baseAlpha);
    if (isAtchuQualified === true) {
      bg = `rgba(34, 197, 94, ${alpha.toFixed(3)})`; // 초록: 앗추 진입
    } else {
      bg = `rgba(249, 115, 22, ${alpha.toFixed(3)})`; // 주황: 200일 위, 앗추 이탈
    }
  } else {
    const denom = scale.maxNegative > 0 ? scale.maxNegative : 1;
    const ratio = Math.min(Math.max(Math.abs(num) / denom, 0), 1);
    alpha = baseAlpha + ratio * (maxAlpha - baseAlpha);
    bg = `rgba(29, 91, 255, ${alpha.toFixed(3)})`; // 파랑: 200일 아래
  }
  if (alpha >= 0.48) {
    return { background: bg, "--tile-text": "rgba(255,255,255,0.92)" };
  }
  return { background: bg };
};

/* ── 기간별 비교 모드 — 초록(상승) / 빨강(하락) ── */
const getPeriodHeatStyle = (value, scale) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return undefined;
  }
  const num = Number(value);
  const baseAlpha = 0.18;
  const maxAlpha = 0.72;
  let alpha, bg;
  if (num >= 0) {
    const denom = scale.maxPositive > 0 ? scale.maxPositive : 1;
    const ratio = Math.min(Math.max(num / denom, 0), 1);
    alpha = baseAlpha + ratio * (maxAlpha - baseAlpha);
    bg = `rgba(34, 197, 94, ${alpha.toFixed(3)})`;
  } else {
    const denom = scale.maxNegative > 0 ? scale.maxNegative : 1;
    const ratio = Math.min(Math.max(Math.abs(num) / denom, 0), 1);
    alpha = baseAlpha + ratio * (maxAlpha - baseAlpha);
    bg = `rgba(239, 68, 68, ${alpha.toFixed(3)})`;
  }
  if (alpha >= 0.48) {
    return { background: bg, "--tile-text": "rgba(255,255,255,0.92)" };
  }
  return { background: bg };
};

const buildSummaryStats = (allTiles) => {
  const valid = allTiles.filter(
    (t) => t.maDist !== null && t.maDist !== undefined && Number.isFinite(Number(t.maDist))
  );
  const qualifiedCount = valid.filter((t) => t.isAtchuQualified === true).length;
  const cautionCount = valid.filter(
    (t) => t.isAtchuQualified !== true && Number(t.maDist) >= 0
  ).length;
  const downCount = valid.filter((t) => Number(t.maDist) < 0).length;
  return { qualifiedCount, cautionCount, downCount };
};

const getAtchuLevel = (maDist, isAtchuQualified) => {
  if (maDist === null || maDist === undefined || !Number.isFinite(Number(maDist))) return null;
  if (Number(maDist) < 0) return "down";
  return isAtchuQualified === true ? "qualified" : "caution";
};

const sortByAtchuDesc = (items, maKey = "maDist") =>
  [...items].sort((a, b) => {
    const aLevel = getAtchuLevel(a[maKey] ?? a.maDist, a.isAtchuQualified);
    const bLevel = getAtchuLevel(b[maKey] ?? b.maDist, b.isAtchuQualified);
    const levelOrder = { qualified: 0, caution: 1, down: 2, null: 3 };
    const aOrder = levelOrder[aLevel] ?? 3;
    const bOrder = levelOrder[bLevel] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const av = Number(a[maKey] ?? a.maDist);
    const bv = Number(b[maKey] ?? b.maDist);
    if (!Number.isFinite(av) && !Number.isFinite(bv)) return 0;
    if (!Number.isFinite(av)) return 1;
    if (!Number.isFinite(bv)) return -1;
    return bv - av;
  });

const sortByValueDesc = (items, getValue) =>
  [...items].sort((a, b) => {
    const av = getValue(a);
    const bv = getValue(b);
    if (!Number.isFinite(av) && !Number.isFinite(bv)) return 0;
    if (!Number.isFinite(av)) return 1;
    if (!Number.isFinite(bv)) return -1;
    return bv - av;
  });

const ATCHU_BADGE_META = {
  qualified: { label: "진입", cls: "atchu-badge--qualified" },
  caution: { label: "주의", cls: "atchu-badge--caution" },
  down: { label: "하락", cls: "atchu-badge--down" }
};

const TickerCard = React.memo(({ item, maDistScale, periodValue, periodScale, isPeriodMode, baseLinkPath }) => {
  const displayValue = isPeriodMode ? periodValue : item.maDist;
  const style = isPeriodMode
    ? getPeriodHeatStyle(periodValue, periodScale)
    : getAtchuHeatStyle(item.maDist, item.isAtchuQualified, maDistScale);
  const level = isPeriodMode ? null : getAtchuLevel(item.maDist, item.isAtchuQualified);
  const badge = level ? ATCHU_BADGE_META[level] : null;
  const trendDays = isPeriodMode ? null : item.trendDays;
  return (
    <Link
      to={`${baseLinkPath || "/trend_list"}/${item.ticker}`}
      className="report-overview-card"
      style={style}
    >
      <div className="report-overview-card-title">{item.label || item.nameKo || item.ticker}</div>
      <div className="report-overview-card-ticker">{item.ticker}</div>
      <div className="report-overview-card-value">{formatOverviewPercent(displayValue)}</div>
      {badge && (
        <div className={`atchu-badge ${badge.cls}`}>● {badge.label}</div>
      )}
      {trendDays !== null && trendDays !== undefined && (
        <div className="report-overview-card-days">
          {trendDays.days}일째
          {item.aboveDays200 !== null && item.aboveDays200 !== undefined && (
            <span className="report-overview-card-filter-ratio">({item.aboveDays200}/20)</span>
          )}
        </div>
      )}
    </Link>
  );
});

export default function MarketHeatmap({ snapshotPayload, overviewTickers = [], periodKey = "ma200", baseLinkPath }) {
  const isPeriodMode = periodKey !== "ma200";
  const periodField = PERIOD_SNAPSHOT_KEYS[periodKey] || null;

  const getPeriodValue = (ticker) => {
    if (!periodField) return null;
    const raw = snapshotPayload?.tickers?.[ticker]?.snapshot?.[periodField];
    if (raw === null || raw === undefined) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  };

  const data = useMemo(
    () => buildOverviewData(snapshotPayload, overviewTickers),
    [snapshotPayload, overviewTickers]
  );

  const {
    coreTickers,
    styleSummary,
    bondTiles,
    smallMidTiles,
    sectorTiles,
    countryTiles,
    commodityTiles,
    leverageTiles
  } = data;

  const sorted = useMemo(() => {
    if (isPeriodMode) {
      const sortFn = (items) => sortByValueDesc(items, (item) => getPeriodValue(item.ticker));
      return {
        coreTickers: sortFn(coreTickers),
        styleSummary: styleSummary,
        bondTiles: sortFn(bondTiles),
        smallMidTiles: sortFn(smallMidTiles),
        sectorTiles: sortFn(sectorTiles),
        countryTiles: sortFn(countryTiles),
        commodityTiles: sortFn(commodityTiles),
        leverageTiles: sortFn(leverageTiles)
      };
    }
    return {
      coreTickers: sortByAtchuDesc(coreTickers),
      styleSummary: sortByAtchuDesc(styleSummary, "maDist"),
      bondTiles: sortByAtchuDesc(bondTiles),
      smallMidTiles: sortByAtchuDesc(smallMidTiles),
      sectorTiles: sortByAtchuDesc(sectorTiles),
      countryTiles: sortByAtchuDesc(countryTiles),
      commodityTiles: sortByAtchuDesc(commodityTiles),
      leverageTiles: sortByAtchuDesc(leverageTiles)
    };
  }, [data, periodKey]);

  const {
    coreTickers: sortedCoreTickers,
    styleSummary: sortedStyleSummary,
    bondTiles: sortedBondTiles,
    smallMidTiles: sortedSmallMidTiles,
    sectorTiles: sortedSectorTiles,
    countryTiles: sortedCountryTiles,
    commodityTiles: sortedCommodityTiles,
    leverageTiles: sortedLeverageTiles
  } = sorted;

  const { summaryStats, maDistScale } = useMemo(() => {
    const allIndividualTiles = [
      ...sortedCoreTickers, ...sortedBondTiles, ...sortedSmallMidTiles,
      ...sortedSectorTiles, ...sortedCountryTiles, ...sortedCommodityTiles,
      ...sortedLeverageTiles
    ];
    const allMaDistValues = [
      ...sortedCoreTickers.map((t) => t.maDist),
      ...sortedBondTiles.map((t) => t.maDist),
      ...sortedSectorTiles.map((t) => t.maDist),
      ...sortedCountryTiles.map((t) => t.maDist),
      ...sortedCommodityTiles.map((t) => t.maDist),
      ...sortedSmallMidTiles.map((t) => t.maDist),
      ...sortedLeverageTiles.map((t) => t.maDist),
      ...sortedStyleSummary.map((t) => t.maDist)
    ];
    return {
      summaryStats: buildSummaryStats(allIndividualTiles),
      maDistScale: getHeatScale(collectHeatValues([allMaDistValues]))
    };
  }, [sorted]);

  /* 기간별 모드 — 스케일 & 요약 통계 */
  const { periodScale, periodSummary } = useMemo(() => {
    if (!isPeriodMode) return { periodScale: null, periodSummary: null };
    const allTickers = [
      ...sortedCoreTickers, ...sortedBondTiles, ...sortedSmallMidTiles,
      ...sortedSectorTiles, ...sortedCountryTiles, ...sortedCommodityTiles,
      ...sortedLeverageTiles
    ];
    const values = allTickers.map((t) => getPeriodValue(t.ticker)).filter(Number.isFinite);
    const upCount = values.filter((v) => v > 0).length;
    const downCount = values.filter((v) => v < 0).length;
    const flatCount = values.filter((v) => v === 0).length;
    return {
      periodScale: getHeatScale(values),
      periodSummary: { upCount, downCount, flatCount }
    };
  }, [sorted, periodKey]);

  /* 기간별 모드 — 스타일 타입 평균 */
  const periodStyleSummary = useMemo(() => {
    if (!isPeriodMode) return null;
    return sortedStyleSummary.map((item) => {
      const values = (item.tickers || [])
        .map((t) => getPeriodValue(t))
        .filter(Number.isFinite);
      const avg = values.length > 0
        ? values.reduce((s, v) => s + v, 0) / values.length
        : null;
      return { ...item, periodAvg: avg };
    });
  }, [sortedStyleSummary, periodKey]);

  const renderTileGrid = (items) =>
    items.map((item) => (
      <TickerCard
        key={item.ticker}
        item={item}
        maDistScale={maDistScale}
        periodValue={isPeriodMode ? getPeriodValue(item.ticker) : null}
        periodScale={periodScale}
        isPeriodMode={isPeriodMode}
        baseLinkPath={baseLinkPath}
      />
    ));

  return (
    <div className="report-market-overview">
      {/* 1. 요약 바 */}
      <div className="report-summary-bar">
        <div className="report-summary-stat">
          <div className="report-summary-label">추적 자산</div>
          <div className="report-summary-value">
            {isPeriodMode ? (
              <>
                <span className="atchu-badge atchu-badge--qualified">▲ 상승 {periodSummary.upCount}</span>
                {" · "}
                <span className="atchu-badge atchu-badge--down">▼ 하락 {periodSummary.downCount}</span>
                {periodSummary.flatCount > 0 && (
                  <>
                    {" · "}
                    <span className="atchu-badge atchu-badge--caution">— 보합 {periodSummary.flatCount}</span>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="atchu-badge atchu-badge--qualified">● 진입 {summaryStats.qualifiedCount}</span>
                {" · "}
                <span className="atchu-badge atchu-badge--caution">● 주의 {summaryStats.cautionCount}</span>
                {" · "}
                <span className="atchu-badge atchu-badge--down">● 하락 {summaryStats.downCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. 핵심 지수 */}
      <div className="report-heat-section">
        <div className="report-overview-title">핵심 지수</div>
        <div className="report-overview-grid">
          {renderTileGrid(sortedCoreTickers)}
        </div>
      </div>

      {/* 3. 섹터 ETF */}
      {sortedSectorTiles.length > 0 && (
        <div className="report-heat-section">
          <div className="report-overview-title">섹터 ETF</div>
          <div className="report-overview-grid">
            {renderTileGrid(sortedSectorTiles)}
          </div>
        </div>
      )}

      {/* 4. 채권 ETF */}
      {sortedBondTiles.length > 0 && (
        <div className="report-heat-section">
          <div className="report-overview-title">채권 ETF</div>
          <div className="report-overview-grid">
            {renderTileGrid(sortedBondTiles)}
          </div>
        </div>
      )}

      {/* 5. 국가 ETF */}
      {sortedCountryTiles.length > 0 && (
        <div className="report-heat-section">
          <div className="report-overview-title">국가 ETF</div>
          <div className="report-overview-grid">
            {renderTileGrid(sortedCountryTiles)}
          </div>
        </div>
      )}

      {/* 6. 원자재 ETF */}
      {sortedCommodityTiles.length > 0 && (
        <div className="report-heat-section">
          <div className="report-overview-title">원자재 ETF</div>
          <div className="report-overview-grid">
            {renderTileGrid(sortedCommodityTiles)}
          </div>
        </div>
      )}

      {/* 7. 스타일 (타입 평균) */}
      <div className="report-heat-section">
        <div className="report-overview-title">스타일 (타입 평균)</div>
        <div className="report-overview-grid">
          {isPeriodMode
            ? (periodStyleSummary || []).map((item) => (
                <div
                  key={item.type}
                  className="report-overview-card"
                  style={getPeriodHeatStyle(item.periodAvg, periodScale)}
                >
                  <div className="report-overview-card-title">{item.type}</div>
                  <div className="report-overview-card-value">{formatOverviewPercent(item.periodAvg)}</div>
                </div>
              ))
            : sortedStyleSummary.map((item) => {
                const level = getAtchuLevel(item.maDist, item.isAtchuQualified);
                const badge = level ? ATCHU_BADGE_META[level] : null;
                return (
                  <div key={item.type} className="report-overview-card" style={getAtchuHeatStyle(item.maDist, item.isAtchuQualified, maDistScale)}>
                    <div className="report-overview-card-title">{item.type}</div>
                    <div className="report-overview-card-value">{formatOverviewPercent(item.maDist)}</div>
                    <div className="report-overview-card-sub">
                      {badge && (
                        <span className={`atchu-badge ${badge.cls}`}>● {badge.label}</span>
                      )}
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* 8. 중소형 ETF */}
      {sortedSmallMidTiles.length > 0 && (
        <div className="report-heat-section">
          <div className="report-overview-title">중소형 ETF</div>
          <div className="report-overview-grid">
            {renderTileGrid(sortedSmallMidTiles)}
          </div>
        </div>
      )}

      {/* 9. 레버리지·인버스 */}
      {sortedLeverageTiles.length > 0 && (
        <div className="report-heat-section">
          <div className="report-overview-title">레버리지·인버스 ETF</div>
          <div className="report-overview-grid">
            {renderTileGrid(sortedLeverageTiles)}
          </div>
        </div>
      )}
    </div>
  );
}
