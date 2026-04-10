import React, { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { navTabs } from "../../config/navigation";
import { getActiveTabFromPathname, navigateByTab } from "../../utils/navigation";
import useTheme from "../../hooks/useTheme";

const discordInviteUrl =
  import.meta.env.VITE_DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  import.meta.env.DISCORD_ATCHU_NEW_DAILY_SUMMARY_AND_NEW_TREND_NOTIFICATION_SERVER_URL ||
  "";

const DEV_TABS = [
  { key: "stocks", label: "관리자 추세 조회", path: "/_dev_trend_list" },
  { key: "stocks_overview", label: "관리자 시장 개요", path: "/_dev_market_overview" },
  { key: "quant", label: "관리자 퀀트 엿보기", path: "/_dev_quant" }
];

export default function AppTopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [devMode, setDevMode] = useState(() => sessionStorage.getItem("atchu_dev") === "1");
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getActiveTabFromPathname(location.pathname);
  const toggleTimestamps = useRef([]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    const now = Date.now();
    const recent = toggleTimestamps.current.filter((t) => now - t < 3000);
    recent.push(now);
    toggleTimestamps.current = recent;
    if (recent.length >= 5) {
      toggleTimestamps.current = [];
      setDevMode(true);
      sessionStorage.setItem("atchu_dev", "1");
    }
  }, [toggleTheme]);

  const handleTabChange = (tab) => {
    navigateByTab(tab, navigate);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="topnav">
        <button
          type="button"
          className="topnav-hamburger"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
        <Link
          to="/"
          className="topnav-brand"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img className="topnav-brand-mark" src="/logo_transparent.png" alt="앗추" />
          <div className="topnav-brand-text">
            <strong>앗추</strong>
          </div>
        </Link>
        <nav className="topnav-tabs">
          {navTabs.map((tab) => (
            <Link
              key={tab.key}
              to={tab.path}
              className={`topnav-tab ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
          {devMode && DEV_TABS.map((tab) => (
            <Link
              key={tab.key}
              to={tab.path}
              className={`topnav-tab ${location.pathname === tab.path ? "active" : ""}`}
              style={{ color: "var(--muted)" }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div
          className={`topnav-theme-toggle ${theme === "dark" ? "topnav-theme-toggle--dark" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={`테마 전환 (현재: ${theme === "dark" ? "다크" : "라이트"})`}
          onClick={handleThemeToggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleThemeToggle()}
        >
          <span className="topnav-theme-toggle-slider" />
          <button
            type="button"
            className={`topnav-theme-toggle-btn ${theme === "light" ? "active" : ""}`}
            tabIndex={-1}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
          <button
            type="button"
            className={`topnav-theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
            tabIndex={-1}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <button
          type="button"
          className="topnav-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="메뉴 닫기"
        />
      )}
      {mobileMenuOpen && (
        <nav className="topnav-mobile-menu">
          {navTabs.map((tab) => (
            <Link
              key={tab.key}
              to={tab.path}
              className={`topnav-mobile-item ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {tab.label}
            </Link>
          ))}
          {devMode && DEV_TABS.map((tab) => (
            <Link
              key={tab.key}
              to={tab.path}
              className={`topnav-mobile-item ${location.pathname === tab.path ? "active" : ""}`}
              style={{ color: "var(--muted)" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {tab.label}
            </Link>
          ))}
          {discordInviteUrl && (
            <a
              className="topnav-mobile-item topnav-mobile-item-discord"
              href={discordInviteUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              디스코드 방 입장하기
            </a>
          )}
        </nav>
      )}
    </>
  );
}
