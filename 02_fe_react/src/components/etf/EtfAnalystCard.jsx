import React from "react";
import EtfRatingBar from "./EtfRatingBar";
import AnalystHeader from "../layout/AnalystHeader";

const parsePriceNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  const num = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(num) ? null : num;
};

export default function EtfAnalystCard({ item, close, formatPrice, formatSignedPercent }) {
  const hasLink = Boolean(item.url);
  const rating = item.rating;
  const upperValue = parsePriceNumber(item.target_price_upper);
  const lowerValue = parsePriceNumber(item.target_price_lower);
  const upperDiff =
    upperValue !== null && close
      ? ((Number(upperValue) - Number(close)) / Number(close)) * 100
      : null;
  const lowerDiff =
    lowerValue !== null && close
      ? ((Number(lowerValue) - Number(close)) / Number(close)) * 100
      : null;
  const upperClass =
    upperDiff === null || upperDiff === undefined ? "" : upperDiff >= 0 ? "trend-up" : "trend-down";
  const lowerClass =
    lowerDiff === null || lowerDiff === undefined ? "" : lowerDiff >= 0 ? "trend-up" : "trend-down";

  return (
    <a
      className={`analyst-card ${hasLink ? "is-link" : "is-static"}`}
      href={hasLink ? item.url : undefined}
      target={hasLink ? "_blank" : undefined}
      rel={hasLink ? "noreferrer" : undefined}
    >
      <AnalystHeader
        title={item.headline}
        date={item.date}
        source={item.source}
        author={item.author}
      />
      <EtfRatingBar rating={rating} />
      {(upperValue !== null || lowerValue !== null) && (
        <div className="analyst-target-grid">
          <div className="detail-metric">
            <span>목표 하단</span>
            <strong>{formatPrice(lowerValue ?? item.target_price_lower)}</strong>
            <em className={`metric-change ${lowerClass}`}>{formatSignedPercent(lowerDiff)}</em>
          </div>
          <div className="detail-metric">
            <span>목표 상단</span>
            <strong>{formatPrice(upperValue ?? item.target_price_upper)}</strong>
            <em className={`metric-change ${upperClass}`}>{formatSignedPercent(upperDiff)}</em>
          </div>
        </div>
      )}
      <p>{item.summary}</p>
      {(item.quote_korean || item.quote_original) && (
        <>
          <div className="analyst-divider" />
          <div className="analyst-translation">
            {item.quote_original && (
              <>
                <div className="analyst-translation-title">원문 인용</div>
                <p>{item.quote_original}</p>
              </>
            )}
            <div className="analyst-translation-title">번역 인용</div>
            <p>{item.quote_korean}</p>
          </div>
        </>
      )}
    </a>
  );
}
