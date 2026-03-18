import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearDevSession } from "../utils/devAuth";

const DEV_LINKS = [
  { to: "/_stocks_overview", label: "개별주 시장 개요", desc: "S&P 500 섹터별 추세 강도, 히트맵, 최근 신호" },
  { to: "/_stocks", label: "개별주 추세 조회", desc: "S&P 500 종목 리스트 (필터/검색/정렬)" }
];

export default function DevPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearDevSession();
    sessionStorage.removeItem("atchu_dev");
    navigate("/");
  };

  return (
    <div className="panel-card" style={{ padding: "32px 24px" }}>
      <h2 className="panel-title" style={{ marginBottom: 8 }}>관리자</h2>
      <p className="panel-subtitle" style={{ marginBottom: 24 }}>개발자 전용 페이지</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {DEV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: "block",
              padding: "16px 20px",
              borderRadius: "var(--radius-sm)",
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              textDecoration: "none",
              color: "var(--ink)"
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{link.label}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{link.desc}</div>
          </Link>
        ))}
      </div>
      <button
        className="ghost"
        onClick={handleLogout}
        style={{ color: "var(--ink)", border: "1px solid var(--line)" }}
      >
        로그아웃
      </button>
    </div>
  );
}
