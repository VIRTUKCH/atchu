import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnResearchCard,
  ColumnCompareRow,
  ColumnCompareTable,
  ColumnTipBox,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  { value: "8.6%", label: "1년 평균 수익률", desc: "200일선 돌파 이후 — 1950년 이후 데이터 기준" },
  { value: "70%", label: "플러스 확률", desc: "200일선 돌파 후 1년 뒤 수익률이 플러스일 확률" },
  { value: "1950년~", label: "검증 기간", desc: "70년+ 역사 데이터로 검증된 통계" },
];

const MA_COMPARE_COLUMNS = ["이평선", "연간 신호 횟수", "주요 문제점"];
const MA_COMPARE_ROWS = [
  [
    { value: "20일 (단기)", dim: true },
    { value: "수십 회", bad: true },
    { value: "노이즈·휩소 다발, 수수료·세금 누적" },
  ],
  [
    { value: "50일 (중기)", dim: true },
    { value: "수~십수 회", bad: true },
    { value: "여전히 잦은 가짜 신호" },
  ],
  [
    { value: "200일 (장기)", highlight: true },
    { value: "연 1-2회", highlight: true },
    { value: "추세의 본질만 포착, 비용 후에도 유효" },
  ],
];

const meta = getFaqMeta("/moving_average_history");

export default function MovingAverageHistoryPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      <ColumnCallout label="숫자가 먼저입니다">
        S&P500이 200일 이동평균선을 돌파한 뒤 1년간의 수익률을 분석하면,
        평균 <strong>8.6%</strong>의 수익이 발생했고 <strong>70%의 확률</strong>로
        플러스를 기록했습니다. 1950년 이후 데이터 기준입니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnResearchCard
        source="역사적 데이터 분석"
        title="200일선 돌파 이후 S&P500 성과 분석"
        stat="돌파 후 1년 평균 수익 8.6%, 플러스 확률 70%"
      >
        1950년부터 S&P500의 200일선 돌파 이후 1년 수익률을 분석한 결과입니다.
        단순 평균보다 높은 이유는 200일선 돌파 자체가 '추세 회복'의 신호이기 때문입니다.
        하락 추세에서 상승으로 전환될 때 특히 강한 수익이 나타납니다.
      </ColumnResearchCard>

      <ColumnCompareRow
        left={{ label: "하락 추세 후 200일선 돌파", value: "+14%", sub: "공황 이후 반등 신호 — 더 강함", variant: "good" }}
        right={{ label: "상승 추세 중 200일선 돌파", value: "+6.6%", sub: "이미 오른 상태에서의 추가 돌파", variant: "neutral" }}
      />

      <ColumnCallout label="기관이 200일선을 쓰는 이유">
        펀드매니저들이 200일선을 기준으로 리스크 온/오프를 결정하기 때문에,
        이 선이 <strong>자기실현적 지지선·저항선</strong>이 됩니다.
        통계적 효과와 집단 행동이 맞물려 200일선의 힘이 만들어집니다.
      </ColumnCallout>

      <ColumnSectionTitle>20일선이나 50일선은 왜 안 쓰나요?</ColumnSectionTitle>

      <ColumnCallout label="신호가 많을수록 비용도, 실수도 늘어납니다">
        200일선은 연간 1-2회 신호를 냅니다. 20일선은 연간 수십 회.
        신호가 많으면 그만큼 매매 기회가 늘어날 것 같지만, 실제로는
        <strong> 노이즈(가짜 신호)가 대부분</strong>입니다.
        매매할 때마다 수수료·세금이 누적되고, 판단 실수도 늘어납니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={MA_COMPARE_COLUMNS}
        rows={MA_COMPARE_ROWS}
      />

      <ColumnResearchCard
        source="학술 연구"
        title="단기 이평선 전략의 거래 비용 문제"
        stat="비용 차감 후 초과 수익 소멸"
      >
        단기 이평선(20일, 50일) 전략은 비용 전 백테스트에서는 그럴듯해 보입니다.
        하지만 실거래에서 발생하는 수수료, 세금, 슬리피지를 반영하면
        초과 수익이 대부분 사라집니다.
        200일선은 거래 횟수가 적어 비용 부담이 낮고, 비용 차감 후에도 유효한
        몇 안 되는 신호 중 하나입니다.
      </ColumnResearchCard>

      <ColumnSectionTitle>앗추가 200일선을 쓰는 진짜 이유</ColumnSectionTitle>

      <ColumnCallout label="투자는 삶의 일부여야 합니다">
        투자가 삶 자체가 되는 순간 삶이 피폐해집니다.
        앗추는 <strong>직장을 다니며 투자하는 사람</strong>을 위한 서비스입니다.
        매일 차트를 확인하고, 단기 신호에 반응하고, 매매를 반복하는 것은
        앗추가 지향하는 방향이 아닙니다.
      </ColumnCallout>

      <ColumnTipBox title="앗추의 매매 구조">
        200일선 기반 전략 → 연간 1-2회 의사결정{"\n"}
        앗추 필터 (20거래일 중 16일 이상) → 추가 필터로 가짜 신호 제거{"\n"}
        → 1년에 한 번 확인해도 충분한 구조
      </ColumnTipBox>

      <ColumnResearchCard
        source="DALBAR 연구"
        title="잦은 매매가 수익률을 갉아먹는다"
        stat="개인투자자 평균 수익률 < 시장 수익률"
      >
        DALBAR의 장기 연구에 따르면, 개인투자자들이 시장 수익률을 밑도는
        핵심 이유는 '잦은 매매'입니다. 시장 상황에 반응해 사고팔수록
        수익률은 오히려 낮아집니다.
        매매 횟수를 줄이는 것 자체가 수익률 향상 전략입니다.
      </ColumnResearchCard>

      <ColumnMythFact
        myth="200일선은 아무 근거 없는 기술적 미신이다"
        fact="100년+ 데이터와 기관 투자자들의 집단 행동이 200일선을 실제로 작동하는 지지선·저항선으로 만듭니다. 미신이 아니라 집단 심리가 만든 자기실현적 지표입니다."
      />

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
