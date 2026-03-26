import landingData from "../../../data/summary/landing_data.json";

export default function LandingRealChart() {
  // 사전 계산 데이터: CSV 로드 + buildCsvAnalytics 불필요
  const items = landingData.chart.items.map((i) => ({
    date: i.d, close: i.c, ma200: i.m
  }));

  // simpleCrossings: 단순 200일선 교차 신호 (섹션 3용)
  // crossings (16/20 필터)는 섹션 5 LandingFilterSection에서 사용
  const simpleMA200Crossings = landingData.simpleCrossings.map((c) => ({
    date: c.d, direction: c.dir, close: c.c
  }));

  if (!items.length) return null;

  // 오늘 종가 (마지막 데이터 포인트) — 보유 중 포지션 평가에 사용
  const lastItem = items[items.length - 1];

  // 16/20 필터 신호로 보유 구간 계산
  let inMarket = false;
  let ci = 0;
  const markedItems = items.map((item) => {
    while (ci < simpleMA200Crossings.length && simpleMA200Crossings[ci].date <= item.date) {
      inMarket = simpleMA200Crossings[ci].direction === "up";
      ci++;
    }
    return { ...item, inMarket };
  });

  // 2020년 이후 차트 범위 내 crossing만
  const visibleCrossings = simpleMA200Crossings.filter((c) => c.date >= "2020-01-01");

  // 거래 페어링 (전체 simpleMA200Crossings 기준으로 쌍을 맞춤)
  const trades = [];
  let buyEvent = null;
  simpleMA200Crossings.forEach((c) => {
    if (c.direction === "up") {
      buyEvent = c;
    } else if (c.direction === "down" && buyEvent) {
      trades.push({ buy: buyEvent, sell: c });
      buyEvent = null;
    }
  });
  if (buyEvent) trades.push({ buy: buyEvent, sell: null });

  // 2020년 이후 거래만 표시
  const visibleTrades = trades.filter((t) => t.buy.date >= "2020-01-01");

  // 1,000만원 훅 계산 (visibleTrades 기준 복리 수익, 보유 중은 오늘 종가 기준 매도로 계산)
  let capital = 1000;
  visibleTrades.forEach((t) => {
    const sellClose = t.sell ? t.sell.close : lastItem.close;
    const gain = (sellClose - t.buy.close) / t.buy.close;
    capital *= (1 + gain);
  });
  const finalCapital = Math.round(capital / 100) * 100;
  const firstBuyDate = visibleTrades.length > 0 ? visibleTrades[0].buy.date : null;
  const firstBuyYear = firstBuyDate ? firstBuyDate.slice(0, 4) : null;
  const firstBuyMonth = firstBuyDate ? parseInt(firstBuyDate.slice(5, 7)) : null;

  // SVG dimensions
  const W = 680;
  const H = 250;
  const PAD_L = 52;
  const PAD_R = 16;
  const PAD_T = 16;
  const BAND_H = 8; // 보유 밴드 높이
  const PAD_B = 32; // 연도 라벨 공간
  const chartH = H - PAD_T - BAND_H - PAD_B; // 가격 차트 영역
  const chartW = W - PAD_L - PAD_R;

  // Y range (5% padding)
  const prices = items.flatMap((item) =>
    [item.close, item.ma200].filter((v) => v !== null && v !== undefined)
  );
  const minRaw = Math.min(...prices);
  const maxRaw = Math.max(...prices);
  const rawRange = maxRaw - minRaw || 1;
  const yPad = rawRange * 0.05;
  const minP = minRaw - yPad;
  const maxP = maxRaw + yPad;
  const rangeP = maxP - minP;

  const CHART_BOTTOM = PAD_T + chartH; // 가격 차트 하단
  const BAND_TOP = CHART_BOTTOM; // 보유 밴드 상단

  const toX = (i) => PAD_L + (i / Math.max(1, markedItems.length - 1)) * chartW;
  const toY = (price) => PAD_T + (1 - (price - minP) / rangeP) * chartH;

  // 보유 밴드 구간 grouping
  const bands = [];
  let bandStart = null;
  let bandInMarket = null;
  markedItems.forEach((item, i) => {
    if (bandInMarket === null) {
      bandStart = i;
      bandInMarket = item.inMarket;
    } else if (item.inMarket !== bandInMarket) {
      bands.push({ startIdx: bandStart, endIdx: i - 1, inMarket: bandInMarket });
      bandStart = i;
      bandInMarket = item.inMarket;
    }
  });
  if (bandStart !== null) {
    bands.push({ startIdx: bandStart, endIdx: markedItems.length - 1, inMarket: bandInMarket });
  }

  // 폴리라인 세그먼트 빌더
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
  const ma200Segments = buildSegments("ma200");

  // Y축 5개 틱
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const ratio = i / 4;
    return {
      price: maxP - ratio * rangeP,
      y: PAD_T + ratio * chartH,
    };
  });

  // X축: 연도별 정확한 위치 (2020~2026)
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const yearTicks = years
    .map((year) => {
      const idx = markedItems.findIndex((item) => item.date >= `${year}-01-01`);
      return idx >= 0 ? { idx, label: String(year) } : null;
    })
    .filter(Boolean);

  // 마커 좌표 계산
  const markerData = visibleCrossings.map((c) => {
    const idx = markedItems.findIndex((item) => item.date >= c.date);
    if (idx < 0) return null;
    const x = toX(idx);
    const y = toY(c.close);
    return { ...c, x, y };
  }).filter(Boolean);

  return (
    <div className="strategy-chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="strategy-chart-svg"
        role="img"
        aria-label="SPY 2020년 이후 가격 및 200일선 + 단순 200일선 교차 매수/매도 신호 차트"
      >
        {/* Y axis */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={CHART_BOTTOM} className="lc-axis" strokeWidth="1" />
        {/* X axis */}
        <line x1={PAD_L} y1={CHART_BOTTOM} x2={PAD_L + chartW} y2={CHART_BOTTOM} className="lc-axis" strokeWidth="1" />

        {/* Y grid + labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD_L} y1={tick.y}
              x2={PAD_L + chartW} y2={tick.y}
              className="lc-grid" strokeWidth="0.5" strokeDasharray="3,3"
            />
            <text
              x={PAD_L - 6} y={tick.y + 4}
              textAnchor="end" fontSize="10"
              className="lc-label" fontFamily="Sora,sans-serif"
            >
              ${Math.round(tick.price)}
            </text>
          </g>
        ))}

        {/* 연도별 X축 눈금 + 라벨 */}
        {yearTicks.map(({ idx, label }) => {
          const x = toX(idx);
          return (
            <g key={label}>
              <line
                x1={x} y1={PAD_T}
                x2={x} y2={CHART_BOTTOM + BAND_H}
                className="lc-axis" strokeWidth="0.5" strokeDasharray="2,4"
              />
              <text
                x={x} y={CHART_BOTTOM + BAND_H + 14}
                textAnchor="middle" fontSize="10"
                className="lc-label" fontFamily="Sora,sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 보유 밴드 (단순 200일선 교차 기준) */}
        {bands.map((band, i) => {
          const x1 = toX(band.startIdx);
          const x2 = toX(band.endIdx);
          return (
            <rect
              key={i}
              x={x1} y={BAND_TOP}
              width={Math.max(1, x2 - x1)} height={BAND_H}
              fill={band.inMarket ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.15)"}
            />
          );
        })}

        {/* SPY 가격 선 */}
        {closeSegments.map((points, i) => (
          <polyline key={i} points={points} className="lc-close" strokeWidth="1.5" />
        ))}

        {/* 200일선 (파란 점선, 보조) */}
        {ma200Segments.map((points, i) => (
          <polyline key={i} points={points} className="lc-ma200" strokeWidth="1.5" strokeDasharray="6,4" />
        ))}

        {/* 매수/매도 마커 (B/S 라벨 + 화살표) */}
        {markerData.map((c, i) => {
          const bw = 14;
          const bh = 14;
          const gap = 8;
          const arrowLen = 6;
          if (c.direction === "up") {
            // 매수(B): 차트 아래, 위쪽 화살표
            const boxTop = c.y + gap;
            const cy = boxTop + bh / 2;
            const arrowTip = boxTop - 2;
            return (
              <g key={i}>
                <line x1={c.x} y1={boxTop} x2={c.x} y2={arrowTip - arrowLen} stroke="rgba(34,197,94,0.7)" strokeWidth="1" />
                <polyline points={`${c.x - 3},${arrowTip} ${c.x},${arrowTip - arrowLen} ${c.x + 3},${arrowTip}`} fill="none" stroke="rgba(34,197,94,0.7)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <rect x={c.x - bw / 2} y={boxTop} width={bw} height={bh} rx={3} fill="rgba(34,197,94,0.9)" />
                <text x={c.x} y={cy + 3.5} fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Sora,sans-serif">B</text>
              </g>
            );
          } else {
            // 매도(S): 차트 위, 아래쪽 화살표
            const boxBottom = c.y - gap;
            const boxTop = boxBottom - bh;
            const cy = boxTop + bh / 2;
            const arrowTip = boxBottom + 2;
            return (
              <g key={i}>
                <line x1={c.x} y1={boxBottom} x2={c.x} y2={arrowTip + arrowLen} stroke="rgba(239,68,68,0.7)" strokeWidth="1" />
                <polyline points={`${c.x - 3},${arrowTip} ${c.x},${arrowTip + arrowLen} ${c.x + 3},${arrowTip}`} fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <rect x={c.x - bw / 2} y={boxTop} width={bw} height={bh} rx={3} fill="rgba(239,68,68,0.9)" />
                <text x={c.x} y={cy + 3.5} fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Sora,sans-serif">S</text>
              </g>
            );
          }
        })}

        {/* 범례 */}
        <line
          x1={PAD_L + chartW - 230} y1={PAD_T + 12}
          x2={PAD_L + chartW - 210} y2={PAD_T + 12}
          className="lc-close" strokeWidth="1.5"
        />
        <text x={PAD_L + chartW - 206} y={PAD_T + 16} fontSize="10" className="lc-label" fontFamily="Sora,sans-serif">
          SPY
        </text>
        <line
          x1={PAD_L + chartW - 182} y1={PAD_T + 12}
          x2={PAD_L + chartW - 162} y2={PAD_T + 12}
          className="lc-ma200" strokeWidth="1.5" strokeDasharray="5,3"
        />
        <text x={PAD_L + chartW - 158} y={PAD_T + 16} fontSize="10" className="lc-ma200-label" fontFamily="Sora,sans-serif">
          200일선
        </text>
        <rect x={PAD_L + chartW - 114} y={PAD_T + 5} width={12} height={12} rx={2.5} fill="rgba(34,197,94,0.9)" />
        <text x={PAD_L + chartW - 108} y={PAD_T + 14.5} fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Sora,sans-serif">B</text>
        <text x={PAD_L + chartW - 96} y={PAD_T + 16} fontSize="10" fill="rgba(34,197,94,0.9)" fontFamily="Sora,sans-serif">
          매수
        </text>
        <rect x={PAD_L + chartW - 66} y={PAD_T + 5} width={12} height={12} rx={2.5} fill="rgba(239,68,68,0.9)" />
        <text x={PAD_L + chartW - 60} y={PAD_T + 14.5} fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Sora,sans-serif">S</text>
        <text x={PAD_L + chartW - 48} y={PAD_T + 16} fontSize="10" fill="rgba(239,68,68,0.9)" fontFamily="Sora,sans-serif">
          매도
        </text>
      </svg>

      {/* 1,000만원 훅 */}
      {firstBuyDate && (
        <div className="strategy-invest-hook">
          <p className="strategy-invest-hook-label">
            {firstBuyYear}년 {firstBuyMonth}월에 1,000만원을 투자했다면
          </p>
          <p className="strategy-invest-hook-value">
            지금 약 <strong>{finalCapital.toLocaleString()}만원</strong>
          </p>
          <p className="strategy-invest-hook-growth">
            약 {(finalCapital / 1000).toFixed(1)}배 성장
          </p>
          <p className="strategy-invest-hook-sub">200일선 기준 · 실제 거래 데이터</p>
          <p className="strategy-invest-hook-disclaimer">과거 백테스트 결과이며 미래 수익을 보장하지 않습니다. 세금·수수료·슬리피지 미반영.</p>
        </div>
      )}

      {/* 거래 내역 테이블 */}
      {visibleTrades.length > 0 && (
        <div className="strategy-trade-wrap">
          <table className="strategy-trade-table">
            <thead>
              <tr>
                <th className="col-date">진입일</th>
                <th>진입가</th>
                <th className="col-date">청산일</th>
                <th>청산가</th>
                <th>수익</th>
              </tr>
            </thead>
            <tbody>
              {visibleTrades.map((t, i) => {
                const isHolding = !t.sell;
                const sellClose = t.sell ? t.sell.close : lastItem.close;
                const sellDate = t.sell ? t.sell.date : lastItem.date;
                const gain = (((sellClose - t.buy.close) / t.buy.close) * 100).toFixed(1);
                const shortDate = (d) => d ? d.slice(2).replace(/-/g, ".") : "";
                return (
                  <tr key={i}>
                    <td className="col-date">{shortDate(t.buy.date)}</td>
                    <td>${Math.round(t.buy.close)}</td>
                    <td className="col-date">{shortDate(sellDate)}{isHolding && <span className="col-holding-note"> (현재)</span>}</td>
                    <td>${Math.round(sellClose)}</td>
                    <td className={parseFloat(gain) >= 0 ? "positive" : "negative"}>
                      {parseFloat(gain) >= 0 ? "+" : ""}{gain}%
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
