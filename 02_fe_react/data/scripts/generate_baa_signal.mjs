#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const CSV_DIR = path.join(ROOT_DIR, "csv");
const SUMMARY_DIR = path.join(ROOT_DIR, "summary", "baa");
const OUT_FILE = path.join(SUMMARY_DIR, "baa_signal.json");

/* ── Universes ── */
const CANARY = ["SPY", "EEM", "EFA", "AGG"];
const OFFENSIVE_G12 = ["SPY", "QQQ", "IWM", "VGK", "EWJ", "VWO", "VNQ", "DBC", "GLD", "TLT", "HYG", "LQD"];
const OFFENSIVE_G4 = ["SPY", "QQQ", "EFA", "AGG"];
const DEFENSIVE = ["TIP", "DBC", "BIL", "IEF", "TLT", "LQD", "AGG"];

const NAME_KO = {
  SPY: "S&P 500", QQQ: "나스닥 100", IWM: "러셀 2000",
  VGK: "유럽", EWJ: "일본", VWO: "신흥국 (FTSE)", EEM: "신흥국 (MSCI)",
  EFA: "선진국 (EAFE)", VNQ: "부동산", DBC: "원자재 종합",
  GLD: "금", TLT: "장기 국채", HYG: "하이일드 채권", LQD: "투자등급 회사채",
  TIP: "물가연동 국채", BIL: "초단기 국채", IEF: "중기 국채",
  AGG: "미국 종합채권"
};

const ALL_TICKERS = [...new Set([...CANARY, ...OFFENSIVE_G12, ...OFFENSIVE_G4, ...DEFENSIVE])];

/* ── Helpers ── */
const round2 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 100) / 100);

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/* ── Step 1: Read CSV → month-end adjusted close ── */
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
    .filter((row) => row.Date)
    .sort((a, b) => String(a.Date).localeCompare(String(b.Date)));

  // Group by year-month, take last trading day of each month
  const monthMap = new Map();
  for (const row of records) {
    const date = String(row.Date);
    const ym = date.slice(0, 7); // "YYYY-MM"
    const close = parseNumber(row.Adjusted_close ?? row.Close);
    if (close === null) continue;
    // Always overwrite — records are sorted ascending, so last entry wins
    monthMap.set(ym, { date, close });
  }

  const monthEnds = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, data]) => ({ ym, date: data.date, close: data.close }));

  return monthEnds;
};

/* ── Step 2: Determine reference month ── */
const getReferenceMonth = () => {
  const now = new Date();
  // Go to first day of current month, then subtract one day → last day of previous month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = new Date(firstOfMonth.getTime() - 1);
  const year = lastDayPrevMonth.getFullYear();
  const month = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/* ── Step 3: 13612W momentum ── */
const calcMomentum13612W = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 0) return null;
  if (idx < 12) return null; // Need at least 12 months before reference

  const p0 = monthEnds[idx].close;
  const p1 = monthEnds[idx - 1]?.close;
  const p3 = monthEnds[idx - 3]?.close;
  const p6 = monthEnds[idx - 6]?.close;
  const p12 = monthEnds[idx - 12]?.close;

  if ([p0, p1, p3, p6, p12].some((v) => v === null || v === undefined || v === 0)) return null;

  const mom = 12 * (p0 / p1 - 1) + 4 * (p0 / p3 - 1) + 2 * (p0 / p6 - 1) + 1 * (p0 / p12 - 1);
  return mom * 100; // percentage
};

/* ── Step 4: Relative momentum (SMA 13-month) ── */
const calcRelMomentum = (monthEnds, refYm) => {
  const idx = monthEnds.findIndex((m) => m.ym === refYm);
  if (idx < 0 || idx < 12) return null; // Need 13 closes (idx 0..12 = 13 values)

  const p0 = monthEnds[idx].close;
  const window = monthEnds.slice(idx - 12, idx + 1); // 13 months
  if (window.length < 13) return null;

  const sum = window.reduce((s, m) => s + m.close, 0);
  const sma13 = sum / 13;
  if (sma13 === 0) return null;

  return p0 / sma13;
};

/* ── Main ── */
const refYm = getReferenceMonth();
console.log(`Reference month: ${refYm}`);

// Load all month-end data
const tickerData = new Map();
let processedCount = 0;

for (const ticker of ALL_TICKERS) {
  const monthEnds = readMonthEnds(ticker);
  if (!monthEnds) continue;

  if (monthEnds.length < 13) {
    console.warn(`[WARN] Not enough monthly data for ${ticker} (${monthEnds.length} months, need >= 13)`);
    continue;
  }

  tickerData.set(ticker, monthEnds);
  processedCount++;
}

// Find the reference month. If not all tickers have it, fall back to latest common month.
let effectiveRefYm = refYm;
const allYms = [...tickerData.values()].map((me) => me[me.length - 1].ym);
const minLatest = allYms.sort()[0]; // earliest "latest month" across all tickers

if (allYms.some((ym) => ym < effectiveRefYm)) {
  // Some tickers don't have the reference month — use the latest common month
  effectiveRefYm = minLatest < effectiveRefYm ? minLatest : effectiveRefYm;
  console.log(`Adjusted reference month to ${effectiveRefYm} (not all tickers had ${refYm})`);
}

// Verify all tickers have the effective reference month
for (const [ticker, monthEnds] of tickerData) {
  const hasRef = monthEnds.some((m) => m.ym === effectiveRefYm);
  if (!hasRef) {
    console.warn(`[WARN] ${ticker} missing data for ${effectiveRefYm}, skipping`);
    tickerData.delete(ticker);
  }
}

// Compute momentum and relMomentum for all tickers
const metrics = new Map();

for (const [ticker, monthEnds] of tickerData) {
  const momentum13612w = calcMomentum13612W(monthEnds, effectiveRefYm);
  const relMomentum = calcRelMomentum(monthEnds, effectiveRefYm);

  if (momentum13612w === null || relMomentum === null) {
    console.warn(`[WARN] Could not compute metrics for ${ticker}`);
    continue;
  }

  metrics.set(ticker, {
    momentum13612w: round2(momentum13612w),
    relMomentum: round2(relMomentum)
  });
}

// Rebalance date = last trading day of reference month
const refMonthEnds = tickerData.get("SPY") || [...tickerData.values()][0];
const refEntry = refMonthEnds?.find((m) => m.ym === effectiveRefYm);
const rebalanceDate = refEntry?.date || `${effectiveRefYm}-28`;

/* ── Step 5: Canary judgment ── */
const canaryResults = CANARY.map((ticker) => {
  const m = metrics.get(ticker);
  return {
    ticker,
    nameKo: NAME_KO[ticker] || ticker,
    momentum13612w: m?.momentum13612w ?? null
  };
});

const canaryPositiveCount = canaryResults.filter((c) => c.momentum13612w !== null && c.momentum13612w > 0).length;
const mode = canaryPositiveCount === 4 ? "offensive" : "defensive";

/* ── Step 6: Portfolio allocation ── */
const bilRelMomentum = metrics.get("BIL")?.relMomentum ?? 0;

const buildDefensiveAllocations = () => {
  const ranked = DEFENSIVE
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.relMomentum - a.relMomentum);

  const top3 = ranked.slice(0, 3).map((item) => {
    const shouldReplace = item.relMomentum < bilRelMomentum;
    return {
      ticker: shouldReplace ? "BIL" : item.ticker,
      nameKo: shouldReplace ? NAME_KO["BIL"] : (NAME_KO[item.ticker] || item.ticker),
      weight: round2(33.33),
      momentum13612w: shouldReplace ? (metrics.get("BIL")?.momentum13612w ?? null) : item.momentum13612w,
      relMomentum: shouldReplace ? bilRelMomentum : item.relMomentum,
      replacedByBil: shouldReplace,
      originalTicker: shouldReplace ? item.ticker : undefined
    };
  });

  return top3;
};

let aggressivePortfolio;
let balancedPortfolio;

if (mode === "offensive") {
  // Aggressive: G4 top 1 by relMomentum
  const g4Ranked = OFFENSIVE_G4
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.relMomentum - a.relMomentum);

  aggressivePortfolio = {
    mode: "offensive",
    allocations: g4Ranked.length > 0
      ? [{
          ticker: g4Ranked[0].ticker,
          nameKo: NAME_KO[g4Ranked[0].ticker] || g4Ranked[0].ticker,
          weight: 100,
          momentum13612w: g4Ranked[0].momentum13612w,
          relMomentum: g4Ranked[0].relMomentum,
          replacedByBil: false
        }]
      : []
  };

  // Balanced: G12 top 6 by relMomentum, 16.67% each
  const g12Ranked = OFFENSIVE_G12
    .filter((t) => metrics.has(t))
    .map((t) => ({ ticker: t, ...metrics.get(t) }))
    .sort((a, b) => b.relMomentum - a.relMomentum);

  balancedPortfolio = {
    mode: "offensive",
    allocations: g12Ranked.slice(0, 6).map((item) => ({
      ticker: item.ticker,
      nameKo: NAME_KO[item.ticker] || item.ticker,
      weight: round2(16.67),
      momentum13612w: item.momentum13612w,
      relMomentum: item.relMomentum,
      replacedByBil: false
    }))
  };
} else {
  // Defensive mode: both use defensive universe
  const defAllocations = buildDefensiveAllocations();
  aggressivePortfolio = { mode: "defensive", allocations: defAllocations };
  balancedPortfolio = { mode: "defensive", allocations: defAllocations };
}

/* ── Step 7: Rankings ── */
const offensiveRanking = OFFENSIVE_G12
  .filter((t) => metrics.has(t))
  .map((t) => {
    const m = metrics.get(t);
    return {
      ticker: t,
      nameKo: NAME_KO[t] || t,
      momentum13612w: m.momentum13612w,
      relMomentum: m.relMomentum,
      selectedG4: mode === "offensive" && aggressivePortfolio.allocations.some((a) => a.ticker === t),
      selectedG12: mode === "offensive" && balancedPortfolio.allocations.some((a) => a.ticker === t)
    };
  })
  .sort((a, b) => b.relMomentum - a.relMomentum);

const defensiveRanking = DEFENSIVE
  .filter((t) => metrics.has(t))
  .map((t) => {
    const m = metrics.get(t);
    const isSelected = mode === "defensive" && aggressivePortfolio.allocations.some((a) => a.ticker === t || a.originalTicker === t);
    const replacedEntry = mode === "defensive" && aggressivePortfolio.allocations.find((a) => a.originalTicker === t);
    return {
      ticker: t,
      nameKo: NAME_KO[t] || t,
      relMomentum: m.relMomentum,
      selected: isSelected,
      replacedByBil: replacedEntry ? true : false
    };
  })
  .sort((a, b) => b.relMomentum - a.relMomentum);

/* ── Output ── */
const payload = {
  generatedAt: new Date().toISOString(),
  signal: {
    mode,
    rebalanceDate,
    canaryPositiveCount
  },
  canary: canaryResults,
  offensiveRanking,
  defensiveRanking,
  portfolios: {
    aggressive: aggressivePortfolio,
    balanced: balancedPortfolio
  }
};

fs.mkdirSync(SUMMARY_DIR, { recursive: true });
const body = `${JSON.stringify(payload, null, 2)}\n`;
fs.writeFileSync(OUT_FILE, body, "utf8");

console.log(`Generated ${OUT_FILE}`);
console.log(`  Tickers processed: ${processedCount}`);
console.log(`  Signal mode: ${mode}`);
console.log(`  Canary positive: ${canaryPositiveCount}/4`);
console.log(`  Rebalance date: ${rebalanceDate}`);
