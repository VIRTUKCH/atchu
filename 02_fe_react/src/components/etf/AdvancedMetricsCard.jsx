import React from "react";
import CollapsibleSection from "./CollapsibleSection";

const fmt = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toFixed(digits);
};

const fmtPct = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

export default function AdvancedMetricsCard({
  advancedMetrics,
  buyHold = null,
  annualizedMap = {},
  mddMap = {},
  periodLabels = {},
  periods = []
}) {
  if (!advancedMetrics) return null;

  const { buyHold: bhRatio, strategies } = advancedMetrics;
  const crossKey = periods.find((p) => p === 200) ?? null;
  const atchuKey = periods.find((p) => String(p).includes("20of16")) ?? null;
  const crossRatio = strategies?.[crossKey] || {};
  const atchuRatio = strategies?.[atchuKey] || {};

  const columns = [
    { label: "매수 후 보유", key: "buyHold" },
    ...(crossKey !== null
      ? [{ label: periodLabels?.[crossKey] || "200일선", key: crossKey }]
      : []),
    ...(atchuKey !== null
      ? [{ label: periodLabels?.[atchuKey] || "앗추 필터", key: atchuKey }]
      : [])
  ];

  const resolveMdd = (key) => {
    const entry = mddMap?.[key];
    if (entry == null) return null;
    return typeof entry === "object" ? entry.mddPercent ?? null : entry;
  };

  const rows = [
    {
      label: "연평균 수익률",
      values: columns.map((col) =>
        col.key === "buyHold"
          ? fmtPct(buyHold?.cagrPercent)
          : fmtPct(annualizedMap?.[col.key])
      ),
      cls: "adv-metrics-row-pct"
    },
    {
      label: "MDD",
      values: columns.map((col) =>
        col.key === "buyHold"
          ? fmtPct(buyHold?.mddPercent)
          : fmtPct(resolveMdd(col.key))
      ),
      cls: "adv-metrics-row-pct"
    },
    {
      label: "샤프 지수",
      values: columns.map((col) =>
        col.key === "buyHold"
          ? fmt(bhRatio?.sharpe)
          : fmt(strategies?.[col.key]?.sharpe)
      ),
      cls: ""
    },
    {
      label: "소르티노 지수",
      values: columns.map((col) =>
        col.key === "buyHold"
          ? fmt(bhRatio?.sortino)
          : fmt(strategies?.[col.key]?.sortino)
      ),
      cls: ""
    }
  ];

  const colCount = columns.length + 1;
  const gridStyle = { gridTemplateColumns: `1fr ${"1fr ".repeat(columns.length)}`.trim() };

  const atchu = atchuKey !== null ? atchuRatio : crossRatio;

  return (
    <CollapsibleSection
      title="심화 지표"
      description="위험 대비 수익 효율과 매매 통계"
    >
      <div className="adv-metrics-body">
        <div className="adv-metrics-section">
          <div className="adv-metrics-subtitle">전략 비교</div>
          <div className="adv-metrics-table">
            <div className="adv-metrics-table-head" style={gridStyle}>
              <span />
              {columns.map((col) => (
                <span key={col.key}>{col.label}</span>
              ))}
            </div>
            {rows.map((row) => (
              <div key={row.label} className={`adv-metrics-table-row ${row.cls}`} style={gridStyle}>
                <span className="adv-metrics-row-label">{row.label}</span>
                {row.values.map((val, i) => (
                  <span key={columns[i].key} className="adv-metrics-row-val">{val}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="adv-metrics-hints">
            <p>샤프: 위험 대비 수익 효율. 1 이상 양호, 2 이상 우수.</p>
            <p>소르티노: 손실 위험 대비 수익 효율. 하락을 잘 피할수록 높다.</p>
          </div>
        </div>

        <div className="adv-metrics-divider" />

        <div className="adv-metrics-section">
          <div className="adv-metrics-subtitle">앗추 필터 매매 통계</div>
          <div className="adv-metrics-stats">
            <div className="adv-metrics-stat">
              <span className="adv-metrics-stat-label">승률</span>
              <span className="adv-metrics-stat-val">
                {atchu.winRate !== null && atchu.winRate !== undefined
                  ? `${fmt(atchu.winRate, 0)}%`
                  : "-"}
              </span>
              {atchu.totalTrades > 0 && (
                <span className="adv-metrics-stat-sub">
                  {atchu.winningTrades}/{atchu.totalTrades}회
                </span>
              )}
            </div>
            <div className="adv-metrics-stat">
              <span className="adv-metrics-stat-label">평균 보유 기간</span>
              <span className="adv-metrics-stat-val">
                {atchu.avgHoldingDays !== null
                  ? `${atchu.avgHoldingDays}일`
                  : "-"}
              </span>
              {atchu.avgHoldingDays !== null && (
                <span className="adv-metrics-stat-sub">
                  약 {Math.round(atchu.avgHoldingDays / 21)}개월
                </span>
              )}
            </div>
            <div className="adv-metrics-stat">
              <span className="adv-metrics-stat-label">수익 팩터</span>
              <span className="adv-metrics-stat-val">
                {atchu.profitFactor !== null ? fmt(atchu.profitFactor) : "-"}
              </span>
              <span className="adv-metrics-stat-sub">
                번 돈 / 잃은 돈
              </span>
            </div>
          </div>
          <div className="adv-metrics-hints">
            <p>승률: 전체 매매 중 수익을 낸 비율.</p>
            <p>평균 보유 기간: 한 번 진입해서 이탈까지 평균 기간. (거래일 기준)</p>
            <p>수익 팩터: 번 돈 ÷ 잃은 돈. 1보다 크면 이익.</p>
          </div>
        </div>

        <div className="adv-metrics-disclaimer">
          무위험 수익률은 0%로 가정합니다. 앗추 필터 이탈 기간은 현금 보유(수익률 0%)로 가정합니다.
          이 지표들은 참고용이며, 투자 판단의 유일한 근거로 사용하지 마세요.
        </div>
      </div>
    </CollapsibleSection>
  );
}
