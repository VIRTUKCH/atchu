import React from "react";

export default function LandingHero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-bg-orb landing-hero-bg-orb--1" />
      <div className="landing-hero-bg-orb landing-hero-bg-orb--2" />
      <div className="landing-hero-content">
        <p className="landing-hero-eyebrow">개인 투자자를 위한 추세 알림 서비스</p>
        <h1 className="landing-hero-headline">
          당신에게<br />
          <span className="landing-hero-highlight">매매 기준이 있나요?</span>
        </h1>
        <p className="landing-hero-sub">
          언제 사야 하는지, 언제 팔아야 하는지<br />
          매번 다른 기준으로 결정하고 있다면
        </p>
      </div>
    </section>
  );
}
