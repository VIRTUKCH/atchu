/**
 * S&P 500 개별주 전략 비교 분석
 * - 매수후보유 (Buy & Hold)
 * - 200일선 단순 교차 (위로 올라가면 매수, 아래로 내려가면 매도)
 * - 앗추 필터 (20일 중 16일 이상 200일선 위면 진입, 미만이면 이탈)
 *
 * 상위 100종목 vs 전체 500종목 별도 통계
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_DIR = path.join(__dirname, "../../public/csv_stock");
const TICKERS_FILE = path.join(__dirname, "../tickers_stock/sp500.json");

// sp500.json 로드
const sp500 = JSON.parse(fs.readFileSync(TICKERS_FILE, "utf-8"));
const tickerMeta = new Map();
sp500.items.forEach((item) => {
  tickerMeta.set(item.ticker, item);
});

// CSV 파싱
function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  const dateIdx = header.indexOf("Date");
  const adjIdx = header.indexOf("Adjusted_close");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const date = cols[dateIdx];
    const adjClose = parseFloat(cols[adjIdx]);
    if (!date || isNaN(adjClose) || adjClose <= 0) continue;
    rows.push({ date, adjClose });
  }
  return rows;
}

// 200일 이동평균 계산 (인덱스 기준)
function calcMA200(rows, idx) {
  if (idx < 199) return null;
  let sum = 0;
  for (let i = idx - 199; i <= idx; i++) {
    sum += rows[i].adjClose;
  }
  return sum / 200;
}

// 전략 시뮬레이션
function simulate(rows) {
  if (rows.length < 250) return null; // 최소 1년+200일

  const startIdx = 199; // MA200이 계산 가능한 첫 인덱스
  const firstPrice = rows[startIdx].adjClose;
  const lastPrice = rows[rows.length - 1].adjClose;
  const firstDate = new Date(rows[startIdx].date);
  const lastDate = new Date(rows[rows.length - 1].date);
  const years = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);

  if (years < 1) return null;

  // 1. Buy & Hold CAGR (MA200 계산 가능 시점부터)
  const buyHoldCagr = (Math.pow(lastPrice / firstPrice, 1 / years) - 1) * 100;

  // 2. 200일선 단순 교차 전략
  let ma200Equity = 1;
  let ma200Holding = false;
  let ma200EntryPrice = null;

  for (let i = startIdx; i < rows.length; i++) {
    const price = rows[i].adjClose;
    const ma = calcMA200(rows, i);
    if (ma === null) continue;

    if (!ma200Holding && price > ma) {
      // 진입
      ma200Holding = true;
      ma200EntryPrice = price;
    } else if (ma200Holding && price < ma) {
      // 이탈
      ma200Equity *= price / ma200EntryPrice;
      ma200Holding = false;
      ma200EntryPrice = null;
    }
  }
  // 미청산 포지션 정리
  if (ma200Holding && ma200EntryPrice > 0) {
    ma200Equity *= lastPrice / ma200EntryPrice;
  }
  const ma200Cagr = (Math.pow(ma200Equity, 1 / years) - 1) * 100;

  // 3. 앗추 필터 (16/20)
  let atchuEquity = 1;
  let atchuHolding = false;
  let atchuEntryPrice = null;

  // 슬라이딩 윈도우로 16/20 계산
  let aboveCount = 0;
  const WINDOW = 20;
  const MIN_DAYS = 16;

  for (let i = startIdx; i < rows.length; i++) {
    const price = rows[i].adjClose;
    const ma = calcMA200(rows, i);

    if (ma !== null && price > ma) aboveCount++;

    // 윈도우 벗어난 거 빼기
    if (i - startIdx >= WINDOW) {
      const oldIdx = i - WINDOW;
      const oldPrice = rows[oldIdx].adjClose;
      const oldMa = calcMA200(rows, oldIdx);
      if (oldMa !== null && oldPrice > oldMa) aboveCount--;
    }

    // 20일치 쌓여야 판정 가능
    if (i - startIdx < WINDOW - 1) continue;

    const isQualified = aboveCount >= MIN_DAYS;

    if (!atchuHolding && isQualified) {
      atchuHolding = true;
      atchuEntryPrice = price;
    } else if (atchuHolding && !isQualified) {
      atchuEquity *= price / atchuEntryPrice;
      atchuHolding = false;
      atchuEntryPrice = null;
    }
  }
  if (atchuHolding && atchuEntryPrice > 0) {
    atchuEquity *= lastPrice / atchuEntryPrice;
  }
  const atchuCagr = (Math.pow(atchuEquity, 1 / years) - 1) * 100;

  // MDD 계산
  function calcMDD(equityCurve) {
    let peak = -Infinity;
    let maxDD = 0;
    for (const val of equityCurve) {
      if (val > peak) peak = val;
      const dd = (val - peak) / peak;
      if (dd < maxDD) maxDD = dd;
    }
    return maxDD * 100;
  }

  // Buy & Hold MDD
  const bhCurve = [];
  for (let i = startIdx; i < rows.length; i++) {
    bhCurve.push(rows[i].adjClose / firstPrice);
  }

  // 200일선 전략 equity curve
  const ma200Curve = [];
  let eq200 = 1;
  let holding200 = false;
  let entry200 = null;
  for (let i = startIdx; i < rows.length; i++) {
    const price = rows[i].adjClose;
    const ma = calcMA200(rows, i);
    if (ma === null) { ma200Curve.push(eq200); continue; }
    if (!holding200 && price > ma) {
      holding200 = true;
      entry200 = price;
    } else if (holding200 && price < ma) {
      eq200 *= price / entry200;
      holding200 = false;
      entry200 = null;
    }
    const current = holding200 ? eq200 * (price / entry200) : eq200;
    ma200Curve.push(current);
  }

  // 앗추 필터 equity curve
  const atchuCurve = [];
  let eqAtchu = 1;
  let holdingAtchu = false;
  let entryAtchu = null;
  let aboveCnt2 = 0;
  for (let i = startIdx; i < rows.length; i++) {
    const price = rows[i].adjClose;
    const ma = calcMA200(rows, i);
    if (ma !== null && price > ma) aboveCnt2++;
    if (i - startIdx >= WINDOW) {
      const oldIdx = i - WINDOW;
      const oldPrice = rows[oldIdx].adjClose;
      const oldMa = calcMA200(rows, oldIdx);
      if (oldMa !== null && oldPrice > oldMa) aboveCnt2--;
    }
    if (i - startIdx < WINDOW - 1) { atchuCurve.push(eqAtchu); continue; }
    const isQ = aboveCnt2 >= MIN_DAYS;
    if (!holdingAtchu && isQ) {
      holdingAtchu = true;
      entryAtchu = price;
    } else if (holdingAtchu && !isQ) {
      eqAtchu *= price / entryAtchu;
      holdingAtchu = false;
      entryAtchu = null;
    }
    const cur = holdingAtchu ? eqAtchu * (price / entryAtchu) : eqAtchu;
    atchuCurve.push(cur);
  }

  return {
    years: years.toFixed(1),
    dataStart: rows[startIdx].date,
    dataEnd: rows[rows.length - 1].date,
    buyHoldCagr: buyHoldCagr.toFixed(2),
    ma200Cagr: ma200Cagr.toFixed(2),
    atchuCagr: atchuCagr.toFixed(2),
    buyHoldMDD: calcMDD(bhCurve).toFixed(1),
    ma200MDD: calcMDD(ma200Curve).toFixed(1),
    atchuMDD: calcMDD(atchuCurve).toFixed(1),
  };
}

// 전체 실행
const files = fs.readdirSync(CSV_DIR).filter((f) => f.endsWith("_all.csv"));
const results = [];

for (const file of files) {
  const ticker = file.replace(".US_all.csv", "");
  const meta = tickerMeta.get(ticker);
  if (!meta) continue;

  const rows = parseCSV(path.join(CSV_DIR, file));
  const result = simulate(rows);
  if (!result) continue;

  results.push({
    ticker,
    rank: meta.rank || 999,
    sector: meta.type,
    ...result,
  });
}

// 통계 함수
function stats(arr, label) {
  if (arr.length === 0) return;

  const median = (vals) => {
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const avg = (vals) => vals.reduce((a, b) => a + b, 0) / vals.length;

  const bhCagrs = arr.map((r) => parseFloat(r.buyHoldCagr));
  const ma200Cagrs = arr.map((r) => parseFloat(r.ma200Cagr));
  const atchuCagrs = arr.map((r) => parseFloat(r.atchuCagr));
  const bhMdds = arr.map((r) => parseFloat(r.buyHoldMDD));
  const ma200Mdds = arr.map((r) => parseFloat(r.ma200MDD));
  const atchuMdds = arr.map((r) => parseFloat(r.atchuMDD));

  // 앗추 > BH 인 종목 수
  const atchuBeatsBH = arr.filter((r) => parseFloat(r.atchuCagr) > parseFloat(r.buyHoldCagr)).length;
  const ma200BeatsBH = arr.filter((r) => parseFloat(r.ma200Cagr) > parseFloat(r.buyHoldCagr)).length;
  // 앗추 > MA200 인 종목 수
  const atchuBeatsMA = arr.filter((r) => parseFloat(r.atchuCagr) > parseFloat(r.ma200Cagr)).length;

  // MDD 개선 비율
  const atchuBetterMDD = arr.filter((r) => parseFloat(r.atchuMDD) > parseFloat(r.buyHoldMDD)).length; // MDD는 음수니까 더 큰게 더 좋은 것

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${label} (${arr.length}종목)`);
  console.log(`${"=".repeat(70)}`);

  console.log(`\n  CAGR (%)`);
  console.log(`  ${"─".repeat(60)}`);
  console.log(`  ${"".padEnd(20)} ${"평균".padStart(8)} ${"중앙값".padStart(8)} ${"최소".padStart(8)} ${"최대".padStart(8)}`);
  console.log(`  ${"매수후보유".padEnd(18)} ${avg(bhCagrs).toFixed(1).padStart(8)} ${median(bhCagrs).toFixed(1).padStart(8)} ${Math.min(...bhCagrs).toFixed(1).padStart(8)} ${Math.max(...bhCagrs).toFixed(1).padStart(8)}`);
  console.log(`  ${"200일선 교차".padEnd(16)} ${avg(ma200Cagrs).toFixed(1).padStart(8)} ${median(ma200Cagrs).toFixed(1).padStart(8)} ${Math.min(...ma200Cagrs).toFixed(1).padStart(8)} ${Math.max(...ma200Cagrs).toFixed(1).padStart(8)}`);
  console.log(`  ${"앗추 필터".padEnd(17)} ${avg(atchuCagrs).toFixed(1).padStart(8)} ${median(atchuCagrs).toFixed(1).padStart(8)} ${Math.min(...atchuCagrs).toFixed(1).padStart(8)} ${Math.max(...atchuCagrs).toFixed(1).padStart(8)}`);

  console.log(`\n  MDD (%)`);
  console.log(`  ${"─".repeat(60)}`);
  console.log(`  ${"".padEnd(20)} ${"평균".padStart(8)} ${"중앙값".padStart(8)} ${"최악".padStart(8)}`);
  console.log(`  ${"매수후보유".padEnd(18)} ${avg(bhMdds).toFixed(1).padStart(8)} ${median(bhMdds).toFixed(1).padStart(8)} ${Math.min(...bhMdds).toFixed(1).padStart(8)}`);
  console.log(`  ${"200일선 교차".padEnd(16)} ${avg(ma200Mdds).toFixed(1).padStart(8)} ${median(ma200Mdds).toFixed(1).padStart(8)} ${Math.min(...ma200Mdds).toFixed(1).padStart(8)}`);
  console.log(`  ${"앗추 필터".padEnd(17)} ${avg(atchuMdds).toFixed(1).padStart(8)} ${median(atchuMdds).toFixed(1).padStart(8)} ${Math.min(...atchuMdds).toFixed(1).padStart(8)}`);

  console.log(`\n  승률 (매수후보유 대비)`);
  console.log(`  ${"─".repeat(60)}`);
  console.log(`  200일선 교차가 BH를 이긴 종목: ${ma200BeatsBH}/${arr.length} (${(ma200BeatsBH/arr.length*100).toFixed(1)}%)`);
  console.log(`  앗추 필터가 BH를 이긴 종목:   ${atchuBeatsBH}/${arr.length} (${(atchuBeatsBH/arr.length*100).toFixed(1)}%)`);
  console.log(`  앗추가 200일선을 이긴 종목:   ${atchuBeatsMA}/${arr.length} (${(atchuBeatsMA/arr.length*100).toFixed(1)}%)`);
  console.log(`  앗추가 MDD 개선한 종목:       ${atchuBetterMDD}/${arr.length} (${(atchuBetterMDD/arr.length*100).toFixed(1)}%)`);

  // CAGR 차이 (앗추 - BH)
  const cagrDiffs = arr.map((r) => parseFloat(r.atchuCagr) - parseFloat(r.buyHoldCagr));
  console.log(`\n  앗추 vs 매수후보유 CAGR 차이`);
  console.log(`  ${"─".repeat(60)}`);
  console.log(`  평균 차이: ${avg(cagrDiffs).toFixed(2)}%p`);
  console.log(`  중앙값 차이: ${median(cagrDiffs).toFixed(2)}%p`);
}

// 상위 100 / 전체 분리
const top100 = results.filter((r) => r.rank <= 100).sort((a, b) => a.rank - b.rank);
const all500 = results.sort((a, b) => a.rank - b.rank);

stats(top100, "S&P 500 상위 100종목 (시가총액 기준)");
stats(all500, "S&P 500 전체");

// 섹터별 요약 (전체)
console.log(`\n${"=".repeat(70)}`);
console.log(`  섹터별 앗추 필터 CAGR vs 매수후보유 CAGR (전체)`);
console.log(`${"=".repeat(70)}`);

const sectors = [...new Set(all500.map((r) => r.sector))];
sectors.forEach((sector) => {
  const sectorStocks = all500.filter((r) => r.sector === sector);
  const avgBH = sectorStocks.reduce((s, r) => s + parseFloat(r.buyHoldCagr), 0) / sectorStocks.length;
  const avgAtchu = sectorStocks.reduce((s, r) => s + parseFloat(r.atchuCagr), 0) / sectorStocks.length;
  const diff = avgAtchu - avgBH;
  const beats = sectorStocks.filter((r) => parseFloat(r.atchuCagr) > parseFloat(r.buyHoldCagr)).length;
  console.log(`  ${sector.padEnd(12)} BH ${avgBH.toFixed(1).padStart(6)}%  앗추 ${avgAtchu.toFixed(1).padStart(6)}%  차이 ${diff >= 0 ? "+" : ""}${diff.toFixed(1).padStart(5)}%p  승률 ${beats}/${sectorStocks.length}`);
});

