import { Link } from "react-router-dom";
import landingData from "../../../data/summary/landing_data.json";

const comparisons = [
  {
    label: "기준",
    bad: "왜 사라고 했는지 모른다",
    good: "200일선 위면 사고, 아래면 판다",
  },
  {
    label: "근거",
    bad: "근거를 알 수 없다",
    good: "누구나 직접 확인 가능",
  },
];

export default function LandingTrustSection() {
  const spyBt = landingData.backtestComparison?.SPY;
  const bh = spyBt?.buyAndHold ?? {};
  const ma = spyBt?.ma200 ?? {};

  const bhCagr = bh.cagr != null ? `${bh.cagr.toFixed(1)}%` : "10.5%";
  const bhMdd = bh.mdd != null ? `${bh.mdd.toFixed(1)}%` : "-55.2%";
  const maCagr = ma.cagr != null ? `${ma.cagr.toFixed(2)}%` : "8.22%";
  const maMdd = ma.mdd != null ? `${ma.mdd.toFixed(0)}%` : "-28%";

  // 1억 기준 최대 손실 금액 (만원)
  const bhLoss = bh.mdd != null ? Math.round(Math.abs(bh.mdd) * 100 / 10) * 10 : 5520;
  const maLoss = ma.mdd != null ? Math.round(Math.abs(ma.mdd) * 100 / 10) * 10 : 2800;

  const dataEnd = spyBt?.dataEnd ? spyBt.dataEnd.slice(0, 4) : "2026";
  const years = spyBt?.years != null ? Math.floor(spyBt.years) : 33;

  return (
    <section className="landing-trust">
      <div className="landing-section-inner">
        <div className="landing-section-header">
          <p className="landing-section-label">신뢰</p>
          <h2 className="landing-section-title">
            직접 확인해 보셔도 좋습니다
          </h2>
        </div>

        <div className="trust-backtest-block">
          <p className="trust-backtest-title">SPY 백테스트 (1993 – {dataEnd}, {years}년)</p>
          <p className="trust-backtest-subtitle">수익률은 비슷, 리스크만 절반</p>
          <p className="trust-backtest-rule">200일선 위에서 매수, 아래로 내려오면 매도하는 단순한 규칙</p>
          <div className="trust-backtest-grid">
            <div className="trust-backtest-item">
              <span className="trust-backtest-label">연평균 수익률</span>
              <div className="trust-backtest-compare">
                <div className="trust-backtest-val trust-backtest-val--dim">
                  <span className="trust-backtest-num">{bhCagr}</span>
                  <span className="trust-backtest-tag">Buy &amp; Hold</span>
                </div>
                <span className="trust-backtest-vs">vs</span>
                <div className="trust-backtest-val trust-backtest-val--good">
                  <span className="trust-backtest-num">{maCagr}</span>
                  <span className="trust-backtest-tag trust-backtest-tag--ma200">200일선</span>
                </div>
              </div>
            </div>
            <div className="trust-backtest-item">
              <span className="trust-backtest-label">최대 낙폭 (MDD)</span>
              <div className="trust-backtest-compare">
                <div className="trust-backtest-val trust-backtest-val--bad">
                  <span className="trust-backtest-num">{bhMdd}</span>
                  <span className="trust-backtest-tag">Buy &amp; Hold</span>
                </div>
                <span className="trust-backtest-vs">→</span>
                <div className="trust-backtest-val trust-backtest-val--good">
                  <span className="trust-backtest-num">{maMdd}</span>
                  <span className="trust-backtest-tag trust-backtest-tag--ma200">200일선</span>
                </div>
              </div>
            </div>
          </div>
          <p className="trust-backtest-real">
            1억 투자 시 최대 손실: <strong className="trust-backtest-real--bad">{bhLoss.toLocaleString()}만원</strong> → <strong className="trust-backtest-real--good">{maLoss.toLocaleString()}만원</strong>
          </p>
          <p className="trust-backtest-note">
            과거 백테스트 결과이며 미래 수익을 보장하지 않습니다.<br />
            실제 거래 시 세금·수수료·슬리피지로 인해 결과가 달라질 수 있습니다. 종가 기준.
          </p>
          <Link to="/trend_list/SPY" className="trust-backtest-detail-link">
            상세 거래 이력 보기 →
          </Link>
        </div>

        <div className="trust-authority-box">
          <p className="trust-authority-text">
            200일선 매매는 앗추만의 주장이 아닙니다.<br />
            <strong>전설적 투자자들이 수십 년간 위기에서 살아남은 기준입니다.</strong>
          </p>
        </div>

        <div className="strategy-trust-strip">
          <div className="strategy-trust-cards">
            <Link to="/paul_tudor_jones" className="strategy-trust-card">
              <div className="strategy-trust-person">
                <strong>폴 튜더 존스</strong>
                <span>헤지펀드 매니저 · 45년+ 운용</span>
              </div>
              <blockquote className="strategy-trust-quote">
                "내가 보는 모든 것의 기준은 200일 이동평균선이다."
              </blockquote>
              <p className="strategy-trust-original">"My metric for everything I look at is the 200-day moving average."</p>
              <span className="strategy-trust-card-link">칼럼 읽기 →</span>
            </Link>

            <Link to="/ed_seykota" className="strategy-trust-card">
              <div className="strategy-trust-person">
                <strong>에드 세이코타</strong>
                <span>시스템 트레이딩 선구자 · 50년+ 운용</span>
              </div>
              <blockquote className="strategy-trust-quote">
                "추세는 친구다. 끝에서 꺾이기 전까지는."
              </blockquote>
              <p className="strategy-trust-original">"The trend is your friend except at the end where it bends."</p>
              <span className="strategy-trust-card-link">칼럼 읽기 →</span>
            </Link>

            <Link to="/faber_paper" className="strategy-trust-card">
              <div className="strategy-trust-person">
                <strong>Mebane Faber 논문</strong>
                <span>SSRN에서 20만회 이상 다운로드</span>
              </div>
              <blockquote className="strategy-trust-quote">
                10개월(≈200일) 이평선 하나로 100년 데이터 검증.<br />
                수익률은 유사, 드로다운은 절반.
              </blockquote>
              <span className="strategy-trust-card-link">칼럼 읽기 →</span>
            </Link>
          </div>
        </div>

        <div className="trust-compare-cards">
          {comparisons.map((item) => (
            <div key={item.label} className="trust-compare-card">
              <p className="trust-compare-label">{item.label}</p>
              <div className="trust-compare-row">
                <div className="trust-compare-bad">
                  <span className="trust-compare-tag">리딩방</span>
                  <p>{item.bad}</p>
                </div>
                <div className="trust-compare-good">
                  <span className="trust-compare-tag">200일선</span>
                  <p>{item.good}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="trust-verify">
          <p>
            틀렸다고 생각하시면 직접 확인하시면 됩니다.<br />
            <strong>아무 차트에서 200일선을 보시면 됩니다.</strong>
          </p>
        </div>

        <p className="trust-section-transition">앗추는 여기서 한 단계 더 갔습니다</p>
      </div>
    </section>
  );
}
