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
  ColumnMythFact,
  ColumnWarningCard,
  ColumnBackLink,
  ColumnStepList,
  ColumnStepItem,
  ColumnPersonCard,
  ColumnCardList,
} from "../../components/column";

const STATS = [
  {
    value: "70%",
    label: "가계 소비가 미국 GDP에서 차지하는 비중",
    desc: "FRED, St. Louis Fed — 미국 경제의 가장 큰 엔진",
  },
  {
    value: "C+I+G+NX",
    label: "케인지안 GDP 항등식",
    desc: "소비·투자·정부지출·순수출. 5개 행위자의 역할이 모두 담긴 공식",
  },
  {
    value: "4¢",
    label: "주가 $1 상승 시 가계 소비 증가분",
    desc: "Ludvigson & Steindel (1999) Fed Working Paper — 부의 효과",
  },
];

const PLAYERS = [
  {
    name: "① 연준 (Federal Reserve)",
    sub: "미국의 중앙은행 · 1913년 설립",
    badge: "통화정책 담당",
    content: (
      <>
        은행들의 은행. 두 가지 핵심 수단으로 경제를 조절한다.<br /><br />
        <strong>기준금리(Federal Funds Rate)</strong>: 단기 자금의 가격을 결정한다.
        금리를 올리면 돈이 비싸져 소비·투자가 둔화한다. 내리면 반대 방향이다.
        연방공개시장위원회(FOMC)가 8주마다 모여 결정한다.<br /><br />
        <strong>대차대조표 운용 (QE / QT)</strong>: 국채와 주택담보증권(MBS)을 사고 팔아
        장기금리와 시중 유동성을 직접 조절한다. 달러를 전자적으로 창조할 수 있는
        법적 권한을 가진 유일한 기관이다.
      </>
    ),
  },
  {
    name: "② 재무부 (US Treasury)",
    sub: "행정부 산하 재정 담당 부처",
    badge: "재정정책 담당",
    content: (
      <>
        세금을 거두고 정부 지출(G)을 집행한다. 재원이 부족할 때는
        <strong> 국채(T-Bill · T-Note · T-Bond)</strong>를 발행해 시장에서 빌린다.<br /><br />
        연준과 공식적으로 독립적이지만, 재무부의 대규모 국채 발행과 연준의 QE가
        맞물릴 때 사실상 재정·통화정책이 협력하는 구조가 된다.
        (2020년 코로나 대응 시 $5조+ 재정 지출과 연준 $4조 국채 매입이 동시에 진행된 것이 대표 사례.)<br /><br />
        <strong>10년물 국채 수익률(10Y Treasury Yield)</strong>이 전 세계 무위험 금리의
        기준이 되는 이유가 바로 재무부다. 이 금리가 오르면 모든 자산의 할인율이 올라
        주식 밸류에이션이 내려간다.
      </>
    ),
  },
  {
    name: "③ 시중 은행 (Commercial Banks)",
    sub: "JP모건 · 뱅크오브아메리카 · 웰스파고 등",
    badge: "신용 창조 담당",
    content: (
      <>
        연준에서 내려온 유동성을 기업과 가계에 대출로 뿌린다.
        이 과정에서 새로운 신용이 창조된다.<br /><br />
        <strong>부분지급준비제도(Fractional Reserve Banking)</strong>: 예금의 일부만
        지급준비금으로 보유하고 나머지를 대출한다. 이 대출이 다시 예금이 되고,
        그 예금의 일부가 또 대출되어 — 처음 유입된 돈보다 훨씬 많은 신용이 경제에 풀린다.<br /><br />
        핵심 역할: <strong>연준의 통화정책이 실물경제에 전달되는 파이프다.</strong>
        QE를 해도 은행이 대출 기준을 강화하면 유동성은 실물에 도달하지 않는다.
        2008~2012년 연준이 대차대조표를 4배 늘렸지만 인플레이션이 낮게 유지된 이유가 이것이다.
        은행들이 대출 대신 연준 계좌에 초과지준을 쌓아뒀기 때문이다.
      </>
    ),
  },
  {
    name: "④ 기업 (Corporations / S&P 500)",
    sub: "미국 상장기업 · GDP의 I(투자) 담당",
    badge: "투자·고용 담당",
    content: (
      <>
        GDP 공식의 <strong>I(Investment, 투자)</strong>를 담당한다.
        은행에서 대출을 받거나, 주식·사채를 발행해 공장·설비·R&D에 투자한다.<br /><br />
        고용을 창출함으로써 가계 소득을 만든다. 그 소득이 다시 소비(C)로 순환한다.
        기업 → 가계 → 기업으로 이어지는 순환의 핵심 고리다.<br /><br />
        <strong>주가는 미래 기업 이익(EPS)의 현재가치다.</strong>
        결국 EPS는 C + I + G + NX의 함수다. 경제가 성장해야 기업이 팔고,
        기업이 팔아야 이익이 나고, 이익이 나야 주가가 올라간다.
      </>
    ),
  },
  {
    name: "⑤ 가계 (Households)",
    sub: "미국 소비자 · GDP의 C(소비) 70% 담당",
    badge: "소비 담당 — GDP의 70%",
    content: (
      <>
        미국 경제의 가장 큰 엔진이다. 가계 소비(C)가 GDP의 약 70%를 차지한다.<br /><br />
        가계는 두 가지 경로로 경제와 연결된다.
        <br />① <strong>소비</strong>: 기업 매출 → 기업 이익 → 주가로 이어진다.
        <br />② <strong>저축·투자</strong>: 은행 예금이 되어 기업 대출의 재원이 된다.<br /><br />
        <strong>부의 효과(Wealth Effect)</strong>: 주가가 오르면 가계는 자산 가치가 늘었다고
        체감해 소비를 늘린다. Ludvigson & Steindel(1999)의 Fed 연구에 따르면
        주가 $1 상승이 가계 소비를 약 4센트 늘린다. 반대로 주가가 급락하면
        가계는 지갑을 닫고 경기 침체가 빨라진다. 2008년 S&P 500 -55%, 2009년 소비 급감이 그 사례다.
      </>
    ),
  },
];

export default function UsEconomyPlayersPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제 기초"
        title={<>미국 경제를 움직이는<br />5개의 톱니바퀴</>}
        desc="연준·재무부·은행·기업·가계 — 이 다섯이 어떻게 연결되어 주식시장을 만드는가"
      />

      <ColumnCallout label="GDP 뉴스, 금리, QE/QT — 이 모든 것을 이해하는 하나의 프레임">
        경제 뉴스를 보면 "연준이 금리를 올렸다", "재무부가 국채를 발행했다",
        "소비자신뢰지수가 하락했다"는 말이 쏟아진다.
        개별 용어를 알아도 전체 그림이 없으면 이 정보들이 주식시장에
        왜 영향을 미치는지 파악하기 어렵다.<br /><br />
        미국 경제는 <strong>5개의 핵심 행위자(Actor)</strong>로 구성된다.
        이 5개가 어떻게 연결되어 있는지를 이해하면
        대부분의 거시경제 뉴스를 스스로 해석할 수 있다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>경제학 교과서의 출발점 — GDP = C + I + G + NX</ColumnSectionTitle>

      <ColumnCallout label="국민소득 항등식이 5개 행위자의 역할을 가르쳐준다">
        케인지안 거시경제학의 핵심 공식이다. 한 나라의 GDP(국내총생산)는 네 가지 지출의 합이다.<br /><br />
        <strong>C (소비, Consumption)</strong>: 가계가 상품·서비스에 쓰는 돈. 미국 GDP의 약 70%.<br />
        <strong>I (투자, Investment)</strong>: 기업이 공장·설비·재고·R&D에 쓰는 돈.<br />
        <strong>G (정부지출, Government Spending)</strong>: 재무부가 집행하는 국방·복지·인프라 지출.<br />
        <strong>NX (순수출, Net Exports)</strong>: 수출 - 수입. 무역수지.<br /><br />
        이 공식이 왜 중요한가.
        <strong> S&P 500 기업의 매출은 결국 C + I + G + NX에서 나온다.</strong>
        가계가 소비를 줄이거나(C↓), 기업이 투자를 멈추거나(I↓),
        정부가 긴축하거나(G↓) 하면 기업 실적이 타격을 받고 주가가 내려간다.
        연준과 재무부의 정책이 결국 이 공식의 각 항목을 올리거나 내리기 위한 수단이다.
      </ColumnCallout>

      <ColumnSectionTitle>5개 행위자와 그 역할</ColumnSectionTitle>

      <ColumnCardList>
        {PLAYERS.map((p) => (
          <ColumnPersonCard
            key={p.name}
            name={p.name}
            sub={p.sub}
            badge={p.badge}
          >
            {p.content}
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      <ColumnSectionTitle>5개 톱니바퀴가 맞물리는 방식 — 자금의 순환</ColumnSectionTitle>

      <ColumnCallout label="한 행위자의 변화는 나머지 넷에게 전달된다">
        5개 행위자는 독립적으로 존재하지 않는다. 한 방향으로 연결된 순환 고리다.
        어느 한 고리가 약해지면 전체 순환이 느려지고, 강해지면 빨라진다.
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="재무부가 국채를 발행한다">
          정부 지출(G) 자금을 조달하기 위해 국채를 발행해 시장에서 빌린다.
          국채 발행이 늘어나면 공급 증가로 채권 가격이 내려가고(= 수익률 상승),
          이것이 전체 금리 환경에 영향을 미친다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="연준이 금리를 조정하고 유동성을 공급한다">
          기준금리 조정과 QE/QT로 단기·장기 금리를 조절한다.
          금리를 낮추면 돈을 빌리는 비용이 줄어들어 기업 투자와 가계 대출이 늘어난다.
          QE는 국채를 사들여 장기금리를 직접 낮추고 은행 지준을 늘린다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="시중 은행이 기업과 가계에 대출을 제공한다">
          연준의 유동성이 실물경제로 전달되는 파이프다.
          금리가 낮아지고 지준이 충분해지면 은행은 대출을 늘린다.
          반대로 불확실성이 높아지면 대출 기준을 강화해 유동성 전달이 막힌다.
        </ColumnStepItem>
        <ColumnStepItem step={4} title="기업이 투자하고 고용을 늘린다">
          은행 대출과 자본시장을 통해 자금을 조달한 기업이 I(투자)를 늘린다.
          투자는 고용을 만들고, 고용은 가계 소득을 만든다.
          이 단계에서 GDP의 I가 커진다.
        </ColumnStepItem>
        <ColumnStepItem step={5} title="가계가 소비한다">
          소득이 생긴 가계가 상품·서비스를 구매한다. 이것이 C(소비)다.
          소비가 늘어나면 기업 매출이 올라가고 → 기업 이익(EPS)이 증가한다.
          EPS 상승은 주가 상승의 가장 직접적인 원인이다.
        </ColumnStepItem>
        <ColumnStepItem step={6} title="주가가 오르고 부의 효과로 소비가 다시 늘어난다">
          EPS↑ → S&P 500↑ → 가계 자산가치↑ → 소비 추가 증가.
          이 자기강화 순환(Self-reinforcing Cycle)이 경기 확장 국면의 핵심 메커니즘이다.
          반대 방향으로 작동하면 경기 수축 나선(Deflationary Spiral)이 된다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnSectionTitle>학술 논문이 밝힌 세 가지 전달 경로</ColumnSectionTitle>

      <ColumnResearchCard
        title="은행 대출 채널: 연방기금금리와 통화정책 전달 경로"
        author="Ben Bernanke · Alan Blinder (프린스턴대 · 프린스턴대)"
        year="1992"
        source="American Economic Review, Vol. 82, No. 4, pp. 901–921"
        stat="연방기금금리가 향후 실물경제 변수(실업·생산)를 가장 잘 예측하는 단일 지표"
      >
        연준의 금리 변화는 단순히 이자 비용만 바꾸는 게 아니다.
        은행이 대출 여부를 결정하는 <strong>신용 공급 자체를 바꾼다.</strong><br /><br />
        금리 인상 → 은행 대출 기준 강화 → 기업 투자(I) 감소 → 고용 감소 → 가계 소득 감소 → 소비(C) 감소.
        이 경로를 <strong>은행 대출 채널(Bank Lending Channel)</strong>이라 한다.<br /><br />
        버냉키와 블라인더의 연구는 금리가 단순한 가격 신호가 아니라,
        은행 시스템을 통해 실물경제에 전달되는 신용량을 통제하는 수단임을 실증했다.
        이것이 "연준이 왜 은행을 감독하는가"에 대한 학술적 근거가 됐다.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="통화정책과 자산가격 변동성 — 금융 가속기 이론"
        author="Ben Bernanke · Mark Gertler (프린스턴대 · 뉴욕대)"
        year="1999"
        source="Federal Reserve Bank of Kansas City / NBER Working Paper No. 7559"
        stat="자산가격 상승 → 기업 담보가치 개선 → 외부 자금조달 비용 하락 → 투자 가속"
      >
        주가 상승은 투자자의 수익에 그치지 않는다. 기업의 대차대조표를 개선한다.<br /><br />
        주가↑ → 기업 보유 자산(주식·부동산) 가치↑ → 담보로 더 많이 빌릴 수 있음 →
        투자(I)↑ → 기업 이익↑ → 주가 추가 상승.
        이 자기강화 메커니즘을 <strong>금융 가속기(Financial Accelerator)</strong>라 한다.<br /><br />
        반대 방향도 동일하게 작동한다. 주가 폭락 → 담보가치 하락 → 신용 긴축 →
        기업 투자 급감 → 주가 추가 하락. 2008년 금융위기가 빠르게 실물경제를 덮친
        이유가 이 가속기 때문이었다. 자산가격과 실물경제가 서로를 강화하는 피드백 루프.
      </ColumnResearchCard>

      <ColumnResearchCard
        title="경제 기계는 어떻게 작동하는가 (How the Economic Machine Works)"
        author="Ray Dalio (Bridgewater Associates 창업자)"
        year="2013"
        source="economicprinciples.org — YouTube 3,000만+ 조회"
        stat="'경제는 단순한 거래의 합이다. 신용이 지출을 만들고, 지출이 소득을 만든다.'"
      >
        달리오는 복잡해 보이는 경제를 하나의 원리로 요약한다:
        <strong> 경제 = 거래의 합</strong>. 모든 거래에서 구매자는 돈(또는 신용)을 주고,
        판매자는 상품·서비스·자산을 준다.<br /><br />
        핵심은 두 개의 사이클:<br />
        <strong>단기 경기 사이클(5~8년)</strong>: 신용 확장 → 경기 호황 → 과열 → 연준 금리 인상 → 수축 → 금리 인하.<br />
        <strong>장기 부채 사이클(75~100년)</strong>: 수십 년에 걸친 신용 팽창 → 부채 부담 임계점 →
        대규모 부채 축소(Deleveraging). 1929년 대공황, 2008년 금융위기가 대표 사례.<br /><br />
        지금 이 두 사이클의 어느 위치에 있는지를 파악하는 것이
        달리오가 말하는 거시 투자의 출발점이다.
      </ColumnResearchCard>

      <ColumnSectionTitle>5개 행위자가 충돌할 때 — 2020~2022년 사례 분석</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="2020년 봄" title="5개 행위자 동시 팽창 — 에브리씽 랠리">
          재무부 $5조+ 재정 지원(C·G 동시 부양) + 연준 대차대조표 $4조→$9조(QE) +
          은행 대출 완화 + 기업 투자 준비 + 가계 저축·현금 급증.
          5개 행위자가 모두 같은 방향으로 움직였다.
          S&P 500은 2020년 3월 저점에서 2021년 말까지 +110% 상승했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2021년 말" title="가계 소비 과열 — 인플레이션 발화">
          가계가 보유한 과잉 저축이 소비(C)로 폭발했다.
          공급망 병목과 맞물려 인플레이션이 8.9%(2022년 6월)에 달했다.
          5개 행위자 중 하나(가계 소비)의 과속이 전체 균형을 무너뜨리기 시작했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2022년" title="연준의 방향 전환 — 5개 행위자 재조정">
          연준이 기준금리를 0%→4.5%로, 대차대조표를 $8.9조→$6.5조로 축소(QT).
          은행 대출 기준 강화 → 기업 투자(I) 위축 → 밸류에이션 압박.
          가계 모기지·카드 대출 이자 급증 → 소비(C) 둔화.
          S&P 500은 -18.1% 하락했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2023~2024년" title="기업이 순환을 다시 이끌다 — AI 투자 붐">
          AI 인프라 투자 급증으로 기업의 I(투자)가 팽창했다.
          노동시장이 견조해 가계 소득과 소비(C)가 유지됐다.
          연준이 금리를 동결하며 은행 대출 여건이 안정됐다.
          S&P 500은 2024년 신고점을 경신했다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnSectionTitle>투자자가 이 프레임으로 모니터할 5가지 지표</ColumnSectionTitle>

      <ColumnCallout label="5개 행위자를 추적하는 5개 지표">
        <strong>① 연준</strong>: 기준금리 + FOMC 점도표(Dot Plot) — 향후 금리 경로를 가늠한다.<br />
        <strong>② 재무부</strong>: 10년물 국채 수익률(10Y Treasury Yield) + 재정적자 규모 — 할인율과 정부 지출 방향.<br />
        <strong>③ 은행</strong>: Senior Loan Officer Opinion Survey(SLOOS) — 대출 기준이 강화되면 신용 긴축 신호.<br />
        <strong>④ 기업</strong>: S&P 500 EPS 성장률 전망 + 설비투자(CapEx) 트렌드 — 실적이 주가의 최종 기반.<br />
        <strong>⑤ 가계</strong>: 소비자신뢰지수(Conference Board) + 개인 저축률 — 소비 엔진의 연료 수준.<br /><br />
        이 5개 지표가 동시에 팽창하는 방향을 가리킬 때 경기는 가속한다.
        하나씩 방향이 엇갈리기 시작할 때 순환의 전환이 가까워진다.
      </ColumnCallout>

      <ColumnMythFact
        myth="연준이 금리를 내리면 주식시장은 오른다. 간단한 공식이다."
        fact="금리 인하가 주가 상승으로 이어지려면 은행이 실제로 대출을 늘리고, 기업이 투자하고, 가계가 소비해야 한다. 2001~2002년 닷컴 버블 붕괴 시 연준이 금리를 6.5%→1.75%로 공격적으로 내렸지만 S&P 500은 추가 -23% 하락했다. 기업 실적과 신용 환경이 뒷받침되지 않으면 금리 인하만으로는 부족하다. 5개 행위자 전체의 방향이 맞아야 한다."
      />

      <ColumnWarningCard
        title="5개 행위자가 모두 같은 방향을 볼 때가 가장 위험하다"
        example="2020~2021: 연준 QE + 재무부 대규모 재정 + 은행 대출 완화 + 기업 낙관 + 가계 소비 폭발 → '에브리씽 버블' → 2022년 급격한 조정"
      >
        5개 행위자가 모두 팽창 방향으로 움직일 때 자산가격 버블이 형성된다.
        그리고 이 버블이 꺼질 때는 반드시 하나 이상의 행위자가 방향을 틀면서 시작된다.<br /><br />
        2022년에는 연준(금리 인상 + QT)이 먼저 방향을 틀었다.
        그것만으로도 나머지 행위자들의 균형이 무너지기 시작했다.<br /><br />
        <strong>거시 리스크 관리의 핵심은 5개 행위자 중 누가 흔들리기 시작하는지를 먼저 알아채는 것이다.</strong>
        주가 예측이 아니라, 순환의 균열이 어디서 시작되는지를 모니터하는 것.
      </ColumnWarningCard>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
