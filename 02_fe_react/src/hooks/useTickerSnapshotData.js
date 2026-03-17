import { useEffect, useState } from "react";

export default function useTickerSnapshotData({
  apiEnabled,
  mockTickers,
  getLocalSnapshot
}) {
  const [tickers, setTickers] = useState([]);
  const [tickersLoading, setTickersLoading] = useState(false);
  const [tickersError, setTickersError] = useState(null);
  const [snapshotMap, setSnapshotMap] = useState({});

  useEffect(() => {
    const fetchTickers = async () => {
      setTickersLoading(true);
      setTickersError(null);
      if (!apiEnabled) {
        setTickers(mockTickers);
        setTickersError(null);
        setTickersLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/v1/tickers");
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.message || "failed to fetch tickers");
        }
        setTickers(Array.isArray(body?.data) ? body.data : []);
      } catch (error) {
        setTickers([]);
        setTickersError(String(error));
      } finally {
        setTickersLoading(false);
      }
    };

    fetchTickers();
  }, [apiEnabled, mockTickers]);

  useEffect(() => {
    const fetchSnapshots = async () => {
      if (!apiEnabled) {
        const entries = tickers
          .filter((item) => item?.ticker)
          .map((item) => [item.ticker.toUpperCase(), getLocalSnapshot(item.ticker)]);
        setSnapshotMap(Object.fromEntries(entries));
        return;
      }
      if (!tickers.length) {
        setSnapshotMap({});
        return;
      }
      const entries = await Promise.all(
        tickers
          .filter((item) => item?.id && item?.ticker)
          .map(async (item) => {
            try {
              const res = await fetch(`/api/v1/tickers/${item.id}/snapshots/latest`);
              const body = await res.json();
              return [item.ticker.toUpperCase(), body?.data || null];
            } catch (error) {
              return [item.ticker.toUpperCase(), null];
            }
          })
      );
      setSnapshotMap(Object.fromEntries(entries));
    };

    fetchSnapshots();
  }, [apiEnabled, tickers, getLocalSnapshot]);

  return {
    tickers,
    tickersLoading,
    tickersError,
    snapshotMap
  };
}
