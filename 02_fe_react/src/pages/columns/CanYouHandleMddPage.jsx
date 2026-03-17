import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnResearchCard,
  ColumnPersonCard,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  {
    value: "-55%",
    label: "S&P 500 최대 낙폭",
    desc: "2007~2009년 금융 위기. 1억이 4,500만 원이 되는 데 17개월이 걸렸다.",
  },
  {
    value: "2배",
    label: "손실의 심리적 무게",
    desc: "Kahneman & Tversky(1979): 같은 금액이라도 손실의 고통은 이익의 기쁨보다 2배 크다.",
  },
  {
    value: "-8.48%p",
    label: "2024년 투자자 vs 시장 격차",
    desc: "DALBAR 2025: 평균 투자자 16.54% vs S&P 500 25.02%. 공포 매도가 주원인.",
  },
];

const meta = getFaqMeta("/can_you_handle_mdd");

export default function CanYouHandleMddPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      {/* ── 흔한 합리화 ── */}
      <ColumnCallout label="흔한 생각">
        "나는 아직 젊다. 시간이 많으니까 떨어져도 기다리면 된다."<br />
        "장기 투자니까 MDD는 신경 안 써도 된다."<br />
        "기다리면 올라오겠지."<br /><br />
        이론적으로는 맞습니다.<br />
        하지만 <strong>실제로 -55%를 경험하면 어떤 일이 벌어지는지</strong>,
        데이터가 보여줍니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 버틸 수 있다는 착각 ── */}
      <ColumnSectionTitle>정말 버틸 수 있을까?</ColumnSectionTitle>

      <ColumnCallout label="-55%는 숫자가 아닙니다">
        1억을 투자했다면 4,500만 원이 됩니다.
        17개월 동안 매일 계좌가 줄어드는 걸 지켜봐야 합니다.<br /><br />
        그 사이에 결혼, 자녀 대학 등록금, 부모님 병원비처럼
        큰 돈이 필요한 일이 생기면 어떨까요?<br /><br />
        "기다리면 된다"는 말은 쉽습니다.
        하지만 <strong>"기다릴 수 있다"와 "기다리면 된다"는 전혀 다른 문제</strong>입니다.
      </ColumnCallout>

      <ColumnResearchCard
        source="Kahneman & Tversky"
        year="1979"
        title="전망 이론 (Prospect Theory)"
        stat="손실의 고통은 같은 크기 이익의 2배"
      >
        100만 원을 벌 때의 기쁨보다, 100만 원을 잃을 때의 고통이 2배 더 큽니다.
        -55%는 숫자만 봐도 크지만, 실제로 경험하면 대부분의 사람은 공포에 매도합니다.
        뇌는 "조금만 더 기다리면"이 아니라 <strong>"더 잃기 전에 나가야 한다"</strong>고 명령합니다.
      </ColumnResearchCard>

      {/* ── DALBAR 증거 ── */}
      <ColumnSectionTitle>데이터가 보여주는 현실</ColumnSectionTitle>

      <ColumnResearchCard
        source="DALBAR Inc."
        year="2025"
        title="Quantitative Analysis of Investor Behavior"
        stat="2024년 개인 투자자 수익률 16.54% vs S&P 500 25.02%"
      >
        매년 발표되는 DALBAR 보고서는 일관된 결론을 보여줍니다:
        개인 투자자의 실제 수익률은 시장 수익률에 크게 못 미칩니다.<br /><br />
        가장 큰 원인은 <strong>하락장에서의 공포 매도</strong>입니다.
        평균 투자자는 2009년 이후 <strong>15년 연속</strong> S&P 500에 뒤처졌습니다.
        매매 타이밍을 맞힌 비율(Guess Right Ratio)은 25% — 4번 중 3번은 틀린 시점에 행동했습니다.
      </ColumnResearchCard>

      <ColumnCallout label="시간이 많아도 소용없는 이유">
        "아직 젊으니까 시간이 해결해준다"는 논리는
        <strong>끝까지 들고 있을 수 있다는 전제</strong>에서만 성립합니다.<br /><br />
        DALBAR 데이터가 보여주듯, 대부분의 투자자는 끝까지 들고 있지 못합니다.
        -30%쯤에서 공포에 팔고, 반등하면 뒤늦게 다시 사고, 결국 시장보다 뒤처집니다.<br /><br />
        시간이 많은 것과 버틸 수 있는 것은 다른 문제입니다.
        <strong>MDD가 크면, 시간이 아무리 많아도 공포 매도를 피할 수 없습니다.</strong>
      </ColumnCallout>

      {/* ── 전문가 ── */}
      <ColumnSectionTitle>전문가들이 말하는 MDD</ColumnSectionTitle>

      <ColumnPersonCard
        name="Paul Tudor Jones"
        sub="Tudor Investment Corporation 설립자 · 순자산 ~$74억"
        badge="방어 우선"
      >
        "가장 중요한 규칙은 방어다. 공격이 아니다."<br />
        수익률을 높이는 것보다 손실을 줄이는 것이 먼저라는 원칙.
        200일선 아래에 있는 자산을 보유하지 않는 이유가 여기 있다.
      </ColumnPersonCard>

      <ColumnPersonCard
        name="Warren Buffett"
        sub="Berkshire Hathaway 회장 · 순자산 ~$1,300억"
        badge="손실 회피"
      >
        "투자의 첫 번째 규칙은 돈을 잃지 않는 것이다.
        두 번째 규칙은 첫 번째 규칙을 잊지 않는 것이다."<br />
        수익률보다 자본 보존이 먼저라는 같은 메시지.
      </ColumnPersonCard>

      <ColumnMythFact
        myth="아직 젊으니까 MDD는 신경 안 써도 된다"
        fact="DALBAR 데이터에 따르면 개인 투자자는 15년 연속 시장 수익률에 뒤처졌습니다. 가장 큰 원인은 하락장에서의 공포 매도입니다. 시간이 많아도 MDD가 크면 버티지 못하고, 버티지 못하면 시간의 효과도 사라집니다."
      />

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
