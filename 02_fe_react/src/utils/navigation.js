const FAQ_PATHS = new Set([
  "/faq",
  "/moving_average_faq",
  "/what_is_moving_average",
  "/atchu_strategy",
  "/moving_average_history",
]);

const COLUMN_PATHS = new Set([
  "/more",
  "/dalio_cycle_guide",
  "/golden_dead_cross",
  "/faber_paper",
  "/paul_tudor_jones",
  "/ed_seykota",
  "/jesse_livermore",
  "/turtle_trader",
  "/marty_schwartz",
  "/buffett_vs_hedge",
  "/jack_bogle",
  "/howard_marks",
  "/crisis_2008",
  "/dotcom_bubble",
  "/covid_crash",
  "/sp500_drawdowns",
  "/bad_timing_still_wins",
  "/dalbar_research",
  "/loss_aversion",
  "/fear_greed_index",
  "/bear_market_survival",
  "/information_paradox",
  "/overseas_investor_psychology",
  "/leverage_faq",
  "/upro_vs_tqqq",
  "/volatility_decay",
  "/hfea_strategy",
  "/all_weather_portfolio",
  "/debt_cycle",
  "/sector_rotation",
  "/vix_explained",
  "/why_sp500",
  "/buy_hold_vs_trend",
  "/dca_vs_lump_sum",
  "/peter_lynch_warning",
  "/momentum_effect",
  "/cta_funds",
  "/diversification_science",
  "/risk_adjusted_return",
]);

const getActiveTabFromPathname = (pathname) => {
  if (pathname.startsWith("/index_etf") || pathname.startsWith("/stock_trend")) {
    return "etfTrend";
  }
  if (pathname.startsWith("/market_overview")) {
    return "marketOverview";
  }
  if (FAQ_PATHS.has(pathname)) {
    return "faq";
  }
  if (COLUMN_PATHS.has(pathname)) {
    return "more";
  }
  return "main";
};

const navigateByTab = (tab, navigate) => {
  const tabPathMap = {
    main: "/",
    etfTrend: "/index_etf",
    marketOverview: "/market_overview",
    faq: "/faq",
    more: "/more"
  };
  const targetPath = tabPathMap[tab];
  if (targetPath) {
    navigate(targetPath);
  }
};

export { getActiveTabFromPathname, navigateByTab };
