import React from "react";

export default function EtfTrendCards({
  movingAverages,
  percentDiffs,
  formatPrice,
  formatSignedPercent
}) {
  const items = [
    {
      label: "200일 추세",
      value: movingAverages?.two_hundred_day,
      percent: percentDiffs?.two_hundred_day
    }
  ];

  return (
    <div className="trend-block">
      <div className="trend-title">추세</div>
      <p className="section-description">
        현재가가 이동평균선보다 위(+)에 있으면 상승 추세, 아래(-)에 있으면 하락 추세입니다.
      </p>
      <div className="trend-grid">
        {items.map((item) => {
          const diff = item.percent ?? null;
          const diffClass =
            diff === null || diff === undefined ? "" : diff >= 0 ? "trend-up" : "trend-down";
          return (
            <div key={item.label} className={`detail-metric trend-card ${diffClass}`}>
              <span>{item.label}</span>
              <strong>{formatPrice(item.value)}</strong>
              <em className={`metric-change ${diffClass}`}>{formatSignedPercent(diff)}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}
