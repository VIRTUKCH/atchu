import { useMemo, useState } from "react";

const formatActionLabel = (direction) => {
  if (direction === "up") {
    return "매수";
  }
  if (direction === "down") {
    return "매도";
  }
  return "-";
};

const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return Number(value).toFixed(digits);
};

const resolveValueClass = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }
  if (value > 0) {
    return "detail-crossing-up";
  }
  if (value < 0) {
    return "detail-crossing-down";
  }
  return "";
};

const formatShortDate = (value) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return `${year.slice(2)}/${month}/${day}`;
    }
    return value;
  }
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

export default function TrendCrossingHistoryCard({
  items = [],
  pageSize = 20,
  yearsOfData,
  periods = [200],
  periodLabels = {},
  statsMap = {},
  annualizedMap = {},
  mddMap = {},
  formatPrice,
  formatSignedPercent
}) {
  const [pageByPeriod, setPageByPeriod] = useState(() =>
    periods.reduce((acc, period) => {
      acc[period] = 1;
      return acc;
    }, {})
  );

  const itemsByPeriod = useMemo(() => {
    const map = {};
    periods.forEach((period) => {
      map[period] = items.filter((item) => item.period === period);
    });
    return map;
  }, [items, periods]);

  const sortedPeriods = useMemo(() => [...periods], [periods]);

  return (
    <div className="detail-crossing-card">
      <div className="detail-crossing-header">
        <div className="detail-crossing-title">이동평균선 돌파 이력</div>
        <p className="section-description">
          가격이 이동평균선을 위/아래로 뚫은 기록입니다.
        </p>
      </div>
      {items.length === 0 ? (
        <div className="detail-crossing-empty">표시할 돌파 이력이 없습니다.</div>
      ) : (
        <div className="detail-crossing-sections">
          {sortedPeriods.map((period) => {
            const periodItems = itemsByPeriod[period] || [];
            const hasTickerColumn = periodItems.some((item) => Boolean(item?.ticker));
            const rowClassName = [
              "detail-crossing-row",
              hasTickerColumn ? "detail-crossing-row--ticker" : "detail-crossing-row--base"
            ].join(" ");
            const statItems = periodItems.filter((item) => !item.assumedExit);
            const stats = statsMap?.[period] || { expectedReturn: null, trades: [] };
            const trades = stats.trades || [];
            const wins = trades.filter((t) => t.returnPercent > 0);
            const losses = trades.filter((t) => t.returnPercent <= 0);
            const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : null;
            const avgReturn = trades.length > 0 ? trades.reduce((s, t) => s + t.returnPercent, 0) / trades.length : null;
            const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.returnPercent, 0) / wins.length : null;
            const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.returnPercent, 0) / losses.length : null;
            const avgPerYear =
              yearsOfData && yearsOfData > 0 ? statItems.length / yearsOfData : null;
            const upCount = statItems.filter((item) => item.direction === "up").length;
            const downCount = statItems.filter((item) => item.direction === "down").length;
            const expectedReturnLabel =
              formatSignedPercent && stats.expectedReturn !== null
                ? formatSignedPercent(stats.expectedReturn).replace("%", "")
                : formatNumber(stats.expectedReturn, 1);
            const expectedReturnSuffix = stats.expectedReturn !== null ? "%" : "";
            const expectedReturnClass = resolveValueClass(stats.expectedReturn);
            const cagrValue = annualizedMap?.[period] ?? null;
            const cagrLabel =
              formatSignedPercent && cagrValue !== null
                ? formatSignedPercent(cagrValue).replace("%", "")
                : formatNumber(cagrValue, 2);
            const cagrSuffix = cagrValue !== null ? "%" : "";
            const cagrClass = resolveValueClass(cagrValue);
            const mddValue = mddMap?.[period]?.mddPercent ?? null;
            const mddUpdatedDate = mddMap?.[period]?.mddUpdatedDate || null;
            const mddLabel =
              formatSignedPercent && mddValue !== null
                ? formatSignedPercent(mddValue).replace("%", "")
                : formatNumber(mddValue, 2);
            const mddSuffix = mddValue !== null ? "%" : "";
            const mddClass = resolveValueClass(mddValue);
            const totalPages = Math.max(1, Math.ceil(periodItems.length / pageSize));
            const currentPage = Math.min(pageByPeriod[period] || 1, totalPages);
            const startIndex = (currentPage - 1) * pageSize;
            const pageItems = periodItems.slice(startIndex, startIndex + pageSize);
            return (
              <div key={period} className="detail-crossing-block">
                <div className="detail-crossing-subtitle">
                  {periodLabels?.[period] || `${period}일선`}
                </div>
                <div className="detail-crossing-stats">
                  <div className="detail-crossing-stats-row detail-crossing-stats-row-top">
                    <span className="detail-crossing-stat">
                      매매 빈도 연{" "}
                      <span className="detail-crossing-stat-value">
                        {formatNumber(avgPerYear, 1)}회
                      </span>
                    </span>
                    <span className="detail-crossing-stat">
                      상승/하락{" "}
                      <span className="detail-crossing-stat-value">
                        {upCount}/{downCount}
                      </span>
                    </span>
                    <span className="detail-crossing-stat">
                      MDD 갱신일{" "}
                      <span className="detail-crossing-stat-value">
                        {mddUpdatedDate || "-"}
                      </span>
                    </span>
                  </div>
                  <div className="detail-crossing-stats-row detail-crossing-stats-row-bottom">
                    <span className="detail-crossing-stat">
                      누적 수익률{" "}
                      <span className={`detail-crossing-stat-value ${expectedReturnClass}`}>
                        {expectedReturnLabel}
                        {expectedReturnSuffix}
                      </span>
                    </span>
                    <span className="detail-crossing-stat">
                      CAGR{" "}
                      <span className={`detail-crossing-stat-value ${cagrClass}`}>
                        {cagrLabel}
                        {cagrSuffix}
                      </span>
                    </span>
                    <span className="detail-crossing-stat">
                      MDD{" "}
                      <span className={`detail-crossing-stat-value ${mddClass}`}>
                        {mddLabel}
                        {mddSuffix}
                      </span>
                    </span>
                  </div>
                  {trades.length > 0 && (
                  <div className="detail-crossing-stats-row detail-crossing-stats-row-bottom">
                    <span className="detail-crossing-stat">
                      익절{" "}
                      <span className="detail-crossing-stat-value detail-crossing-up">{wins.length}회</span>
                      {" / "}손절{" "}
                      <span className="detail-crossing-stat-value detail-crossing-down">{losses.length}회</span>
                      {winRate !== null && (
                        <span className="detail-crossing-stat-sub"> (승률 {formatNumber(winRate, 0)}%)</span>
                      )}
                    </span>
                    <span className="detail-crossing-stat">
                      평균 수익률{" "}
                      <span className={`detail-crossing-stat-value ${resolveValueClass(avgReturn)}`}>
                        {formatNumber(avgReturn, 2)}%
                      </span>
                    </span>
                    <span className="detail-crossing-stat">
                      익절 평균{" "}
                      <span className="detail-crossing-stat-value detail-crossing-up">
                        {avgWin !== null ? `+${formatNumber(avgWin, 2)}%` : "-"}
                      </span>
                      {" / "}손절 평균{" "}
                      <span className="detail-crossing-stat-value detail-crossing-down">
                        {avgLoss !== null ? `${formatNumber(avgLoss, 2)}%` : "-"}
                      </span>
                    </span>
                  </div>
                  )}
                </div>
                <div className="detail-crossing-table">
                  <div className={`${rowClassName} detail-crossing-head`}>
                    <span>날짜</span>
                    <span>액션</span>
                    <span>가격(매매 수익률)</span>
                    {hasTickerColumn && <span>티커</span>}
                  </div>
                  {pageItems.map((item) => {
                    const directionClass =
                      item.assumedExit
                        ? "detail-crossing-down"
                        : item.direction === "up"
                        ? "detail-crossing-up"
                        : item.direction === "down"
                        ? "detail-crossing-down"
                        : "";
                    const priceValue = item.close ?? item.adjustedClose ?? null;
                    const tradeReturnLabel =
                      formatSignedPercent && item.tradeReturn !== null
                        ? formatSignedPercent(item.tradeReturn).replace("%", "")
                        : formatNumber(item.tradeReturn, 1);
                    const tradeReturnSuffix = item.tradeReturn !== null ? "%" : "";
                    const tradeReturnClass = resolveValueClass(item.tradeReturn);
                    const priceText = formatPrice ? formatPrice(priceValue) : priceValue ?? "-";
                    return (
                      <div key={item.id} className={rowClassName}>
                        <span>{formatShortDate(item.date)}</span>
                        <span className={directionClass}>
                          {item.assumedExit
                            ? "매도(가정)"
                            : formatActionLabel(item.direction)}
                        </span>
                        <span className="detail-crossing-price-trade">
                          <span className="detail-crossing-price-value">{priceText}</span>
                          <span className={`detail-crossing-trade-return ${tradeReturnClass}`}>
                            ({tradeReturnLabel}
                            {tradeReturnSuffix})
                          </span>
                        </span>
                        {hasTickerColumn && <span>{item.ticker || "-"}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="detail-crossing-pagination">
                  <button
                    type="button"
                    className="detail-crossing-button"
                    onClick={() =>
                      setPageByPeriod((prev) => ({
                        ...prev,
                        [period]: Math.max(1, (prev[period] || 1) - 1)
                      }))
                    }
                    disabled={currentPage <= 1}
                  >
                    이전
                  </button>
                  <span className="detail-crossing-page">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="detail-crossing-button"
                    onClick={() =>
                      setPageByPeriod((prev) => ({
                        ...prev,
                        [period]: Math.min(totalPages, (prev[period] || 1) + 1)
                      }))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    다음
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
