#!/usr/bin/env node
/**
 * 듀얼 모멘텀 4변형 시그널 생성
 *
 * GEM  — Global Equities Momentum (Gary Antonacci 원조)
 * ADM  — Accelerating Dual Momentum (1M+3M+6M 가속 모멘텀)
 * CDM  — Composite Dual Momentum (4모듈 분산)
 * Sector — 미국 10개 섹터 듀얼 모멘텀
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "dm");
const OUT_FILE = path.join(SUMMARY_DIR, "dm_signal.json");

/* ═══════════════════════════════════════════════════════
   Universes
   ═══════════════════════════════════════════════════════ */

const GEM = { offensive: ["SPY", "EFA"], defensive: "AGG", benchmark: "BIL" };
const ADM = { offensive: ["SPY", "EFA"], defensive: "TLT", benchmark: "BIL" };
const CDM_MODULES = [
  { name: "주식", candidates: ["SPY", "EFA"] },
  { name: "크레딧", candidates: ["LQD", "HYG"] },
  { name: "부동산", candidates: ["VNQ"] },
  { name: "스트레스", candidates: ["GLD", "TLT"] },
];
const SECTORS = ["XLB", "XLC", "XLE", "XLF", "XLI", "XLK", "XLP", "XLU", "XLV", "XLY"];

const ALL_TICKERS = [...new Set([
  ...GEM.offensive, GEM.defensive, GEM.benchmark,
  ...ADM.offensive, ADM.defensive, ADM.benchmark,
  ...CDM_MODULES.flatMap((m) => m.candidates), "BIL",
  ...SECTORS,
  "SPY", "AGG", // 벤치마크용
])];

const NAME_KO = {
  SPY: "S&P 500", EFA: "선진국 (EAFE)", AGG: "미국 종합채권",
  BIL: "초단기 국채", TLT: "장기 국채", GLD: "금",
  VNQ: "미국 부동산", LQD: "투자등급 회사채", HYG: "하이일드 채권",
  XLB: "소재", XLC: "커뮤니케이션", XLE: "에너지",
  XLF: "금융", XLI: "산업재", XLK: "기술",
  XLP: "필수소비재", XLU: "유틸리티", XLV: "헬스케어", XLY: "임의소비재",
};

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

const round2 = (v) =>
  v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 100) / 100;
const round3 = (v) =>
  v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 1000) / 1000;
const parseNumber = (v) => {
  const p = Number(v);
  return Number.isFinite(p) ? p : null;
};

/* ═══════════════════════════════════════════════════════
   Step 1 — CSV → month-end adjusted close
   ═══════════════════════════════════════════════════════ */

const readMonthEnds = (ticker) => {
  const csvPath = path.join(CSV_DIR, `${ticker}.US_all.csv`);
  if (!fs.existsSync(csvPath)) {
    console.warn(`[WARN] CSV not found: ${csvPath}`);
    return null;
  }
  const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");
  if (lines.length < 3) {
    console.warn(`[WARN] CSV too short: ${ticker}`);
    return null;
  }
  const headers = lines[0].split(",").map((h) => h.trim());
  const records = lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      const row = {};
      headers.forEach((h, i) => { row[h] = parts[i]; });
      return row;
    })
    .filter((r) => r.Date)
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
    .map(([ym, d]) => ({ ym, date: d.date, close: d.close }));
};

/* ═══════════════════════════════════════════════════════
   Step 2 — Reference month (직전 월말)
   ═══════════════════════════════════════════════════════ */

const getReferenceMonth = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(first.getTime() - 1);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}`;
};

/* ═══════════════════════════════════════════════════════
   Momentum calculators
   ═══════════════════════════════════════════════════════ */

/** N개월 수익률 (%) */
const calcNmReturn = (monthEnds, refYm, n) => {
  if (!monthEnds) return null;
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 0 || idx < n) return null;
  const p0 = monthEnds[idx].close;
  const pN = monthEnds[idx - n].close;
  if (!p0 || !pN || pN === 0) return null;
  return (p0 / pN - 1) * 100;
};

/** 12개월 수익률 (GEM, CDM, 섹터용) */
const calc12mReturn = (monthEnds, refYm) => calcNmReturn(monthEnds, refYm, 12);

/** 가속 모멘텀 점수 (ADM): 1M + 3M + 6M 합산 */
const calcAcceleratingScore = (monthEnds, refYm) => {
  const r1 = calcNmReturn(monthEnds, refYm, 1);
  const r3 = calcNmReturn(monthEnds, refYm, 3);
  const r6 = calcNmReturn(monthEnds, refYm, 6);
  if (r1 === null || r3 === null || r6 === null) return null;
  return round2(r1 + r3 + r6);
};

/* ═══════════════════════════════════════════════════════
   Data loading
   ═══════════════════════════════════════════════════════ */

const refYm = getReferenceMonth();
console.log(`Reference month: ${refYm}`);

const tickerData = new Map();
for (const ticker of ALL_TICKERS) {
  const monthEnds = readMonthEnds(ticker);
  if (!monthEnds || monthEnds.length < 7) {
    console.warn(`[WARN] Insufficient data for ${ticker}`);
    continue;
  }
  tickerData.set(ticker, monthEnds);
}
console.log(`Loaded ${tickerData.size}/${ALL_TICKERS.length} tickers`);

// 기준월 조정 (일부 티커가 기준월 데이터 없을 수 있음)
let effectiveRefYm = refYm;
const allLatestYms = [...tickerData.values()].map((me) => me[me.length - 1].ym).sort();
if (allLatestYms.length > 0 && allLatestYms[0] < effectiveRefYm) {
  effectiveRefYm = allLatestYms[0];
  console.log(`Adjusted reference month to ${effectiveRefYm}`);
}

const getClose = (ticker, ym) =>
  tickerData.get(ticker)?.find((m) => m.ym === ym)?.close ?? null;
const getDate = (ym) =>
  (tickerData.get("SPY") || [...tickerData.values()][0])?.find((m) => m.ym === ym)?.date ??
  `${ym}-28`;
const rebalanceDate = getDate(effectiveRefYm);

/* ═══════════════════════════════════════════════════════
   Per-variant signal calculators
   ═══════════════════════════════════════════════════════ */

/** GEM: SPY vs EFA (12M) → 승자 vs BIL → AGG 대피 */
const calcGemForMonth = (ym) => {
  const spyRet = calc12mReturn(tickerData.get("SPY"), ym);
  const efaRet = calc12mReturn(tickerData.get("EFA"), ym);
  const bilRet = calc12mReturn(tickerData.get("BIL"), ym);
  if (spyRet === null || efaRet === null || bilRet === null) return null;

  const winner = spyRet >= efaRet ? "SPY" : "EFA";
  const winnerRet = winner === "SPY" ? spyRet : efaRet;
  const invested = winnerRet > bilRet;

  return {
    mode: invested ? "invested" : "defensive",
    allocations: invested
      ? [{ ticker: winner, weight: 100 }]
      : [{ ticker: "AGG", weight: 100 }],
  };
};

/** ADM: 가속 점수(1M+3M+6M) → 둘 다 음수면 TLT */
const calcAdmForMonth = (ym) => {
  const spyScore = calcAcceleratingScore(tickerData.get("SPY"), ym);
  const efaScore = calcAcceleratingScore(tickerData.get("EFA"), ym);
  if (spyScore === null || efaScore === null) return null;

  if (spyScore < 0 && efaScore < 0) {
    return { mode: "defensive", allocations: [{ ticker: "TLT", weight: 100 }] };
  }
  const winner = spyScore >= efaScore ? "SPY" : "EFA";
  return { mode: "invested", allocations: [{ ticker: winner, weight: 100 }] };
};

/** CDM: 4모듈 × 25%, 각 모듈 독립 판단 */
const calcCdmForMonth = (ym) => {
  const bilRet = calc12mReturn(tickerData.get("BIL"), ym);
  if (bilRet === null) return null;

  const moduleResults = [];
  const allocations = [];

  for (const mod of CDM_MODULES) {
    const candidateReturns = mod.candidates
      .filter((t) => tickerData.has(t))
      .map((t) => ({ ticker: t, return12m: calc12mReturn(tickerData.get(t), ym) }))
      .filter((c) => c.return12m !== null);

    if (candidateReturns.length === 0) continue;
    candidateReturns.sort((a, b) => b.return12m - a.return12m);
    const winner = candidateReturns[0];
    const result = winner.return12m > bilRet ? winner.ticker : "BIL";

    moduleResults.push({
      name: mod.name,
      candidates: mod.candidates,
      winner: winner.ticker,
      winnerReturn12m: round2(winner.return12m),
      bilReturn12m: round2(bilRet),
      result,
      weight: 25,
    });
    allocations.push({ ticker: result, weight: 25 });
  }

  const allBil = allocations.every((a) => a.ticker === "BIL");
  return { mode: allBil ? "defensive" : "invested", allocations, modules: moduleResults };
};

/** 섹터 DM: 12M 상위 4섹터 → 각 T-Bill 필터 */
const calcSectorDmForMonth = (ym) => {
  const bilRet = calc12mReturn(tickerData.get("BIL"), ym);
  if (bilRet === null) return null;

  const sectorReturns = SECTORS.filter((t) => tickerData.has(t))
    .map((t) => ({ ticker: t, return12m: calc12mReturn(tickerData.get(t), ym) }))
    .filter((c) => c.return12m !== null);

  if (sectorReturns.length < 4) return null;
  sectorReturns.sort((a, b) => b.return12m - a.return12m);

  const top4 = sectorReturns.slice(0, 4);
  const allocations = top4.map((s) => ({
    ticker: s.return12m > bilRet ? s.ticker : "BIL",
    weight: 25,
  }));
  const allBil = allocations.every((a) => a.ticker === "BIL");
  return { mode: allBil ? "defensive" : "invested", allocations };
};

/* ═══════════════════════════════════════════════════════
   Backtest infrastructure
   ═══════════════════════════════════════════════════════ */

const calcMetrics = (returns, finalEquity) => {
  const n = returns.length;
  if (n === 0) return { cagr: null, mdd: null, sharpe: null, maxAnnualLoss: null };
  const cagr = (Math.pow(finalEquity, 12 / n) - 1) * 100;
  let peak = 1.0, maxDD = 0, eq = 1.0;
  for (const r of returns) {
    eq *= 1 + r;
    if (eq > peak) peak = eq;
    const dd = (eq - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  const mean = returns.reduce((s, r) => s + r, 0) / n;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(12) : null;
  return { cagr: round2(cagr), mdd: round2(maxDD * 100), sharpe: round3(sharpe) };
};

const calcMaxAnnualLoss = (yearMap) => {
  let worst = 0;
  for (const [, cum] of yearMap) {
    const ret = (cum - 1) * 100;
    if (ret < worst) worst = ret;
  }
  return round2(worst);
};

/** 공통 백테스트 함수 — (변형 키, 필요 티커, 배분 함수) → { backtest, history } */
const runBacktest = (variantKey, variantTickers, allocFn) => {
  // 1) 공통 시작점 (모든 티커가 12개월 이상 데이터를 가진 첫 월)
  const requiredTickers = [...new Set([...variantTickers, "SPY", "AGG"])].filter((t) =>
    tickerData.has(t)
  );
  const allYms = new Set();
  for (const t of requiredTickers) {
    for (const m of tickerData.get(t)) allYms.add(m.ym);
  }
  const sortedYms = [...allYms].sort();

  let commonStartYm = null;
  for (const ym of sortedYms) {
    let ok = true;
    for (const t of requiredTickers) {
      const me = tickerData.get(t);
      const idx = me.findIndex((m) => m.ym === ym);
      if (idx < 12) { ok = false; break; }
    }
    if (ok) { commonStartYm = ym; break; }
  }

  if (!commonStartYm) {
    console.warn(`[WARN] No common start for ${variantKey}`);
    return { backtest: null, history: [] };
  }

  // 2) 백테스트 구간
  const months = sortedYms.filter((ym) => ym >= commonStartYm && ym <= effectiveRefYm);
  const records = [];
  for (const ym of months) {
    const result = allocFn(ym);
    if (!result) continue;
    records.push({ date: getDate(ym), ym, mode: result.mode, allocations: result.allocations });
  }

  if (records.length < 2) {
    console.warn(`[WARN] Not enough backtest records for ${variantKey}`);
    return { backtest: null, history: [] };
  }

  // 3) 에쿼티 커브 계산
  let eqStrat = 1.0, eqSpy = 1.0, eq6040 = 1.0;
  const mRet = { strat: [], spy: [], sf: [] };
  const yRet = { strat: new Map(), spy: new Map(), sf: new Map() };
  const equityCurve = [
    { date: records[0].date, [variantKey]: round3(1), spy: round3(1), sixtyForty: round3(1) },
  ];

  for (let i = 0; i < records.length - 1; i++) {
    const cur = records[i];
    const next = records[i + 1];

    // 전략 수익률
    let stratRet = 0;
    for (const { ticker, weight } of cur.allocations) {
      const c0 = getClose(ticker, cur.ym);
      const c1 = getClose(ticker, next.ym);
      if (c0 && c1 && c0 > 0) stratRet += (weight / 100) * (c1 / c0 - 1);
    }

    // SPY B&H
    const spyC0 = getClose("SPY", cur.ym);
    const spyC1 = getClose("SPY", next.ym);
    const spyRet = spyC0 && spyC1 && spyC0 > 0 ? spyC1 / spyC0 - 1 : 0;

    // 60/40
    const aggC0 = getClose("AGG", cur.ym);
    const aggC1 = getClose("AGG", next.ym);
    const bondRet = aggC0 && aggC1 && aggC0 > 0 ? aggC1 / aggC0 - 1 : 0;
    const sfRet = 0.6 * spyRet + 0.4 * bondRet;

    eqStrat *= 1 + stratRet;
    eqSpy *= 1 + spyRet;
    eq6040 *= 1 + sfRet;

    mRet.strat.push(stratRet);
    mRet.spy.push(spyRet);
    mRet.sf.push(sfRet);

    const year = next.ym.slice(0, 4);
    for (const [key, ret] of [["strat", stratRet], ["spy", spyRet], ["sf", sfRet]]) {
      if (!yRet[key].has(year)) yRet[key].set(year, 1.0);
      yRet[key].set(year, yRet[key].get(year) * (1 + ret));
    }

    equityCurve.push({
      date: next.date,
      [variantKey]: round3(eqStrat),
      spy: round3(eqSpy),
      sixtyForty: round3(eq6040),
    });
  }

  // 4) 성과 지표
  const stratMetrics = calcMetrics(mRet.strat, eqStrat);
  stratMetrics.maxAnnualLoss = calcMaxAnnualLoss(yRet.strat);
  const spyMetrics = calcMetrics(mRet.spy, eqSpy);
  const sfMetrics = calcMetrics(mRet.sf, eq6040);

  const totalMonths = records.length;
  const defMonths = records.filter((r) => r.mode === "defensive").length;

  // 5) 히스토리 (최근 36개월)
  const history = records.slice(-36).map((r) => ({
    date: r.date,
    mode: r.mode,
    allocations: r.allocations.map((a) => ({
      ticker: a.ticker,
      nameKo: NAME_KO[a.ticker] || a.ticker,
      weight: a.weight,
    })),
  }));

  return {
    backtest: {
      startDate: records[0].date,
      endDate: records[records.length - 1].date,
      [variantKey]: stratMetrics,
      spy: spyMetrics,
      sixtyForty: sfMetrics,
      defensiveRatio: round2(defMonths / totalMonths),
      equityCurve,
    },
    history,
  };
};

/* ═══════════════════════════════════════════════════════
   Execute — 현재 시그널 + 백테스트
   ═══════════════════════════════════════════════════════ */

// ── GEM ──
const gemCurrent = calcGemForMonth(effectiveRefYm);
const gemComparison = ["SPY", "EFA", "BIL"].map((t) => ({
  ticker: t,
  nameKo: NAME_KO[t],
  return12m: round2(calc12mReturn(tickerData.get(t), effectiveRefYm)),
}));
const gemResult = runBacktest(
  "gem",
  [...GEM.offensive, GEM.defensive, GEM.benchmark],
  calcGemForMonth
);

// ── ADM ──
const admCurrent = calcAdmForMonth(effectiveRefYm);
const admRanking = ["SPY", "EFA"]
  .map((t) => {
    const me = tickerData.get(t);
    return {
      ticker: t,
      nameKo: NAME_KO[t],
      score1m: round2(calcNmReturn(me, effectiveRefYm, 1)),
      score3m: round2(calcNmReturn(me, effectiveRefYm, 3)),
      score6m: round2(calcNmReturn(me, effectiveRefYm, 6)),
      totalScore: calcAcceleratingScore(me, effectiveRefYm),
      selected: admCurrent?.allocations[0]?.ticker === t,
    };
  })
  .sort((a, b) => (b.totalScore ?? -Infinity) - (a.totalScore ?? -Infinity));
const admResult = runBacktest(
  "adm",
  [...ADM.offensive, ADM.defensive, ADM.benchmark],
  calcAdmForMonth
);

// ── CDM ──
const cdmCurrent = calcCdmForMonth(effectiveRefYm);
const cdmResult = runBacktest(
  "cdm",
  [...new Set([...CDM_MODULES.flatMap((m) => m.candidates), "BIL"])],
  (ym) => {
    const r = calcCdmForMonth(ym);
    return r ? { mode: r.mode, allocations: r.allocations } : null;
  }
);

// ── Sector DM ──
const sectorCurrent = calcSectorDmForMonth(effectiveRefYm);
const sectorRanking = SECTORS.filter((t) => tickerData.has(t))
  .map((t) => {
    const ret = calc12mReturn(tickerData.get(t), effectiveRefYm);
    const bilRet = calc12mReturn(tickerData.get("BIL"), effectiveRefYm);
    return {
      ticker: t,
      nameKo: NAME_KO[t],
      return12m: round2(ret),
      aboveBil: ret !== null && bilRet !== null ? ret > bilRet : null,
    };
  })
  .sort((a, b) => (b.return12m ?? -Infinity) - (a.return12m ?? -Infinity))
  .map((item, idx) => ({ ...item, rank: idx + 1, selected: idx < 4 }));
const sectorResult = runBacktest(
  "sector",
  [...SECTORS, "BIL"],
  (ym) => {
    const r = calcSectorDmForMonth(ym);
    return r ? { mode: r.mode, allocations: r.allocations } : null;
  }
);

/* ═══════════════════════════════════════════════════════
   Output JSON
   ═══════════════════════════════════════════════════════ */

const addNameKo = (allocs) =>
  (allocs || []).map((a) => ({ ...a, nameKo: NAME_KO[a.ticker] || a.ticker }));

const payload = {
  generatedAt: new Date().toISOString(),
  variants: {
    gem: {
      signal: {
        mode: gemCurrent?.mode ?? "unknown",
        rebalanceDate,
        winner: gemCurrent?.allocations[0]?.ticker ?? null,
      },
      comparison: gemComparison,
      portfolio: { allocations: addNameKo(gemCurrent?.allocations) },
      backtest: gemResult.backtest,
      history: gemResult.history,
    },
    adm: {
      signal: {
        mode: admCurrent?.mode ?? "unknown",
        rebalanceDate,
        topAsset: admCurrent?.allocations[0]?.ticker ?? null,
      },
      ranking: admRanking,
      portfolio: { allocations: addNameKo(admCurrent?.allocations) },
      backtest: admResult.backtest,
      history: admResult.history,
    },
    cdm: {
      signal: {
        mode: cdmCurrent?.mode ?? "unknown",
        rebalanceDate,
      },
      modules: cdmCurrent?.modules ?? [],
      portfolio: { allocations: addNameKo(cdmCurrent?.allocations) },
      backtest: cdmResult.backtest,
      history: cdmResult.history,
    },
    sector: {
      signal: {
        mode: sectorCurrent?.mode ?? "unknown",
        rebalanceDate,
      },
      ranking: sectorRanking,
      portfolio: { allocations: addNameKo(sectorCurrent?.allocations) },
      backtest: sectorResult.backtest,
      history: sectorResult.history,
    },
  },
};

/* ═══════════════════════════════════════════════════════
   Write output
   ═══════════════════════════════════════════════════════ */

fs.mkdirSync(SUMMARY_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(`\nGenerated ${OUT_FILE}`);
console.log(`  Reference: ${effectiveRefYm} (${rebalanceDate})`);

for (const [key, label] of [["gem", "GEM"], ["adm", "ADM"], ["cdm", "CDM"], ["sector", "Sector"]]) {
  const v = payload.variants[key];
  const bt = v.backtest?.[key];
  const period = v.backtest ? `${v.backtest.startDate} → ${v.backtest.endDate}` : "N/A";
  console.log(`  ${label}: ${v.signal.mode} | CAGR ${bt?.cagr ?? "—"}% MDD ${bt?.mdd ?? "—"}% Sharpe ${bt?.sharpe ?? "—"} | ${period}`);
}
