import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnResearchCard,
  ColumnCompareTable,
  ColumnMythFact,
  ColumnWarningCard,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  {
    value: "20~70년",
    label: "슈퍼 사이클 완전 주기",
    desc: "트러프-트러프 기준 (Jacks, NBER 2013)",
  },
  {
    value: "4번",
    label: "1850년 이후 확인된 사이클 수",
    desc: "산업혁명 → 전후 복구 → 재산업화 → 중국",
  },
  {
    value: "300%+",
    label: "2000년대 구리 가격 상승률",
    desc: "중국 WTO 가입(2001) → 2011년 절정까지",
  },
];

export default function SuperCyclePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title={<>20년에 한 번 오는 거대한 파도<br />— 슈퍼 사이클</>}
        desc="중국이 원자재를 삼켰고, AI가 반도체를 삼키고 있다. 역사상 4번 반복된 장기 사이클의 메커니즘."
      />

      <ColumnCallout label="경기 침체가 와도 계속 오르는 자산이 있다">
        일반적인 경기 사이클은 2~8년 주기로 반복된다. 그런데 그 위에는 더 거대한 파도가 있다.<br /><br />
        <strong>슈퍼 사이클(Super Cycle)</strong>은 특정 자산군이 10~35년 동안 지속적으로 상승하는 장기 현상이다.
        단순 경기 호황이 아니다. 거대 경제권의 산업화·도시화라는 구조적 수요 충격이 공급의 대응 속도를
        수십 년 앞서갈 때 발생한다.<br /><br />
        추세를 따르는 투자자에게 슈퍼 사이클은 가장 큰 기회다.
        200일 이평선 위에서 수년간 포지션을 유지할 수 있는, 추세추종 전략이 가장 빛나는 시장이기 때문이다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>슈퍼 사이클이란 무엇인가</ColumnSectionTitle>

      <ColumnCallout label="David Jacks (NBER, 2013) — 163년 데이터의 정의">
        사이먼 프레이저 대학교의 David Jacks 교수는 1850년부터 2013년까지 40개 원자재 상품을 분석한
        NBER 논문에서 슈퍼 사이클을 다음과 같이 정의했다.<br /><br />
        <strong>슈퍼 사이클 = 광범위한 원자재 가격의 동시적·장기적 상승·하락 현상.</strong><br />
        상승기만 10~35년, 완전 사이클(저점→저점)은 20~70년.<br /><br />
        핵심 동인은 두 가지다:<br />
        1. <strong>수요 충격</strong>: 미국·독일·일본·중국 같은 거대 경제권이 급속 산업화·도시화에 진입할 때 발생하는 원자재 수요 폭발.<br />
        2. <strong>공급 지연</strong>: 광산 개발, 인프라 건설, 생산 설비 확충에는 수년~수십 년이 필요. 수요가 공급을 장기간 앞서 가격이 지속 상승한다.<br /><br />
        163년 데이터에서 슈퍼 사이클은 예외가 아니라 반복되는 규칙이었다.
      </ColumnCallout>

      <ColumnSectionTitle>역사상 4번 반복된 패턴</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="1906~1923년" title="제1 사이클 — 미국·유럽 산업혁명">
          미국과 유럽의 철도 확장, 제철·석탄 산업 급성장.
          도시화 가속으로 건설·소재 수요가 폭발했다.
          석탄·철광석·강철 가격이 약 17년간 대세 상승. 이 사이클이 끝날 때 미국은 세계 최대 공업국이 되었다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1933~1955년" title="제2 사이클 — 재무장과 전후 복구">
          1930년대 나치 독일의 재무장과 일본의 군사 확장으로 원자재 수요가 먼저 급등했다.
          이후 2차 대전 전후 유럽·일본 재건이 22년에 걸친 소재·에너지·건설 수요를 이어갔다.
          미국이 마샬 플랜으로 유럽에 $130억(현재 가치 약 $1,700억)을 공급했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1968~1982년" title="제3 사이클 — 재산업화와 오일 쇼크">
          유럽·일본의 전후 경제 고도성장이 마무리되는 시기, 에너지·원자재 수요가 구조적으로 공급을 초과했다.
          1973년 1차, 1979년 2차 오일 쇼크가 겹치며 에너지 가격이 폭등.
          금 가격은 온스당 $35(1968)에서 $850(1980)으로 약 24배 상승했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2000~2014년" title="제4 사이클 — 중국 대폭발">
          2001년 12월 중국의 WTO 가입이 분수령이었다.
          도시화율 35% → 50% 상승 과정에서 중국은 세계 원자재의 절반 이상을 소비하기 시작했다.
          구리: $1,000/t(2001) → $10,000/t(2011), 철광석: $10/t → $187/t으로 각각 300%, 1,770% 상승.
          호주·브라질·캐나다 등 자원 수출국이 구조적 강세장을 경험했다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnSectionTitle>저명한 투자자들이 본 슈퍼 사이클</ColumnSectionTitle>

      <ColumnResearchCard
        title="Hot Commodities (2004) — 상품 투자 선언"
        author="Jim Rogers (Quantum Fund 공동창업자, Rogers Commodity Index 창설자)"
        year="2004"
        source="Rogers Commodity Index Fund (RYMF)"
        stat="Rogers Commodity Index: 설립 이후 +165%, 당시 전 자산군 최고 성과 인덱스"
      >
        짐 로저스는 조지 소로스와 함께 Quantum Fund를 공동창업한 전설적 투자자다.
        그는 1998년 상품 슈퍼 사이클의 시작을 선언하고, 2004년 "Hot Commodities"에서 논리를 공개했다.<br /><br />
        핵심 주장: 역사적으로 상품 약세장은 17~22년 지속됐고, 새 강세장은 그만큼 길다.
        수요보다 <strong>공급 제약이 더 중요한 동인</strong>이다.
        중국의 13억 인구가 산업화에 진입하면 어떤 공급도 따라올 수 없다.<br /><br />
        그는 말과 행동이 일치했다. 가족과 함께 싱가포르로 이주하며 "21세기는 아시아의 세기"라고 선언했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="2023 Commodity Outlook: An Underinvested Supercycle"
        author="Jeff Currie (Goldman Sachs Global Head of Commodities Research)"
        year="2022~2023"
        source="Goldman Sachs Research"
        stat="S&P GSCI 상품지수 43% 수익률 예측 — '구경제의 복수(Revenge of the Old Economy)'"
      >
        2022년 Goldman Sachs의 상품 연구 수장 Jeff Currie는 새로운 슈퍼 사이클 진입을 선언했다.<br /><br />
        근거: 2010년대 내내 에너지·광업 분야에 대한 만성적 저투자(Chronic Underinvestment)가 진행됐다.
        그 결과 공급 인프라가 위축된 상태에서 경기 회복 수요가 V자형으로 돌아왔다.
        수요 충격 × 구조적 공급 제약 = 새 슈퍼 사이클.<br /><br />
        Goldman은 이 사이클이 약 10년 지속될 것으로 전망했다. 에너지·농산물·금속 전반에 걸친
        광범위한 상승이 예상된다고 분석했다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="From Boom to Bust: A Typology of Real Commodity Prices in the Long Run"
        author="David S. Jacks (Simon Fraser University)"
        year="2013"
        source="NBER Working Paper 18874 / Cliometrica (2019 출판)"
        stat="1850~2013년 40개 상품 163년 분석 — 슈퍼 사이클 평균 주기 30~35년 확인"
      >
        학술적으로 가장 광범위하게 인용되는 슈퍼 사이클 연구다.
        2011년 생산 기준 $8.72조 규모의 40개 상품을 163년에 걸쳐 분석했다.<br /><br />
        핵심 발견: 슈퍼 사이클은 역사적 이상 현상이 아니라 반복되는 규칙적 패턴이다.
        산업화·도시화와 같은 거대 수요 충격이 반드시 선행된다.
        현재의 AI·반도체 수요 급증도 이 프레임으로 이해할 수 있다.
      </ColumnResearchCard>

      <ColumnSectionTitle>슈퍼 사이클과 섹터·국가 투자</ColumnSectionTitle>

      <ColumnCallout label="슈퍼 사이클은 특정 섹터와 국가를 수십 년간 밀어올린다">
        슈퍼 사이클의 혜택은 모든 자산에 균등하지 않다.
        수요 충격의 수혜 섹터가 뚜렷하게 존재하고,
        그 섹터의 비중이 높은 국가가 구조적 강세장을 경험한다.<br /><br />
        2000년대 철광석 슈퍼 사이클에서 자원 수출 비중이 높던 호주(ASX 200)는
        미국 S&P500을 수년간 앞섰다.
        2020년대 AI 반도체 슈퍼 사이클에서 KOSPI와 대만 가권지수가 구조적으로 강한 이유도 같은 논리다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["슈퍼 사이클", "핵심 수혜 섹터", "강세 국가 사례"]}
        rows={[
          ["1906~1923 산업혁명", { value: "철강·석탄·철도" }, { value: "미국·영국·독일" }],
          ["1933~1955 전후 복구", { value: "소재·에너지·건설" }, { value: "미국·독일·일본" }],
          ["1968~1982 재산업화", { value: "에너지·금·원자재" }, { value: "산유국(OPEC)·호주" }],
          ["2000~2014 중국 붐", { value: "광업·에너지·소재" }, { value: "호주·브라질·캐나다", highlight: true }],
          ["2020s AI 반도체", { value: "반도체·AI 인프라", highlight: true }, { value: "한국·대만·미국(빅테크)", highlight: true }],
        ]}
      />

      <ColumnCallout label="2020년대: AI 반도체 슈퍼 사이클이 한국·대만을 밀어올린다">
        글로벌 반도체 산업 매출: 2024년 $6,300억 → 2026년 $9,100억 예상.
        30년 만에 처음으로 3년 연속 두 자릿수 성장이 예상되는 구간이다.<br /><br />
        <strong>한국 — HBM(고대역폭 메모리) 독점</strong><br />
        삼성전자·SK하이닉스가 공급하는 HBM은 Nvidia GPU에 탑재되는 AI 연산의 핵심 부품이다.
        KOSPI에서 반도체 비중은 25~30%에 달한다.
        AI 수요가 계속되는 한, 한국 지수는 구조적 수혜를 받는다.<br /><br />
        <strong>대만 — 로직칩 + 패키징 병목 독점</strong><br />
        TSMC는 Nvidia의 CoWoS(Chip-on-Wafer-on-Substrate) 패키징 용량을 지배한다.
        AI 칩의 최종 완성은 TSMC 없이 불가능하다. 이것이 단순 성장주가 아닌 슈퍼 사이클 수혜다.<br /><br />
        <strong>국가 모멘텀 전략과의 연결</strong><br />
        EWY(한국 ETF), EWT(대만 ETF)는 AI 반도체 슈퍼 사이클 수혜를 가장 직접적으로 받는 국가 ETF다.
        추세추종 기반의 국가 모멘텀 전략에서 자연스럽게 상위 순위를 차지하는 구간이 발생한다.
      </ColumnCallout>

      <ColumnSectionTitle>추세추종과 슈퍼 사이클: 가장 잘 맞는 전략</ColumnSectionTitle>

      <ColumnCallout label="슈퍼 사이클은 추세추종자의 이상적인 시장">
        일반적인 경기 사이클(2~8년)은 200일 이평선 전략이 포착하기에는 짧고 노이즈가 많다.
        그런데 슈퍼 사이클의 상승기(10~35년)는 다르다.<br /><br />
        200일 이평선이 수년간 우상향을 유지한다.
        추세추종 전략이 수년간 포지션을 유지하며 복리 수익을 누적할 수 있다.
        공급 제약으로 인한 가격 상승은 일시적 모멘텀이 아닌 구조적 추세다.<br /><br />
        실제로 CTA(Commodity Trading Advisor) 헤지펀드들은 2000년대 원자재 슈퍼 사이클에서
        주식·채권 대비 압도적 성과를 기록했다. 이 기간 Barclay CTA Index는 연평균 7~12%를 기록하며
        S&P500을 꾸준히 앞섰다.<br /><br />
        <strong>슈퍼 사이클을 예측할 필요가 없다. 이미 200일 이평선 위에 올라와 있다면,
        그 자산이 슈퍼 사이클을 타고 있든 아니든 추세는 추세다.</strong>
      </ColumnCallout>

      <ColumnMythFact
        myth="슈퍼 사이클이라면 지금 당장 해당 원자재·섹터에 집중 투자해야 한다"
        fact="슈퍼 사이클의 시작과 끝은 사전에 알 수 없다. Goldman Sachs의 2023년 43% 원자재 상승 예측은 크게 빗나갔다. 슈퍼 사이클을 '예측'하는 것이 아니라, 이미 200일 이평선 위에서 추세가 살아있는 자산을 따르는 것이 현실적 전략이다."
      />

      <ColumnWarningCard
        title="슈퍼 사이클 투자의 함정"
        example="2011년 절정 직전, '중국 성장은 멈추지 않는다'는 컨센서스 — 그 해 철광석 가격은 고점을 찍고 3년 뒤 85% 폭락했다"
      >
        모든 전문가가 슈퍼 사이클을 외칠 때는 이미 고점 부근일 가능성이 높다.
        2011년 중국 슈퍼 사이클 절정 직전, 자원 수출국의 주식시장은 역사적 고점에 있었고
        "원자재 슈퍼 사이클은 수십 년 더 계속된다"는 리포트가 쏟아졌다.<br /><br />
        2026년 현재, 세계은행은 원자재 가격이 6년 저점으로 하락 중임을 보고했다.
        IMF도 2010년대 원자재 슈퍼 사이클의 종료 단계를 분석한 보고서를 출판했다.<br /><br />
        <strong>슈퍼 사이클 담론이 주류가 됐을 때가 오히려 추세를 점검해야 할 시점이다.</strong>
        가격이 200일 이평선 아래로 내려왔다면, 슈퍼 사이클 서사가 아무리 강해도 포지션을 줄이는 게 맞다.
      </ColumnWarningCard>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
