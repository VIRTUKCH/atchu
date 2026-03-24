import { useMemo, useState } from "react";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const TABS = [
  { key: "atchu", label: "앗추 필터" },
  { key: "buyHold", label: "매수후보유" }
];

function getCellColor(value, theme) {
  if (value === null || value === undefined) return "transparent";
  const v = Number(value);
  if (Number.isNaN(v)) return "transparent";
  if (Math.abs(v) < 0.005) return theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  if (v > 0) {
    const intensity = Math.min(v / 10, 1);
    return theme === "dark"
      ? `rgba(34,197,94,${0.15 + intensity * 0.55})`
      : `rgba(22,163,74,${0.12 + intensity * 0.48})`;
  }
  const intensity = Math.min(Math.abs(v) / 10, 1);
  return theme === "dark"
    ? `rgba(239,68,68,${0.15 + intensity * 0.55})`
    : `rgba(220,38,38,${0.12 + intensity * 0.48})`;
}

function formatValue(value) {
  if (value === null || value === undefined) return "";
  const v = Number(value);
  if (Number.isNaN(v)) return "";
  return v.toFixed(2);
}

export default function MonthlyReturnsHeatmap({ data, formatSignedPercent }) {
  const [activeTab, setActiveTab] = useState("atchu");
  const theme = document.documentElement.getAttribute("data-theme") || "light";

  const { years, grid, yearTotals } = useMemo(() => {
    if (!data || !data[activeTab]) return { years: [], grid: {}, yearTotals: {} };
    const strategyData = data[activeTab];
    const yrs = Object.keys(strategyData)
      .map(Number)
      .sort((a, b) => b - a);

    const totals = {};
    yrs.forEach((yr) => {
      const months = strategyData[yr] || {};
      let total = 0;
      MONTHS.forEach((m) => {
        if (months[m] !== undefined && months[m] !== null) total += months[m];
      });
      totals[yr] = total;
    });

    return { years: yrs, grid: strategyData, yearTotals: totals };
  }, [data, activeTab]);

  if (!data || years.length === 0) return null;

  return (
    <div className="monthly-heatmap-card">
      <div className="monthly-heatmap-header">
        <div className="monthly-heatmap-title">월별 수익률</div>
        <div className="monthly-heatmap-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`monthly-heatmap-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <p className="section-description">
        {activeTab === "atchu"
          ? "앗추 필터 이탈 구간은 0.00% (현금 보유)로 표시됩니다."
          : "ETF를 매수 후 보유했을 때의 월별 수익률입니다."}
      </p>
      <div className="monthly-heatmap-scroll">
        <table className="monthly-heatmap-table">
          <thead>
            <tr>
              <th className="monthly-heatmap-corner">월\년</th>
              {years.map((yr) => (
                <th key={yr} className="monthly-heatmap-year-header">{yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((month) => (
              <tr key={month}>
                <td className="monthly-heatmap-month-label">{month}</td>
                {years.map((yr) => {
                  const val = grid[yr]?.[month] ?? null;
                  return (
                    <td
                      key={yr}
                      className="monthly-heatmap-cell"
                      style={{ backgroundColor: getCellColor(val, theme) }}
                    >
                      {formatValue(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="monthly-heatmap-total-row">
              <td className="monthly-heatmap-month-label">합계</td>
              {years.map((yr) => {
                const val = yearTotals[yr] ?? null;
                return (
                  <td
                    key={yr}
                    className="monthly-heatmap-cell monthly-heatmap-total-cell"
                    style={{ backgroundColor: getCellColor(val, theme) }}
                  >
                    {formatValue(val)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="monthly-heatmap-disclaimer">
        과거 백테스트 결과이며 미래 수익을 보장하지 않습니다. 이탈 기간은 현금 보유(수익률 0%)로 가정합니다.
      </p>
    </div>
  );
}
