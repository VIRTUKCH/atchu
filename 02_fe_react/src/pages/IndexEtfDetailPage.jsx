import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/detail.css";
import "../styles/index-etf.css";
import EtfSummaryCard from "../components/etf/EtfSummaryCard";
import PriceTrendChart from "../components/etf/PriceTrendChart";
import StrategyComparisonCard from "../components/etf/StrategyComparisonCard";
import TrendCrossingHistoryCard from "../components/etf/TrendCrossingHistoryCard";
import AdvancedMetricsCard from "../components/etf/AdvancedMetricsCard";
import MonthlyReturnsHeatmap from "../components/etf/MonthlyReturnsHeatmap";
export default function IndexEtfDetailPage({ model }) {
  const {
    tickerMetaMap,
    API_ENABLED,
    getLocalSnapshot,
    loadLocalDetailAnalytics,
    toRecentShape,
    isStaleCloseByUsMarketDate,
    formatPrice,
    formatPercent,
    formatSignedPercent,
    getBestOverallCagrInfo,
    cagrStrategyLabelMap,
  } = model;
  const { ticker } = useParams();
  const key = (ticker || "").toUpperCase();
  const [snapshotData, setSnapshotData] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [detailAnalytics, setDetailAnalytics] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const changeValue = snapshotData?.percentChangeFromPreviousClose;
  const marketDateLabel =
    snapshotData?.dataDateMarket ||
    snapshotData?.data_date_market ||
    null;
  const closeStatus = isStaleCloseByUsMarketDate(null, marketDateLabel);
  const meta = tickerMetaMap.get(key);
  const timestampLabel = marketDateLabel || "-";
  const tickerId = meta?.id;

  const recentData = toRecentShape(snapshotData);
  const chartSeries = detailAnalytics?.chartSeries || {};
  const rawCrossingHistory = detailAnalytics?.crossingHistory || { items: [] };
  // 공개 페이지: 200일선·앗추 필터만 표시 (골든크로스는 개발자 전용)
  const PUBLIC_PERIODS = new Set([200, "200-20of16"]);
  const crossingHistory = {
    ...rawCrossingHistory,
    periods: (rawCrossingHistory.periods || []).filter((p) => PUBLIC_PERIODS.has(p)),
    items: (rawCrossingHistory.items || []).filter((item) => PUBLIC_PERIODS.has(item.period)),
  };
  const drawdownStats = detailAnalytics?.drawdownStats || null;
  const isComputing = snapshotLoading || detailLoading;

  const trendHoldingItems = detailAnalytics?.trendHolding?.items || [];
  const holding200 = trendHoldingItems.find((item) => item.label === "200일선");
  const trendSupportItems = detailAnalytics?.trendSupport?.items || [];
  const support200 = trendSupportItems.find((item) => item.label === "200일선");
  const isAtchuQualified200 = support200 ? (support200.aboveDays ?? 0) >= 16 : null;

  React.useEffect(() => {
    if (!tickerId) {
      return;
    }
    if (!API_ENABLED) {
      setSnapshotData(getLocalSnapshot(key));
      setSnapshotLoading(false);
    } else {
      setSnapshotLoading(true);
      fetch(`/api/v1/tickers/${tickerId}/snapshots/latest`)
        .then((res) => res.json())
        .then((body) => {
          setSnapshotData(body?.data || null);
        })
        .catch(() => {
          setSnapshotData(null);
        })
        .finally(() => setSnapshotLoading(false));
    }
    setDetailLoading(true);
    loadLocalDetailAnalytics(key)
      .then((analytics) => {
        setDetailAnalytics(analytics);
      })
      .catch(() => {
        setDetailAnalytics(null);
      })
      .finally(() => setDetailLoading(false));
  }, [tickerId, key]);


  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">{key} 상세</div>
        </div>
      </div>
      {isComputing && <div className="panel-placeholder">데이터를 불러오는 중입니다</div>}
      {!isComputing && !meta && (
        <p className="panel-subtitle">지원하지 않는 ETF입니다.</p>
      )}
      {!isComputing && meta && !snapshotData && (
        <p className="panel-subtitle">해당 ETF 데이터를 찾을 수 없습니다.</p>
      )}
      {!isComputing && meta && (
        <>
          <EtfSummaryCard
            ticker={key}
            open={recentData.open}
            high={recentData.high}
            low={recentData.low}
            close={recentData.close}
            changePercent={changeValue}
            movingAverages={recentData.moving_averages}
            percentDiffs={recentData.percent_difference_from_moving_averages}
            holdingDays={{
              two_hundred: holding200?.days ?? null
            }}
            holdingDirection={{
              two_hundred: holding200?.direction ?? null
            }}
            isAtchuQualified={isAtchuQualified200}
            aboveDays200={support200?.aboveDays ?? null}
            cagrFinal={detailAnalytics ? getBestOverallCagrInfo(detailAnalytics).value : null}
            cagrFinalLabel={
              detailAnalytics
                ? (() => {
                    const best = getBestOverallCagrInfo(detailAnalytics);
                    return best.period !== null && best.period !== undefined
                      ? cagrStrategyLabelMap[best.period] || String(best.period)
                      : null;
                  })()
                : null
            }
            mddFinal={
              detailAnalytics
                ? (() => {
                    const best = getBestOverallCagrInfo(detailAnalytics);
                    if (best.period == null) return null;
                    const mddEntry = crossingHistory.mddMap?.[best.period];
                    if (mddEntry == null) return null;
                    return typeof mddEntry === "object" ? mddEntry.mddPercent ?? null : mddEntry;
                  })()
                : null
            }
            dataStartDate={snapshotData?.dataStartDate ?? null}
            isStaleClose={closeStatus.isStaleClose}
            marketStatusLabel={closeStatus.statusLabel}
            meta={meta}
            periodReturns={recentData.period_returns}
          />
          <PriceTrendChart
            title="최근 1년 그래프"
            series={chartSeries.oneYear?.items || []}
          />
          <PriceTrendChart
            title="최근 5년 그래프"
            series={chartSeries.fiveYear?.items || []}
          />
          {detailAnalytics?.monthlyReturns && (
            <MonthlyReturnsHeatmap
              data={detailAnalytics.monthlyReturns}
              formatSignedPercent={formatSignedPercent}
            />
          )}
          <StrategyComparisonCard
            buyHold={drawdownStats?.buyHold || null}
            items={crossingHistory.items || []}
            startDate={crossingHistory.startDate}
            endDate={crossingHistory.endDate}
            yearsOfData={crossingHistory.yearsOfData}
            periods={crossingHistory.periods || [100, 200]}
            periodLabels={crossingHistory.periodLabels || {}}
            annualizedMap={crossingHistory.annualizedMap || {}}
            mddMap={crossingHistory.mddMap || {}}
            formatSignedPercent={formatSignedPercent}
          />
          <TrendCrossingHistoryCard
            items={crossingHistory.items || []}
            yearsOfData={crossingHistory.yearsOfData}
            periods={crossingHistory.periods || [100, 200]}
            periodLabels={crossingHistory.periodLabels || {}}
            statsMap={crossingHistory.statsMap || {}}
            annualizedMap={crossingHistory.annualizedMap || {}}
            mddMap={crossingHistory.mddMap || {}}
            pageSize={5}
            formatPrice={formatPrice}
            formatSignedPercent={formatSignedPercent}
          />
          <AdvancedMetricsCard
            advancedMetrics={detailAnalytics?.advancedMetrics || null}
            buyHold={drawdownStats?.buyHold || null}
            annualizedMap={crossingHistory.annualizedMap || {}}
            mddMap={crossingHistory.mddMap || {}}
            periodLabels={crossingHistory.periodLabels || {}}
            periods={crossingHistory.periods || []}
          />
          <p className="detail-disclaimer">과거 백테스트 결과이며 미래 수익을 보장하지 않습니다. 실제 거래 시 세금·수수료·슬리피지로 인해 결과가 달라질 수 있습니다. 투자 참고용 데이터이며, 매수·매도를 권유하지 않습니다. 투자 결정과 책임은 전적으로 본인에게 있습니다.</p>
        </>
      )}
    </section>
  );
}
