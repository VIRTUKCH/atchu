import { useState, useRef } from "react";

const formatPeriodLabel = (date, periodType) => {
  if (!date) return "";
  if (periodType === "monthly") {
    const [y, m] = date.split("-");
    return `${y}년 ${parseInt(m, 10)}월`;
  }
  if (periodType === "weekly") {
    return `${date} 주간`;
  }
  return date;
};

const formatVolume = (v) => {
  if (v == null) return "-";
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
};

export default function PriceTrendChart({
  title = "가격/이평선 그래프",
  series = [],
  variant = "line",
  periodType = "daily"
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipXPct, setTooltipXPct] = useState(0);
  const svgRef = useRef(null);

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

  const baseValueKeys = ["close", "ma50", "ma200"];
  const candleValueKeys = ["open", "high", "low", "closeRaw", "ma50", "ma200"];
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

  const handleMouseMove = (e) => {
    if (!svgRef.current || !series.length || variant !== "candle") return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const svgY = ((e.clientY - rect.top) / rect.height) * height;
    if (svgX < plotLeft || svgX > plotRight || svgY < plotTop || svgY > plotBottom) {
      setHoveredItem(null);
      return;
    }
    const index = Math.max(
      0,
      Math.min(series.length - 1, Math.round(((svgX - plotLeft) / plotWidth) * (series.length - 1)))
    );
    const item = series[index];
    const candleX = plotLeft + (series.length <= 1 ? 0 : (index / (series.length - 1)) * plotWidth);
    setHoveredItem(item);
    setTooltipXPct((candleX - plotLeft) / plotWidth);
  };

  const closeSegments = buildSegments(series, "close");
  const ma50Segments = buildSegments(series, "ma50");
  const ma200Segments = buildSegments(series, "ma200");
  const hasMa50 = ma50Segments.some((s) => s.length > 0);
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
          {variant === "candle" ? (
            <>
              <span className="legend-item legend-candle-up">상승</span>
              <span className="legend-item legend-candle-down">하락</span>
              {hasMa50 && <span className="legend-item legend-ma50">50일선</span>}
              <span className="legend-item legend-ma200">200일선</span>
            </>
          ) : (
            <>
              <span className="legend-item legend-close">종가</span>
              {hasMa50 && <span className="legend-item legend-ma50">50일선</span>}
              <span className="legend-item legend-ma200">200일선</span>
            </>
          )}
        </div>
      </div>
      {hoveredItem && (
        <div
          className="candle-tooltip"
          style={{ left: `${Math.min(80, Math.max(5, tooltipXPct * 100))}%` }}
        >
          <div className="candle-tooltip-date">
            {formatPeriodLabel(hoveredItem.date, periodType)}
          </div>
          <div className="candle-tooltip-row">
            <span>시가</span>
            <span>{hoveredItem.open?.toFixed(2)}</span>
          </div>
          <div className="candle-tooltip-row">
            <span>고가</span>
            <span>{hoveredItem.high?.toFixed(2)}</span>
          </div>
          <div className="candle-tooltip-row">
            <span>저가</span>
            <span>{hoveredItem.low?.toFixed(2)}</span>
          </div>
          <div className="candle-tooltip-row">
            <span>종가</span>
            <span>{hoveredItem.closeRaw?.toFixed(2)}</span>
          </div>
          <div className="candle-tooltip-row">
            <span>거래량</span>
            <span>{formatVolume(hoveredItem.volume)}</span>
          </div>
          {hoveredItem.open != null && hoveredItem.open !== 0 && hoveredItem.closeRaw != null && (
            <div className="candle-tooltip-row">
              <span>등락률</span>
              <span style={{
                color: hoveredItem.closeRaw >= hoveredItem.open ? "#f87171" : "#60a5fa"
              }}>
                {hoveredItem.closeRaw >= hoveredItem.open ? "+" : ""}
                {(((hoveredItem.closeRaw - hoveredItem.open) / hoveredItem.open) * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}
      <svg
        ref={svgRef}
        className="detail-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredItem(null)}
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
            const candleClass = isUp ? "chart-candle-up" : "chart-candle-down";
            return (
              <g key={`candle-${index}`} className={candleClass}>
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
        {ma50Segments.map((points, index) => (
          <polyline
            key={`ma50-${index}`}
            points={points}
            className="chart-line chart-ma50"
          />
        ))}
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
