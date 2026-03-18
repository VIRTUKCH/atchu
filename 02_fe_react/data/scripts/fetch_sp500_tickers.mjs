#!/usr/bin/env node
/**
 * S&P 500 구성종목을 EODHD API에서 가져와 tickers_stock/sp500.json을 생성한다.
 * 일회성 스크립트. 구성 변경 시 다시 실행.
 *
 * 사용법: EODHD_API_TOKEN=xxx node fetch_sp500_tickers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const OUT_FILE = path.join(ROOT_DIR, "tickers_stock", "sp500.json");

// EODHD API 토큰 불필요 — GitHub 공개 데이터셋 사용

const SECTOR_KO = {
  "Technology": "기술",
  "Information Technology": "기술",
  "Health Care": "헬스케어",
  "Healthcare": "헬스케어",
  "Financials": "금융",
  "Consumer Discretionary": "임의소비재",
  "Communication Services": "통신",
  "Industrials": "산업재",
  "Consumer Staples": "필수소비재",
  "Energy": "에너지",
  "Utilities": "유틸리티",
  "Real Estate": "부동산",
  "Materials": "소재",
  "Basic Materials": "소재"
};

async function fetchFromDatahub() {
  const url = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GitHub 데이터 조회 오류: ${res.status}`);
  }
  const text = await res.text();
  const lines = text.trim().split("\n");
  // CSV 헤더: Symbol,Security,GICS Sector,GICS Sub-Industry,...
  return lines.slice(1).map((line) => {
    // 따옴표 안의 쉼표를 보호하면서 파싱
    const parts = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { parts.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    parts.push(current.trim());
    return {
      Symbol: parts[0] || "",
      Security: parts[1] || "",
      "GICS Sector": parts[2] || "",
      "GICS Sub-Industry": parts[3] || ""
    };
  });
}

async function main() {
  console.log("S&P 500 구성종목 조회 중 (GitHub datasets)...");
  const components = await fetchFromDatahub();
  console.log(`총 ${components.length}개 종목 수신`);

  const items = components
    .map((comp) => {
      const ticker = (comp.Symbol || "").replace(".", "-").trim();
      if (!ticker) return null;
      const sector = comp["GICS Sector"] || "";
      const sectorKo = SECTOR_KO[sector] || sector;
      const name = (comp.Security || "").trim();
      const industry = (comp["GICS Sub-Industry"] || "").trim();
      // 반도체·바이오텍은 섹터에서 분리
      let typeKo = sectorKo;
      if (/^Semiconductor/i.test(industry)) typeKo = "반도체";
      if (/^Biotechnology$/i.test(industry)) typeKo = "바이오텍";
      return {
        ticker,
        name,
        name_ko: name,
        asset_type: "개별주",
        type: typeKo,
        sector,
        industry,
        heatmap_label: ticker
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.ticker.localeCompare(b.ticker));

  const payload = {
    type: "S&P 500",
    items
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`생성 완료: ${OUT_FILE} (${items.length}종목)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
