#!/usr/bin/env node
/**
 * 트렌드 팔로잉 (간소화) 전략 신호 생성
 *
 * 9개 자산군 ETF에 앗추 필터(200일 SMA, 20거래일 중 16일)를 적용.
 * 필터 통과 자산은 동일 비중(11.1%) 투자, 미통과 자산 비중은 BIL(단기 국채)에 투자.
 * 월 1회 리밸런싱. 벤치마크: SPY B&H, 60/40(SPY+AGG).
 *
 * ⚠️ 기관급 트렌드 팔로잉(60개+ 선물, 롱/숏, 레버리지)의 간소화 버전.
 *    숏 불가 → Crisis Alpha 절반 상실. 교육/참고용.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "trend");
const OUT_FILE = path.join(SUMMARY_DIR, "trend_signal.json");

/* ── Universe ── */
const UNIVERSE = [
  { ticker: "SPY", nameKo: "미국 주식", role: "성장 추세" },
  { ticker: "TLT", nameKo: "장기 국채", role: "금리 추세" },
  { ticker: "IEF", nameKo: "중기 국채", role: "안정성" },
  { ticker: "GLD", nameKo: "금", role: "인플레/불확실성" },
  { ticker: "DBC", nameKo: "원자재", role: "인플레/공급 충격" },
  { ticker: "EFA", nameKo: "선진국 주식", role: "글로벌 추세" },
  { ticker: "EEM", nameKo: "이머징 주식", role: "이머징 추세" },
  { ticker: "TIP", nameKo: "물가연동채", role: "인플레 방어" },
  { ticker: "VNQ", nameKo: "부동산", role: "실물자산 추세" },
];
const CASH_TICKER = "BIL"; // 백테스트용 현금 대체 (2007~, SGOV보다 데이터 긺)
const ASSET_COUNT = UNIVERSE.length;

/* ── Helpers ── */
const round2 = (v) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : Math.round(v * 100) / 100;
const round3 = (v) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : Math.round(v * 1000) / 1000;
const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

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

/* ── CSV → 월말 종가 (벤치마크/현금 수익률용) ── */
function readMonthEnds(ticker) {
  const csvPath = path.join(CSV_DIR, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) return null;

  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 3) return null;

  const headers = lines[0].split(",").map((h) => h.trim());
  const records = lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      headers.forEach((h, i) => { row[h] = parts[i]; });
      return row;
    })
    .filter((row) => row.Date)
    .sort((a, b) => String(a.Date).localeCompare(String(b.Date)));

  const monthMap = new Map();
  for (const row of records) {
    const date = String(row.Date);
    const ym = date.slice(0, 7);
    const close = parseNumber(row.Adjusted_close ?? row.Close);
    if (close === null) continue;
    monthMap.set(ym, { date, close });
  }

  return [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, data]) => ({ ym, date: data.date, close: data.close }));
}

/* ── 기준월 (전월) ── */
function getReferenceMonth() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
  const year = lastDayPrevMonth.getFullYear();
  const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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

  // 벤치마크/현금 월말 종가
  const bilMonthEnds = readMonthEnds(CASH_TICKER);
  const aggMonthEnds = readMonthEnds("AGG");
  const bilMap = new Map(bilMonthEnds?.map((m) => [m.ym, m.close]) || []);
  const aggMap = new Map(aggMonthEnds?.map((m) => [m.ym, m.close]) || []);

  // 자산별 월말 종가도 준비 (수익률 계산용)
  const monthEndCache = new Map();
  for (const u of UNIVERSE) {
    const me = readMonthEnds(u.ticker);
    if (me) monthEndCache.set(u.ticker, new Map(me.map((m) => [m.ym, m.close])));
  }

  // SPY 월말 종가 (벤치마크)
  const spyMeMap = monthEndCache.get("SPY");

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

  // Equity curve
  let eqTrend = 1.0;
  let eqSpy = 1.0;
  let eq6040 = 1.0;

  const equityCurve = [];
  const monthlyReturns = { trend: [], spy: [], sixtyForty: [] };

  if (monthlyRecords.length > 0) {
    equityCurve.push({
      date: monthlyRecords[0].ym,
      trend: round3(eqTrend),
      spy: round3(eqSpy),
      sixtyForty: round3(eq6040),
    });
  }

  for (let i = 0; i < monthlyRecords.length - 1; i++) {
    const cur = monthlyRecords[i];
    const next = monthlyRecords[i + 1];

    // 트렌드 팔로잉 포트폴리오 수익률
    let trendRet = 0;
    let investedW = 0;
    let cashW = 0;

    for (const a of cur.assets) {
      const meMap = monthEndCache.get(a.ticker);
      if (!meMap) continue;
      const c0 = meMap.get(cur.ym);
      const c1 = meMap.get(next.ym);
      if (!c0 || !c1 || c0 === 0) continue;

      const assetRet = c1 / c0 - 1;
      if (a.invested) {
        trendRet += (1 / ASSET_COUNT) * assetRet;
        investedW += 1 / ASSET_COUNT;
      } else {
        cashW += 1 / ASSET_COUNT;
      }
    }

    // 현금 비중의 BIL 수익률
    if (cashW > 0) {
      const bilC0 = bilMap.get(cur.ym);
      const bilC1 = bilMap.get(next.ym);
      if (bilC0 && bilC1 && bilC0 > 0) {
        trendRet += cashW * (bilC1 / bilC0 - 1);
      }
    }

    // SPY B&H
    const spyC0 = spyMeMap?.get(cur.ym);
    const spyC1 = spyMeMap?.get(next.ym);
    const spyRet = spyC0 && spyC1 && spyC0 > 0 ? spyC1 / spyC0 - 1 : 0;

    // 60/40
    const aggC0 = aggMap.get(cur.ym);
    const aggC1 = aggMap.get(next.ym);
    const aggRet = aggC0 && aggC1 && aggC0 > 0 ? aggC1 / aggC0 - 1 : 0;
    const sixtyFortyRet = 0.6 * spyRet + 0.4 * aggRet;

    eqTrend *= 1 + trendRet;
    eqSpy *= 1 + spyRet;
    eq6040 *= 1 + sixtyFortyRet;

    monthlyReturns.trend.push(trendRet);
    monthlyReturns.spy.push(spyRet);
    monthlyReturns.sixtyForty.push(sixtyFortyRet);

    equityCurve.push({
      date: next.ym,
      trend: round3(eqTrend),
      spy: round3(eqSpy),
      sixtyForty: round3(eq6040),
    });
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

    return { cagr: round2(cagr), mdd: round2(mdd), sharpe: round3(sharpe) };
  };

  const trendMetrics = calcMetrics(monthlyReturns.trend, eqTrend);
  const spyMetrics = calcMetrics(monthlyReturns.spy, eqSpy);
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

  // 6. 출력
  const output = {
    generatedAt: new Date().toISOString(),
    strategy: {
      name: "트렌드 팔로잉 (간소화)",
      type: "다자산 SMA 필터 + 동일 비중",
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
    signal: {
      rebalanceDate: refDate,
      investedCount,
      cashCount,
      assets: currentAssets,
    },
    portfolio,
  };

  if (monthlyRecords.length > 1) {
    output.backtest = {
      startDate: monthlyRecords[0].date,
      endDate: monthlyRecords[monthlyRecords.length - 1].date,
      trend: trendMetrics,
      spy: spyMetrics,
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
    console.log(`[TREND] Trend CAGR: ${trendMetrics.cagr}%  MDD: ${trendMetrics.mdd}%  Sharpe: ${trendMetrics.sharpe}`);
    console.log(`[TREND] SPY   CAGR: ${spyMetrics.cagr}%  MDD: ${spyMetrics.mdd}%`);
    console.log(`[TREND] 60/40 CAGR: ${sixtyFortyMetrics.cagr}%  MDD: ${sixtyFortyMetrics.mdd}%`);
    console.log(`[TREND] Avg invested assets: ${avgInvested}/${ASSET_COUNT}`);
  }
}

main();
