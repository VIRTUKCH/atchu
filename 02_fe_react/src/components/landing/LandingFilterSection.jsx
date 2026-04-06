import landingData from "../../../data/summary/landing_data.json";

const BACKTEST_TICKERS = ["SPY", "QQQ", "XLE", "GLD"];

export default function LandingFilterSection() {
  const comparison = landingData.backtestComparison;
  if (!comparison) return null;

  // SPY 2020+ 신호 횟수
  const simpleCount = (landingData.simpleCrossings || [])
    .filter((c) => c.d >= "2020-01-01").length;
  const filterCount = (landingData.crossings || [])
    .filter((c) => c.d >= "2020-01-01").length;

  // 앗추 필터 거래 이력 (crossings 페어링, 2020+ 표시)
  const lastChartItem = (landingData.chart?.items ?? []).at(-1);
  const filterTrades = (() => {
    const trades = [];
    let buy = null;
    (landingData.crossings ?? []).forEach((c) => {
      if (c.dir === "up") { buy = c; }
      else if (c.dir === "down" && buy) { trades.push({ buy, sell: c }); buy = null; }
    });
    if (buy) trades.push({ buy, sell: null });
    return trades.filter((t) => t.buy.d >= "2020-01-01");
  })();
  const shortDate = (d) => d ? d.slice(2).replace(/-/g, ".") : "";

  // 백테스트 테이블 데이터
  const tableRows = BACKTEST_TICKERS.map((ticker) => {
    const d = comparison[ticker];
    if (!d) return null;
    return {
      ticker,
      ma200Cagr: d.ma200.cagr,
      filterCagr: d.atchuFilter.cagr,
      ma200Trades: d.ma200.signalsPerYear,
      filterTrades: d.atchuFilter.signalsPerYear,
      ma200Mdd: d.ma200.mdd,
      filterMdd: d.atchuFilter.mdd,
    };
  }).filter(Boolean);

  const spyData = comparison.SPY;

  return (
    <section className="landing-filter">
      <div className="landing-section-inner">
        <div className="landing-section-header">
          <p className="landing-section-label">앗추 필터</p>
          <h2 className="landing-section-title">
            거짓 신호를 걸러냅니다
          </h2>
          <p className="landing-section-desc">
            200일선은 좋은 기준이지만, 선을 넘을 때마다 사고팔면<br />
            매매가 잦아지고 거짓 신호에 당합니다.
          </p>
        </div>

        <div className="filter-rule-card">
          <p className="filter-rule-title">앗추 필터 (16/20 규칙)</p>
          <p className="filter-rule-desc">
            최근 20거래일 중 <strong>16일 이상</strong> 200일선 위에 있을 때만 진입 신호.<br />
            단기 변동에 흔들리지 않습니다.
          </p>
        </div>

        {/* 매매 횟수 + 수익률 + MDD 비교 */}
        <div className="filter-frequency-block">
          <p className="filter-frequency-question">200일선 대신 앗추 필터로 매매했다면?</p>
          <p className="filter-frequency-period">S&P 500 (SPY) · {spyData ? `${Math.round(spyData.years)}년` : ""} 백테스트</p>

          <div className="filter-stats-grid filter-stats-grid--3col">
            <div className="filter-stats-item">
              <span className="filter-stats-label">매매 횟수</span>
              <div className="filter-stats-row">
                <span className="filter-stats-val filter-stats-val--dim">연 {spyData?.ma200.signalsPerYear}회</span>
                <span className="filter-stats-vs">→</span>
                <span className="filter-stats-val filter-stats-val--good">연 {spyData?.atchuFilter.signalsPerYear}회</span>
              </div>
            </div>
            <div className="filter-stats-item">
              <span className="filter-stats-label">연평균 수익률 (CAGR)</span>
              <div className="filter-stats-row">
                <span className="filter-stats-val filter-stats-val--dim">{spyData?.ma200.cagr}%</span>
                <span className="filter-stats-vs">→</span>
                <span className="filter-stats-val filter-stats-val--good">{spyData?.atchuFilter.cagr}%</span>
              </div>
            </div>
            <div className="filter-stats-item">
              <span className="filter-stats-label">최대 낙폭 (MDD)</span>
              <div className="filter-stats-row">
                <span className="filter-stats-val filter-stats-val--dim">{spyData?.ma200.mdd}%</span>
                <span className="filter-stats-vs">→</span>
                <span className="filter-stats-val filter-stats-val--good">{spyData?.atchuFilter.mdd}%</span>
              </div>
            </div>
          </div>

          <div className="filter-stats-legend">
            <span className="filter-stats-legend-dim">200일선</span>
            <span className="filter-stats-legend-highlight">앗추 필터</span>
          </div>

          <p className="filter-stats-note">
            매매 횟수는 줄어도, 수익률과 리스크는 비슷하거나 더 낫습니다.
          </p>

          {/* 앗추 필터 거래 이력 */}
          {filterTrades.length > 0 && (
            <div className="strategy-trade-wrap">
              <p className="filter-trade-period-label">2020년 이후 거래 이력 (최근 신호 흐름 확인용)</p>
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
                  {[...filterTrades].reverse().map((t, i) => {
                    const isHolding = !t.sell;
                    const sellClose = t.sell ? t.sell.c : lastChartItem?.c;
                    const sellDate = t.sell ? t.sell.d : lastChartItem?.d;
                    const gain = sellClose
                      ? (((sellClose - t.buy.c) / t.buy.c) * 100).toFixed(1)
                      : null;
                    return (
                      <tr key={i}>
                        <td className="col-date">{shortDate(t.buy.d)}</td>
                        <td>${Math.round(t.buy.c)}</td>
                        <td className="col-date">
                          {shortDate(sellDate)}
                          {isHolding && <span className="col-holding-note"> (현재)</span>}
                        </td>
                        <td>{sellClose ? `$${Math.round(sellClose)}` : "-"}</td>
                        <td className={gain !== null && parseFloat(gain) >= 0 ? "positive" : "negative"}>
                          {gain !== null ? `${parseFloat(gain) >= 0 ? "+" : ""}${gain}%` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 백테스트 비교 카드 */}
        <div className="filter-table-block">
          <p className="filter-table-title">
            {spyData ? `${Math.round(spyData.years)}년` : ""} 백테스트 비교
          </p>

          <div className="filter-cards">
            {tableRows.map((row) => (
              <div key={row.ticker} className="filter-card">
                <p className="filter-card-ticker">{row.ticker}</p>
                <div className="filter-card-grid">
                  {/* 행 1: 헤더 */}
                  <span></span>
                  <span className="filter-card-col-label">200일선</span>
                  <span className="filter-card-col-label filter-card-col-label--atchu">앗추 필터</span>
                  {/* 행 2: 수익률 */}
                  <span className="filter-card-row-label">수익률</span>
                  <span className="filter-card-val">{row.ma200Cagr}%</span>
                  <span className="filter-card-val filter-card-val--atchu">{row.filterCagr}%</span>
                  {/* 행 3: 매매 횟수 */}
                  <span className="filter-card-row-label">매매 횟수</span>
                  <span className="filter-card-val">연 {row.ma200Trades}회</span>
                  <span className="filter-card-val filter-card-val--atchu">연 {row.filterTrades}회</span>
                  {/* 행 4: MDD */}
                  <span className="filter-card-row-label">MDD</span>
                  <span className="filter-card-val">{row.ma200Mdd}%</span>
                  <span className="filter-card-val filter-card-val--atchu">{row.filterMdd}%</span>
                </div>
              </div>
            ))}
          </div>

          <p className="filter-table-note">
            수익률은 종목에 따라 높아지기도, 낮아지기도 합니다.<br />
            차이는 크지 않습니다.<br />
            핵심은 <strong>매매 횟수가 연 2회 이내로 감소</strong>한다는 것.<br />
            바쁜 직장인도 충분히 가능한 전략입니다.
          </p>
          <p className="filter-table-disclaimer">
            과거 백테스트 결과이며 미래 수익을 보장하지 않습니다.<br />
            수익률은 전체 데이터 기간 기준이며, 거래 이력은 2020년 이후 최근 신호만 표시합니다.<br />
            세금·수수료·슬리피지 미반영.
          </p>
        </div>

        <p className="filter-section-transition">SPY가 약해도 기회는 있다</p>
      </div>
    </section>
  );
}
