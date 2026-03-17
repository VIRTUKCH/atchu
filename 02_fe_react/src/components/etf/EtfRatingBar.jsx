import React from "react";

const allowedRatings = new Set([
  "STRONG_BUY",
  "BUY",
  "NEUTRAL",
  "SELL",
  "STRONG_SELL",
  "UNKNOWN"
]);

const ratingLabels = {
  STRONG_BUY: "적극매수",
  BUY: "매수",
  NEUTRAL: "중립",
  SELL: "매도",
  STRONG_SELL: "적극매도",
  UNKNOWN: "알 수 없음"
};

const ratingIndexMap = {
  STRONG_SELL: 0,
  SELL: 1,
  NEUTRAL: 2,
  BUY: 3,
  STRONG_BUY: 4
};

export default function EtfRatingBar({ rating }) {
  const ratingRaw = String(rating || "UNKNOWN").toUpperCase();
  const normalized = allowedRatings.has(ratingRaw) ? ratingRaw : "UNKNOWN";
  const ratingIndex = ratingIndexMap[normalized] ?? null;

  const labelKeys = ["STRONG_SELL", "SELL", "NEUTRAL", "BUY", "STRONG_BUY"];

  return (
    <div className="analyst-rating-bar">
      <div
        className={`rating-track ${ratingIndex === null ? "is-unknown" : ""}`}
        data-rating={normalized}
        style={ratingIndex === null ? undefined : { "--rating-index": ratingIndex }}
      >
        {labelKeys.map((key, index) => (
          <div
            key={key}
            className={`rating-segment ${
              ratingIndex !== null && ratingIndex === index ? "is-active" : ""
            }`}
          >
            <span>{ratingLabels[key]}</span>
          </div>
        ))}
      </div>
      {ratingIndex === null && <div className="rating-unknown">알 수 없음</div>}
    </div>
  );
}
