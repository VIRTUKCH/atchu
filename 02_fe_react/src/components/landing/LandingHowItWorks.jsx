import React from "react";

const steps = [
  {
    number: "01",
    icon: "📡",
    title: "추세 자동 감지",
    desc: "85개 ETF의\n추세 전환 신호를 매일 자동 감지합니다.",
  },
  {
    number: "02",
    icon: "🔔",
    title: "Discord 알림 발송",
    desc: "매일 아침 Discord로 알림을 보냅니다.\n사이트 방문 없이 신호만 받으세요.",
  },
  {
    number: "03",
    icon: "🧠",
    title: "판단은 본인이 직접",
    desc: "신호는 참고 정보입니다.\n투자 판단과 책임은 본인에게 있습니다.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="landing-howitworks">
      <div className="landing-section-inner">
        <div className="landing-section-header">
          <p className="landing-section-label">서비스 이용 방법</p>
          <h2 className="landing-section-title">
            딱 세 단계면 됩니다.
          </h2>
          <p className="landing-section-desc">
            분석 도구도, 매일 차트도 필요 없습니다.
          </p>
        </div>

        <div className="howitworks-steps">
          {steps.map((step, i) => (
            <React.Fragment key={step.number}>
              <div className="howitworks-step">
                <div className="howitworks-step-number">{step.number}</div>
                <div className="howitworks-step-icon">{step.icon}</div>
                <h3 className="howitworks-step-title">{step.title}</h3>
                <p className="howitworks-step-desc">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="howitworks-connector" aria-hidden="true">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="howitworks-disclaimer">
          투자 참고용이며, 매수·매도를 권유하지 않습니다.
        </div>
      </div>
    </section>
  );
}
