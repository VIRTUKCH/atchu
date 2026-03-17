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
  ColumnHighlight,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const INVESTORS = [
  {
    name: "폴 튜더 존스",
    nameEn: "Paul Tudor Jones",
    title: "튜더 인베스트먼트 설립자 · 헤지펀드 매니저",
    quote:
      "내가 보는 모든 것의 기준은 200일 이동평균선이다.",
    quoteEn:
      "My metric for everything I look at is the 200-day moving average of closing prices.",
    highlight: "1987년 블랙 먼데이 대폭락 당시 200일선 이탈을 근거로 대응했다고 알려짐",
  },
  {
    name: "에드 세이코타",
    nameEn: "Ed Seykota",
    title: "추세추종 트레이더 · Market Wizards 수록",
    quote:
      "추세는 친구다. 그리고 이동평균선은 그 친구의 얼굴을 보여준다.",
    quoteEn: "Trend is your friend. Moving averages show you which way your friend is facing.",
    highlight: "이동평균 기반 시스템을 핵심 도구로 사용해온 추세추종 트레이더",
  },
  {
    name: "마티 슈워츠",
    nameEn: "Marty Schwartz",
    title: "챔피언십 트레이더 · Market Wizards 수록",
    quote:
      "이동평균선은 내가 매수 측에 있어야 하는지 매도 측에 있어야 하는지 알려주는 가장 빠른 방법이다.",
    quoteEn:
      "Moving averages are the fastest way to tell me whether I should be on the buy side or sell side.",
    highlight: "미국 트레이딩 챔피언십에서 높은 수익률을 기록한 것으로 알려진 트레이더",
  },
  {
    name: "메브 파버",
    nameEn: "Mebane Faber",
    title: "Cambria Investment 공동 창립자 · 퀀트 전략가",
    quote:
      "10개월(약 200일) 이동평균선 위에 있을 때 매수, 아래일 때 현금 보유. 단순하지만 데이터가 증명하는 전략이다.",
    quoteEn:
      "Buy when above the 10-month moving average, hold cash when below. Simple, and the data proves it works.",
    highlight:
      "학술 논문을 통해 이 전략의 과거 데이터를 분석한 퀀트 연구자. 미래를 보장하지는 않음.",
  },
  {
    name: "찰리 멍거",
    nameEn: "Charlie Munger",
    title: "버크셔 해서웨이 부회장 · 워런 버핏의 50년 파트너",
    quote:
      "좋은 주식을 200주 이동평균선에서 매수하기만 해도 S&P 500을 큰 폭으로 이길 수 있다. 문제는 그런 규율을 갖춘 사람이 거의 없다는 것이다.",
    quoteEn:
      "If all you ever did was buy high-quality stocks on the 200-week moving average, you would beat the S&P 500 by a large margin over time. The problem is, few human beings have that kind of discipline.",
    highlight: "200일이 아닌 200주(약 4년) 이평선 — 극단적 장기 관점. 다만 1차 출처가 공식적으로 확인되지 않은 인용문.",
  },
];

const STATS = [
  {
    label: "최대 낙폭 감소 (백테스트)",
    value: "~50%",
    desc: "200일선 전략 백테스트에서 Buy & Hold 대비 최대 낙폭이 절반 수준으로 나타난 연구가 있음. 과거 데이터 기준.",
  },
  {
    label: "시장 신호로 활용된 기간",
    value: "70년+",
    desc: "1950년대 리처드 도나키안이 체계화한 이후 현재까지 일부 투자자들이 활용",
  },
  {
    label: "폴 튜더 존스 운용 수익 (알려진 수치)",
    value: "5,000%+",
    desc: "1980년 이후 누적 수익률로 일부 매체에서 보도된 수치. 200일선 외에도 다양한 전략을 복합적으로 사용함.",
  },
];

const meta = getFaqMeta("/moving_average_faq");

export default function MovingAverageFaqPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      <ColumnCallout label="이런 시각도 있습니다">
        일부 유명 투자자들은 이 지표를 수익 극대화보다{" "}
        <strong>큰 손실을 피하는 리스크 관리 도구</strong>로 활용해왔다고 말합니다.
        200일 이동평균선을 기준으로 포지션을 관리하면 역사적 대폭락 구간에서
        손실 노출을 줄였다는 백테스트 데이터도 있습니다. 단, 과거 데이터가 미래를 보장하지는 않습니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>유명 투자자들이 직접 한 말</ColumnSectionTitle>

      <ColumnCardList>
        {INVESTORS.map((inv) => (
          <ColumnPersonCard key={inv.nameEn} name={inv.name} sub={inv.title}>
            <ColumnQuote en={inv.quoteEn}>"{inv.quote}"</ColumnQuote>
            <ColumnHighlight>{inv.highlight}</ColumnHighlight>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
