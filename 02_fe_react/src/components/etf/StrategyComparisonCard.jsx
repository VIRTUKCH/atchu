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
    return "strategy-cmp-up";
  }
  if (value < 0) {
    return "strategy-cmp-down";
  }
  return "";
};

const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return "-";
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }
  const diffMs = end.getTime() - start.getTime();
  const totalDays = diffMs >= 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const yearsLabel = String(Math.max(0, years)).padStart(2, "0");
  const monthsLabel = String(Math.max(0, months)).padStart(2, "0");
  const daysLabel = String(Math.max(0, totalDays)).padStart(4, "0");
  return `${yearsLabel}년 ${monthsLabel}개월 (${daysLabel}일)`;
};

const fmtPct = (value, formatSignedPercent) => {
  if (value === null || value === undefined) return "-";
  return formatSignedPercent
    ? formatSignedPercent(value)
    : `${formatNumber(value, 2)}%`;
};

export default function StrategyComparisonCard({
  buyHold = null,
  items = [],
  startDate,
  endDate,
  yearsOfData,
  periods = [200],
  periodLabels = {},
  annualizedMap = {},
  mddMap = {},
  formatSignedPercent
}) {
  if (!buyHold) {
    return null;
  }

  const yearCountLabel = formatDuration(startDate, endDate);
  const rangeLabel = startDate && endDate ? `${startDate} ~ ${endDate}` : "-";

  const rows = [
    {
      label: "매수 후 보유",
      cagr: buyHold.cagrPercent,
      mdd: buyHold.mddPercent,
      mddDate: buyHold.mddUpdatedDate || null,
      freq: null
    },
    ...periods.map((period) => {
      const periodItems = items.filter((item) => item.period === period && !item.assumedExit);
      const avgPerYear = yearsOfData && yearsOfData > 0 ? periodItems.length / yearsOfData : null;
      return {
        label: periodLabels?.[period] || `${period}일선`,
        cagr: annualizedMap?.[period] ?? null,
        mdd: mddMap?.[period]?.mddPercent ?? null,
        mddDate: mddMap?.[period]?.mddUpdatedDate || null,
        freq: avgPerYear
      };
    })
  ];

  return (
    <div className="strategy-cmp-card">
      <div className="strategy-cmp-header">
        <div className="strategy-cmp-title">전략 비교</div>
        <p className="section-description">
          같은 기간, 다른 전략의 성과를 비교합니다.
        </p>
        <dl className="strategy-cmp-range">
          <div className="strategy-cmp-range-row">
            <dt className="strategy-cmp-range-key">데이터 기간</dt>
            <dd className="strategy-cmp-range-val">{yearCountLabel}</dd>
          </div>
          <div className="strategy-cmp-range-row">
            <dt className="strategy-cmp-range-key">범위</dt>
            <dd className="strategy-cmp-range-val">{rangeLabel}</dd>
          </div>
        </dl>
      </div>
      <div className="strategy-cmp-list">
        {rows.map((row) => (
          <div key={row.label} className="strategy-cmp-mcard">
            <div className="strategy-cmp-mcard-head">
              <span className="strategy-cmp-mcard-label">{row.label}</span>
            </div>
            <div className="strategy-cmp-mcard-grid">
              <div className="strategy-cmp-mcard-cell">
                <span className="strategy-cmp-mcard-key">연평균 수익률</span>
                <span className={`strategy-cmp-mcard-val ${resolveValueClass(row.cagr)}`}>
                  {fmtPct(row.cagr, formatSignedPercent)}
                </span>
              </div>
              <div className="strategy-cmp-mcard-cell">
                <span className="strategy-cmp-mcard-key">MDD</span>
                <span className={`strategy-cmp-mcard-val ${resolveValueClass(row.mdd)}`}>
                  {fmtPct(row.mdd, formatSignedPercent)}
                </span>
              </div>
              <div className="strategy-cmp-mcard-cell">
                <span className="strategy-cmp-mcard-key">MDD 갱신일</span>
                <span className="strategy-cmp-mcard-val">{row.mddDate || "-"}</span>
              </div>
              <div className="strategy-cmp-mcard-cell">
                <span className="strategy-cmp-mcard-key">연 매매</span>
                <span className="strategy-cmp-mcard-val">
                  {row.freq !== null ? `${formatNumber(row.freq, 1)}회` : "-"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
