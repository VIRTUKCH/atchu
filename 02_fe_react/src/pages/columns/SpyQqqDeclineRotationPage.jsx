import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnResearchCard,
  ColumnCompareTable,
  ColumnMythFact,
  ColumnSectionTitle,
  ColumnWarningCard,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  {
    value: "-55%",
    label: "2008 금융 위기 S&P 500",
    desc: "신용 시스템 붕괴. 섹터·국가 가리지 않고 대부분의 자산이 동반 하락했다.",
  },
  {
    value: "3주",
    label: "2020 코로나 급락 속도",
    desc: "약 3주 만에 200일선 이탈. 이평선 신호는 후행 지표라 급격한 사건에는 반응이 늦다.",
  },
  {
    value: "연 1~2회",
    label: "앗추 필터 평균 매매 횟수",
    desc: "잡음을 줄이는 대신, 빠른 반응은 포기한 설계. 이것이 장점이자 한계다.",
  },
];

const meta = getFaqMeta("/spy_qqq_decline_rotation");

export default function SpyQqqDeclineRotationPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      {/* ── 한계 인정 ── */}
      <ColumnCallout label="솔직하게 말하겠습니다">
        앗추 필터는 200일 이동평균선 기반입니다.
        이동평균선은 <strong>후행 지표</strong>입니다.
        과거 데이터를 기반으로 추세를 판단하기 때문에,
        급격한 하락에는 반응이 늦을 수밖에 없습니다.<br /><br />
        2020년 코로나 급락은 약 3주 만에 200일선을 이탈했습니다.
        필터가 신호를 보내기 전에 이미 상당한 하락이 진행된 후였습니다.<br /><br />
        앗추 필터는 <strong>모든 하락을 막아주는 도구가 아닙니다.</strong>
        횡보장의 잡음을 줄이고, 큰 추세를 따라가는 데 최적화된 규칙입니다.
        이 한계를 아는 것이 올바르게 사용하는 첫걸음입니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 2008 글로벌 위기 ── */}
      <ColumnSectionTitle>모든 자산이 함께 떨어질 때</ColumnSectionTitle>

      <ColumnCallout label="2008년 글로벌 금융 위기">
        2008년은 다른 하락장과 근본적으로 달랐습니다.
        신용 시스템 자체가 붕괴하면서, 자산 간 상관관계가 일시적으로 급등했습니다.
        에너지, 국가, 개별주 할 것 없이 대부분이 동반 하락했습니다.<br /><br />
        이럴 때는 섹터·국가 로테이션이 의미가 없습니다.
        <strong>거의 모든 자산이 200일선 아래라면, 현금이 포지션입니다.</strong><br /><br />
        앗추의 시장 개요 페이지에서 대부분의 자산이 200일선 아래에 있다면,
        그것 자체가 <strong>"지금은 쉬라"는 신호</strong>입니다.
      </ColumnCallout>

      <ColumnWarningCard title="쉬는 것도 전략입니다">
        반드시 어딘가에 투자해야 한다는 법은 없습니다.
        억지로 상승 추세를 찾아 나서면 오히려 약한 추세에 물릴 위험이 높아집니다.{"\n"}
        {"\n"}
        다시 추세가 살아나면 앗추 필터가 알려줍니다.
        그때까지는 기다리는 것이 가장 현명한 전략일 수 있습니다.
      </ColumnWarningCard>

      {/* ── 그래도 작동하는 경우 ── */}
      <ColumnSectionTitle>그러나, 항상 모든 것이 함께 떨어지는 건 아닙니다</ColumnSectionTitle>

      <ColumnCallout label="하락의 원인이 섹터마다 다를 때">
        모든 하락장이 2008년 같지는 않습니다.
        하락의 원인이 특정 섹터에 집중될 때는, 다른 섹터가 오히려 수혜를 입기도 합니다.<br /><br />
        <strong>2000~2002 닷컴 버블:</strong> 기술주가 -78% 폭락하는 동안,
        소비재(Consumer Staples)는 +31%를 기록했습니다.
        사람들이 코카콜라를 마시고 P&G 샴푸를 쓰는 것을 멈추지는 않았습니다.<br /><br />
        <strong>2022년:</strong> 금리 인상으로 QQQ가 -33% 떨어지는 동안,
        XLE(에너지 ETF)는 +64%를 기록했습니다.
        같은 해, 같은 미국 시장에서 97%p 격차가 발생했습니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["자산", "2022년 성과", "비고"]}
        rows={[
          ["QQQ (나스닥 100)", { value: "-33%", bad: true }, "금리 인상 → 성장주 타격"],
          ["SPY (S&P 500)", { value: "-19%" }, "전반적 하락장"],
          ["XLP (소비재)", { value: "-0.5%" }, "방어적 유지"],
          ["XLE (에너지)", { value: "+64%", highlight: true }, "러시아-우크라이나 → 에너지 수혜"],
        ]}
      />

      <ColumnCallout label="핵심은 구분입니다">
        대세 하락장에서도 기회가 있을 <strong>수는</strong> 있습니다.
        하지만 그 전에 먼저 확인해야 할 것이 있습니다.<br /><br />
        <strong>1. 대부분의 자산이 200일선 아래인가?</strong><br />
        → 그렇다면 2008년형 글로벌 위기일 수 있습니다. 쉬세요.<br /><br />
        <strong>2. 특정 섹터만 무너지고 다른 섹터는 200일선 위인가?</strong><br />
        → 2022년형 섹터 차별화일 수 있습니다. 추세가 살아있는 자산은 유효합니다.<br /><br />
        앗추의 시장 개요 페이지에서 이 구분을 한눈에 확인할 수 있습니다.
      </ColumnCallout>

      {/* ── 학술 근거 ── */}
      <ColumnSectionTitle>학술 연구가 말하는 것</ColumnSectionTitle>

      <ColumnResearchCard
        source="Journal of Finance"
        year="1999"
        title="Do Industries Explain Momentum?"
        author="Tobias Moskowitz · Mark Grinblatt"
        stat="섹터 모멘텀이 개별주 모멘텀의 상당 부분을 설명"
      >
        개별주 모멘텀의 상당 부분이 사실 섹터 모멘텀이었습니다.
        섹터 효과를 제거하면 개별주 모멘텀은 크게 약해졌습니다.
        이는 하락장에서 개별주를 찾기보다
        <strong>강한 섹터 ETF 단위로 접근하는 것이 더 일관적</strong>임을 시사합니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Journal of Finance"
        year="2013"
        title="Value and Momentum Everywhere"
        author="Clifford Asness · Tobias Moskowitz · Lasse Pedersen (AQR Capital)"
        stat="8개 자산군 전반에서 모멘텀 프리미엄 확인"
      >
        모멘텀 프리미엄은 특정 자산군에 국한되지 않고 보편적으로 존재합니다.
        단, 이 프리미엄이 <strong>글로벌 위기 시에는 크게 약해진다</strong>는 점도
        같은 논문에서 확인됩니다. 평상시의 근거를 위기에 그대로 적용할 수 없다는 뜻입니다.
      </ColumnResearchCard>

      {/* ── 결론 ── */}
      <ColumnMythFact
        myth="앗추 필터를 따르면 하락장에서도 안전하다"
        fact="앗추 필터는 후행 지표입니다. 급격한 하락에는 반응이 늦고, 글로벌 위기(2008년형)에서는 섹터 로테이션도 효과가 제한됩니다. 대부분의 자산이 200일선 아래면 현금이 답이고, 쉬는 것도 전략입니다."
      />

      <ColumnTipBox title="앗추에서 확인하는 방법">
        시장 개요 페이지에서 자산군별 앗추 필터 통과 비율을 확인하세요.{"\n"}
        통과 비율이 낮을수록 시장 전반의 추세가 약한 상태입니다.{"\n"}
        이때는 무리하게 진입하지 않는 것이 과거 데이터가 보여주는 교훈입니다.
      </ColumnTipBox>

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
