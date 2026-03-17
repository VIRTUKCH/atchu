import React from "react";
import { clearDevSession } from "../utils/devAuth";
import { useNavigate } from "react-router-dom";

export default function DevPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearDevSession();
    navigate("/");
  };

  return (
    <div className="panel-card" style={{ textAlign: "center", padding: "48px 24px" }}>
      <h2 className="panel-title" style={{ marginBottom: 12 }}>
        개발자 페이지
      </h2>
      <p className="panel-subtitle">
        관리자 전용 공간입니다. 기능은 추후 추가됩니다.
      </p>
      <button className="ghost" onClick={handleLogout} style={{ marginTop: 16 }}>
        로그아웃
      </button>
    </div>
  );
}
