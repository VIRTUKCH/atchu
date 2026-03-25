#!/usr/bin/env node
/**
 * 트렌드 팔로잉 (간소화) 전략 신호 생성
 *
 * 9개 자산군 ETF에 앗추 필터(200일 SMA, 20거래일 중 16일)를 적용.
 * 두 가지 비중 방식 동시 백테스트:
 *   - 동일가중 (각 11.1%)
 *   - CAGR가중 (바이앤홀드 CAGR에 비례)
 * 미통과 자산 비중은 BIL(단기 국채)에 투자.
 * 월 1회 리밸런싱. 벤치마크: SPY B&H, 60/40(SPY+AGG).
 *
 * ⚠️ 기관급 트렌드 팔로잉(60개+ 선물, 롱/숏, 레버리지)의 간소화 버전.
 *    숏 불가 → Crisis Alpha 절반 상실. 교육/참고용.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadTickerPool, readMonthEnds, readLatestClose, readDailyPrices,
  round2, round3, parseNumber, getReferenceMonth, calcPeriodReturns,
} from "./lib/quant_utils.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "trend");
const OUT_FILE = path.join(SUMMARY_DIR, "trend_signal.json");

/* ── Universe ── */
const pool = loadTickerPool("cta", ROOT_DIR);
const UNIVERSE = pool.items.filter(i => i.ticker !== "BIL").map(i => ({
  ticker: i.ticker, nameKo: i.name_ko, role: ""
}));
const CASH_TICKER = "BIL"; // 백테스트용 현금 대체 (2007~, SGOV보다 데이터 긺)
const ASSET_COUNT = UNIVERSE.length;
const NAME_KO = pool.nameMap;

/* ── CSV → 일별 종가 (+ SMA 200 계산) ── */
function readDailyWithSma(ticker) {
  const csvPath = path.join(CSV_DIR, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) {
    console.warn(`[WARN] CSV not found: ${csvPath}`);
    return null;
  }

  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 3) return null;

  const headers = lines[0].split(",").map((h) => h.trim());
  const daily = lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      headers.forEach((h, i) => { row[h] = parts[i]; });
      return row;
    })
    .filter((row) => row.Date)
    .map((row) => ({
      date: String(row.Date),
      close: parseNumber(row.Adjusted_close ?? row.Close),
    }))
    .filter((d) => d.close !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  // SMA 200 시리즈 계산 (O(N) sliding window)
  let sum = 0;
  for (let i = 0; i < daily.length; i++) {
    sum += daily[i].close;
    if (i >= 200) sum -= daily[i - 200].close;
    daily[i].sma200 = i >= 199 ? sum / 200 : null;
  }

  return daily;
}

/* ── 앗추 필터 판정 ── */
function calcAtchuFilter(dailyData, targetDate) {
  // targetDate 이전 가장 가까운 거래일 찾기
  let targetIdx = -1;
  for (let i = dailyData.length - 1; i >= 0; i--) {
    if (dailyData[i].date <= targetDate) {
      targetIdx = i;
      break;
    }
  }
  if (targetIdx < 0) return null;
  // 200일 SMA + 20거래일 필요: 최소 인덱스 219
  if (targetIdx < 219) return null;

  // 직전 20거래일에서 종가 > 해당 날의 SMA 200인 날 세기
  let daysAbove = 0;
  for (let i = targetIdx - 19; i <= targetIdx; i++) {
    if (dailyData[i].sma200 !== null && dailyData[i].close > dailyData[i].sma200) {
      daysAbove++;
    }
  }

  return {
    invested: daysAbove >= 16,
    daysAbove,
    sma200: round2(dailyData[targetIdx].sma200),
    close: round2(dailyData[targetIdx].close),
  };
}

/* ── 자산 CAGR 계산 (전체 기간 바이앤홀드) ── */
function calcAssetCagr(dailyData) {
  if (!dailyData || dailyData.length < 2) return null;
  const first = dailyData[0];
  const last = dailyData[dailyData.length - 1];
  const years =
    (new Date(last.date) - new Date(first.date)) / (365.25 * 24 * 3600 * 1000);
  if (years < 0.5) return null;
  return (Math.pow(last.close / first.close, 1 / years) - 1) * 100;
}

/* ── Main ── */
function main() {
  console.log("[TREND] Starting Trend Following signal generation...");

  const refYm = getReferenceMonth();
  console.log(`[TREND] Reference month: ${refYm}`);

  // 1. 일별 데이터 + SMA 200 로드
  const dailyCache = new Map();
  for (const u of UNIVERSE) {
    const daily = readDailyWithSma(u.ticker);
    if (!daily || daily.length < 220) {
      console.warn(`[WARN] Not enough daily data for ${u.ticker}`);
      continue;
    }
    dailyCache.set(u.ticker, daily);
    console.log(`[TREND] ${u.ticker}: ${daily.length} daily records loaded`);
  }

  if (dailyCache.size < ASSET_COUNT) {
    console.warn(`[WARN] Only ${dailyCache.size}/${ASSET_COUNT} assets loaded`);
  }

  // CAGR 가중치 계산
  const cagrData = [];
  for (const u of UNIVERSE) {
    const daily = dailyCache.get(u.ticker);
    const cagr = daily ? calcAssetCagr(daily) : null;
    cagrData.push({ ticker: u.ticker, cagr: cagr ?? 0 });
  }
  const totalCagr = cagrData.reduce((s, d) => s + Math.max(d.cagr, 0), 0);
  const cagrWeights = new Map();
  for (const d of cagrData) {
    cagrWeights.set(d.ticker, totalCagr > 0 ? Math.max(d.cagr, 0) / totalCagr : 1 / ASSET_COUNT);
  }

  console.log("[TREND] CAGR weights:");
  for (const d of cagrData.sort((a, b) => b.cagr - a.cagr)) {
    console.log(`[TREND]   ${d.ticker}: CAGR ${round2(d.cagr)}% → weight ${round2(cagrWeights.get(d.ticker) * 100)}%`);
  }

  // 벤치마크/현금 월말 종가
  const bilMonthEnds = readMonthEnds(CASH_TICKER, CSV_DIR);
  const aggMonthEnds = readMonthEnds("AGG", CSV_DIR);
  const bilMap = new Map(bilMonthEnds?.map((m) => [m.ym, m.close]) || []);
  const aggMap = new Map(aggMonthEnds?.map((m) => [m.ym, m.close]) || []);

  // 자산별 월말 종가도 준비 (수익률 계산용)
  const monthEndCache = new Map();
  for (const u of UNIVERSE) {
    const me = readMonthEnds(u.ticker, CSV_DIR);
    if (me) monthEndCache.set(u.ticker, new Map(me.map((m) => [m.ym, m.close])));
  }

  // SPY 월말 종가 (벤치마크)
  const spyMeMap = monthEndCache.get("SPY");

  // SPY 월말 종가 배열 (SMA 계산용)
  const spyMonthEndsArr = readMonthEnds("SPY", CSV_DIR) || [];

  // Helper: SPY 10-month SMA at a given YM
  const calcSpySma10 = (ym) => {
    const idx = spyMonthEndsArr.findIndex((m) => m.ym === ym);
    if (idx < 9) return null;
    const window = spyMonthEndsArr.slice(idx - 9, idx + 1);
    return window.reduce((s, m) => s + m.close, 0) / 10;
  };

  // 2. 월말 거래일 목록 (SPY 일별 데이터 기준)
  const spyDaily = dailyCache.get("SPY");
  if (!spyDaily) {
    console.error("[ERROR] SPY daily data not available");
    return;
  }

  const monthEndDates = new Map(); // ym → date (SPY 기준 월말 거래일)
  for (const d of spyDaily) {
    const ym = d.date.slice(0, 7);
    monthEndDates.set(ym, d.date); // 마지막으로 덮어쓰면 월말 거래일
  }

  // 3. 기준월 조정
  let effectiveRefYm = refYm;
  if (!monthEndDates.has(effectiveRefYm)) {
    const available = [...monthEndDates.keys()].sort();
    const last = available[available.length - 1];
    if (last < effectiveRefYm) effectiveRefYm = last;
    console.log(`[TREND] Adjusted reference month to ${effectiveRefYm}`);
  }

  // 4. 현재 신호
  const refDate = monthEndDates.get(effectiveRefYm);
  const currentAssets = [];

  for (const u of UNIVERSE) {
    const daily = dailyCache.get(u.ticker);
    if (!daily) {
      currentAssets.push({ ticker: u.ticker, nameKo: u.nameKo, invested: false, daysAbove: 0, sma200: null, close: null });
      continue;
    }
    const filter = calcAtchuFilter(daily, refDate);
    if (!filter) {
      currentAssets.push({ ticker: u.ticker, nameKo: u.nameKo, invested: false, daysAbove: 0, sma200: null, close: null });
      continue;
    }
    currentAssets.push({
      ticker: u.ticker,
      nameKo: u.nameKo,
      role: u.role,
      invested: filter.invested,
      daysAbove: filter.daysAbove,
      sma200: filter.sma200,
      close: filter.close,
    });
  }

  const investedCount = currentAssets.filter((a) => a.invested).length;
  const cashCount = ASSET_COUNT - investedCount;

  // 현재 포트폴리오
  const weight = round2(100 / ASSET_COUNT);
  const portfolio = [];
  let cashWeight = 0;
  for (const a of currentAssets) {
    if (a.invested) {
      portfolio.push({ ticker: a.ticker, nameKo: a.nameKo, weight });
    } else {
      cashWeight += weight;
    }
  }
  if (cashWeight > 0) {
    portfolio.push({ ticker: "SGOV", nameKo: "초단기 국채", weight: round2(cashWeight) });
  }

  // 5. 백테스트
  // 공통 시작: 모든 유니버스 자산이 220일+ 일별 데이터를 가진 첫 월
  const sortedYms = [...monthEndDates.entries()]
    .sort(([a], [b]) => a.localeCompare(b));

  let commonStartYm = null;
  for (const [ym, date] of sortedYms) {
    let allReady = true;
    for (const u of UNIVERSE) {
      const daily = dailyCache.get(u.ticker);
      if (!daily) { allReady = false; break; }
      const filter = calcAtchuFilter(daily, date);
      if (!filter) { allReady = false; break; }
    }
    // BIL 데이터도 필요
    if (allReady && !bilMap.has(ym)) allReady = false;
    if (allReady) { commonStartYm = ym; break; }
  }

  if (!commonStartYm) {
    console.warn("[WARN] Cannot find common start for backtest");
  }

  const backtestYms = commonStartYm
    ? sortedYms
        .filter(([ym]) => ym >= commonStartYm && ym <= effectiveRefYm)
        .map(([ym]) => ym)
    : [];

  console.log(`[TREND] Backtest range: ${commonStartYm} ~ ${effectiveRefYm} (${backtestYms.length} months)`);

  // 월별 기록
  const monthlyRecords = [];

  for (const ym of backtestYms) {
    const date = monthEndDates.get(ym);
    const assets = [];

    for (const u of UNIVERSE) {
      const daily = dailyCache.get(u.ticker);
      if (!daily) continue;
      const filter = calcAtchuFilter(daily, date);
      assets.push({
        ticker: u.ticker,
        invested: filter?.invested ?? false,
        daysAbove: filter?.daysAbove ?? 0,
      });
    }

    const invested = assets.filter((a) => a.invested).length;

    monthlyRecords.push({
      ym,
      date,
      investedCount: invested,
      cashCount: ASSET_COUNT - invested,
      assets,
    });
  }

  // Equity curve (동일가중 + CAGR가중 동시)
  let eqTrend = 1.0;
  let eqTrendCagr = 1.0;
  let eqSpy = 1.0;
  let eqSpyMa = 1.0;
  let eq6040 = 1.0;

  const equityCurve = [];
  const monthlyReturns = { trend: [], trendCagr: [], spy: [], spyMa: [], sixtyForty: [] };

  if (monthlyRecords.length > 0) {
    equityCurve.push({
      date: monthlyRecords[0].ym,
      trend: round3(eqTrend),
      trendCagr: round3(eqTrendCagr),
      spy: round3(eqSpy),
      sixtyForty: round3(eq6040),
    });
  }

  for (let i = 0; i < monthlyRecords.length - 1; i++) {
    const cur = monthlyRecords[i];
    const next = monthlyRecords[i + 1];

    // 동일가중 + CAGR가중 수익률 동시 계산
    let trendRet = 0;
    let trendCagrRet = 0;
    let cashW = 0;
    let cashWCagr = 0;

    for (const a of cur.assets) {
      const meMap = monthEndCache.get(a.ticker);
      if (!meMap) continue;
      const c0 = meMap.get(cur.ym);
      const c1 = meMap.get(next.ym);
      if (!c0 || !c1 || c0 === 0) continue;

      const assetRet = c1 / c0 - 1;
      const equalW = 1 / ASSET_COUNT;
      const cagrW = cagrWeights.get(a.ticker) || equalW;

      if (a.invested) {
        trendRet += equalW * assetRet;
        trendCagrRet += cagrW * assetRet;
      } else {
        cashW += equalW;
        cashWCagr += cagrW;
      }
    }

    // 현금 비중의 BIL 수익률
    const bilC0 = bilMap.get(cur.ym);
    const bilC1 = bilMap.get(next.ym);
    const bilRet = bilC0 && bilC1 && bilC0 > 0 ? bilC1 / bilC0 - 1 : 0;
    if (cashW > 0) trendRet += cashW * bilRet;
    if (cashWCagr > 0) trendCagrRet += cashWCagr * bilRet;

    // SPY B&H
    const spyC0 = spyMeMap?.get(cur.ym);
    const spyC1 = spyMeMap?.get(next.ym);
    const spyRet = spyC0 && spyC1 && spyC0 > 0 ? spyC1 / spyC0 - 1 : 0;

    // SPY + 10-month SMA filter
    const spySma10 = calcSpySma10(cur.ym);
    const spyMaRet = (spySma10 && spyC0 > spySma10) ? spyRet : 0;

    // 60/40
    const aggC0 = aggMap.get(cur.ym);
    const aggC1 = aggMap.get(next.ym);
    const aggRet = aggC0 && aggC1 && aggC0 > 0 ? aggC1 / aggC0 - 1 : 0;
    const sixtyFortyRet = 0.6 * spyRet + 0.4 * aggRet;

    eqTrend *= 1 + trendRet;
    eqTrendCagr *= 1 + trendCagrRet;
    eqSpy *= 1 + spyRet;
    eqSpyMa *= 1 + spyMaRet;
    eq6040 *= 1 + sixtyFortyRet;

    monthlyReturns.trend.push(trendRet);
    monthlyReturns.trendCagr.push(trendCagrRet);
    monthlyReturns.spy.push(spyRet);
    monthlyReturns.spyMa.push(spyMaRet);
    monthlyReturns.sixtyForty.push(sixtyFortyRet);

    equityCurve.push({
      date: next.ym,
      trend: round3(eqTrend),
      trendCagr: round3(eqTrendCagr),
      spy: round3(eqSpy),
      sixtyForty: round3(eq6040),
    });
  }

  /* ── 부분월(오늘) 포인트 ── */
  const latestSpy = readLatestClose("SPY", CSV_DIR);
  if (latestSpy && equityCurve.length > 0 && monthlyRecords.length > 0) {
    const lastEq = equityCurve[equityCurve.length - 1];
    const lastRecord = monthlyRecords[monthlyRecords.length - 1];
    if (latestSpy.date > lastRecord.date) {
      // 동일가중 + CAGR가중 수익률 동시 계산
      let partialRet = 0;
      let partialRetCagr = 0;
      let cashW = 0;
      let cashWCagr = 0;

      for (const a of lastRecord.assets) {
        const meMap = monthEndCache.get(a.ticker);
        if (!meMap) continue;
        const c0 = meMap.get(lastRecord.ym);
        const latest = readLatestClose(a.ticker, CSV_DIR);
        if (!c0 || !latest || c0 === 0) continue;

        const assetRet = latest.close / c0 - 1;
        const equalW = 1 / ASSET_COUNT;
        const cagrW = cagrWeights.get(a.ticker) || equalW;

        if (a.invested) {
          partialRet += equalW * assetRet;
          partialRetCagr += cagrW * assetRet;
        } else {
          cashW += equalW;
          cashWCagr += cagrW;
        }
      }

      // 현금 비중의 BIL 수익률
      const bilRef = bilMap.get(lastRecord.ym);
      const bilLatest = readLatestClose(CASH_TICKER, CSV_DIR);
      const bilPartialRet = bilRef && bilLatest && bilRef > 0 ? bilLatest.close / bilRef - 1 : 0;
      if (cashW > 0) partialRet += cashW * bilPartialRet;
      if (cashWCagr > 0) partialRetCagr += cashWCagr * bilPartialRet;

      // SPY B&H
      const spyRef = spyMeMap?.get(lastRecord.ym);
      const spyPartial = (spyRef && spyRef > 0) ? (latestSpy.close / spyRef - 1) : 0;

      // 60/40
      const aggRef = aggMap.get(lastRecord.ym);
      const aggLatest = readLatestClose("AGG", CSV_DIR);
      const aggPartial = aggRef && aggLatest && aggRef > 0 ? aggLatest.close / aggRef - 1 : 0;
      const sixtyFortyPartial = 0.6 * spyPartial + 0.4 * aggPartial;

      equityCurve.push({
        date: latestSpy.date,
        trend: round3(lastEq.trend * (1 + partialRet)),
        trendCagr: round3(lastEq.trendCagr * (1 + partialRetCagr)),
        spy: round3(lastEq.spy * (1 + spyPartial)),
        sixtyForty: round3(lastEq.sixtyForty * (1 + sixtyFortyPartial)),
      });
    }
  }

  // 성과 지표
  const calcMetrics = (returns, finalEquity) => {
    const n = returns.length;
    if (n === 0) return { cagr: null, mdd: null, sharpe: null };

    const cagr = (Math.pow(finalEquity, 12 / n) - 1) * 100;

    let peak = 1.0;
    let maxDD = 0;
    let eq = 1.0;
    for (const r of returns) {
      eq *= 1 + r;
      if (eq > peak) peak = eq;
      const dd = (eq - peak) / peak;
      if (dd < maxDD) maxDD = dd;
    }
    const mdd = maxDD * 100;

    const mean = returns.reduce((s, r) => s + r, 0) / n;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    const sharpe = std > 0 ? (mean / std) * Math.sqrt(12) : null;

    const downsideSq = returns.reduce((s, r) => s + Math.min(r, 0) ** 2, 0);
    const downsideDev = Math.sqrt(downsideSq / n);
    const sortino = downsideDev > 0 ? (mean / downsideDev) * Math.sqrt(12) : null;

    return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe), sortino: round3(sortino) };
  };

  const trendMetrics = calcMetrics(monthlyReturns.trend, eqTrend);
  const trendCagrMetrics = calcMetrics(monthlyReturns.trendCagr, eqTrendCagr);
  const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
  const spyMaMetrics = calcMetrics(monthlyReturns.spyMa, eqSpyMa);
  const sixtyFortyMetrics = calcMetrics(monthlyReturns.sixtyForty, eq6040);

  const totalMonths = monthlyRecords.length;
  const cashMonths = monthlyRecords.filter((r) => r.cashCount === ASSET_COUNT).length;
  const avgInvested = totalMonths > 0
    ? round2(monthlyRecords.reduce((s, r) => s + r.investedCount, 0) / totalMonths)
    : 0;

  // 히스토리 (최근 36개월)
  const history = monthlyRecords.slice(-36).map((r) => ({
    date: r.date,
    ym: r.ym,
    investedCount: r.investedCount,
    assets: r.assets.map((a) => ({
      ticker: a.ticker,
      invested: a.invested,
      daysAbove: a.daysAbove,
    })),
  }));

  // 6. periodReturns 계산
  const lastRecord = monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1] : null;
  const lastRebalDate = lastRecord ? lastRecord.date : null;

  // 동일가중 현재 배분 (invested → equalW, cash → BIL)
  const trendAlloc = [];
  if (lastRecord) {
    const equalW = 1 / ASSET_COUNT;
    let cashWTotal = 0;
    for (const a of lastRecord.assets) {
      if (a.invested) {
        trendAlloc.push({ ticker: a.ticker, weight: equalW });
      } else {
        cashWTotal += equalW;
      }
    }
    if (cashWTotal > 0) trendAlloc.push({ ticker: CASH_TICKER, weight: cashWTotal });
  }

  // CAGR가중 현재 배분
  const trendCagrAlloc = [];
  if (lastRecord) {
    let cashWTotal = 0;
    for (const a of lastRecord.assets) {
      const cagrW = cagrWeights.get(a.ticker) || (1 / ASSET_COUNT);
      if (a.invested) {
        trendCagrAlloc.push({ ticker: a.ticker, weight: cagrW });
      } else {
        cashWTotal += cagrW;
      }
    }
    if (cashWTotal > 0) trendCagrAlloc.push({ ticker: CASH_TICKER, weight: cashWTotal });
  }

  const periodReturnsTrend = equityCurve.length > 1 && lastRebalDate
    ? calcPeriodReturns(equityCurve, "trend", trendAlloc, CSV_DIR, lastRebalDate)
    : { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };

  const periodReturnsTrendCagr = equityCurve.length > 1 && lastRebalDate
    ? calcPeriodReturns(equityCurve, "trendCagr", trendCagrAlloc, CSV_DIR, lastRebalDate)
    : { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };

  // SPY 벤치마크 periodReturns
  const spyAlloc = [{ ticker: "SPY", weight: 1 }];
  const periodReturnsSpy = equityCurve.length > 1 && lastRebalDate
    ? calcPeriodReturns(equityCurve, "spy", spyAlloc, CSV_DIR, lastRebalDate)
    : { "1M": null, "3M": null, "6M": null, "1Y": null, "3Y": null, "5Y": null };

  // 7. 출력
  const cagrWeightsArr = UNIVERSE.map((u) => ({
    ticker: u.ticker,
    nameKo: u.nameKo,
    cagr: round2(cagrData.find((d) => d.ticker === u.ticker)?.cagr ?? 0),
    equalWeight: round2(100 / ASSET_COUNT),
    cagrWeight: round2((cagrWeights.get(u.ticker) || 0) * 100),
  })).sort((a, b) => b.cagr - a.cagr);

  const output = {
    generatedAt: new Date().toISOString(),
    strategy: {
      name: "CTA (간소화)",
      type: "다자산 SMA 필터 — 동일가중 + CAGR가중 비교",
      signal: "앗추 필터 (200일선, 20거래일 중 16일)",
      rebalancing: "월 1회",
      cashAsset: "SGOV",
      backtestCashAsset: "BIL",
    },
    universe: UNIVERSE.map((u) => ({
      ticker: u.ticker,
      nameKo: u.nameKo,
      weight: round2(100 / ASSET_COUNT),
      role: u.role,
    })),
    cagrWeights: cagrWeightsArr,
    signal: {
      rebalanceDate: refDate,
      investedCount,
      cashCount,
      assets: currentAssets,
    },
    portfolio,
    periodReturns: {
      trend: periodReturnsTrend,
      trendCagr: periodReturnsTrendCagr,
      spy: periodReturnsSpy,
    },
  };

  if (monthlyRecords.length > 1) {
    output.backtest = {
      startDate: monthlyRecords[0].date,
      endDate: monthlyRecords[monthlyRecords.length - 1].date,
      trend: trendMetrics,
      trendCagr: trendCagrMetrics,
      spy: spyMetrics,
      spyMa: spyMaMetrics,
      sixtyForty: sixtyFortyMetrics,
      allCashMonths: cashMonths,
      avgInvestedAssets: avgInvested,
      equityCurve,
    };
    output.history = history;
  }

  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));

  console.log(`[TREND] Signal written → ${OUT_FILE}`);
  console.log(`[TREND] Current: ${investedCount}/${ASSET_COUNT} invested, ${cashCount} in SGOV`);
  console.log(`[TREND] Invested: ${currentAssets.filter((a) => a.invested).map((a) => a.ticker).join(", ") || "none"}`);
  if (monthlyRecords.length > 1) {
    console.log(`[TREND] Backtest: ${monthlyRecords[0].date} → ${monthlyRecords[monthlyRecords.length - 1].date} (${monthlyRecords.length} months)`);
    console.log(`[TREND] Equal  CAGR: ${trendMetrics.cagr}%  MDD: ${trendMetrics.mdd}%  Sharpe: ${trendMetrics.sharpe}`);
    console.log(`[TREND] CAGR-W CAGR: ${trendCagrMetrics.cagr}%  MDD: ${trendCagrMetrics.mdd}%  Sharpe: ${trendCagrMetrics.sharpe}`);
    console.log(`[TREND] SPY    CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%`);
    console.log(`[TREND] 60/40  CAGR: ${sixtyFortyMetrics.cagr}%  MDD: ${sixtyFortyMetrics.mdd}%`);
    console.log(`[TREND] Avg invested assets: ${avgInvested}/${ASSET_COUNT}`);
  }
}

main();
