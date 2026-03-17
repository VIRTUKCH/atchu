import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnPersonCard,
  ColumnCardList,
  ColumnQuote,
  ColumnWarningCard,
  ColumnInfoCard,
  ColumnInfoDesc,
  ColumnSolution,
  ColumnDecayExample,
  ColumnFlowCard,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "1,061%",
    label: "25년 누적 수익 (백테스트)",
    desc: "TQQQ + 225일 이평선 전략 (2000~2025) 백테스트 수치. 매수보유(628%) 대비 높게 나타남. 과거 데이터 기준.",
  },
  {
    value: "28.6%",
    label: "최대 낙폭 (백테스트)",
    desc: "같은 전략의 최대 드로우다운 백테스트 수치. 매수보유(83%) 대비 낮게 나타남. 실제 운용과는 다를 수 있음.",
  },
  {
    value: "40년+",
    label: "추세추종 헤지펀드 역사",
    desc: "MAN AHL, Winton 등 추세추종 전문 헤지펀드가 수십 년째 운용 중인 것으로 알려짐",
  },
];

const STRATEGIES = [
  {
    name: "폴 튜더 존스",
    nameEn: "Paul Tudor Jones",
    title: "튜더 인베스트먼트 설립자 · 헤지펀드 매니저",
    approach: "200일 이동평균선 기준",
    detail:
      "200일선 위에 있을 때만 포지션 유지, 아래로 이탈하면 시장에서 나온다는 접근법을 밝힌 바 있습니다. 레버리지에 대해서는 신중한 입장 — \"보상/위험 비율이 극도로 유리한 기회만 레버리지하라.\"",
    source: "Market Wizards · 토니 로빈스 인터뷰",
    quote: "수익은 추세 중간에서 만들어진다. 200일선이 이탈 시점을 알려준다.",
  },
  {
    name: "워터 켈러 (VAA/DAA)",
    nameEn: "Wouter Keller",
    title: "VU University Amsterdam · Flex Capital CEO",
    approach: "학술 검증된 모멘텀 신호",
    detail:
      "절대 모멘텀(추세) + 상대 모멘텀 결합 방식을 연구한 퀀트 연구자입니다. 신호가 없으면 현금·단기채로 전환하는 전략을 제안했습니다. DAA(Defensive Asset Allocation) 논문에서 레버리지 자산에도 이 방법론을 적용한 백테스트 결과를 공개했습니다.",
    source: "SSRN — Vigilant Asset Allocation (2017)",
    quote: "추세 신호가 없으면 현금으로 대피. 강력한 크래시 보호 효과.",
  },
  {
    name: "TQQQ + 이동평균선 전략",
    nameEn: "Leveraged ETF + Trend Signal",
    title: "커뮤니티 실증 연구 · Bogleheads / Financial Wisdom TV",
    approach: "3배 레버리지 ETF + 이평선 신호",
    detail:
      "QQQ가 225일 이평선 위에 있으면 TQQQ(3배 레버리지) 보유, 아래면 현금 전환하는 방식의 25년 백테스트 결과가 커뮤니티에서 공유된 사례입니다. 과거 데이터 기반 시뮬레이션이며 미래를 보장하지 않습니다.",
    source: "Bogleheads 포럼 · Financial Wisdom TV 백테스트 (2000~2025)",
    quote: "수익 1,061% vs 매수보유 628%, 최대 낙폭 28.6% vs 83% (백테스트 수치).",
  },
  {
    name: "코리 호프스타인 (Return Stacking)",
    nameEn: "Corey Hoffstein",
    title: "Newfound Research · Return Stacked® Portfolio Solutions",
    approach: "레버리지 + 추세추종 동시 운용",
    detail:
      "주식 ETF에 선물 기반 추세추종 전략을 레버리지로 얹는 구조를 연구한 운용사입니다. 비상관 자산을 쌓아 포트폴리오 효율성을 높이는 방법론을 제시했습니다.",
    source: "Return Stacked® (2024) · RCM Alternatives 리뷰",
    quote: "레버리지를 지능적으로 써서 비상관 자산을 쌓는다.",
  },
];

const RISKS = [
  {
    title: "시그널 지연",
    desc: "이동평균선은 후행 지표입니다. 추세 전환을 포착하는 데 시간이 걸려, 신호가 나오기 전까지 손실이 누적될 수 있습니다.",
    example: "예: 2022년 초 급락 시 200일선 이탈 신호까지 수 주 소요",
  },
  {
    title: "과최적화(Over-fitting)",
    desc: "백테스트에서 예쁜 결과를 내는 파라미터가 실전에선 다를 수 있습니다. 225일, 200일 등 특정 수치를 맹신하지 마세요.",
    example: "과거 데이터에 맞춘 파라미터는 미래를 보장하지 않음",
  },
  {
    title: "세금 및 거래 비용",
    desc: "추세 신호에 따라 잦은 매매가 발생하면 단기 양도세와 거래 수수료가 누적됩니다. 레버리지 ETF는 운용 보수도 일반 ETF보다 높습니다.",
    example: "TQQQ 연간 운용 보수 약 0.88% (QQQ 0.20% 대비 4배 이상)",
  },
];

export default function LeverageFaqPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자자들의 접근법"
        title={<>추세 추종에 레버리지를<br />사용하면 안 되나요?</>}
        desc="레버리지는 위험하다는 인식이 많지만, 추세 신호를 기반으로 조건부로 활용하는 투자자와 연구자들도 있습니다."
      />

      <ColumnCallout label="이런 접근법도 있습니다">
        일부 투자자와 연구자들은 추세가 확인된 구간에서만 레버리지를 사용하고,
        그렇지 않을 때는 현금 또는 단기채로 전환하는 방법을 씁니다.
        이 접근이 레버리지 ETF의 약점인{" "}
        <strong>변동성 감쇠(Volatility Decay)</strong>를 피하는 데
        도움이 된다는 시각도 있습니다.
      </ColumnCallout>

      <ColumnInfoCard title="레버리지 ETF의 함정">
        <ColumnInfoDesc>
          레버리지 ETF는 <strong>매일의 수익률을 N배로 추적</strong>합니다.
          시장이 꾸준히 오르면 좋지만, <strong>횡보하거나 등락을 반복하면</strong>{" "}
          원금보다 낮은 수준으로 서서히 녹아내리는 현상이 발생할 수 있습니다. 이것이 변동성 감쇠입니다.
        </ColumnInfoDesc>
        <ColumnDecayExample
          rows={[
            { label: "1일차 +10%", value: "레버리지 3배: +30% → 잔고 130", variant: "bad" },
            { label: "2일차 −10%", value: "레버리지 3배: −30% → 잔고 91", variant: "bad" },
          ]}
          note="기초자산은 100 → 99로 1% 손실, 레버리지는 100 → 91로 9% 손실"
        />
        <ColumnSolution>
          <strong>이 시각에서의 해법:</strong> 추세가 살아 있을 때(이평선 위)만 보유 →
          변동성 감쇠가 발생하는 횡보 구간 노출을 줄임
        </ColumnSolution>
      </ColumnInfoCard>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>투자자와 연구자들의 접근법</ColumnSectionTitle>

      <ColumnCardList>
        {STRATEGIES.map((s) => (
          <ColumnPersonCard key={s.nameEn} name={s.name} sub={s.title} badge={s.approach}>
            <p className="col-card-detail">{s.detail}</p>
            <ColumnQuote>"{s.quote}"</ColumnQuote>
            <div className="col-card-source">출처: {s.source}</div>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      <ColumnFlowCard
        title="이 전략의 기본 흐름"
        step={{ icon: "●", label: "추세 확인", sub: "이동평균선 / 모멘텀 신호" }}
        branches={[
          { label: "추세 있음", text: "레버리지 진입 → 상승 구간 참여", variant: "good" },
          { label: "추세 없음", text: "현금·단기채 → 드로우다운 방어", variant: "bad" },
        ]}
      />

      <ColumnSectionTitle>주의해야 할 리스크</ColumnSectionTitle>

      <ColumnCardList>
        {RISKS.map((r) => (
          <ColumnWarningCard key={r.title} title={r.title} example={r.example}>
            {r.desc}
          </ColumnWarningCard>
        ))}
      </ColumnCardList>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
