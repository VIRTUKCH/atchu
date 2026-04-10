import React, { useEffect, useState } from "react";

export default function AppSidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tabs = [
    { key: "main", label: "메인", icon: "⌂", short: "메", onClick: () => onTabChange("main") },
    { key: "etfTrend", label: "추세 조회", icon: "↗", short: "추", onClick: () => onTabChange("etfTrend") },
    { key: "developerPortfolio", label: "개발자의 포트폴리오 예시", icon: "◧", short: "포", onClick: () => onTabChange("developerPortfolio") },
    { key: "godOpportunity", label: "레이달리오의 5단계 사이클", icon: "◎", short: "5", onClick: () => onTabChange("godOpportunity") }
  ];

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", mobileOpen);
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="mobile-appbar">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "사이드바 닫기" : "사이드바 열기"}
          title={mobileOpen ? "닫기" : "메뉴"}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <div className="mobile-appbar-brand">
          <strong>앗추</strong>
          <span>Trend Pulse Console</span>
        </div>
      </header>
      {mobileOpen && <button type="button" className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="메뉴 닫기" />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">A</div>
        {!collapsed && (
          <div className="brand-text">
            <strong>앗추</strong>
            <span>Trend Pulse Console</span>
          </div>
        )}
      </div>
      <button type="button" className="sidebar-toggle" onClick={() => setCollapsed((v) => !v)}>
        {collapsed ? "열기" : "닫기"}
      </button>
      <nav className="sidebar-menu" aria-label="메인 탭">
        {!collapsed && <div className="sidebar-section-title">Navigation</div>}
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`sidebar-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => {
              tab.onClick();
              setMobileOpen(false);
            }}
            title={tab.label}
          >
            <span className="sidebar-tab-icon">{collapsed ? tab.short : tab.icon}</span>
            {!collapsed && <span className="sidebar-tab-label">{tab.label}</span>}
          </button>
        ))}
      </nav>
      </aside>
    </>
  );
}
