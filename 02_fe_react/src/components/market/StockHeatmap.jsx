import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const PERIOD_SNAPSHOT_KEYS = {
  "1d": "percentChangeFromPreviousClose",
  "5d": "percentChange5d",
  "63d": "percentChange63d",
  "252d": "percentChange252d",
  "1260d": "percentChange1260d"
};

const formatPercent = (value) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-";
  const num = Number(value);
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
};

const getHeatScale = (values) => {
  const positives = values.filter((v) => v > 0);
  const negatives = values.filter((v) => v < 0).map((v) => Math.abs(v));
  return {
    maxPositive: positives.length ? Math.max(...positives) : 0,
    maxNegative: negatives.length ? Math.max(...negatives) : 0
  };
};

const getAtchuHeatStyle = (maDist, isAtchuQualified, scale) => {
  if (maDist === null || maDist === undefined || !Number.isFinite(Number(maDist))) return undefined;
  const num = Number(maDist);
  const baseAlpha = 0.18;
  const maxAlpha = 0.72;
  let alpha, bg;
  if (num >= 0) {
    const denom = scale.maxPositive > 0 ? scale.maxPositive : 1;
    const ratio = Math.min(Math.max(num / denom, 0), 1);
    alpha = baseAlpha + ratio * (maxAlpha - baseAlpha);
    bg = isAtchuQualified === true
      ? `rgba(34, 197, 94, ${alpha.toFixed(3)})`
      : `rgba(249, 115, 22, ${alpha.toFixed(3)})`;
  } else {
    const denom = scale.maxNegative > 0 ? scale.maxNegative : 1;
    const ratio = Math.min(Math.max(Math.abs(num) / denom, 0), 1);
    alpha = baseAlpha + ratio * (maxAlpha - baseAlpha);
    bg = `rgba(29, 91, 255, ${alpha.toFixed(3)})`;
  }
  return alpha >= 0.48
    ? { background: bg, "--tile-text": "rgba(255,255,255,0.92)" }
    : { background: bg };
};

const getPeriodHeatStyle = (value, scale) => {
  if (!Number.isFinite(Number(value))) return undefined;
  const num = Number(value);
  const baseAlpha = 0.18;
  const maxAlpha = 0.72;
  let alpha, bg;
  if (num >= 0) {
    const denom = scale.maxPositive > 0 ? scale.maxPositive : 1;
    alpha = baseAlpha + Math.min(num / denom, 1) * (maxAlpha - baseAlpha);
    bg = `rgba(34, 197, 94, ${alpha.toFixed(3)})`;
  } else {
    const denom = scale.maxNegative > 0 ? scale.maxNegative : 1;
    alpha = baseAlpha + Math.min(Math.abs(num) / denom, 1) * (maxAlpha - baseAlpha);
    bg = `rgba(239, 68, 68, ${alpha.toFixed(3)})`;
  }
  return alpha >= 0.48
    ? { background: bg, "--tile-text": "rgba(255,255,255,0.92)" }
    : { background: bg };
};

const getAtchuLevel = (maDist, isAtchuQualified) => {
  if (!Number.isFinite(Number(maDist))) return null;
  if (Number(maDist) < 0) return "down";
  return isAtchuQualified === true ? "qualified" : "caution";
};

const BADGE_META = {
  qualified: { label: "진입", cls: "atchu-badge--qualified" },
  caution: { label: "주의", cls: "atchu-badge--caution" },
  down: { label: "하락", cls: "atchu-badge--down" }
};

const sortByAtchu = (items) =>
  [...items].sort((a, b) => {
    const order = { qualified: 0, caution: 1, down: 2, null: 3 };
    const diff = (order[getAtchuLevel(a.maDist, a.isAtchuQualified)] ?? 3) -
                 (order[getAtchuLevel(b.maDist, b.isAtchuQualified)] ?? 3);
    if (diff !== 0) return diff;
    const av = Number(a.maDist), bv = Number(b.maDist);
    if (!Number.isFinite(av)) return 1;
    if (!Number.isFinite(bv)) return -1;
    return bv - av;
  });

const sortByValue = (items, getValue) =>
  [...items].sort((a, b) => {
    const av = getValue(a), bv = getValue(b);
    if (!Number.isFinite(av)) return 1;
    if (!Number.isFinite(bv)) return -1;
    return bv - av;
  });

const Tile = React.memo(({ item, maDistScale, periodValue, periodScale, isPeriodMode, baseLinkPath }) => {
  const displayValue = isPeriodMode ? periodValue : item.maDist;
  const style = isPeriodMode
    ? getPeriodHeatStyle(periodValue, periodScale)
    : getAtchuHeatStyle(item.maDist, item.isAtchuQualified, maDistScale);
  const level = isPeriodMode ? null : getAtchuLevel(item.maDist, item.isAtchuQualified);
  const badge = level ? BADGE_META[level] : null;
  const trendDays = isPeriodMode ? null : item.trendDays;
  return (
    <Link to={`${baseLinkPath || "/_stocks"}/${item.ticker}`} className="report-overview-card" style={style}>
      <div className="report-overview-card-title">{item.label || item.ticker}</div>
      <div className="report-overview-card-ticker">{item.ticker}</div>
      <div className="report-overview-card-value">{formatPercent(displayValue)}</div>
      {badge && <div className={`atchu-badge ${badge.cls}`}>● {badge.label}</div>}
      {trendDays !== null && trendDays !== undefined && (
        <div className="report-overview-card-days">
          {trendDays.days}일째
          {item.aboveDays200 != null && <span className="report-overview-card-filter-ratio">({item.aboveDays200}/20)</span>}
        </div>
      )}
    </Link>
  );
});

export default function StockHeatmap({ snapshotPayload, overviewTickers = [], periodKey = "ma200", baseLinkPath }) {
  const isPeriodMode = periodKey !== "ma200";
  const periodField = PERIOD_SNAPSHOT_KEYS[periodKey] || null;

  const getPeriodValue = (ticker) => {
    if (!periodField) return null;
    const raw = snapshotPayload?.tickers?.[ticker]?.snapshot?.[periodField];
    return Number.isFinite(Number(raw)) ? Number(raw) : null;
  };

  // 섹터별 타일 빌드
  const { sectorGroups, allTiles } = useMemo(() => {
    const tickersData = snapshotPayload?.tickers || {};
    const sectorMap = {};
    const tiles = [];

    overviewTickers.forEach((item) => {
      const ticker = String(item.ticker || "").toUpperCase();
      const data = tickersData[ticker];
      if (!data?.snapshot) return;
      const snap = data.snapshot;
      const sector = item.group || item.type || "기타";
      const tile = {
        ticker,
        maDist: Number.isFinite(Number(snap.percentDiff200)) ? Number(snap.percentDiff200) : null,
        isAtchuQualified: snap.isAtchuQualified200 === true,
        aboveDays200: Number.isFinite(Number(snap.aboveDays200)) ? Number(snap.aboveDays200) : null,
        trendDays: (() => {
          const h = data.trendHolding?.items?.[0];
          return h?.days != null ? { days: Number(h.days), direction: h.direction } : null;
        })(),
        label: item.heatmap_label || item.ticker,
        nameKo: item.name_ko || item.nameKo || ""
      };
      if (!sectorMap[sector]) sectorMap[sector] = [];
      sectorMap[sector].push(tile);
      tiles.push(tile);
    });

    // 섹터별 앗추 필터 통과 비율 내림차순 정렬
    const groups = Object.entries(sectorMap)
      .map(([sector, items]) => {
        const qualified = items.filter((t) => t.isAtchuQualified).length;
        return { sector, items, qualified, total: items.length, pct: items.length > 0 ? qualified / items.length : 0 };
      })
      .sort((a, b) => b.pct - a.pct);

    return { sectorGroups: groups, allTiles: tiles };
  }, [snapshotPayload, overviewTickers]);

  // 스케일 계산
  const maDistScale = useMemo(() => {
    const values = allTiles.map((t) => t.maDist).filter(Number.isFinite);
    return getHeatScale(values);
  }, [allTiles]);

  const periodScale = useMemo(() => {
    if (!isPeriodMode) return null;
    const values = allTiles.map((t) => getPeriodValue(t.ticker)).filter(Number.isFinite);
    return getHeatScale(values);
  }, [allTiles, periodKey]);

  // 요약 통계
  const summary = useMemo(() => {
    const valid = allTiles.filter((t) => Number.isFinite(t.maDist));
    if (isPeriodMode) {
      const values = allTiles.map((t) => getPeriodValue(t.ticker)).filter(Number.isFinite);
      return { up: values.filter((v) => v > 0).length, down: values.filter((v) => v < 0).length };
    }
    return {
      qualified: valid.filter((t) => t.isAtchuQualified).length,
      caution: valid.filter((t) => !t.isAtchuQualified && t.maDist >= 0).length,
      down: valid.filter((t) => t.maDist < 0).length
    };
  }, [allTiles, periodKey]);

  const renderTiles = (items) => {
    const sorted = isPeriodMode
      ? sortByValue(items, (t) => getPeriodValue(t.ticker))
      : sortByAtchu(items);
    return sorted.map((item) => (
      <Tile
        key={item.ticker}
        item={item}
        maDistScale={maDistScale}
        periodValue={isPeriodMode ? getPeriodValue(item.ticker) : null}
        periodScale={periodScale}
        isPeriodMode={isPeriodMode}
        baseLinkPath={baseLinkPath}
      />
    ));
  };

  return (
    <div className="report-market-overview">
      <div className="report-summary-bar">
        <div className="report-summary-stat">
          <div className="report-summary-label">S&P 500 종목</div>
          <div className="report-summary-value">
            {isPeriodMode ? (
              <>
                <span className="atchu-badge atchu-badge--qualified">▲ 상승 {summary.up}</span>
                {" · "}
                <span className="atchu-badge atchu-badge--down">▼ 하락 {summary.down}</span>
              </>
            ) : (
              <>
                <span className="atchu-badge atchu-badge--qualified">● 진입 {summary.qualified}</span>
                {" · "}
                <span className="atchu-badge atchu-badge--caution">● 주의 {summary.caution}</span>
                {" · "}
                <span className="atchu-badge atchu-badge--down">● 하락 {summary.down}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {sectorGroups.map(({ sector, items, qualified, total }) => (
        <div key={sector} className="report-heat-section">
          <div className="report-overview-title">
            {sector} ({qualified}/{total})
          </div>
          <div className="report-overview-grid">
            {renderTiles(items)}
          </div>
        </div>
      ))}
    </div>
  );
}
