import { Link } from "react-router-dom";
import landingData from "../../../data/summary/landing_data.json";
import sectorData from "../../../data/tickers/sector.json";
import countryData from "../../../data/tickers/country.json";
import commodityData from "../../../data/tickers/commodity.json";

const nameKoMap = Object.fromEntries(
  [
    ...(sectorData.items || []),
    ...(countryData.items || []),
    ...(commodityData.items || []),
  ].map((item) => [item.ticker, item.name_ko])
);

const ETF_TICKERS = ["XLE", "INDA", "EWY", "GLD"];

// 사전 계산 데이터: CSV 로드 + buildCsvAnalytics 불필요
const cards = ETF_TICKERS.map((ticker) => ({
  ticker,
  name: nameKoMap[ticker] || ticker,
  cagr: landingData.cagr[ticker] ?? null
}));

export default function LandingStockExplore() {
  if (!cards.length) return null;

  return (
    <section className="landing-explore">
      <div className="landing-section-inner">
        <div className="landing-section-header">
          <p className="landing-section-label">기회 탐색</p>
          <h2 className="landing-section-title">
            SPY가 약해도,<br />
            기회는 다른 곳에 있습니다
          </h2>
          <p className="landing-section-desc">
            앗추 필터를 섹터·국가·원자재 ETF에 적용하여,<br />
            실제 과거 데이터로 계산한 연평균 수익률입니다.
          </p>
        </div>

        <div className="explore-cards">
          {cards.map((card) => (
            <Link
              key={card.ticker}
              to={`/index_etf/${card.ticker}`}
              className="explore-card"
            >
              <span className="explore-card-ticker">{card.ticker}</span>
              <span className="explore-card-name">{card.name}</span>
              <span className="explore-card-cagr">
                {card.cagr != null ? `${card.cagr.toFixed(1)}%` : "—"}
              </span>
              <span className="explore-card-cagr-label">앗추 필터 연평균 (백테스트)</span>
              <span className="explore-card-link">상세 보기 →</span>
            </Link>
          ))}
        </div>

        <p className="explore-disclaimer">과거 백테스트 결과이며 미래 수익을 보장하지 않습니다. 투자 결정과 책임은 전적으로 본인에게 있습니다.</p>

        <div className="explore-cta-wrap">
          <Link to="/index_etf" className="explore-cta-btn explore-cta-btn--secondary">
            85개 ETF 추세 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
