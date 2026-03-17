import React, { useState, useEffect } from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnResearchCard,
  ColumnCompareRow,
  ColumnCompareTable,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnWarningCard,
  ColumnMythFact,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

/* ── 골든크로스 백테스트 계산 ── */
function computeGoldenCrossBacktest(csvText) {
  if (!csvText) return null;
  const lines = csvText.trim().split("\n");
  if (lines.length < 250) return null;

  const headers = lines[0].split(",").map((h) => h.trim());
  const records = lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx];
      });
      return row;
    })
    .filter((r) => r.Date)
    .sort((a, b) => a.Date.localeCompare(b.Date));
  if (records.length < 200) return null;

  const prices = records.map((r) => {
    const v = Number(r.Adjusted_close);
    return Number.isFinite(v) ? v : null;
  });

  // SMA 계산
  const computeSMA = (period) => {
    const result = new Array(prices.length).fill(null);
    for (let i = period - 1; i < prices.length; i++) {
      let sum = 0;
      let valid = true;
      for (let j = i - period + 1; j <= i; j++) {
        if (prices[j] === null) {
          valid = false;
          break;
        }
        sum += prices[j];
      }
      if (valid) result[i] = sum / period;
    }
    return result;
  };

  const ma50 = computeSMA(50);
  const ma200 = computeSMA(200);

  // 골든/데드 크로스 감지
  const crosses = [];
  for (let i = 1; i < prices.length; i++) {
    if (!ma50[i] || !ma50[i - 1] || !ma200[i] || !ma200[i - 1]) continue;
    const prevAbove = ma50[i - 1] > ma200[i - 1];
    const currAbove = ma50[i] > ma200[i];
    if (!prevAbove && currAbove) {
      crosses.push({
        date: records[i].Date,
        type: "golden",
        close: prices[i],
        ma50: ma50[i],
        ma200: ma200[i],
      });
    } else if (prevAbove && !currAbove) {
      crosses.push({
        date: records[i].Date,
        type: "dead",
        close: prices[i],
        ma50: ma50[i],
        ma200: ma200[i],
      });
    }
  }

  // 거래 페어링
  const trades = [];
  let buyEvent = null;
  crosses.forEach((c) => {
    if (c.type === "golden" && !buyEvent) {
      buyEvent = c;
    } else if (c.type === "dead" && buyEvent) {
      trades.push({
        buyDate: buyEvent.date,
        buyPrice: buyEvent.close,
        sellDate: c.date,
        sellPrice: c.close,
        returnPct: ((c.close - buyEvent.close) / buyEvent.close) * 100,
      });
      buyEvent = null;
    }
  });
  const lastPrice = prices[prices.length - 1];
  const lastDate = records[records.length - 1].Date;
  if (buyEvent) {
    trades.push({
      buyDate: buyEvent.date,
      buyPrice: buyEvent.close,
      sellDate: null,
      sellPrice: lastPrice,
      returnPct: ((lastPrice - buyEvent.close) / buyEvent.close) * 100,
      open: true,
    });
  }

  // 전략 수익 / MDD (전체 기간)
  let equity = 1;
  let peak = 1;
  let mdd = 0;
  let inMarket = false;
  let prevPrice = null;
  let crossIdx = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] === null) {
      prevPrice = null;
      continue;
    }
    if (inMarket && prevPrice !== null) {
      equity *= prices[i] / prevPrice;
    }
    if (equity > peak) peak = equity;
    const dd = equity / peak - 1;
    if (dd < mdd) mdd = dd;
    while (
      crossIdx < crosses.length &&
      crosses[crossIdx].date <= records[i].Date
    ) {
      inMarket = crosses[crossIdx].type === "golden";
      crossIdx++;
    }
    prevPrice = prices[i];
  }

  // Buy & Hold
  const firstIdx = prices.findIndex((p) => p !== null);
  let bhPeak = prices[firstIdx];
  let bhMdd = 0;
  for (let i = firstIdx; i < prices.length; i++) {
    if (prices[i] === null) continue;
    if (prices[i] > bhPeak) bhPeak = prices[i];
    const dd = prices[i] / bhPeak - 1;
    if (dd < bhMdd) bhMdd = dd;
  }
  const bhEquity = lastPrice / prices[firstIdx];
  const years =
    (new Date(lastDate) - new Date(records[firstIdx].Date)) /
    (365.25 * 24 * 60 * 60 * 1000);
  const closedTrades = trades.filter((t) => !t.open);

  // 차트 데이터 (2000년 이후)
  const chartItems = [];
  for (let i = 0; i < prices.length; i++) {
    if (records[i].Date < "2000-01-01") continue;
    chartItems.push({
      date: records[i].Date,
      close: prices[i],
      ma50: ma50[i],
      ma200: ma200[i],
    });
  }

  return {
    chartItems,
    visibleCrosses: crosses.filter((c) => c.date >= "2000-01-01"),
    visibleTrades: trades.filter((t) => t.buyDate >= "2000-01-01"),
    stats: {
      totalTrades: closedTrades.length,
      winRate:
        closedTrades.length > 0
          ? Math.round(
              (closedTrades.filter((t) => t.returnPct > 0).length /
                closedTrades.length) *
                100
            )
          : 0,
      strategyCagr: (Math.pow(equity, 1 / years) - 1) * 100,
      strategyMdd: mdd * 100,
      bhCagr: (Math.pow(bhEquity, 1 / years) - 1) * 100,
      bhMdd: bhMdd * 100,
      years: Math.round(years),
    },
  };
}

/* ── SPY 골든크로스 백테스트 차트 ── */
function GoldenCrossChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    import("../../../data/csv/SPY.US_all.csv?raw").then((m) => {
      setData(computeGoldenCrossBacktest(m.default));
    });
  }, []);

  if (!data)
    return <div className="strategy-chart-wrap strategy-chart-placeholder" />;

  const { chartItems, visibleCrosses, visibleTrades, stats } = data;
  if (!chartItems.length) return null;

  // ma50 > ma200 이면 시장에 있는 상태
  const markedItems = chartItems.map((item) => ({
    ...item,
    inMarket:
      item.ma50 !== null && item.ma200 !== null && item.ma50 > item.ma200,
  }));

  // SVG 크기
  const W = 680;
  const H = 250;
  const PAD_L = 52;
  const PAD_R = 16;
  const PAD_T = 16;
  const BAND_H = 8;
  const PAD_B = 32;
  const chartH = H - PAD_T - BAND_H - PAD_B;
  const chartW = W - PAD_L - PAD_R;

  // Y 범위
  const allPrices = chartItems.flatMap((item) =>
    [item.close, item.ma50, item.ma200].filter((v) => v !== null)
  );
  const minRaw = Math.min(...allPrices);
  const maxRaw = Math.max(...allPrices);
  const rawRange = maxRaw - minRaw || 1;
  const yPad = rawRange * 0.05;
  const minP = minRaw - yPad;
  const maxP = maxRaw + yPad;
  const rangeP = maxP - minP;
  const CHART_BOTTOM = PAD_T + chartH;

  const toX = (i) =>
    PAD_L + (i / Math.max(1, markedItems.length - 1)) * chartW;
  const toY = (price) => PAD_T + (1 - (price - minP) / rangeP) * chartH;

  // 보유 밴드
  const bands = [];
  let bandStart = null;
  let bandState = null;
  markedItems.forEach((item, i) => {
    if (bandState === null) {
      bandStart = i;
      bandState = item.inMarket;
    } else if (item.inMarket !== bandState) {
      bands.push({ startIdx: bandStart, endIdx: i - 1, inMarket: bandState });
      bandStart = i;
      bandState = item.inMarket;
    }
  });
  if (bandStart !== null) {
    bands.push({
      startIdx: bandStart,
      endIdx: markedItems.length - 1,
      inMarket: bandState,
    });
  }

  // 폴리라인
  const buildSegments = (key) => {
    const segments = [];
    let current = [];
    markedItems.forEach((item, i) => {
      const val = item[key];
      if (val !== null && val !== undefined) {
        current.push(`${toX(i).toFixed(1)},${toY(val).toFixed(1)}`);
      } else if (current.length) {
        segments.push(current.join(" "));
        current = [];
      }
    });
    if (current.length) segments.push(current.join(" "));
    return segments;
  };

  const closeSegments = buildSegments("close");
  const ma50Segments = buildSegments("ma50");
  const ma200Segments = buildSegments("ma200");

  // Y축 5개 틱
  const yTicks = Array.from({ length: 5 }, (_, i) => ({
    price: maxP - (i / 4) * rangeP,
    y: PAD_T + (i / 4) * chartH,
  }));

  // X축 연도 (2년 간격)
  const yearList = [];
  for (let y = 2000; y <= 2026; y += 2) yearList.push(y);
  const yearTicks = yearList
    .map((year) => {
      const idx = markedItems.findIndex(
        (item) => item.date >= `${year}-01-01`
      );
      return idx >= 0 ? { idx, label: String(year) } : null;
    })
    .filter(Boolean);

  // 크로스 마커
  const markerData = visibleCrosses
    .map((c) => {
      const idx = markedItems.findIndex((item) => item.date >= c.date);
      if (idx < 0) return null;
      return { ...c, x: toX(idx), y: toY(c.ma200) };
    })
    .filter(Boolean);

  // 투자 시뮬레이션
  let capital = 1000;
  visibleTrades.forEach((t) => {
    capital *= 1 + t.returnPct / 100;
  });
  const finalCapital = Math.round(capital / 100) * 100;
  const firstBuy = visibleTrades.length > 0 ? visibleTrades[0] : null;

  return (
    <div className="strategy-chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="strategy-chart-svg"
        role="img"
        aria-label="SPY 2000년 이후 골든크로스/데드크로스 백테스트 차트"
      >
        {/* 축 */}
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={CHART_BOTTOM}
          className="lc-axis"
          strokeWidth="1"
        />
        <line
          x1={PAD_L}
          y1={CHART_BOTTOM}
          x2={PAD_L + chartW}
          y2={CHART_BOTTOM}
          className="lc-axis"
          strokeWidth="1"
        />

        {/* Y 그리드 + 라벨 */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={tick.y}
              x2={PAD_L + chartW}
              y2={tick.y}
              className="lc-grid"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <text
              x={PAD_L - 6}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="10"
              className="lc-label"
              fontFamily="Sora,sans-serif"
            >
              ${Math.round(tick.price)}
            </text>
          </g>
        ))}

        {/* X축 연도 */}
        {yearTicks.map(({ idx, label }) => {
          const x = toX(idx);
          return (
            <g key={label}>
              <line
                x1={x}
                y1={PAD_T}
                x2={x}
                y2={CHART_BOTTOM + BAND_H}
                className="lc-axis"
                strokeWidth="0.5"
                strokeDasharray="2,4"
              />
              <text
                x={x}
                y={CHART_BOTTOM + BAND_H + 14}
                textAnchor="middle"
                fontSize="10"
                className="lc-label"
                fontFamily="Sora,sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 보유 밴드 */}
        {bands.map((band, i) => (
          <rect
            key={i}
            x={toX(band.startIdx)}
            y={CHART_BOTTOM}
            width={Math.max(1, toX(band.endIdx) - toX(band.startIdx))}
            height={BAND_H}
            fill={
              band.inMarket
                ? "rgba(34,197,94,0.4)"
                : "rgba(239,68,68,0.15)"
            }
          />
        ))}

        {/* 가격선 */}
        {closeSegments.map((points, i) => (
          <polyline
            key={`c${i}`}
            points={points}
            className="lc-close"
            strokeWidth="1.5"
          />
        ))}

        {/* 50일선 (주황) */}
        {ma50Segments.map((points, i) => (
          <polyline
            key={`m50-${i}`}
            points={points}
            className="lc-ma50"
            strokeWidth="1.2"
          />
        ))}

        {/* 200일선 (파랑 점선) */}
        {ma200Segments.map((points, i) => (
          <polyline
            key={`m200-${i}`}
            points={points}
            className="lc-ma200"
            strokeWidth="1.5"
            strokeDasharray="6,4"
          />
        ))}

        {/* 골든/데드 크로스 마커 */}
        {markerData.map((c, i) => {
          const bw = 14;
          const bh = 14;
          const gap = 8;
          const arrowLen = 6;
          const isGolden = c.type === "golden";
          const color = isGolden
            ? "rgba(34,197,94,0.9)"
            : "rgba(239,68,68,0.9)";
          const arrowColor = isGolden
            ? "rgba(34,197,94,0.7)"
            : "rgba(239,68,68,0.7)";

          if (isGolden) {
            const boxTop = c.y + gap;
            const cy = boxTop + bh / 2;
            const arrowTip = boxTop - 2;
            return (
              <g key={i}>
                <line
                  x1={c.x}
                  y1={boxTop}
                  x2={c.x}
                  y2={arrowTip - arrowLen}
                  stroke={arrowColor}
                  strokeWidth="1"
                />
                <polyline
                  points={`${c.x - 3},${arrowTip} ${c.x},${arrowTip - arrowLen} ${c.x + 3},${arrowTip}`}
                  fill="none"
                  stroke={arrowColor}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x={c.x - bw / 2}
                  y={boxTop}
                  width={bw}
                  height={bh}
                  rx={3}
                  fill={color}
                />
                <text
                  x={c.x}
                  y={cy + 3.5}
                  fontSize="9"
                  fontWeight="700"
                  fill="#fff"
                  textAnchor="middle"
                  fontFamily="Sora,sans-serif"
                >
                  G
                </text>
              </g>
            );
          }
          const boxBottom = c.y - gap;
          const boxTop = boxBottom - bh;
          const cy = boxTop + bh / 2;
          const arrowTip = boxBottom + 2;
          return (
            <g key={i}>
              <line
                x1={c.x}
                y1={boxBottom}
                x2={c.x}
                y2={arrowTip + arrowLen}
                stroke={arrowColor}
                strokeWidth="1"
              />
              <polyline
                points={`${c.x - 3},${arrowTip} ${c.x},${arrowTip + arrowLen} ${c.x + 3},${arrowTip}`}
                fill="none"
                stroke={arrowColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x={c.x - bw / 2}
                y={boxTop}
                width={bw}
                height={bh}
                rx={3}
                fill={color}
              />
              <text
                x={c.x}
                y={cy + 3.5}
                fontSize="9"
                fontWeight="700"
                fill="#fff"
                textAnchor="middle"
                fontFamily="Sora,sans-serif"
              >
                D
              </text>
            </g>
          );
        })}

        {/* 범례 */}
        <line
          x1={PAD_L + chartW - 280}
          y1={PAD_T + 12}
          x2={PAD_L + chartW - 260}
          y2={PAD_T + 12}
          className="lc-close"
          strokeWidth="1.5"
        />
        <text
          x={PAD_L + chartW - 256}
          y={PAD_T + 16}
          fontSize="10"
          className="lc-label"
          fontFamily="Sora,sans-serif"
        >
          SPY
        </text>

        <line
          x1={PAD_L + chartW - 232}
          y1={PAD_T + 12}
          x2={PAD_L + chartW - 212}
          y2={PAD_T + 12}
          className="lc-ma50"
          strokeWidth="1.2"
        />
        <text
          x={PAD_L + chartW - 208}
          y={PAD_T + 16}
          fontSize="10"
          className="lc-ma50-label"
          fontFamily="Sora,sans-serif"
        >
          50일
        </text>

        <line
          x1={PAD_L + chartW - 182}
          y1={PAD_T + 12}
          x2={PAD_L + chartW - 162}
          y2={PAD_T + 12}
          className="lc-ma200"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
        <text
          x={PAD_L + chartW - 158}
          y={PAD_T + 16}
          fontSize="10"
          className="lc-ma200-label"
          fontFamily="Sora,sans-serif"
        >
          200일
        </text>

        <rect
          x={PAD_L + chartW - 114}
          y={PAD_T + 5}
          width={12}
          height={12}
          rx={2.5}
          fill="rgba(34,197,94,0.9)"
        />
        <text
          x={PAD_L + chartW - 108}
          y={PAD_T + 14.5}
          fontSize="8"
          fontWeight="700"
          fill="#fff"
          textAnchor="middle"
          fontFamily="Sora,sans-serif"
        >
          G
        </text>
        <text
          x={PAD_L + chartW - 96}
          y={PAD_T + 16}
          fontSize="10"
          fill="rgba(34,197,94,0.9)"
          fontFamily="Sora,sans-serif"
        >
          골든
        </text>

        <rect
          x={PAD_L + chartW - 66}
          y={PAD_T + 5}
          width={12}
          height={12}
          rx={2.5}
          fill="rgba(239,68,68,0.9)"
        />
        <text
          x={PAD_L + chartW - 60}
          y={PAD_T + 14.5}
          fontSize="8"
          fontWeight="700"
          fill="#fff"
          textAnchor="middle"
          fontFamily="Sora,sans-serif"
        >
          D
        </text>
        <text
          x={PAD_L + chartW - 48}
          y={PAD_T + 16}
          fontSize="10"
          fill="rgba(239,68,68,0.9)"
          fontFamily="Sora,sans-serif"
        >
          데드
        </text>
      </svg>

      {/* 투자 시뮬레이션 */}
      {firstBuy && (
        <div className="strategy-invest-hook">
          <p className="strategy-invest-hook-label">
            {firstBuy.buyDate.slice(0, 4)}년에 골든크로스 전략으로 1,000만원을
            투자했다면
          </p>
          <p className="strategy-invest-hook-value">
            지금 약 <strong>{finalCapital.toLocaleString()}만원</strong>
          </p>
          <p className="strategy-invest-hook-growth">
            약 {(finalCapital / 1000).toFixed(1)}배 성장
          </p>
          <p className="strategy-invest-hook-sub">
            골든크로스 매수 · 데드크로스 매도 · SPY 기준
          </p>
          <p className="strategy-invest-hook-disclaimer">
            과거 백테스트 결과이며 미래 수익을 보장하지 않습니다.
            세금·수수료·슬리피지 미반영.
          </p>
        </div>
      )}

      {/* 백테스트 성과 요약 */}
      <div className="strategy-invest-hook" style={{ marginTop: 8 }}>
        <p className="strategy-invest-hook-label">
          SPY {stats.years}년간 백테스트 결과
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 16px",
            marginTop: 8,
          }}
        >
          <div>
            <span className="strategy-invest-hook-sub">전략 CAGR</span>
            <br />
            <strong>{stats.strategyCagr.toFixed(1)}%</strong>
          </div>
          <div>
            <span className="strategy-invest-hook-sub">Buy&Hold CAGR</span>
            <br />
            <strong>{stats.bhCagr.toFixed(1)}%</strong>
          </div>
          <div>
            <span className="strategy-invest-hook-sub">전략 MDD</span>
            <br />
            <strong>{stats.strategyMdd.toFixed(1)}%</strong>
          </div>
          <div>
            <span className="strategy-invest-hook-sub">Buy&Hold MDD</span>
            <br />
            <strong>{stats.bhMdd.toFixed(1)}%</strong>
          </div>
          <div>
            <span className="strategy-invest-hook-sub">승률</span>
            <br />
            <strong>{stats.winRate}%</strong>
          </div>
          <div>
            <span className="strategy-invest-hook-sub">총 거래</span>
            <br />
            <strong>{stats.totalTrades}회</strong>
          </div>
        </div>
      </div>

      {/* 거래 내역 테이블 */}
      {visibleTrades.length > 0 && (
        <div className="strategy-trade-wrap">
          <table className="strategy-trade-table">
            <thead>
              <tr>
                <th className="col-date">골든크로스</th>
                <th>매수가</th>
                <th className="col-date">데드크로스</th>
                <th>매도가</th>
                <th>수익</th>
              </tr>
            </thead>
            <tbody>
              {visibleTrades.map((t, i) => {
                const gain = t.returnPct.toFixed(1);
                return (
                  <tr key={i}>
                    <td className="col-date">{t.buyDate}</td>
                    <td>${Math.round(t.buyPrice)}</td>
                    <td className="col-date">
                      {t.sellDate || "보유 중"}
                    </td>
                    <td>
                      {t.sellPrice ? `$${Math.round(t.sellPrice)}` : "—"}
                    </td>
                    <td
                      className={
                        parseFloat(gain) >= 0 ? "positive" : "negative"
                      }
                    >
                      {parseFloat(gain) >= 0 ? "+" : ""}
                      {gain}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── 통계 데이터 ── */
const STATS = [
  {
    value: "~+12%",
    label: "골든크로스 이후 1년 평균",
    desc: "S&P500 역사적 데이터 기준, 골든크로스 발생 후 12개월 평균 수익률",
  },
  {
    value: "~25회",
    label: "1970년 이후 발생 횟수",
    desc: "평균 2~3년에 한 번 발생하는 비교적 드문 신호",
  },
  {
    value: "~73%",
    label: "1년 후 양수 확률",
    desc: "골든크로스 발생 후 1년 뒤 S&P500이 플러스인 비율",
  },
];

/* ── 메인 페이지 ── */
export default function GoldenDeadCrossPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="추세 추종 기초"
        title="골든 크로스와 데드 크로스의 의미"
        desc="50일선과 200일선이 교차할 때 시장은 무슨 신호를 보내는가. 역사적 데이터와 SPY 백테스트로 확인합니다."
      />

      <ColumnCallout label="데이터가 말하는 것">
        골든 크로스(50일선이 200일선을 위로 돌파) 발생 후 S&P500의 1년 평균
        수익률은 과거 데이터에서 약 <strong>+12%</strong>를 기록했습니다. 반면
        데드 크로스 이후에는 단기 변동성이 높아지는 경향이 있었으나, 1년 후에는
        평균적으로 양수 수익을 회복한 경우가 많았습니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 개념 이해 ── */}
      <ColumnSectionTitle>개념 이해</ColumnSectionTitle>

      <ColumnCallout label="골든 크로스">
        단기 이평선(50일)이 장기 이평선(200일)을{" "}
        <strong>아래에서 위로</strong> 교차. 단기 추세가 장기 추세보다 강해졌다는
        의미로, <strong>강세 전환 신호</strong>로 해석합니다. 50일선이 200일선
        위로 올라가려면 최근 50일간의 평균 가격이 200일 평균보다 높아야 하므로,
        상당 기간의 상승 추세가 선행되어야 합니다.
      </ColumnCallout>

      <ColumnCallout label="데드 크로스">
        단기 이평선(50일)이 장기 이평선(200일)을{" "}
        <strong>위에서 아래로</strong> 교차. 단기 추세가 장기 추세 아래로
        무너졌다는 의미로, <strong>약세 전환 신호</strong>로 해석합니다. 시장이
        이미 하락세에 접어든 후에 발생하므로, 확인 신호로서의 성격이 강합니다.
      </ColumnCallout>

      <ColumnCompareRow
        left={{
          label: "골든 크로스 이후 1년",
          value: "약 +12%",
          sub: "상승 추세 확인 신호 (과거 평균)",
          variant: "good",
        }}
        right={{
          label: "데드 크로스 발생",
          value: "변동성 확대",
          sub: "단기 하락 위험 증가, 장기적으로는 회복 경향",
          variant: "bad",
        }}
      />

      {/* ── 학술 연구 ── */}
      <ColumnSectionTitle>학술 연구와 역사적 근거</ColumnSectionTitle>

      <ColumnResearchCard
        source="SSRN"
        year="2007"
        title="A Quantitative Approach to Tactical Asset Allocation"
        author="Mebane T. Faber"
        stat="MDD 50% 감소"
      >
        10개월(약 200일) 이동평균선으로 1900년 이후 S&P500 백테스트를 수행한
        논문입니다. 결과: CAGR은 Buy &amp; Hold와 유사하면서 최대 드로다운은 약
        50% 감소했습니다. 골든크로스/데드크로스의 핵심 논리인{" "}
        <strong>장단기 이평선 교차가 추세 전환을 포착</strong>하는 전략의 가장
        널리 인용되는 학술적 근거입니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="S&P Dow Jones Indices"
        year="2020"
        title="Moving Averages: The Case of the S&P 500"
        author="S&P DJI Research"
        stat="73% 양수 확률"
      >
        1970년 이후 S&P500의 골든크로스를 분석한 결과, 골든크로스 발생 후 12개월
        수익률이 양수인 경우가 약 73%였습니다. 평균 수익률은 +12.4%로, 데드크로스
        이후(-1.5%)와 뚜렷한 차이를 보였습니다. 다만{" "}
        <strong>신호가 늦게 발생하는 후행적 특성</strong>이 주요 한계로
        지적되었습니다.
      </ColumnResearchCard>

      {/* ── 역사적 사례 ── */}
      <ColumnSectionTitle>S&P500 주요 크로스 사례</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="2001.09" title="데드 크로스">
          닷컴 버블 붕괴 진행 중 데드크로스 발생. 50일선이 200일선 아래로
          하락하며 S&P500은 이후 2002년 10월까지 추가 -30% 하락. 하락장 초입이
          아닌 중간에 발생하여, 후행 신호의 한계를 보여줌.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2003.06" title="골든 크로스">
          닷컴 버블 이후 회복 과정에서 골든크로스 발생. 이후 2007년까지 약 4년간
          강세장이 지속되어, 이 신호를 따른 투자자는 약 +60% 수익을 거둠.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2007.12" title="데드 크로스">
          글로벌 금융위기 직전 데드크로스 발생. 이후 S&P500은 2009년 3월까지
          -55% 폭락. 이 신호를 따라 매도했다면 금융위기 최악의 하락을 피할 수
          있었음.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2009.06" title="골든 크로스">
          금융위기 이후 반등 과정에서 골든크로스 발생. 저점 대비 이미 +35% 상승한
          시점이었지만, 이후 2015년까지 추가 +80% 상승. 후행적이지만 장기 강세장
          진입을 확인하는 신호로 유효했음.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2020.07" title="골든 크로스">
          코로나 폭락 이후 반등으로 7월 초 50일선이 200일선을 위로 돌파. 이후
          S&P500은 2021년 말까지 강세장 지속, +50% 이상 추가 상승.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2022.03" title="데드 크로스">
          연준 금리 인상 사이클 시작과 함께 50일선이 200일선 아래로 이탈. 이후
          2022년 한 해 동안 약세장 지속 (-20% 이상).
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2023.02" title="골든 크로스">
          2022년 약세장 이후 반등 과정에서 크로스 발생. 2023~2024년 AI 주도
          강세장 재개 신호가 됨.
        </ColumnTimelineItem>
      </ColumnTimeline>

      {/* ── SPY 백테스트 ── */}
      <ColumnSectionTitle>SPY 골든크로스 전략 백테스트</ColumnSectionTitle>

      <ColumnCallout label="백테스트 규칙">
        <strong>매수:</strong> 50일 이동평균선이 200일 이동평균선을 위로
        돌파(골든크로스) 시 종가 매수.{" "}
        <strong>매도:</strong> 50일선이 200일선을 아래로 돌파(데드크로스) 시 종가
        매도. 매도 후에는 현금 보유. 거래 비용, 세금, 슬리피지는 미반영.
      </ColumnCallout>

      <GoldenCrossChart />

      {/* ── 전략 비교 ── */}
      <ColumnSectionTitle>전략 비교</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["지표", "골든크로스 전략", "Buy-and-Hold"]}
        rows={[
          [
            "수익 구조",
            { value: "하락장 회피로 손실 최소화", highlight: true },
            { value: "상승·하락 모두 보유" },
          ],
          [
            "최대 드로다운",
            { value: "약 -20%~-30%", highlight: true },
            { value: "-55% (2008)", bad: true },
          ],
          [
            "매매 빈도",
            { value: "평균 2~3년에 1회", highlight: true },
            { value: "매매 없음 (0회)", highlight: true },
          ],
          [
            "후행성",
            { value: "있음 (저점 대비 10~15% 높게 진입)", dim: true },
            { value: "없음", highlight: true },
          ],
          [
            "심리적 부담",
            { value: "낮음 (규칙 기반)", highlight: true },
            { value: "높음 (폭락 인내 필요)", bad: true },
          ],
        ]}
      />

      {/* ── 한계와 주의점 ── */}
      <ColumnSectionTitle>한계와 주의점</ColumnSectionTitle>

      <ColumnWarningCard
        title="후행 지표의 본질적 한계"
        example="예: 2009년 골든크로스는 저점 대비 이미 +35% 상승한 시점에 발생. 2007년 데드크로스도 고점 대비 -10% 하락한 후."
      >
        골든크로스와 데드크로스는 과거 데이터의 평균으로 계산되므로, 추세 전환이
        이미 진행된 후에 신호가 발생합니다. 바닥에서 사고 꼭대기에서 파는 것은
        원리적으로 불가능하며, 진입·이탈이 실제 전환점보다 늦는 것은 이 전략의
        구조적 비용입니다.
      </ColumnWarningCard>

      <ColumnWarningCard
        title="횡보장에서의 휩소 (Whipsaw)"
        example="예: 2015~2016년, 2011년 등 횡보장에서 골든크로스와 데드크로스가 짧은 간격으로 반복 발생."
      >
        뚜렷한 추세 없이 횡보하는 시장에서는 50일선과 200일선이 자주 교차하며,
        매수 직후 하락하거나 매도 직후 반등하는 휩소가 반복됩니다. 이런 구간에서의
        거래 손실이 전체 전략의 수익을 깎아먹을 수 있습니다.
      </ColumnWarningCard>

      <ColumnMythFact
        myth="크로스 신호가 나오면 바로 매매해야 한다"
        fact="크로스는 확인 신호이므로 후행성이 있습니다. 앗추는 여기에 16/20 필터를 추가 적용하여 잦은 매매를 줄인 추세 데이터를 제공합니다."
      />

      <ColumnMythFact
        myth="골든크로스가 발생하면 무조건 강세장이 시작된다"
        fact="골든크로스 이후 1년 수익률이 양수일 확률은 약 73%로 높지만, 약 27%의 경우에는 오히려 하락합니다. 2015년 등 짧은 골든크로스 후 다시 데드크로스가 이어진 사례가 있습니다."
      />

      <ColumnTipBox icon="💡" title="앗추에서 활용하는 법">
        1. 골든크로스/데드크로스는{" "}
        <strong>시장 추세의 큰 방향</strong>을 확인하는 도구로 활용하세요.
        <br />
        2. 앗추의 16/20 필터는 단순 골든크로스보다{" "}
        <strong>휩소를 줄이고 추세 확인 정확도를 높인</strong> 방식입니다.
        <br />
        3. 골든크로스 발생 직후보다는 16/20 필터가 함께 확인될 때 더 신뢰도가
        높습니다.
        <br />
        4. 데드크로스 발생은 반드시 매도 신호가 아닌,{" "}
        <strong>리스크 관리 점검 시점</strong>으로 활용하세요.
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
