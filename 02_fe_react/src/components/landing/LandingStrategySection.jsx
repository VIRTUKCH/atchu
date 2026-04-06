import LandingRealChart from "./LandingRealChart";

export default function LandingStrategySection() {
  return (
    <section className="landing-strategy">
      <div className="landing-section-inner">
        <div className="landing-section-header landing-section-header--light">
          <p className="landing-section-label landing-section-label--dim">해결책</p>
          <h2 className="landing-section-title landing-section-title--light">
            간단하지만 강력한 기준, 200일선
          </h2>
          <p className="landing-section-desc landing-section-desc--dim">
            200일선* 위에 있으면 들어가고, 아래로 내려오면 나온다.<br />
            Paul Tudor Jones가 "나의 모든 지표의 기준은 200일 이동평균선"이라고 밝힌 바로 그 지표입니다.
          </p>
          <p className="landing-section-footnote">*200일선(이동평균선) : 지난 200거래일간의 평균 가격</p>
        </div>

        <p className="strategy-chart-transition">이 기준을 따랐다면 어떻게 달랐을까?</p>
        <p className="strategy-chart-caption">S&P 500 (SPY) — 실제 거래 데이터</p>
        <LandingRealChart />

        <p className="strategy-section-transition">최근 몇 년만 잘된 거 아냐?<br />SPY만 결과가 좋은 거 아니야?</p>
      </div>
    </section>
  );
}
