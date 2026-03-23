import React from "react";
import { Link } from "react-router-dom";
import EtfSummaryMovingAverages from "./EtfSummaryMovingAverages";

function EtfSummaryCard({
  ticker,
  open,
  high,
  low,
  close,
  changePercent,
  movingAverages,
  percentDiffs,
  holdingDays,
  holdingDirection,
  isAtchuQualified,
  aboveDays200,
  cagrFinal,
  cagrFinalLabel,
  mddFinal,
  dataStartDate,
  isStaleClose,
  marketStatusLabel,
  maAlignment,
  maAlignmentDays,
  meta,
  to,
}) {
  const formatPrice = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "-";
    }
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "-";
    }
    return `${Number(value).toFixed(2)}%`;
  };

  const formatSignedPercent = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "-";
    }
    const num = Number(value);
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}%`;
  };

  const changeClass =
    changePercent === null || changePercent === undefined
      ? ""
      : Number(changePercent) >= 0
      ? "change-up"
      : "change-down";
  const cagrFinalClass =
    cagrFinal === null || cagrFinal === undefined
      ? ""
      : Number(cagrFinal) >= 0
      ? "change-up"
      : "change-down";
  const mddFinalClass =
    mddFinal === null || mddFinal === undefined
      ? ""
      : "change-down";
  const dataStartLabel = (() => {
    if (!dataStartDate) return null;
    const d = new Date(dataStartDate);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  })();
  const maItems = [
    {
      label: "200일",
      value: movingAverages?.two_hundred_day,
      diff: percentDiffs?.two_hundred_day,
      breakoutDays: holdingDays?.two_hundred,
      breakoutDirection: holdingDirection?.two_hundred
    }
  ];

  const displayMaItems = maItems;

  const openNum = Number(open);
  const highNum = Number(high);
  const lowNum = Number(low);
  const closeNum = Number(close);
  const hasCandle =
    Number.isFinite(openNum) &&
    Number.isFinite(highNum) &&
    Number.isFinite(lowNum) &&
    Number.isFinite(closeNum) &&
    highNum >= lowNum;
  const candleRange = hasCandle ? Math.max(highNum - lowNum, 0.000001) : 1;
  const toY = (value) => ((highNum - value) / candleRange) * 20 + 2;
  const yHigh = hasCandle ? toY(highNum) : 2;
  const yLow = hasCandle ? toY(lowNum) : 22;
  const yOpen = hasCandle ? toY(openNum) : 12;
  const yClose = hasCandle ? toY(closeNum) : 12;
  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1.5);
  const candleClass = changePercent !== null && changePercent !== undefined
    ? Number(changePercent) >= 0 ? "up" : "down"
    : closeNum >= openNum ? "up" : "down";
  const rawSuitability =
    meta?.trendFollowing?.suitability ||
    meta?.trend_following?.suitability ||
    null;
  const suitabilityLabel =
    rawSuitability === "적합"
      ? "추세추종 적합"
      : rawSuitability === "고위험"
      ? "고위험"
      : rawSuitability;
  const suitabilityClass =
    rawSuitability === "적합"
      ? "type-suitability-fit"
      : rawSuitability === "고위험"
      ? "type-suitability-danger"
      : "";
  const shortDescription = meta?.shortDescription || meta?.short_description || "-";
  const Wrapper = to ? Link : "div";
  const wrapperProps = to ? { to, className: "index-card" } : { className: "index-card index-card-static" };
  return (
    <Wrapper {...wrapperProps}>
      <div className="index-card-head">
        <span className="ticker-pill">{ticker}</span>
        {meta?.nameKo && <span className="ticker-name-ko">{meta.nameKo}</span>}
        {suitabilityLabel && (
          <span className={`type-suitability-badge ${suitabilityClass}`}>
            {suitabilityLabel}
          </span>
        )}
      </div>
      <div className="index-card-body">
        <div className="index-card-left">
          {isAtchuQualified !== null && (
            <div className={`atchu-filter-indicator ${isAtchuQualified ? "atchu-active" : "atchu-inactive"}`}>
              <span className="atchu-filter-dot" />
              <span className="atchu-filter-text">
                앗추 필터 {isAtchuQualified ? "적용 중" : "이탈"}{aboveDays200 !== null ? ` (${aboveDays200}/20일)` : ""}
              </span>
            </div>
          )}
          {maAlignment && maAlignment !== "none" && (
            <div className={`atchu-filter-indicator ma-alignment-indicator ma-alignment-${maAlignment}`}>
              <span className="atchu-filter-dot" />
              <span className="atchu-filter-text">
                이평선 {maAlignment === "full" ? "정배열" : maAlignment === "partial" ? "부분 정배열" : "역배열"}
                {maAlignmentDays != null && ` ${maAlignmentDays}일째`}
              </span>
            </div>
          )}
          <div className="index-price-row">
            <div className="index-price">{formatPrice(close)}</div>
            <div className={`index-change ${changeClass}`}>({formatPercent(changePercent)})</div>
            {hasCandle ? (
              <svg className={`index-price-candle ${candleClass}`} viewBox="0 0 14 24" aria-hidden="true">
                <line x1="7" y1={yHigh} x2="7" y2={yLow} className="index-price-candle-wick" />
                <rect
                  x="3"
                  y={bodyTop}
                  width="8"
                  height={bodyHeight}
                  rx="1"
                  className="index-price-candle-body"
                />
              </svg>
            ) : (
              <span className="index-price-candle-empty">-</span>
            )}
          </div>
          {marketStatusLabel && (
            <div className="market-status-note">{marketStatusLabel}</div>
          )}
          {isStaleClose && (
            <div className="stale-close-note">[금일 종가 업데이트 미적용]</div>
          )}
          <div className="index-info">
            <span className="index-info-label">간단한 설명</span>
            <span className="index-info-value">{shortDescription}</span>
          </div>
        </div>
        <div className="index-card-right">
          <EtfSummaryMovingAverages
            items={displayMaItems}
            formatPrice={formatPrice}
            formatSignedPercent={formatSignedPercent}
            cagrValue={cagrFinal !== null && cagrFinal !== undefined ? formatSignedPercent(cagrFinal) : null}
            cagrClass={cagrFinalClass}
            mddValue={mddFinal !== null && mddFinal !== undefined ? formatSignedPercent(mddFinal) : null}
            mddClass={mddFinalClass}
            dataStartLabel={dataStartLabel}
          />
        </div>
      </div>
    </Wrapper>
  );
}

export default React.memo(EtfSummaryCard);
