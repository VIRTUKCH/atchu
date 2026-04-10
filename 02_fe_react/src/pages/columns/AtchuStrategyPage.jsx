import React from "react";
import { Link } from "react-router-dom";
import { getFaqMeta } from "../../config/faqItems";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnFlowCard,
  ColumnTipBox,
  ColumnBackLink,
  ColumnCompareTable,
  ColumnMythFact,
} from "../../components/column";

const FILTER_STATS = [
  { value: "20일", label: "관찰 기간", desc: "최근 20거래일의 종가를 확인한다" },
  { value: "16일", label: "통과 기준", desc: "16일 이상 200일선 위면 '추세 유효'" },
  { value: "연 1~2회", label: "평균 매매 횟수", desc: "잡음을 걸러내 불필요한 매매를 최소화" },
];

const BENEFIT_STATS = [
  { value: "수수료 절감", label: "비용 우위", desc: "잦은 매매 없이 비용 누수를 차단" },
  { value: "일에 집중", label: "심리적 여유", desc: "시장을 매일 확인하지 않아도 됨" },
  { value: "규칙 기반", label: "감정 배제", desc: "사야 할지 말아야 할지 고민이 사라진다" },
];

const meta = getFaqMeta("/atchu_strategy");

export default function AtchuStrategyPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      {/* ── 앗추 필터 소개 ── */}
      <ColumnCallout label="한 줄 요약">
        앗추 필터는 <strong>최근 20거래일 중 16거래일 이상</strong> 종가가
        200일 이동평균선 위에 있을 때 통과합니다.<br /><br />
        통과하면 상승 추세, 이탈하면 추세 약화.<br />
        <strong>이 지표를 매매 판단의 참고로 활용할 수 있습니다.</strong><br /><br />
        하루 이틀 이평선 아래로 내려갔다고 바로 반응하지 않습니다.
        충분한 기간 동안 추세를 확인한 후에야 신호를 바꿉니다.
        그래서 이름이 '필터'입니다 — 잡음을 걸러냅니다.
      </ColumnCallout>

      <ColumnFlowCard
        title="앗추 필터 판단 흐름"
        step={{ icon: "●", label: "최근 20거래일 확인", sub: "종가가 200일 이동평균선 위에 있었던 날을 셉니다" }}
        branches={[
          { label: "16일 이상 (80%)", text: "추세 유효 → 보유 또는 매수", variant: "good" },
          { label: "15일 이하", text: "추세 약화 → 매도 검토", variant: "bad" },
        ]}
      />

      <ColumnStatGrid stats={FILTER_STATS} />

      {/* ── 왜 단순 교차가 아닌가 ── */}
      <ColumnSectionTitle>200일선 돌파했는데 또 빠졌다면</ColumnSectionTitle>

      <ColumnCallout label="채찍질(Whipsaw)">
        200일선을 하루 넘었다가, 다음 날 다시 아래로 내려오는 일은
        횡보장에서 수시로 일어납니다.<br /><br />
        단순 교차를 기준으로 삼으면 오늘 매수, 내일 매도가 반복됩니다.
        매매할 때마다 수수료가 쌓이고, 심리적으로도 지칩니다.
        이것을 '채찍질(whipsaw)'이라고 부릅니다.<br /><br />
        앗추 필터는 이 잡음을 걸러냅니다.
        20일 중 16일이라는 <strong>여유 기간</strong>을 두어,
        진짜 추세 전환과 일시적 변동을 구분합니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["항목", "단순 MA200 교차", "앗추 필터"]}
        rows={[
          [
            "연간 매매 횟수",
            { value: "수십 회 (횡보장)", bad: true },
            { value: "평균 1~2회", highlight: true },
          ],
          [
            "수수료·슬리피지",
            { value: "반복 발생", bad: true },
            { value: "크게 줄어듦", highlight: true },
          ],
          [
            "횡보장 대응",
            { value: "채찍질 반복", bad: true },
            { value: "잡음 필터링", highlight: true },
          ],
          [
            "심리적 부담",
            { value: "매일 시장 확인", bad: true },
            { value: "신호 드물어 안정적", highlight: true },
          ],
        ]}
      />

      <ColumnStatGrid stats={BENEFIT_STATS} />

      {/* ── 앗추의 철학 ── */}
      <ColumnSectionTitle>앗추가 지키려는 것</ColumnSectionTitle>

      <ColumnCallout label="설계 원칙">
        앗추는 개별주를 다루지 않습니다.
        실적 쇼크, 오너 리스크처럼 이동평균선이 막을 수 없는 위험이 있기 때문입니다.
        분산된 ETF만 다룹니다.<br /><br />
        <strong>이 서비스를 믿고 따랐다가 크게 다치는 일이 없어야 합니다.</strong><br /><br />
        복잡한 지표는 쓰지 않습니다.
        200일선 하나, 16/20 규칙 하나.
        누구나 이해할 수 있고, 누구나 검증할 수 있는 기준만 사용합니다.
        데이터는 전부 공개되어 있습니다. 직접 확인하세요.
      </ColumnCallout>

      <ColumnTipBox icon="[>]">
        앗추 필터 기준 실제 매매 이력은 모두 기록되어 있습니다.{" "}
        <Link to="/trend_list/SPY">SPY 추세 조회 상세</Link>에서
        과거 매수·매도 시점과 수익률을 직접 확인할 수 있습니다.
      </ColumnTipBox>

      <ColumnMythFact
        myth="200일선을 넘으면 바로 사야 한다"
        fact="하루 이틀의 돌파는 잡음일 수 있습니다. 앗추 필터는 20거래일 중 16일 이상 200일선 위에 있을 때만 추세가 유효하다고 판단합니다. 성급한 진입을 막고, 안정적인 상승 추세가 확인될 때만 지표를 업데이트합니다."
      />

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
