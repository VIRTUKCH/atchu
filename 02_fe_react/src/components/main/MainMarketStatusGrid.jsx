import { useMemo } from "react";

const toPercent = (value) => `${Math.round(value)}%`;

const TYPE_DISPLAY_ORDER = [
  "미국 대표 지수", "스타일", "배당", "섹터", "국가", "채권", "원자재", "중소형"
];
const TYPE_ORDER_MAP = new Map(TYPE_DISPLAY_ORDER.map((t, i) => [t, i]));

export default function MainMarketStatusGrid({ items, onTypeSelect }) {
  const sortedItems = useMemo(() => {
    const withRatio = items.map(([type, counts]) => {
      const r = counts.total > 0 ? (counts.above / counts.total) * 100 : 0;
      return [type, counts, r];
    });
    return [...withRatio].sort((a, b) => {
      const aRank = TYPE_ORDER_MAP.has(a[0]) ? TYPE_ORDER_MAP.get(a[0]) : Number.MAX_SAFE_INTEGER;
      const bRank = TYPE_ORDER_MAP.has(b[0]) ? TYPE_ORDER_MAP.get(b[0]) : Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
  }, [items]);

  return (
    <>
      <div className="main-market-grid">
        {sortedItems.map(([type, counts, ratio]) => {
          const above = counts.above;
          return (
            <button
              key={type}
              type="button"
              className="main-market-card"
              onClick={() => onTypeSelect?.(type)}
              title={`${type} 타입 추세 조회`}
            >
              <div className="main-market-card-head">
                <span className="main-market-type">{type}</span>
                <span className="main-market-count">
                  {above}/{counts.total}
                </span>
              </div>
              <div className="main-market-bar" title={`${toPercent(ratio)} 상승 추세`}>
                <div className="main-market-bar-fill" style={{ width: `${ratio}%` }} />
              </div>
              <div className="main-market-ratio">{toPercent(ratio)}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
