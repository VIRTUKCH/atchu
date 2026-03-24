import { useCallback, useEffect, useMemo, useState } from "react";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const TABS = [
  { key: "atchu", label: "앗추 필터" },
  { key: "buyHold", label: "매수후보유" }
];

const PC_YEARS_PER_PAGE = 10;
const MOBILE_YEARS_PER_PAGE = 5;
const MOBILE_BREAKPOINT = 768;

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
  if (value === null || value === undefined) return "-";
  const v = Number(value);
  if (Number.isNaN(v)) return "-";
  return v.toFixed(2);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function MonthlyReturnsHeatmap({ data }) {
  const [activeTab, setActiveTab] = useState("atchu");
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  const theme = document.documentElement.getAttribute("data-theme") || "light";
  const yearsPerPage = isMobile ? MOBILE_YEARS_PER_PAGE : PC_YEARS_PER_PAGE;

  // 두 전략의 연도를 합쳐서 전체 범위 결정
  const { maxYear, minYear, grid, yearTotals } = useMemo(() => {
    if (!data) return { maxYear: null, minYear: null, grid: {}, yearTotals: {} };
    // 모든 전략의 연도를 합산
    const allYears = new Set();
    ["buyHold", "atchu"].forEach((s) => {
      if (data[s]) Object.keys(data[s]).forEach((y) => allYears.add(Number(y)));
    });
    if (allYears.size === 0) return { maxYear: null, minYear: null, grid: {}, yearTotals: {} };

    const sorted = [...allYears].sort((a, b) => a - b);
    const mn = sorted[0];
    const mx = sorted[sorted.length - 1];

    const strategyData = data[activeTab] || {};
    const totals = {};
    for (let yr = mn; yr <= mx; yr += 1) {
      const months = strategyData[yr] || {};
      let total = 0;
      let hasAny = false;
      MONTHS.forEach((m) => {
        if (months[m] !== undefined && months[m] !== null) {
          total += months[m];
          hasAny = true;
        }
      });
      totals[yr] = hasAny ? total : null;
    }

    return { maxYear: mx, minYear: mn, grid: strategyData, yearTotals: totals };
  }, [data, activeTab]);

  // 탭 전환 시 페이지 리셋
  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    setPage(0);
  }, []);

  // 페이지별 연도 배열 생성 (항상 yearsPerPage개 고정)
  const totalYearSpan = maxYear && minYear ? maxYear - minYear + 1 : 0;
  const totalPages = Math.max(1, Math.ceil(totalYearSpan / yearsPerPage));
  const pageYears = useMemo(() => {
    if (!maxYear) return [];
    const startYear = maxYear - page * yearsPerPage;
    const result = [];
    for (let i = 0; i < yearsPerPage; i += 1) {
      result.push(startYear - i);
    }
    return result;
  }, [maxYear, page, yearsPerPage]);

  // 화면 크기 변경 시 페이지 범위 보정
  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  if (!data || !maxYear) return null;

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
              onClick={() => handleTabChange(tab.key)}
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
      <table className="monthly-heatmap-table">
        <thead>
          <tr>
            <th className="monthly-heatmap-corner">월\년</th>
            {pageYears.map((yr) => (
              <th key={yr} className="monthly-heatmap-year-header">{yr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((month) => (
            <tr key={month}>
              <td className="monthly-heatmap-month-label">{month}</td>
              {pageYears.map((yr) => {
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
            {pageYears.map((yr) => {
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
      {totalPages > 1 && (
        <div className="monthly-heatmap-pagination">
          <button
            type="button"
            className="monthly-heatmap-page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
          >
            ← 최신
          </button>
          <span className="monthly-heatmap-page-info">
            {pageYears[pageYears.length - 1]}~{pageYears[0]}
          </span>
          <button
            type="button"
            className="monthly-heatmap-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            과거 →
          </button>
        </div>
      )}
      <p className="monthly-heatmap-disclaimer">
        과거 백테스트 결과이며 미래 수익을 보장하지 않습니다. 이탈 기간은 현금 보유(수익률 0%)로 가정합니다.
      </p>
    </div>
  );
}
