import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/detail.css";
import "../styles/index-etf.css";
import EtfSummaryCard from "../components/etf/EtfSummaryCard";
import PriceTrendChart from "../components/etf/PriceTrendChart";
import StrategyComparisonCard from "../components/etf/StrategyComparisonCard";
import TrendCrossingHistoryCard from "../components/etf/TrendCrossingHistoryCard";
import AdvancedMetricsCard from "../components/etf/AdvancedMetricsCard";
import {
  stockTickerMetaMap,
  stockSnapshotMap,
  toRecentShape,
  loadStockDetailAnalytics
} from "../utils/stockDataLoaders";
import { isStaleCloseByUsMarketDate } from "../utils/marketDate";
import {
  formatPrice,
  formatSignedPercent
} from "../utils/format";

const CAGR_STRATEGY_LABEL_MAP = {
  200: "200일선",
  "200-20of16": "앗추 필터",
  "golden_cross": "골든크로스"
};

function getBestOverallCagrInfo(analytics) {
  if (!analytics?.crossingHistory?.annualizedMap) return { value: null, period: null };
  const map = analytics.crossingHistory.annualizedMap;
  let best = { value: null, period: null };
  for (const [period, value] of Object.entries(map)) {
    if (value === null || value === undefined) continue;
    if (best.value === null || Number(value) > Number(best.value)) {
      best = { value: Number(value), period };
    }
  }
  return best;
}

export default function StockDetailPage() {
  const { ticker } = useParams();
  const key = (ticker || "").toUpperCase();
  const [detailAnalytics, setDetailAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const meta = stockTickerMetaMap.get(key);
  const snapshot = stockSnapshotMap[key] || null;
  const recentData = toRecentShape(snapshot);
  const changeValue = snapshot?.percentChangeFromPreviousClose;
  const marketDateLabel = snapshot?.dataDateMarket || null;
  const closeStatus = isStaleCloseByUsMarketDate(null, marketDateLabel);

  useEffect(() => {
    setLoading(true);
    setDetailAnalytics(null);
    loadStockDetailAnalytics(key)
      .then((analytics) => setDetailAnalytics(analytics))
      .catch(() => setDetailAnalytics(null))
      .finally(() => setLoading(false));
  }, [key]);

  const chartSeries = detailAnalytics?.chartSeries || {};
  const crossingHistory = detailAnalytics?.crossingHistory || { items: [] };
  const drawdownStats = detailAnalytics?.drawdownStats || null;

  const trendHoldingItems = detailAnalytics?.trendHolding?.items || [];
  const holding200 = trendHoldingItems.find((item) => item.label === "200일선");
  const trendSupportItems = detailAnalytics?.trendSupport?.items || [];
  const support200 = trendSupportItems.find((item) => item.label === "200일선");
  const isAtchuQualified200 = support200 ? (support200.aboveDays ?? 0) >= 16 : null;
  const bestCagr = getBestOverallCagrInfo(detailAnalytics);

  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">{key} 상세</div>
        </div>
      </div>
      {loading && <div className="panel-placeholder">데이터를 불러오는 중입니다</div>}
      {!loading && !meta && (
        <p className="panel-subtitle">지원하지 않는 종목입니다.</p>
      )}
      {!loading && meta && !snapshot && (
        <p className="panel-subtitle">해당 종목 데이터를 찾을 수 없습니다.</p>
      )}
      {!loading && meta && (
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
            holdingDays={{ two_hundred: holding200?.days ?? null }}
            holdingDirection={{ two_hundred: holding200?.direction ?? null }}
            isAtchuQualified={isAtchuQualified200}
            aboveDays200={support200?.aboveDays ?? null}
            cagrFinal={bestCagr.value}
            cagrFinalLabel={
              bestCagr.period != null
                ? CAGR_STRATEGY_LABEL_MAP[bestCagr.period] || String(bestCagr.period)
                : null
            }
            mddFinal={
              bestCagr.period != null
                ? (() => {
                    const mddEntry = crossingHistory.mddMap?.[bestCagr.period];
                    if (mddEntry == null) return null;
                    return typeof mddEntry === "object" ? mddEntry.mddPercent ?? null : mddEntry;
                  })()
                : null
            }
            cagrAtchu={crossingHistory.annualizedMap?.["200-20of16"] ?? null}
            mddAtchu={(() => {
              const e = crossingHistory.mddMap?.["200-20of16"];
              if (e == null) return null;
              return typeof e === "object" ? e.mddPercent ?? null : e;
            })()}
            cagrAlignment={crossingHistory.annualizedMap?.["golden_cross"] ?? null}
            mddAlignment={(() => {
              const e = crossingHistory.mddMap?.["golden_cross"];
              if (e == null) return null;
              return typeof e === "object" ? e.mddPercent ?? null : e;
            })()}
            dataStartDate={snapshot?.dataStartDate ?? null}
            isStaleClose={closeStatus.isStaleClose}
            marketStatusLabel={closeStatus.statusLabel}
            maAlignment={recentData.ma_alignment}
            maAlignmentDays={recentData.ma_alignment_days}
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
          <StrategyComparisonCard
            buyHold={drawdownStats?.buyHold || null}
            items={crossingHistory.items || []}
            startDate={crossingHistory.startDate}
            endDate={crossingHistory.endDate}
            yearsOfData={crossingHistory.yearsOfData}
            periods={crossingHistory.periods || [200]}
            periodLabels={crossingHistory.periodLabels || {}}
            annualizedMap={crossingHistory.annualizedMap || {}}
            mddMap={crossingHistory.mddMap || {}}
            formatSignedPercent={formatSignedPercent}
          />
          <TrendCrossingHistoryCard
            items={crossingHistory.items || []}
            yearsOfData={crossingHistory.yearsOfData}
            periods={crossingHistory.periods || [200]}
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
