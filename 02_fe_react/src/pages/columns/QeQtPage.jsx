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
  ColumnStepList,
  ColumnStepItem,
  ColumnPullQuote,
  ColumnPersonCard,
  ColumnCardList,
} from "../../components/column";

const STATS = [
  {
    value: "10배",
    label: "연준 대차대조표 팽창",
    desc: "2008년 $0.9조 → 2022년 $8.9조",
  },
  {
    value: "+22%",
    label: "QE3 S&P 500 프리미엄",
    desc: "QE3 없었을 경우 대비 초과 수익 추정",
  },
  {
    value: "-9.1%",
    label: "QT 10% 축소 시 주식 수익률",
    desc: "Tālis Putniņš, Financial Analysts Journal 2020",
  },
];

const INVESTORS = [
  {
    name: "레이 달리오",
    sub: "Bridgewater Associates 창업자",
    badge: "빅 데트 사이클",
    content: (
      <>
        달리오는 QE를 부채 사이클의 핵심 도구로 본다.
        경제가 침체하면 중앙은행이 금리를 0으로 내리고, 그것도 부족하면 QE로 유동성을 직접 주입한다.
        이 과정에서 자산가격이 올라 레버리지가 축적된다.<br /><br />
        그러나 QT로 전환하면 그동안 쌓인 레버리지가 급격히 청산되며 충격이 증폭된다.
        달리오는 특히 <strong>"버블 속 자극"</strong>을 경고한다 —
        이미 자산가격이 과열된 상황에서 다시 QE를 시작하면
        부채 사이클의 가장 위험한 마지막 단계에 진입한다는 것이다.
      </>
    ),
  },
  {
    name: "하워드 마크스",
    sub: "Oaktree Capital 공동창업자",
    badge: "마스터링 더 마켓 사이클",
    content: (
      <>
        마크스는 QE가 시장의 가격 발견 기능을 근본적으로 왜곡한다고 본다.
        그의 표현을 빌리면, <strong>"우리는 자유 시장이 아니다."</strong><br /><br />
        "정부가 금리를 0%로 설정하면, 투자자들은 3% 수익률을 천국이라 생각해 몰려든다.
        위험을 제대로 평가하지 않고 수익률 사냥에 나선다."<br /><br />
        QE가 만든 저금리 환경은 자산 전반의 밸류에이션을 인위적으로 끌어올렸다.
        QT가 이 왜곡을 되돌리는 과정은 불가피하게 고통스럽다고 마크스는 경고한다.
      </>
    ),
  },
  {
    name: "제레미 그랜썸",
    sub: "GMO 공동창업자",
    badge: "슈퍼버블 경고",
    content: (
      <>
        그랜썸은 10년간 지속된 QE가 역사적으로 유례없는 <strong>동시 자산 버블</strong>을 만들었다고 주장한다.
        채권·주식·부동산이 동시에 과열된 "슈퍼버블"이다.<br /><br />
        2022년 GMO 리포트에서 그는 이렇게 썼다:
        "QT와 금리 인상의 시작이 슈퍼버블의 첫 번째 붕괴 신호다.
        이전 세 개의 미국 슈퍼버블(1929, 2000, 2008)은 모두 연준의 긴축과 함께 터졌다."<br /><br />
        그는 2022년 하락이 시작에 불과하다고 경고했으나, 이후 AI 랠리로 시장은 신고점을 경신했다.
        버블 판단은 맞았어도, 타이밍 예측의 어려움을 잘 보여주는 사례다.
      </>
    ),
  },
];

export default function QeQtPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="통화정책"
        title={<>주식 한다면 꼭 알아야 할 개념<br />QE(양적완화) · QT(양적긴축)</>}
        desc="연준이 채권을 사고 파는 행위가 어떻게 주식시장 전체를 움직이는가 — 2008년부터 지금까지"
      />

      <ColumnCallout label="돈을 찍는 게 아니라 채권을 사는 것이다">
        2008년 금융위기 이후, 연준은 기준금리가 0%에 도달해도 경제가 살아나지 않자
        전례 없는 수단을 꺼냈다. 국채와 모기지 채권을 직접 사들여 시장에 돈을 주입하는 것 —
        <strong> 양적완화(Quantitative Easing, QE)</strong>다.<br /><br />
        그 반대, 시중에 풀린 유동성을 다시 흡수하는 것이 <strong>양적긴축(Quantitative Tightening, QT)</strong>이다.
        이 두 정책의 사이클은 지난 15년간 주식시장의 가장 강력한 거시적 변수였다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnSectionTitle>양적완화(QE)란 무엇인가</ColumnSectionTitle>

      <ColumnCallout label="제로 금리 이후의 비전통적 통화정책">
        전통적인 통화정책은 기준금리를 올리고 내리는 것이다.
        그런데 금리가 이미 0%에 도달하면(제로하한, Zero Lower Bound) 더 이상 내릴 수 없다.
        이 막다른 골목에서 중앙은행이 선택한 대안이 QE다.<br /><br />
        연준은 시중 금융기관이 보유한 국채와 주택담보증권(MBS)을 사들이고,
        그 대가로 은행 지급준비금(reserve)을 늘려준다.
        중앙은행의 대차대조표가 팽창한다는 뜻에서 "대차대조표 정책(Balance Sheet Policy)"이라고도 한다.
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="연준이 국채·MBS를 매입한다">
          금융기관이 보유한 장기채권을 연준이 사들인다.
          시중에 풀린 채권 물량이 줄어들고, 채권 가격이 오른다(= 수익률 하락).
          10년물 국채 금리는 QE를 통해 평균 약 1%p 하락한 것으로 추정된다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="은행 지급준비금이 증가한다">
          연준이 채권을 사고 지불한 돈이 은행 계좌에 쌓인다.
          은행 입장에서는 보유 현금(지준)이 늘어난 셈이다.
          시중 유동성이 물리적으로 증가한다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="장기금리가 하락하고 대출 비용이 낮아진다">
          국채 수익률 하락은 기업 회사채, 주택담보대출 금리 등 다른 장기금리에도 영향을 미친다.
          기업의 자금 조달 비용이 낮아지고, 소비자의 모기지 이자 부담도 줄어든다.
        </ColumnStepItem>
        <ColumnStepItem step={4} title="투자자들이 주식 등 위험자산으로 이동한다">
          국채 수익률이 낮아지면 안전자산에 묶인 돈의 매력이 떨어진다.
          투자자들은 더 높은 수익을 찾아 주식·부동산·신흥국 채권으로 이동한다.
          이것이 <strong>포트폴리오 밸런스 효과(Portfolio Balance Effect)</strong>다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnSectionTitle>역사 속 QE — 위기의 소방수 4번</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="QE1 (2008.11~2010.3)" title="리먼 쇼크 대응 — MBS $6천억 매입">
          2008년 9월 리먼브라더스 파산 직후 신용시장이 완전히 얼어붙었다.
          연준은 11월부터 주택담보증권(MBS)과 국채를 매입하기 시작했다.
          S&P 500은 2009년 3월 바닥(666포인트)을 찍고 반등을 시작했다.
          QE1은 금융 시스템 붕괴를 막는 소방수 역할을 했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="QE2 (2010.11~2011.6)" title="더블딥 예방 — 국채 $6천억 추가">
          QE1 종료 후 경기 회복이 기대에 미치지 못했다.
          버냉키 연준 의장은 2010년 잭슨홀 연설에서 추가 부양 의지를 공개적으로 밝혔고,
          11월에 $6천억 국채 매입 프로그램을 발표했다.
          S&P 500은 발표 당일부터 랠리를 시작해 약 8개월간 상승했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="QE3 (2012.9~2014.10)" title="완전고용 목표 — 월 $850억 무기한">
          2012년 9월, 연준은 처음으로 "목표 달성까지 무기한(open-ended)" QE를 선언했다.
          매달 MBS $400억 + 국채 $450억, 총 $850억 매입.
          이 시기 S&P 500은 QE가 없었을 경우 대비 최대 22%의 프리미엄을 기록한 것으로 연구됐다.
          2013년 12월부터 테이퍼링(매입 규모 축소)을 시작해 2014년 10월 완전 종료했다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="코로나 QE (2020.3~2022.3)" title="팬데믹 대응 — $4조→$8.9조 초고속 팽창">
          2020년 3월, 코로나 충격으로 S&P 500이 -34% 폭락하자 연준은 역대 가장 빠른 속도로
          대차대조표를 팽창시켰다. 단 2개월 만에 $1.5조가 추가됐다.
          이후 2022년 3월까지 대차대조표는 $4조에서 $8.9조로 두 배 이상 팽창했다.
          2020년 3~5월 S&P 500 반등(+31%)의 약 1/3~1/2이 연준의 대차대조표 팽창으로 설명된다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnResearchCard
        title="양적완화와 새로운 통화정책 도구"
        author="Ben Bernanke (前 연준 의장, 2022년 노벨경제학상 수상)"
        year="2010 / 2020"
        source="Jackson Hole 연설 (2010) / American Economic Review (2020)"
        stat="QE로 10년물 국채 금리 평균 약 1%p 하락 — 연준·BIS 연구 종합"
      >
        버냉키는 2010년 잭슨홀 연설에서 QE의 작동 원리를 명확히 설명했다.
        핵심은 <strong>포트폴리오 밸런스 채널</strong>이다.
        연준이 국채를 흡수하면 투자자들이 비슷한 특성의 다른 자산(주식, 회사채 등)으로 이동한다.
        이 과정에서 자산가격이 올라 소비와 투자가 늘어나며 경기가 회복된다.<br /><br />
        그는 2020년 AER 논문에서 이렇게 결론지었다:
        QE는 정상적인 금융시장 환경에서도 금융 여건을 완화하는 데 효과적이었다.
        단, 효과는 시간이 지남에 따라 점점 희석되는 경향이 있다.
      </ColumnResearchCard>

      <ColumnSectionTitle>왜 QE를 하면 주가가 오르나 — 포트폴리오 밸런스 효과</ColumnSectionTitle>

      <ColumnPullQuote
        attribution="Ben Bernanke"
        role="前 연방준비제도 의장 · 2022년 노벨경제학상 수상자"
      >
        "QE는 이론적으로는 작동하지 않는다. 하지만 실제로는 작동한다."
      </ColumnPullQuote>

      <ColumnCallout label="위험자산으로의 강제 이주 메커니즘">
        포트폴리오 밸런스 효과는 간단한 논리다.
        연준이 국채를 대량 매입하면 시중에 국채 물량이 줄어든다.
        기존에 국채를 보유하던 투자자들은 팔고 나서 비슷한 수익률의 대안을 찾아야 한다.
        그런데 국채 수익률은 이미 낮아졌으니 국채 수준의 안전 자산으로는 만족하기 어렵다.<br /><br />
        결국 투자자들은 더 높은 수익을 찾아 주식, 회사채, 부동산, 신흥국 자산으로 이동한다.
        이 이동이 자산가격을 밀어올린다.<br /><br />
        <strong>자산가격 상승 → 보유 자산의 가치 증가(부의 효과) → 소비 의향 증가 → 실물경기 회복.</strong>
        이것이 연준이 의도한 QE의 전달 경로다.
      </ColumnCallout>

      <ColumnSectionTitle>양적긴축(QT) — 파티가 끝나는 시간</ColumnSectionTitle>

      <ColumnCallout label="대차대조표를 줄이는 두 가지 방법">
        QT는 QE의 반대 방향이다.
        연준이 보유한 국채의 만기가 도래했을 때 재투자를 중단하거나,
        시장에 채권을 매각하여 대차대조표를 줄인다.<br /><br />
        유동성이 시중에서 흡수되면 장기금리가 올라가고,
        위험자산의 매력이 상대적으로 떨어진다.
        "$1조 달러 QT = 10년물 국채 금리 약 2%p 상승"이라는 연구 결과도 있다.
      </ColumnCallout>

      <ColumnTimeline>
        <ColumnTimelineItem year="QT1 (2017.10~2019.9)" title="첫 번째 긴축 실험 — 2018 Q4 쇼크">
          2017년 10월, 연준은 역사상 처음으로 체계적인 QT를 시작했다.
          초기 월 $100억에서 매 분기 $100억씩 늘려 2018년 중반엔 월 $500억 수준으로 확대했다.
          2018년 4분기, S&P 500은 -20% 급락했다.
          당시 파월 의장의 "자동 조종(autopilot)" 발언과 QT가 맞물리며 시장 충격이 컸다.<br /><br />
          2019년 9월, 레포(Repo) 시장 금리가 하룻밤 사이 9%로 폭등했다.
          금융 시스템의 유동성이 임계 수준까지 줄어든 신호였다.
          연준은 QT를 즉시 중단하고 레포 시장 직접 지원에 나섰다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="QT2 (2022.6~2025.초)" title="역대 최대 규모 — $8.9조→$6.5조">
          2022년 초 인플레이션이 40년 만에 최고(8.9%)에 달하자 연준은 금리 인상과 QT를 동시에 시작했다.
          2022년 6월부터 월 최대 $950억씩 대차대조표를 줄였다. QT1보다 거의 두 배 빠른 속도였다.
          2022년 S&P 500은 -18.1% 하락했다. 단, 금리 인상·지정학 리스크·기술주 밸류에이션 조정 등
          복합 요인이 겹쳐 QT 단독의 효과를 분리하기 어렵다.
          2025년 초 대차대조표는 $6.5조 수준으로 축소됐다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnCompareTable
        columns={["구분", "양적완화 (QE)", "양적긴축 (QT)"]}
        rows={[
          ["목적", "경기 부양 · 위기 대응", "인플레이션 억제"],
          ["수단", "국채 · MBS 매입", "만기 후 재투자 중단 · 매각"],
          ["대차대조표", "팽창 ↑", "축소 ↓"],
          ["장기금리", { value: "하락 ↓", highlight: true }, { value: "상승 ↑", bad: true }],
          ["주식시장", { value: "상승 압력", highlight: true }, { value: "하락 압력", bad: true }],
          ["위험자산 선호", { value: "증가", highlight: true }, { value: "감소", bad: true }],
          ["시행 시기", "경기 침체 · 위기", "인플레이션 과열"],
        ]}
      />

      <ColumnSectionTitle>저명한 투자자들은 어떻게 봤나</ColumnSectionTitle>

      <ColumnCardList>
        {INVESTORS.map((inv) => (
          <ColumnPersonCard
            key={inv.name}
            name={inv.name}
            sub={inv.sub}
            badge={inv.badge}
          >
            {inv.content}
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      <ColumnResearchCard
        title="Free Markets to Fed Markets: QE가 주식시장에 미치는 영향"
        author="Tālis Putniņš (리가 공과대학교 / 호주 테크놀로지대학교)"
        year="2020"
        source="Financial Analysts Journal (2Q 2021)"
        stat="대차대조표 10% 축소 → 주식 수익률 -9.1% (2015~2019년 구간에서는 -16.7%)"
      >
        Putniņš는 2009년부터 2020년까지 연준 대차대조표와 주식시장의 관계를 분석했다.
        핵심 발견은 비대칭성이다. 대차대조표 팽창보다 <strong>축소(QT)에 시장이 더 민감하게 반응</strong>한다.<br /><br />
        QT 구간(2015~2019년) 분석에서 대차대조표 10% 축소는 주식 수익률 -16.7%와 연결됐다.
        반면 QE 팽창 구간에서의 주식 수익률 기여도는 상대적으로 낮았다.
        이는 "오르는 건 천천히, 내리는 건 빠르게"라는 금융시장의 비대칭성을 실증한다.
      </ColumnResearchCard>

      <ColumnSectionTitle>투자자가 알아야 할 것</ColumnSectionTitle>

      <ColumnMythFact
        myth="QE가 시작되면 사고, QT가 시작되면 팔면 된다. 연준 정책만 보면 투자를 이길 수 있다."
        fact="QE1·QE2 시기 주가 상승은 펀더멘털 개선(기업 실적 회복)이 주된 원인이었다. 2022년 QT 때는 금리 인상·지정학 리스크가 복합 작용했다. 연준 정책은 강력한 변수지만, 6~18개월의 시차를 두고 실물에 반영되며 단독으로 작동하지 않는다."
      />

      <ColumnWarningCard
        title="QE/QT를 단기 타이밍 신호로 쓰지 마라"
        example="QT1: 2017년 10월 QT 시작 후 1년간 S&P 500은 오히려 상승했다. 폭락은 1년 뒤 Q4 2018에 왔고, 회복은 QT가 끝나기 전에 시작됐다."
      >
        연준 정책과 시장 반응 사이에는 시차(lag)가 있다.
        QE 발표 직후 시장이 항상 오르는 것도 아니고, QT 직후 항상 내리는 것도 아니다.<br /><br />
        더 중요한 것은 QE/QT가 진행되는 <strong>경제 맥락</strong>이다.
        QT가 경기 과열 억제를 위해 시작됐다면 초기에 기업 실적이 여전히 강할 수 있다.
        반면 QE가 경기 붕괴 방지용이라면 주가는 한동안 더 빠질 수도 있다.<br /><br />
        <strong>추세추종 투자자에게 연준 정책은 매매 신호가 아닌, 흐름의 맥락을 이해하는 도구다.</strong>
        실제 매매는 가격이 200일 이평선 위에 있는지 아래에 있는지가 판단 기준이다.
      </ColumnWarningCard>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
