import React from "react";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "../config/faqItems";
import JsonLd from "../components/common/JsonLd";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    "name": item.label,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.heroDesc,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
    <JsonLd schema={FAQ_SCHEMA} />
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
    </>
  );
}
