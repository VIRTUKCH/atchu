import React from "react";
import "../styles/column.css";
import { trendSignalPayload } from "../utils/trendDataLoaders";
import { ColumnCompareTable } from "../components/column/ColumnCompareTable";
import { ColumnCallout } from "../components/column/ColumnCallout";
import { ColumnStatGrid } from "../components/column/ColumnStatGrid";
import { ColumnWarningCard } from "../components/column/ColumnWarningCard";
import { ColumnKeyFactGrid } from "../components/column/ColumnKeyFact";
import { ColumnTimeline, ColumnTimelineItem } from "../components/column/ColumnTimeline";
import { ColumnBackLink } from "../components/column/ColumnBackLink";
import TrendEquityCurveChart from "../components/trend/TrendEquityCurveChart";

function calcPeriodReturns(equityCurve, curveKey) {
  if (!equityCurve || !curveKey || equityCurve.length < 2) return null;
  const latest = equityCurve[equityCurve.length - 1];
  const latestVal = latest[curveKey];
  if (latestVal == null) return null;
  const lookup = (monthsAgo) => {
    const idx = equityCurve.length - 1 - monthsAgo;
    return idx >= 0 ? equityCurve[idx][curveKey] : null;
  };
  const pct = (prev) => prev != null ? ((latestVal / prev - 1) * 100).toFixed(1) : null;
  return { "5Y": pct(lookup(60)), "3Y": pct(lookup(36)), "1Y": pct(lookup(12)), "6M": pct(lookup(6)), "3M": pct(lookup(3)), "1M": pct(lookup(1)) };
}

/* ── [1] 기간별 수익률 ── */
function ReturnsSection({ equityCurve }) {
  const returns = calcPeriodReturns(equityCurve, "trend");
  if (!returns) return null;
  const periods = [
    { key: "1M", label: "1개월" },
    { key: "3M", label: "3개월" },
    { key: "6M", label: "6개월" },
    { key: "1Y", label: "1년" },
    { key: "3Y", label: "3년" },
    { key: "5Y", label: "5년" },
  ];
  const stats = periods.map((p) => {
    const val = returns[p.key];
    if (val == null) return { value: "—", label: p.label, desc: "USD 기준" };
    const num = parseFloat(val);
    return { value: `${num >= 0 ? "+" : ""}${val}%`, label: p.label, desc: "USD 기준" };
  });
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        기간별 수익률
      </h3>
      <ColumnStatGrid stats={stats} />
    </div>
  );
}

/* ── [2] 현재 신호 ── */
function SignalSection({ signal }) {
  if (!signal) return null;
  const { rebalanceDate, investedCount, cashCount, assets } = signal;
  const total = investedCount + cashCount;

  const rows = (assets || []).map((a) => [
    { value: a.ticker, highlight: a.invested },
    a.nameKo || "",
    a.close != null ? String(a.close) : "—",
    a.sma200 != null ? String(a.sma200) : "—",
    `${a.daysAbove ?? 0}/20`,
    a.invested ? "투자" : "SGOV",
  ]);

  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        현재 신호
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span className={`quant-signal-badge quant-signal-badge--${investedCount > total / 2 ? "offensive" : "defensive"}`}>
          {investedCount}/{total} 투자
        </span>
        {rebalanceDate && (
          <span style={{ fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
            {rebalanceDate.slice(0, 7)} 월말 기준
          </span>
        )}
      </div>
      <ColumnCompareTable
        columns={["자산", "이름", "종가", "SMA 200", "일수", "판정"]}
        rows={rows}
      />
    </div>
  );
}

/* ── CAGR 가중 비중 테이블 ── */
function CagrWeightsSection({ cagrWeights }) {
  if (!cagrWeights || cagrWeights.length === 0) return null;
  const rows = cagrWeights.map((w) => [
    { value: w.ticker, highlight: true },
    w.nameKo,
    `${w.cagr}%`,
    `${w.equalWeight}%`,
    `${w.cagrWeight}%`,
  ]);
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        비중 배분: 동일가중 vs CAGR가중
      </h3>
      <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.6, margin: "0 0 12px" }}>
        CAGR가중은 각 자산의 전체 기간 바이앤홀드 CAGR에 비례하여 비중을 배분한다.
        CAGR이 높은 자산(GLD, SPY)에 더 많이, 낮은 자산(DBC)에 더 적게 투자.
      </p>
      <ColumnCompareTable
        columns={["자산", "이름", "CAGR", "동일가중", "CAGR가중"]}
        rows={rows}
      />
    </div>
  );
}

/* ── [3] 트렌드 팔로잉이란 ── */
function WhatIsSection() {
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        트렌드 팔로잉이란
      </h3>
      <ColumnCallout>
        <strong>오르고 있으면 사고, 내리고 있으면 판다.</strong><br />
        가격이 200일 이동평균선 위에 안정적으로 있으면 상승 추세로 판단하여 투자하고,
        아래로 내려가면 추세가 꺾인 것으로 보고 현금(SGOV)으로 대피한다.
      </ColumnCallout>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: "clamp(16px, calc(14px + 0.5vw), 18px)", fontWeight: 600, marginBottom: 8 }}>앗추 필터</h4>
        <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.6, margin: 0 }}>
          최근 <strong>20거래일 중 16거래일 이상</strong> 종가가 200일선 위에 있을 때 통과.
          하루 이틀의 잡음을 걸러 안정적인 상승 추세만 잡아낸다.
        </p>
      </div>

      <div style={{ marginTop: 16 }}>
        <ColumnKeyFactGrid
          facts={[
            { label: "추세 관성", value: "행동경제학적으로 가격은 관성을 가진다. 오르던 것은 계속 오르려 하고, 내리던 것은 계속 내리려 한다." },
            { label: "손실 자동 차단", value: "하락 추세에 진입하면 자동으로 현금 대피. 사전 판단이나 감정 개입 없이 규칙대로 실행." },
            { label: "110년 검증", value: "AQR이 1880~1990년 110년간 백테스트 — 모든 기간, 모든 자산군에서 수익성 확인." },
          ]}
        />
      </div>
    </div>
  );
}

/* ── [4] 월가에서는 어떻게 하나 ── */
function WallStreetSection() {
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        월가에서는 어떻게 하나
      </h3>
      <ColumnKeyFactGrid
        facts={[
          { label: "AQR Capital", value: "60개+ 선물 시장에 분산. 여러 시간대(단기/중기/장기)를 앙상블로 조합. 롱/숏 모두 운용. 2024년 +11%, 2025년 H1 +5.5%." },
          { label: "Man Group (AHL)", value: "50~150개 시장 운용. 속도·캐리·시장범위·배분방식 4가지 파라미터를 튜닝. 30년+ 운용 경력." },
          { label: "학술 연구", value: "SSRN 논문 발견: 시간대 선택(lookback period)이 방법론(SMA vs EMA)보다 훨씬 중요하다. 방법은 단순해도 된다." },
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <ColumnCallout>
          <strong>Crisis Alpha</strong> — 2008년 S&P 500이 -37% 빠지는 동안, CTA 헤지펀드들은 +20~40% 수익을 냈다.
          하락 추세에 숏을 걸고, 채권 상승 추세에 롱을 잡아서 위기 시 양의 수익을 만드는 구조.
          이것이 트렌드 팔로잉을 "위기의 알파"라 부르는 이유다.
        </ColumnCallout>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: "clamp(16px, calc(14px + 0.5vw), 18px)", fontWeight: 600, marginBottom: 8 }}>
          Man Group: 2025년 drawdown 분석
        </h4>
        <ColumnCompareTable
          columns={["항목", "수치"]}
          rows={[
            ["2025.4 기준 12개월 수익률", "-18.6% (역사상 2번째 최악)"],
            ["원인", "미국 관세 정책 on/off로 추세 형성 불가"],
            ["-10% 이상 drawdown 후 12개월 평균", "+9.8% 회복"],
            ["2019년 저점(-16%) 후 2024년까지", "+82.5% 회복"],
            ["크라우딩 증거", "없음 (자금흐름-성과 상관계수 -0.1)"],
          ]}
        />
      </div>
    </div>
  );
}

/* ── [5] 우리 전략의 한계 ── */
function LimitationsSection() {
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        우리 전략의 한계
      </h3>
      <ColumnCallout variant="warning">
        <strong>이 전략은 기관급 트렌드 팔로잉이 아닙니다.</strong><br />
        월가 기관들의 방법론을 참고했지만, 개인 투자자의 현실적 제약으로 인해 핵심 요소가 빠져 있습니다.
      </ColumnCallout>

      <div style={{ marginTop: 16 }}>
        <ColumnCompareTable
          columns={["항목", "기관 (AQR, Man Group)", "우리 전략"]}
          rows={[
            ["시장 수", "60~150개 선물 시장", "9개 ETF"],
            ["포지션", "롱 + 숏 (하락에도 베팅)", "롱/현금만 (숏 불가)"],
            ["레버리지", "사용 (수익 증폭)", "없음"],
            ["리밸런싱", "일별~주별", "월 1회"],
            ["자산 접근", "통화·곡물·원유 개별 선물", "ETF 묶음만"],
            ["Crisis Alpha", "위기 시 양의 수익 (숏)", "손실 회피만 가능 (수익 불가)"],
          ]}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <ColumnCallout>
          <strong>숏을 못 하므로 하락장에서 돈을 벌 수 없고, 단지 잃지 않을 뿐이다.</strong><br />
          기관급 Crisis Alpha(위기 시 양의 수익)는 숏 포지션에서 나온다.
          우리 전략은 하락 추세 자산을 현금(SGOV)으로 전환해서 <em>방어</em>만 한다.
        </ColumnCallout>
      </div>
    </div>
  );
}

/* ── [6] 2022년: 이 전략이 어떻게 방어했나 ── */
function Year2022Section() {
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        2022년: 이 전략이 어떻게 방어했나
      </h3>
      <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", lineHeight: 1.6, margin: "0 0 12px" }}>
        2022년은 주식과 채권이 동시에 폭락한 해였다. 60/40 포트폴리오가 무너졌지만,
        트렌드 팔로잉은 앗추 필터가 하락 추세를 감지해 대부분을 현금(BIL)으로 전환했다.
      </p>
      <ColumnCompareTable
        columns={["자산", "2022 수익률", "앗추 필터", "판정"]}
        rows={[
          ["SPY (미국 주식)", "-18.1%", "SMA 200 이탈", "SGOV 전환"],
          ["TLT (장기 국채)", "-31.2%", "SMA 200 이탈", "SGOV 전환"],
          ["IEF (중기 국채)", "-10.5%", "SMA 200 이탈", "SGOV 전환"],
          ["GLD (금)", "-0.8%", "보합", "SGOV 전환"],
          [{ value: "DBC (원자재)", highlight: true }, { value: "+19.5%", highlight: true }, "SMA 200 위", { value: "투자 유지", highlight: true }],
          ["EFA (선진국)", "-14.9%", "SMA 200 이탈", "SGOV 전환"],
          ["EEM (이머징)", "-20.1%", "SMA 200 이탈", "SGOV 전환"],
          ["TIP (물가연동채)", "-11.8%", "SMA 200 이탈", "SGOV 전환"],
          ["VNQ (부동산)", "-26.2%", "SMA 200 이탈", "SGOV 전환"],
        ]}
      />
      <div style={{ marginTop: 16 }}>
        <ColumnCallout>
          <strong>9개 중 8개가 현금 전환, 원자재만 투자.</strong><br />
          SPY -18%, TLT -31%가 포트폴리오에 반영되지 않았다.
          결과: 트렌드 팔로잉 2022년 수익률 <strong>약 +0.5%</strong> (SPY -13.6%, 60/40 -12.4%).
        </ColumnCallout>
      </div>
    </div>
  );
}

/* ── [7] 성과 ── */
function PerformanceSection({ backtest }) {
  if (!backtest) return null;
  const t = backtest.trend;
  const tc = backtest.trendCagr;
  const spy = backtest.spy;
  const sf = backtest.sixtyForty;
  const stats = [
    { value: `${t?.cagr ?? "—"}%`, label: "동일가중 CAGR", desc: "연평균 수익률" },
    { value: `${tc?.cagr ?? "—"}%`, label: "CAGR가중 CAGR", desc: "연평균 수익률" },
    { value: `${t?.mdd ?? "—"}%`, label: "동일가중 MDD", desc: "최대 낙폭" },
    { value: `${tc?.mdd ?? "—"}%`, label: "CAGR가중 MDD", desc: "최대 낙폭" },
  ];
  const compareRows = [
    ["동일가중", `${t?.cagr ?? "—"}%`, `${t?.mdd ?? "—"}%`, `${t?.sharpe ?? "—"}`],
    ["CAGR가중", `${tc?.cagr ?? "—"}%`, `${tc?.mdd ?? "—"}%`, `${tc?.sharpe ?? "—"}`],
    ["SPY B&H", `${spy?.cagr ?? "—"}%`, `${spy?.mdd ?? "—"}%`, `${spy?.sharpe ?? "—"}`],
    ["60/40 B&H", `${sf?.cagr ?? "—"}%`, `${sf?.mdd ?? "—"}%`, `${sf?.sharpe ?? "—"}`],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3 className="panel-title" style={{ marginBottom: 4, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
          전략 성과 요약
        </h3>
        {backtest.startDate && (
          <div style={{ marginBottom: 12, fontSize: "clamp(15px, calc(14.3px + 0.19vw), 16px)", color: "var(--muted)" }}>
            {backtest.startDate.slice(0, 7)} ~ {backtest.endDate?.slice(0, 7)} 백테스트
          </div>
        )}
        <ColumnStatGrid stats={stats} />
        <div style={{ marginTop: 16 }}>
          <ColumnCompareTable columns={["전략", "CAGR", "MDD", "샤프"]} rows={compareRows} />
        </div>
      </div>
      <TrendEquityCurveChart equityCurve={backtest.equityCurve} />
    </div>
  );
}

/* ── [8] 히스토리 ── */
function HistorySection({ history }) {
  if (!history || history.length === 0) return null;
  const [showAll, setShowAll] = React.useState(false);
  const sorted = [...history].reverse();
  const visible = showAll ? sorted : sorted.slice(0, 12);
  return (
    <div className="panel-card" style={{ padding: "20px" }}>
      <h3 className="panel-title" style={{ marginBottom: 12, fontSize: "clamp(18px, calc(15.2px + 0.75vw), 22px)" }}>
        월별 리밸런싱 히스토리
      </h3>
      <ColumnTimeline>
        {visible.map((h) => {
          const invested = (h.assets || []).filter((a) => a.invested).map((a) => a.ticker);
          const cash = (h.assets || []).filter((a) => !a.invested).map((a) => a.ticker);
          return (
            <ColumnTimelineItem key={h.ym} year={h.ym} title={`${h.investedCount}/9 투자`}>
              {invested.length > 0 ? `투자: ${invested.join(", ")}` : "전체 현금"}
              {cash.length > 0 && invested.length > 0 && (
                <>
                  <br />
                  <span style={{ fontSize: "clamp(13px, calc(11px + 0.5vw), 15px)", color: "var(--muted)" }}>
                    SGOV: {cash.join(", ")}
                  </span>
                </>
              )}
            </ColumnTimelineItem>
          );
        })}
      </ColumnTimeline>
      {!showAll && history.length > 12 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            marginTop: 12, padding: "8px 16px",
            border: "1px solid var(--line)", borderRadius: "var(--radius-sm, 6px)",
            background: "transparent", color: "var(--ink)", cursor: "pointer",
            fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)",
          }}
        >
          전체 {history.length}개월 보기
        </button>
      )}
    </div>
  );
}

/* ── Main ── */
export default function TrendFollowingPage() {
  if (!trendSignalPayload) {
    return (
      <div className="panel-card" style={{ padding: 32, textAlign: "center" }}>
        <h2 className="panel-title">CTA (Commodity Trading Advisor)</h2>
        <p style={{ marginTop: 12, color: "var(--muted)" }}>
          트렌드 팔로잉 신호 데이터가 아직 생성되지 않았습니다.<br />
          파이프라인을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const { signal, backtest, history } = trendSignalPayload;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, margin: "0 auto", padding: "16px" }}>
      <ColumnBackLink to="/_dev_quant">← 퀀트 엿보기</ColumnBackLink>
      <h2 className="panel-title" style={{ fontSize: "clamp(20px, calc(15.8px + 1.1vw), 26px)", marginBottom: 0 }}>
        CTA (Commodity Trading Advisor)
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "clamp(15px, calc(12.4px + 0.7vw), 18px)", margin: 0 }}>
        9개 자산군 ETF에 앗추 필터 적용 — 동일가중 vs CAGR가중 비교
      </p>

      <ReturnsSection equityCurve={backtest?.equityCurve} />
      <SignalSection signal={signal} />
      <CagrWeightsSection cagrWeights={trendSignalPayload.cagrWeights} />
      <WhatIsSection />
      <WallStreetSection />
      <LimitationsSection />
      <Year2022Section />
      <PerformanceSection backtest={backtest} />
      <HistorySection history={history} />

      <ColumnWarningCard>
        이 트렌드 팔로잉 전략은 기관급 CTA의 <strong>대폭 간소화 버전</strong>이며, 개인 학습·참고용입니다.
        숏 포지션 불가로 Crisis Alpha가 없고, 9개 ETF만 사용하여 분산이 제한적입니다.
        과거 성과가 미래 수익을 보장하지 않으며, 투자 판단의 책임은 본인에게 있습니다.
      </ColumnWarningCard>
    </div>
  );
}
