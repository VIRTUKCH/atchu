import React from "react";

const cards = [
  { text: "뉴스 보고 샀다가 고점에 물렸다", icon: "😤" },
  { text: "싸 보여서 샀는데, 더 떨어졌다", icon: "😨" },
  { text: "더 오를 줄 알았는데, 가지고 있다 보니 떨어졌다", icon: "😩" },
  { text: "버티면 오르겠지 했는데, 결국 손실만 커졌다", icon: "😰" },
  { text: "남들 따라 샀다가 손해만 봤다", icon: "📱" },
  { text: "뉴스 볼 때마다 불안해서 자꾸 손이 간다", icon: "😵‍💫" },
];

export default function LandingProblemSection() {
  return (
    <section className="landing-problem" id="diagnosis">
      <div className="landing-section-inner">
        <div className="landing-section-header">
          <p className="landing-section-label">진단</p>
          <h2 className="landing-section-title">
            이 중에 나와 같은<br />
            <span className="landing-problem-em">경험이 있나요?</span>
          </h2>
        </div>

        <div className="landing-problem-cards">
          {cards.map((card) => (
            <div key={card.text} className="landing-problem-card">
              <span className="landing-problem-card-icon">{card.icon}</span>
              <p className="landing-problem-card-text">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="landing-problem-conclusion">
          <p>
            이 패턴의 공통점은<br />
            <strong>기준이 없었다는 것.</strong>
          </p>
        </div>

        <div className="landing-problem-transition">
          <p>그렇다면, 기준이 있었다면 어떻게 달랐을까?</p>
        </div>
      </div>
    </section>
  );
}
