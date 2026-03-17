export default function PriceTrendChart({
  title = "가격/이평선 그래프",
  series = [],
  variant = "line"
}) {
  const height = 260;
  const width = 1000;
  const paddingX = 24;
  const paddingY = 18;
  const axisLeftSpace = 42;
  const axisBottomSpace = 22;
  const plotLeft = paddingX + axisLeftSpace;
  const plotRight = width - paddingX;
  const plotTop = paddingY;
  const plotBottom = height - paddingY - axisBottomSpace;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  if (!series.length) {
    return (
      <div className="detail-chart-card">
        <div className="detail-chart-title">{title}</div>
        <div className="detail-chart-empty">그래프에 표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  const baseValueKeys = ["close", "ma200"];
  const candleValueKeys = ["open", "high", "low", "closeRaw", ...baseValueKeys];
  const valueKeys = variant === "candle" ? candleValueKeys : baseValueKeys;
  const values = series.flatMap((item) =>
    valueKeys.map((key) => item?.[key]).filter((value) => value !== null && value !== undefined)
  );
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const toPoint = (value, index, count) => {
    if (value === null || value === undefined) {
      return null;
    }
    const x = plotLeft + (count <= 1 ? 0 : (index / (count - 1)) * plotWidth);
    const ratio = (value - minValue) / valueRange;
    const y = plotTop + (1 - ratio) * plotHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  const buildSegments = (items, key) => {
    const segments = [];
    let current = [];
    items.forEach((item, index) => {
      const point = toPoint(item?.[key], index, items.length);
      if (point) {
        current.push(point);
      } else if (current.length) {
        segments.push(current.join(" "));
        current = [];
      }
    });
    if (current.length) {
      segments.push(current.join(" "));
    }
    return segments;
  };

  const closeSegments = buildSegments(series, "close");
  const ma200Segments = buildSegments(series, "ma200");
  const candleWidth = Math.max(2, Math.min(8, plotWidth / Math.max(1, series.length) * 0.6));
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, index) => {
    const ratio = yTicks === 0 ? 0 : index / yTicks;
    const value = maxValue - ratio * valueRange;
    const y = plotTop + ratio * plotHeight;
    return { value, y };
  });
  const xTicks = 4;
  const xTickIndexes = Array.from({ length: xTicks + 1 }, (_, index) => {
    const ratio = xTicks === 0 ? 0 : index / xTicks;
    return Math.round(ratio * (series.length - 1));
  });

  return (
    <div className="detail-chart-card">
      <div className="detail-chart-header">
        <div className="detail-chart-title">
          {title}
          <span className="detail-chart-note">(모바일은 가로 권장)</span>
        </div>
        <div className="detail-chart-legend">
          <span className="legend-item legend-close">종가</span>
          <span className="legend-item legend-ma200">200일선</span>
        </div>
      </div>
      <svg
        className="detail-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <line
          x1={plotLeft}
          y1={plotTop}
          x2={plotLeft}
          y2={plotBottom}
          className="chart-axis"
        />
        <line
          x1={plotLeft}
          y1={plotBottom}
          x2={plotRight}
          y2={plotBottom}
          className="chart-axis"
        />
        {yTickValues.map((tick, index) => (
          <g key={`y-${index}`}>
            <line
              x1={plotLeft - 4}
              y1={tick.y}
              x2={plotLeft}
              y2={tick.y}
              className="chart-tick"
            />
            <text
              x={plotLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="chart-axis-label"
            >
              {tick.value.toFixed(2)}
            </text>
          </g>
        ))}
        {xTickIndexes.map((index) => {
          const item = series[index];
          if (!item) {
            return null;
          }
          const x =
            plotLeft + (series.length <= 1 ? 0 : (index / (series.length - 1)) * plotWidth);
          const label = item.date || "";
          return (
            <g key={`x-${index}`}>
              <line
                x1={x}
                y1={plotBottom}
                x2={x}
                y2={plotBottom + 4}
                className="chart-tick"
              />
              <text
                x={x}
                y={plotBottom + 16}
                textAnchor="middle"
                className="chart-axis-label"
              >
                {label}
              </text>
            </g>
          );
        })}
        {variant === "line" &&
          closeSegments.map((points, index) => (
            <polyline
              key={`close-${index}`}
              points={points}
              className="chart-line chart-close"
            />
          ))}
        {variant === "candle" &&
          series.map((item, index) => {
            const openValue = item?.open ?? null;
            const highValue = item?.high ?? null;
            const lowValue = item?.low ?? null;
            const closeValue = item?.closeRaw ?? null;
            if (
              openValue === null ||
              highValue === null ||
              lowValue === null ||
              closeValue === null
            ) {
              return null;
            }
            const x =
              plotLeft + (series.length <= 1 ? 0 : (index / (series.length - 1)) * plotWidth);
            const toY = (value) =>
              plotTop + (1 - (value - minValue) / valueRange) * plotHeight;
            const yHigh = toY(highValue);
            const yLow = toY(lowValue);
            const yOpen = toY(openValue);
            const yClose = toY(closeValue);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));
            const isUp = closeValue >= openValue;
            const className = isUp ? "chart-candle-up" : "chart-candle-down";
            return (
              <g key={`candle-${index}`} className={className}>
                <line x1={x} y1={yHigh} x2={x} y2={yLow} className="chart-wick" />
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  className="chart-body"
                />
              </g>
            );
          })}
        {ma200Segments.map((points, index) => (
          <polyline
            key={`ma200-${index}`}
            points={points}
            className="chart-line chart-ma200"
          />
        ))}
      </svg>
    </div>
  );
}
