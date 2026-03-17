import React from "react";
import "../styles/developer.css";
import InvestorStoriesSection from "../components/main/InvestorStoriesSection";

export default function MorePage() {
  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">칼럼</div>
          <p className="panel-subtitle">전설적인 투자자들의 이야기</p>
        </div>
      </div>
      <InvestorStoriesSection />
    </section>
  );
}
