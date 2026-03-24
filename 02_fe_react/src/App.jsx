import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppTopNav from "./components/layout/AppTopNav";
import AppDiscordBanner from "./components/layout/AppDiscordBanner";
import AppFooter from "./components/layout/AppFooter";
import AppRoutes from "./routes/AppRoutes";
import {
  formatPercent,
  formatPrice,
  formatSignedPercent,
  formatTrendSuitabilityLabel
} from "./utils/format";
import {
  isStaleCloseByUsMarketDate
} from "./utils/marketDate";
import {
  csvModules,
  tickerModules,
  latestSnapshotPayload,
  latestTrendNotificationPayload
} from "./utils/dataLoaders";
import { typeLabels } from "./config/typeLabels";
import useTickerSnapshotData from "./hooks/useTickerSnapshotData";
import useIndexEtfControls from "./hooks/useIndexEtfControls";
import usePageModels from "./hooks/usePageModels";
import useRouteModel from "./hooks/useRouteModel";
import {
  buildLocalTickers,
  buildMockTickers
} from "./utils/tickerMeta";
import { createAppDataAdapters } from "./utils/appDataAdapters";
const API_ENABLED = false;
const {
  loadLocalDetailAnalytics,
  getLocalListAnalytics,
  getLocalSnapshot,
  toRecentShape
} = createAppDataAdapters({
  latestSnapshotPayload,
  csvModules
});

const localTickers = buildLocalTickers(tickerModules);
const mockTickers = buildMockTickers(localTickers);
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedType,
    toggleType,
    sortMode,
    setSortMode
  } = useIndexEtfControls();
  const { tickers, tickersLoading, tickersError, snapshotMap } = useTickerSnapshotData({
    apiEnabled: API_ENABLED,
    mockTickers,
    getLocalSnapshot
  });

  useEffect(() => {
    if (location.pathname === "/trend_list" && location.search) {
      navigate("/trend_list", { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  const {
    indexEtfPageModel,
    indexEtfDetailModel,
  } = usePageModels({
    tickers,
    tickersLoading,
    tickersError,
    snapshotMap,
    selectedType,
    toggleType,
    sortMode,
    setSortMode,
    navigate,
    API_ENABLED,
    getLocalSnapshot,
    loadLocalDetailAnalytics,
    toRecentShape,
    getLocalListAnalytics,
    isStaleCloseByUsMarketDate,
    typeLabels,
    formatTrendSuitabilityLabel,
    formatPrice,
    formatPercent,
    formatSignedPercent,
    latestSnapshotPayload,
    overviewTickers: mockTickers,
  });
  const routeModel = useRouteModel({
    tickers,
    latestSnapshotPayload,
    snapshotMap,
    getLocalListAnalytics,
    navigate,
    formatSignedPercent,
    indexEtfPageModel,
    indexEtfDetailModel,
    latestTrendNotificationPayload,
    overviewTickers: mockTickers
  });

  const isLanding = location.pathname === "/";
  return (
    <div className={`page${isLanding ? " page--landing" : ""}`}>
      <AppTopNav />
      <main>
        <AppRoutes routeModel={routeModel} />
      </main>
      <AppDiscordBanner />
      <AppFooter />
    </div>
  );
}
