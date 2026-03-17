import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnPullQuote,
  ColumnStatGrid,
  ColumnAllocationBar,
  ColumnSectionTitle,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "40년+", label: "운용 기간", desc: "브리지워터 어소시에이츠" },
  { value: "4번", label: "마이너스 기록 횟수", desc: "40년간 통계" },
  { value: "~7%", label: "연평균 수익률", desc: "물가 조정 후 실질 수익" },
];

const ALLOCATION = [
  { label: "주식 (S&P500 등)", pct: 30, color: "#3b82f6" },
  { label: "장기 국채", pct: 40, color: "#10b981" },
  { label: "중기 국채", pct: 15, color: "#6366f1" },
  { label: "금", pct: 7.5, color: "#f59e0b" },
  { label: "원자재", pct: 7.5, color: "#ef4444" },
];

export default function AllWeatherPortfolioPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title="달리오의 올웨더: 40년간 4번만 마이너스"
        desc="주식 30% + 장기채 40% + 중기채 15% + 금 7.5% + 원자재 7.5%. 위험 기반 분산의 원리."
      />

      <ColumnPullQuote
        attribution="Ray Dalio"
        role="브리지워터 어소시에이츠 창립자"
      >
        현금은 쓰레기다. 하지만 제대로 분산하면 어떤 폭풍도 버틸 수 있다.
      </ColumnPullQuote>

      <ColumnStatGrid stats={STATS} />

      <ColumnAllocationBar items={ALLOCATION} />

      <ColumnSectionTitle>왜 이 배분인가 — 4계절 경제 대응</ColumnSectionTitle>

      <ColumnCallout label="경제의 4계절에 모두 대응하는 포트폴리오">
        달리오는 경제를 2가지 축(성장/침체, 인플레이션/디플레이션)으로 나눠
        4가지 경제 환경을 정의했습니다.<br /><br />
        <strong>경기 상승 + 인플레이션:</strong> 주식, 원자재 수혜<br />
        <strong>경기 상승 + 디플레이션:</strong> 주식, 채권 수혜<br />
        <strong>경기 침체 + 인플레이션:</strong> 금, 원자재 수혜<br />
        <strong>경기 침체 + 디플레이션:</strong> 채권, 금 수혜<br /><br />
        이 4가지에 모두 대응하도록 설계된 것이 올웨더 포트폴리오입니다.
      </ColumnCallout>

      <ColumnCallout label="달리오 사이클 가이드와 함께 읽으세요">
        올웨더는 어떤 경제 환경에서도 큰 손실 없이 버티는 전략입니다.
        달리오의 거시경제 사이클 분석과 결합하면 현재 경제 환경에서
        어떤 자산이 유리한지 더 명확하게 볼 수 있습니다.
        <strong>추세 신호와 올웨더를 결합하면 공격과 방어를 동시에 갖출 수 있습니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
