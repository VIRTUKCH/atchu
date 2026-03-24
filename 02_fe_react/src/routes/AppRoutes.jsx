import React, { Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import MainPage from "../pages/MainPage";

const IndexEtfPage = React.lazy(() => import("../pages/IndexEtfPage"));
const IndexEtfDetailPage = React.lazy(() => import("../pages/IndexEtfDetailPage"));

function AnalysisRedirect() {
  const { ticker } = useParams();
  return <Navigate to={`/trend_list/${ticker}`} replace />;
}
const MarketOverviewPage = React.lazy(() => import("../pages/MarketOverviewPage"));
const MorePage = React.lazy(() => import("../pages/MorePage"));
const FaqPage = React.lazy(() => import("../pages/FaqPage"));
const TrendGuidePage = React.lazy(() => import("../pages/TrendGuidePage"));

// FAQ 페이지
const MovingAverageFaqPage = React.lazy(() => import("../pages/columns/MovingAverageFaqPage"));
const LeverageFaqPage = React.lazy(() => import("../pages/columns/LeverageFaqPage"));
const SpyQqqDeclineRotationPage = React.lazy(() => import("../pages/columns/SpyQqqDeclineRotationPage"));

// 칼럼 페이지 — 거시경제
const DalioCycleGuidePage = React.lazy(() => import("../pages/columns/DalioCycleGuidePage"));

// 칼럼 페이지 — 추세 추종 기초
const WhatIsMovingAveragePage = React.lazy(() => import("../pages/columns/WhatIsMovingAveragePage"));
const GoldenDeadCrossPage = React.lazy(() => import("../pages/columns/GoldenDeadCrossPage"));
const MovingAverageHistoryPage = React.lazy(() => import("../pages/columns/MovingAverageHistoryPage"));
const FaberPaperPage = React.lazy(() => import("../pages/columns/FaberPaperPage"));
const AtchuStrategyPage = React.lazy(() => import("../pages/columns/AtchuStrategyPage"));
const HoldingConvictionPage = React.lazy(() => import("../pages/columns/HoldingConvictionPage"));
const CanYouHandleMddPage = React.lazy(() => import("../pages/columns/CanYouHandleMddPage"));

// 칼럼 페이지 — 전설적 투자자
const PaulTudorJonesPage = React.lazy(() => import("../pages/columns/PaulTudorJonesPage"));
const StanWeinsteinPage = React.lazy(() => import("../pages/columns/StanWeinsteinPage"));
const EdSeykotaPage = React.lazy(() => import("../pages/columns/EdSeykotaPage"));
const JesseLivermorePage = React.lazy(() => import("../pages/columns/JesseLivermorePage"));
const TurtleTraderPage = React.lazy(() => import("../pages/columns/TurtleTraderPage"));
const MartySchwartzPage = React.lazy(() => import("../pages/columns/MartySchwartzPage"));
const BuffettVsHedgePage = React.lazy(() => import("../pages/columns/BuffettVsHedgePage"));
const JackBoglePage = React.lazy(() => import("../pages/columns/JackBoglePage"));
const HowardMarksPage = React.lazy(() => import("../pages/columns/HowardMarksPage"));

// 칼럼 페이지 — 위기 분석
const Crisis2008Page = React.lazy(() => import("../pages/columns/Crisis2008Page"));
const DotcomBubblePage = React.lazy(() => import("../pages/columns/DotcomBubblePage"));
const CovidCrashPage = React.lazy(() => import("../pages/columns/CovidCrashPage"));
const Sp500DrawdownsPage = React.lazy(() => import("../pages/columns/Sp500DrawdownsPage"));
const BadTimingStillWinsPage = React.lazy(() => import("../pages/columns/BadTimingStillWinsPage"));

// 칼럼 페이지 — 투자 심리
const CrowdSignalPage = React.lazy(() => import("../pages/columns/CrowdSignalPage"));
const DalbarResearchPage = React.lazy(() => import("../pages/columns/DalbarResearchPage"));
const LossAversionPage = React.lazy(() => import("../pages/columns/LossAversionPage"));
const FearGreedIndexPage = React.lazy(() => import("../pages/columns/FearGreedIndexPage"));
const BearMarketSurvivalPage = React.lazy(() => import("../pages/columns/BearMarketSurvivalPage"));
const InformationParadoxPage = React.lazy(() => import("../pages/columns/InformationParadoxPage"));
const OverseasInvestorPsychologyPage = React.lazy(() => import("../pages/columns/OverseasInvestorPsychologyPage"));

// 칼럼 페이지 — 레버리지
const UproVsTqqqPage = React.lazy(() => import("../pages/columns/UproVsTqqqPage"));
const VolatilityDecayPage = React.lazy(() => import("../pages/columns/VolatilityDecayPage"));
const HfeaStrategyPage = React.lazy(() => import("../pages/columns/HfeaStrategyPage"));

// 칼럼 페이지 — 거시경제
const AllWeatherPortfolioPage = React.lazy(() => import("../pages/columns/AllWeatherPortfolioPage"));
const DebtCyclePage = React.lazy(() => import("../pages/columns/DebtCyclePage"));
const SectorRotationPage = React.lazy(() => import("../pages/columns/SectorRotationPage"));
const CountryMomentumPage = React.lazy(() => import("../pages/columns/CountryMomentumPage"));
const VixExplainedPage = React.lazy(() => import("../pages/columns/VixExplainedPage"));
const WhySp500Page = React.lazy(() => import("../pages/columns/WhySp500Page"));
const SuperCyclePage = React.lazy(() => import("../pages/columns/SuperCyclePage"));
const CpiStockMarketPage = React.lazy(() => import("../pages/columns/CpiStockMarketPage"));
const InterestRatePage = React.lazy(() => import("../pages/columns/InterestRatePage"));
const QeQtPage = React.lazy(() => import("../pages/columns/QeQtPage"));
const UsEconomyPlayersPage = React.lazy(() => import("../pages/columns/UsEconomyPlayersPage"));
const FedChairsPage = React.lazy(() => import("../pages/columns/FedChairsPage"));
const GiantsPredictionPage = React.lazy(() => import("../pages/columns/GiantsPredictionPage"));
const BearMarketSignalsPage = React.lazy(() => import("../pages/columns/BearMarketSignalsPage"));

// 개발자 페이지
const PasswordGate = React.lazy(() => import("../components/auth/PasswordGate"));
const DevPage = React.lazy(() => import("../pages/DevPage"));
const StockListPage = React.lazy(() => import("../pages/StockListPage"));
const StockDetailPage = React.lazy(() => import("../pages/StockDetailPage"));
const StockOverviewPage = React.lazy(() => import("../pages/StockOverviewPage"));
const BaaQuantPeekPage = React.lazy(() => import("../pages/BaaQuantPeekPage"));
const HaaQuantPeekPage = React.lazy(() => import("../pages/HaaQuantPeekPage"));
const FaberSectorPage = React.lazy(() => import("../pages/FaberSectorPage"));
const AllWeatherPage = React.lazy(() => import("../pages/AllWeatherPage"));
const TrendFollowingPage = React.lazy(() => import("../pages/TrendFollowingPage"));
const QuantHubPage = React.lazy(() => import("../pages/QuantHubPage"));
const DualMomentumPage = React.lazy(() => import("../pages/DualMomentumPage"));
const BusinessCyclePage = React.lazy(() => import("../pages/BusinessCyclePage"));
const QvmPage = React.lazy(() => import("../pages/QvmPage"));

// 칼럼 페이지 — 전략 심화
const BuyHoldVsTrendPage = React.lazy(() => import("../pages/columns/BuyHoldVsTrendPage"));
const DcaVsLumpSumPage = React.lazy(() => import("../pages/columns/DcaVsLumpSumPage"));
const PeterLynchWarningPage = React.lazy(() => import("../pages/columns/PeterLynchWarningPage"));
const MomentumEffectPage = React.lazy(() => import("../pages/columns/MomentumEffectPage"));
const CtaFundsPage = React.lazy(() => import("../pages/columns/CtaFundsPage"));
const DiversificationSciencePage = React.lazy(() => import("../pages/columns/DiversificationSciencePage"));
const RiskAdjustedReturnPage = React.lazy(() => import("../pages/columns/RiskAdjustedReturnPage"));
const IndividualStockMa200Page = React.lazy(() => import("../pages/columns/IndividualStockMa200Page"));
const SectorMomentumPage = React.lazy(() => import("../pages/columns/SectorMomentumPage"));
const AtchuFilterSellCriteriaPage = React.lazy(() => import("../pages/columns/AtchuFilterSellCriteriaPage"));
const WhyMddMattersPage = React.lazy(() => import("../pages/columns/WhyMddMattersPage"));

function BentoLayout({ children }) {
  return <div className="app-content-full">{children}</div>;
}

export default function AppRoutes({ routeModel }) {
  const {
    tickers,
    latestSnapshotPayload,
    snapshotMap,
    getLocalListAnalytics,
    navigate,
    formatSignedPercent,
    latestTrendNotificationPayload,
    indexEtfPageModel,
    indexEtfDetailModel,
    overviewTickers
  } = routeModel;

  return (
    <Suspense fallback={<div className="page-loading" />}>
      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              tickers={tickers}
              latestSnapshotPayload={latestSnapshotPayload}
              snapshotMap={snapshotMap}
              getLocalListAnalytics={getLocalListAnalytics}
              navigate={navigate}
              formatSignedPercent={formatSignedPercent}
              latestTrendNotificationPayload={latestTrendNotificationPayload}
              onTypeSelect={(type) => {
                indexEtfPageModel?.toggleType?.(type);
                navigate("/trend_list");
              }}
            />
          }
        />
        <Route
          path="/trend_list"
          element={<BentoLayout><IndexEtfPage pageTitle="추세 조회" model={indexEtfPageModel} /></BentoLayout>}
        />
        <Route path="/trend_list/:ticker" element={<BentoLayout><IndexEtfDetailPage model={indexEtfDetailModel} /></BentoLayout>} />
        <Route path="/analysis/:ticker" element={<AnalysisRedirect />} />
        <Route path="/guide" element={<TrendGuidePage />} />
        {/* 이전 URL 리다이렉트 */}
        <Route path="/stock_trend" element={<Navigate to="/trend_list" replace />} />
        <Route path="/index_etf" element={<Navigate to="/trend_list" replace />} />
        <Route path="/index_etf/:ticker" element={<AnalysisRedirect />} />
        <Route path="/dalio_cycle_guide" element={<DalioCycleGuidePage />} />
        <Route path="/more" element={<BentoLayout><MorePage /></BentoLayout>} />
        <Route path="/faq" element={<BentoLayout><FaqPage /></BentoLayout>} />

        {/* FAQ */}
        <Route path="/moving_average_faq" element={<MovingAverageFaqPage />} />
        <Route path="/what_is_moving_average" element={<WhatIsMovingAveragePage />} />
        <Route path="/atchu_strategy" element={<AtchuStrategyPage />} />
        <Route path="/moving_average_history" element={<MovingAverageHistoryPage />} />
        <Route path="/holding_conviction" element={<HoldingConvictionPage />} />
        <Route path="/spy_qqq_decline_rotation" element={<SpyQqqDeclineRotationPage />} />
        <Route path="/why_mdd_matters" element={<WhyMddMattersPage />} />
        <Route path="/can_you_handle_mdd" element={<CanYouHandleMddPage />} />

        {/* 칼럼 — 추세 추종 기초 */}
        <Route path="/golden_dead_cross" element={<GoldenDeadCrossPage />} />
        <Route path="/faber_paper" element={<FaberPaperPage />} />

        {/* 칼럼 — 전설적 투자자 */}
        <Route path="/paul_tudor_jones" element={<PaulTudorJonesPage />} />
        <Route path="/stan_weinstein" element={<StanWeinsteinPage />} />
        <Route path="/ed_seykota" element={<EdSeykotaPage />} />
        <Route path="/jesse_livermore" element={<JesseLivermorePage />} />
        <Route path="/turtle_trader" element={<TurtleTraderPage />} />
        <Route path="/marty_schwartz" element={<MartySchwartzPage />} />
        <Route path="/buffett_vs_hedge" element={<BuffettVsHedgePage />} />
        <Route path="/jack_bogle" element={<JackBoglePage />} />
        <Route path="/howard_marks" element={<HowardMarksPage />} />

        {/* 칼럼 — 위기 분석 */}
        <Route path="/crisis_2008" element={<Crisis2008Page />} />
        <Route path="/dotcom_bubble" element={<DotcomBubblePage />} />
        <Route path="/covid_crash" element={<CovidCrashPage />} />
        <Route path="/sp500_drawdowns" element={<Sp500DrawdownsPage />} />
        <Route path="/bad_timing_still_wins" element={<BadTimingStillWinsPage />} />

        {/* 칼럼 — 투자 심리 */}
        <Route path="/crowd_signal" element={<CrowdSignalPage />} />
        <Route path="/dalbar_research" element={<DalbarResearchPage />} />
        <Route path="/loss_aversion" element={<LossAversionPage />} />
        <Route path="/fear_greed_index" element={<FearGreedIndexPage />} />
        <Route path="/bear_market_survival" element={<BearMarketSurvivalPage />} />
        <Route path="/information_paradox" element={<InformationParadoxPage />} />
        <Route path="/overseas_investor_psychology" element={<OverseasInvestorPsychologyPage />} />

        {/* 칼럼 — 레버리지 */}
        <Route path="/leverage_faq" element={<LeverageFaqPage />} />
        <Route path="/upro_vs_tqqq" element={<UproVsTqqqPage />} />
        <Route path="/volatility_decay" element={<VolatilityDecayPage />} />
        <Route path="/hfea_strategy" element={<HfeaStrategyPage />} />

        {/* 칼럼 — 거시경제 */}
        <Route path="/all_weather_portfolio" element={<AllWeatherPortfolioPage />} />
        <Route path="/debt_cycle" element={<DebtCyclePage />} />
        <Route path="/sector_rotation" element={<SectorRotationPage />} />
        <Route path="/country_momentum" element={<CountryMomentumPage />} />
        <Route path="/vix_explained" element={<VixExplainedPage />} />
        <Route path="/why_sp500" element={<WhySp500Page />} />
        <Route path="/super_cycle" element={<SuperCyclePage />} />
        <Route path="/cpi_stock_market" element={<CpiStockMarketPage />} />
        <Route path="/interest_rate" element={<InterestRatePage />} />
        <Route path="/qe_qt" element={<QeQtPage />} />
        <Route path="/us_economy_players" element={<UsEconomyPlayersPage />} />
        <Route path="/fed_chairs" element={<FedChairsPage />} />
        <Route path="/giants_prediction" element={<GiantsPredictionPage />} />
        <Route path="/bear_market_signals" element={<BearMarketSignalsPage />} />

        {/* 칼럼 — 전략 심화 */}
        <Route path="/buy_hold_vs_trend" element={<BuyHoldVsTrendPage />} />
        <Route path="/dca_vs_lump_sum" element={<DcaVsLumpSumPage />} />
        <Route path="/peter_lynch_warning" element={<PeterLynchWarningPage />} />
        <Route path="/momentum_effect" element={<MomentumEffectPage />} />
        <Route path="/cta_funds" element={<CtaFundsPage />} />
        <Route path="/diversification_science" element={<DiversificationSciencePage />} />
        <Route path="/risk_adjusted_return" element={<RiskAdjustedReturnPage />} />
        <Route path="/individual_stock_ma200" element={<IndividualStockMa200Page />} />
<Route path="/sector_momentum" element={<SectorMomentumPage />} />
        <Route path="/atchu_filter_sell_criteria" element={<AtchuFilterSellCriteriaPage />} />

        {/* 개발자 전용 (숨김) */}
        <Route path="/_dev" element={<BentoLayout><PasswordGate><DevPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_trend_list" element={<BentoLayout><PasswordGate><StockListPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_trend_list/:ticker" element={<BentoLayout><PasswordGate><StockDetailPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_market_overview" element={<BentoLayout><PasswordGate><StockOverviewPage /></PasswordGate></BentoLayout>} />
        {/* 이전 개발자 URL 리다이렉트 */}
        <Route path="/_stocks" element={<Navigate to="/_dev_trend_list" replace />} />
        <Route path="/_stocks/:ticker" element={<Navigate to="/_dev_trend_list" replace />} />
        <Route path="/_stocks_overview" element={<Navigate to="/_dev_market_overview" replace />} />
        <Route path="/_dev_quant" element={<BentoLayout><PasswordGate><QuantHubPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/baa-a" element={<BentoLayout><PasswordGate><BaaQuantPeekPage variant="aggressive" /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/baa-b" element={<BentoLayout><PasswordGate><BaaQuantPeekPage variant="balanced" /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/haa" element={<BentoLayout><PasswordGate><HaaQuantPeekPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/faber-sector" element={<BentoLayout><PasswordGate><FaberSectorPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/risk-parity" element={<BentoLayout><PasswordGate><AllWeatherPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/trend-following" element={<BentoLayout><PasswordGate><TrendFollowingPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/dm-gem" element={<BentoLayout><PasswordGate><DualMomentumPage variant="gem" /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/dm-adm" element={<BentoLayout><PasswordGate><DualMomentumPage variant="adm" /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/dm-cdm" element={<BentoLayout><PasswordGate><DualMomentumPage variant="cdm" /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/dm-sector" element={<BentoLayout><PasswordGate><DualMomentumPage variant="sector" /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/business-cycle" element={<BentoLayout><PasswordGate><BusinessCyclePage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/multi-factor" element={<BentoLayout><PasswordGate><QvmPage /></PasswordGate></BentoLayout>} />
        <Route path="/_dev_quant/dual-momentum" element={<Navigate to="/_dev_quant/dm-gem" replace />} />
        <Route path="/_dev_quant/baa" element={<Navigate to="/_dev_quant/baa-a" replace />} />
        {/* 기존 URL 리다이렉트 */}
        <Route path="/_quant" element={<Navigate to="/_dev_quant" replace />} />
        <Route path="/_quant/*" element={<Navigate to="/_dev_quant" replace />} />

        <Route
          path="/market_overview"
          element={
            <BentoLayout>
              <MarketOverviewPage
                latestSnapshotPayload={latestSnapshotPayload}
                overviewTickers={overviewTickers}
                latestTrendNotificationPayload={latestTrendNotificationPayload}
                onTypeSelect={(type) => {
                  indexEtfPageModel?.toggleType?.(type);
                  navigate("/trend_list");
                }}
              />
            </BentoLayout>
          }
        />
        <Route
          path="*"
          element={
            <MainPage
              tickers={tickers}
              latestSnapshotPayload={latestSnapshotPayload}
              snapshotMap={snapshotMap}
              getLocalListAnalytics={getLocalListAnalytics}
              navigate={navigate}
              formatSignedPercent={formatSignedPercent}
              latestTrendNotificationPayload={latestTrendNotificationPayload}
              onTypeSelect={(type) => {
                indexEtfPageModel?.toggleType?.(type);
                navigate("/trend_list");
              }}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}
