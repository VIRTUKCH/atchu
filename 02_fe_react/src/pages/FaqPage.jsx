import React from "react";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "../config/faqItems";

export default function FaqPage() {
  return (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <div className="panel-title">자주 묻는 질문</div>
          <p className="panel-subtitle">
            앗추 서비스와 투자 개념에 대한 해설
          </p>
        </div>
      </div>
      <div className="more-link-list">
        {FAQ_ITEMS.map((item) => (
          <Link key={item.path} to={item.path} className="more-link-card">
            <div className="more-link-label">{item.label}</div>
            <div className="more-link-desc">{item.description}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
