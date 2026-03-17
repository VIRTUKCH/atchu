import React, { useState } from "react";
import {
  verifyDevPassword,
  isDevSessionValid,
  saveDevSession,
} from "../../utils/devAuth";
import "../../styles/password-gate.css";

export default function PasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isDevSessionValid);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (isAuthenticated) return <>{children}</>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);
    const valid = await verifyDevPassword(password);
    setIsVerifying(false);
    if (valid) {
      saveDevSession();
      setIsAuthenticated(true);
    } else {
      setError("비밀번호가 일치하지 않습니다");
      setPassword("");
    }
  };

  return (
    <div className="password-gate">
      <div className="password-gate-card">
        <div className="password-gate-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="password-gate-title">접근 제한</h2>
        <p className="password-gate-desc">이 페이지는 관리자 전용입니다.</p>
        <form onSubmit={handleSubmit} className="password-gate-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="password-gate-input"
            autoFocus
            disabled={isVerifying}
          />
          <button
            type="submit"
            className="password-gate-btn"
            disabled={isVerifying || !password.trim()}
          >
            {isVerifying ? "확인 중..." : "확인"}
          </button>
        </form>
        {error && <p className="password-gate-error">{error}</p>}
      </div>
    </div>
  );
}
