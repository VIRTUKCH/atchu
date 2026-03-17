import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnCallout,
  ColumnKeyFact,
  ColumnKeyFactGrid,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "1988년", label: "Stage Analysis 출간", desc: "Secrets for Profiting in Bull and Bear Markets — 전 세계 수십만 트레이더가 읽은 추세추종 교과서" },
  { value: "4단계", label: "시장 분석 체계", desc: "Base → Advancing → Distribution → Declining. 모든 종목은 이 사이클을 반복한다" },
  { value: "30주선", label: "핵심 기준선", desc: "≈ 200일 이동평균선. 강세장과 약세장을 가르는 단 하나의 선" },
];

const STAGES = [
  {
    icon: "①",
    value: "Stage 1 — 기저 (Base)",
    label: "200일선 아래에서 횡보 · 매수 금지",
    desc: "주가가 200일선 아래에서 좁게 횡보한다. 추세가 없고 방향이 불분명한 구간. 와인스타인의 원칙: 이 구간에서는 절대 매수하지 않는다.",
  },
  {
    icon: "②",
    value: "Stage 2 — 상승 (Advancing)",
    label: "200일선 위 돌파 + 거래량 증가 · 최적 매수 구간",
    desc: "주가가 200일선 위로 돌파하며 상승 추세를 만든다. 거래량이 평균의 2~3배 이상 증가할 때 신뢰도가 높아진다. 와인스타인이 유일하게 매수를 허용하는 구간.",
  },
  {
    icon: "③",
    value: "Stage 3 — 분배 (Distribution)",
    label: "200일선 근처에서 횡보 · 매도 준비",
    desc: "상승이 멈추고 200일선 부근에서 횡보한다. 큰손 투자자들이 주식을 팔기 시작하는 구간. 보유 중이라면 이 단계에서 매도를 준비해야 한다.",
  },
  {
    icon: "④",
    value: "Stage 4 — 하락 (Declining)",
    label: "200일선 아래 이탈 · 보유 금지",
    desc: "주가가 200일선을 하향 이탈하며 하락 추세로 진입한다. 와인스타인의 원칙: Stage 4 종목은 절대 보유하지 않는다. '싸 보인다'는 이유로 매수하는 것이 가장 위험하다.",
  },
];

export default function StanWeinsteinPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title={<>스탠 와인스타인:<br />"200일선 위면 강세장,<br />아래면 약세장이다"</>}
        desc="1988년, 한 권의 책이 추세추종의 교과서가 됐습니다. Stage Analysis — 4단계로 시장을 읽는 방법."
      />

      <ColumnPullQuote
        attribution="Stan Weinstein"
        role="Secrets for Profiting in Bull and Bear Markets (1988) 저자"
      >
        "Stage 2에서만 사라. Stage 4에 있는 종목을 '싸다'는 이유로 사는 것은 가장 비싼 실수다."
        <br /><br />
        200일선 위에 있는 종목과 아래에 있는 종목을 구분하는 것만으로도
        절반의 실수는 피할 수 있다.
        <br />
        <small>— 책에서 전달한 핵심 원칙 요약 · Secrets for Profiting in Bull and Bear Markets (1988)</small>
      </ColumnPullQuote>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>4단계 분석법 — 모든 종목은 이 사이클을 반복한다</ColumnSectionTitle>

      <ColumnCallout>
        와인스타인이 발견한 것은 단순하다. 시장의 모든 종목은 상승하기 전에 반드시
        <strong> 횡보(Stage 1)</strong>하고, 상승(Stage 2) 후에는 <strong>분배(Stage 3)</strong>를 거쳐
        하락(Stage 4)한다. 그리고 다시 횡보로 돌아간다. 이 사이클을 알면 <strong>'언제 사야 하는가'</strong>와
        <strong> '언제 피해야 하는가'</strong>가 명확해진다.
      </ColumnCallout>

      <ColumnKeyFactGrid>
        {STAGES.map((s) => (
          <ColumnKeyFact
            key={s.value}
            icon={s.icon}
            value={s.value}
            label={s.label}
            desc={s.desc}
          />
        ))}
      </ColumnKeyFactGrid>

      <ColumnSectionTitle>왜 200일선이 기준인가</ColumnSectionTitle>

      <ColumnCallout label="핵심 원칙">
        와인스타인은 처음에 <strong>30주 이동평균선(≈ 200일선)</strong>을 기준으로 사용했다.
        이후 기관 투자자들이 40주선(200일선)을 더 많이 추적하게 되면서
        스스로 기준을 200일선으로 전환했다.
        <br /><br />
        이유는 단순하다. <strong>많은 기관이 같은 선을 본다는 것 자체가 그 선에 힘을 준다.</strong>
        200일선이 지지선/저항선으로 작동하는 이유가 여기에 있다.
      </ColumnCallout>

      <ColumnCallout label="Stage 2 매수가 유리한 이유">
        독립 백테스트(thepatternsite.com 기준)에서 Stage 1(기저 구간) 매수 시
        수익 확률은 <strong>69.3%</strong>인 반면,
        Stage 4(하락 구간) 매수 시 수익 확률은 <strong>24.4%</strong>에 불과했다.
        같은 종목이라도 <strong>어느 단계에서 사느냐</strong>가 수익률을 결정한다.
        <br />
        <small>출처: thepatternsite.com 독립 분석 (Weinstein 공식 데이터 아님)</small>
      </ColumnCallout>

      <ColumnSectionTitle>앗추 필터와의 연결</ColumnSectionTitle>

      <ColumnCallout label="같은 원칙, 다른 구현">
        앗추 필터(최근 20거래일 중 16일 이상 200일선 위)는 와인스타인의 Stage 2 판단과
        같은 원칙을 따른다. <strong>200일선 위에 확실히 자리잡았을 때만 신호를 낸다.</strong>
        <br /><br />
        단순히 "오늘 200일선을 넘었다"는 신호는 잡음이 많다. 20일 중 16일 이상이라는
        조건은 와인스타인이 강조한 <strong>"추세가 확실히 전환됐을 때"</strong>의
        기계적 구현이다.
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
