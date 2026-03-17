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
  ColumnFlowCard,
  ColumnCompareTable,
  ColumnWarningCard,
  ColumnMythFact,
  ColumnBackLink,
  ColumnStepList,
  ColumnStepItem,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  {
    value: "3~12개월",
    label: "모멘텀 지속 기간",
    desc: "Jegadeesh & Titman (1993) — 상승 추세는 수개월간 지속. 40개국 이상에서 반복 검증됨",
  },
  {
    value: "상위 7%",
    label: "수익 주도 거래 비율",
    desc: "Zarattini et al. (2024), 66,000+ 거래 — 소수의 대형 추세가 전체 수익을 결정. 중간 진입도 핵심 수익 캡처 가능",
  },
  {
    value: "3.8배",
    label: "200일선 아래 변동성",
    desc: "Ned Davis Research — Russell 2000: 200일선 위 7% vs 아래 26.5%. 200일선 위 = 리스크 3.8배 낮음",
  },
];

const ENTRY_EXPERTS = [
  {
    name: "스탠 와인스타인",
    nameEn: "Stan Weinstein",
    title:
      "스테이지 분석 창시자 · 《Secrets for Profiting in Bull and Bear Markets》 저자",
    quote:
      "Stage 2(상승 추세)에 있는 주식은 어느 시점에서도 매수할 수 있다. 핵심은 Stage 2에 있느냐, 없느냐다.",
    quoteEn:
      "Any stock that is in a Stage 2 advance is a legitimate buy candidate. The key is whether it's in Stage 2 or not.",
    highlight:
      "와인스타인의 Stage 2 = 주가가 상승하는 30주(약 150일) MA 위에 위치. 앗추 필터의 '20일 중 16일 이상 200일선 위' 조건이 Stage 2 확인 역할을 한다. 돌파 직후가 가장 이상적이지만, Stage 2 내라면 어디서든 진입 가능하다는 것이 그의 핵심 주장이다.",
  },
  {
    name: "폴 튜더 존스",
    nameEn: "Paul Tudor Jones",
    title: "튜더 인베스트먼트 설립자 · 순자산 ~$74억",
    quote:
      "200일 이동평균 규칙을 사용하면 빠져나올 수 있다. 방어를 하는 것이다.",
    quoteEn:
      "If you use the 200-day moving average rule, then you get out. You play defense, and you get out.",
    highlight:
      "1987년 블랙먼데이 직전 200일선 이탈을 확인하고 전량 매도. 진입 시점과 무관하게, 추세 이탈 신호가 나오면 즉시 대응한다는 원칙. 이 규칙은 돌파 시 진입했든 중간에 진입했든 동일하게 적용된다.",
  },
];

const meta = getFaqMeta("/atchu_filter_sell_criteria");

export default function AtchuFilterSellCriteriaPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      <ColumnCallout label="앗추의 기본 전제">
        앗추 서비스의 핵심 원칙은 명확합니다.{" "}
        <strong>앗추 필터를 처음 돌파하는 시점에 매수하는 것이 가장 이상적입니다.</strong>{" "}
        그때 진입하면 추세의 시작부터 올라타고, 리스크 대비 기대수익이 가장 높습니다.
        <br />
        <br />
        그런데 현실에서는 그 타이밍을 놓치는 일이 생깁니다. 이미 200일선 위에서
        잘 가고 있는 종목을 보며 "지금 들어가도 될까?" 고민하게 됩니다. 이
        칼럼은 그 질문에 답합니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 진입 가능한 조건 ── */}
      <ColumnSectionTitle>
        추세 중간에 들어가도 되는 3가지 조건
      </ColumnSectionTitle>

      <ColumnCallout label="왜 가능한가">
        Jegadeesh & Titman (1993) 연구에 따르면 모멘텀은 3~12개월간 지속됩니다.
        Zarattini et al. (2024)은 수익의 대부분이 소수의 대형 추세에서 나온다는
        것을 66,000+ 거래 분석으로 입증했습니다.{" "}
        <strong>
          핵심 추세에 올라탄다면, 초기 진입인지 중간 진입인지는 부차적입니다.
        </strong>{" "}
        단, 다음 3가지 조건을 모두 충족해야 합니다.
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="앗추 필터가 아직 유효한가">
          최근 20거래일 중 200일선 위 일수가 16일 이상이어야 합니다. 이것이
          스탠 와인스타인이 말하는 'Stage 2(상승 추세)' 구간입니다. Stage 2
          내에서는 어느 시점에서도 진입이 가능합니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="200일선 대비 과열 구간이 아닌가">
          현재 주가가 200일 이동평균 대비 +20% 이내여야 합니다. 윌리엄
          오닐(IBD)은 기초(base)에서 5% 이상 '확장(extended)'된 종목은 위험하다고
          경고했습니다. 과도하게 확장된 종목은 수정 구간을 기다리는 것이
          현명합니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="앗추 필터 점수가 흔들리고 있지 않은가">
          필터 통과 일수가 감소 추세에 있다면, 추세 이탈이 임박한 신호일 수
          있습니다. Avramov et al. (2021) 연구는 이평선으로부터의 거리(MAD)가
          향후 수익률을 예측한다는 것을 개별 종목 단위에서 검증했습니다.
        </ColumnStepItem>
      </ColumnStepList>

      {/* ── 진입하면 안 되는 경우 ── */}
      <ColumnSectionTitle>이럴 때는 들어가면 안 된다</ColumnSectionTitle>

      <ColumnWarningCard
        title="200일선 대비 +20% 이상 과열 구간"
        example="윌리엄 오닐: '기초(base)에서 5% 이상 확장되면 위험하다.' Ned Davis Research: 200일선 대비 크게 확장된 종목은 평균 회귀 경향이 있다."
      >
        과열 구간에서 진입하면 진입 직후 수정 구간을 맞닥뜨릴 가능성이
        높습니다. 이런 경우 종목이 200일선으로 되돌아오는 수정 과정을 기다렸다가
        재진입하는 것이 낫습니다.
      </ColumnWarningCard>

      <ColumnWarningCard
        title="앗추 필터 점수가 이탈 임박 수준 (16일 미만 근접)"
        example="Clare et al. (2016): 추세 추종 규칙 적용 시 MDD 43% → 30% 미만. 추세 이탈 신호를 무시하고 진입하면 이 효과를 반대로 경험하게 됨."
      >
        필터 점수가 이미 16일 근처로 떨어진 상태라면, 추세 이탈 직전에 진입하는
        셈입니다. 앗추 필터는 매수 타이밍을 알려주는 도구이자, 이탈 신호를 알려주는
        도구입니다.
      </ColumnWarningCard>

      <ColumnWarningCard
        title="고점 부근 분배 국면 신호 (Stage 3)"
        example="스탠 와인스타인: '맹세하라: Stage 4에서는 절대 주식을 보유하지 마라.' Stage 3는 Stage 4 직전의 분배 구간이다."
      >
        고점 부근에서 거래량이 급증하거나, 주가가 횡보 또는 하락하기 시작하면
        Stage 3(분배 국면)일 수 있습니다. 이 구간에서의 진입은 추세 추종 원칙과
        정면으로 배치됩니다.
      </ColumnWarningCard>

      {/* ── 의사결정 플로우 ── */}
      <ColumnSectionTitle>의사결정: 지금 들어가야 하나?</ColumnSectionTitle>

      <ColumnFlowCard
        title="앗추 필터 종목 진입 판단"
        step={{
          icon: "🤔",
          label: "앗추 필터에 있는 이 종목, 지금 들어가도 될까?",
          sub: "아래 두 가지 경우 중 어디에 해당하는지 확인하세요.",
        }}
        branches={[
          {
            label: "앗추 필터 돌파 시점 (최적 타이밍)",
            text: "즉시 매수. 이것이 앗추 서비스가 추구하는 가장 이상적인 진입 시점입니다.",
            variant: "good",
          },
          {
            label: "이미 추세 중간 — 3가지 조건 확인",
            text: "필터 유효(16/20↑) + 과열 아님(200일선 +20% 이내) + 점수 안정 → 진입 가능. 하나라도 미충족 → 다음 기회 대기.",
            variant: "neutral",
          },
        ]}
      />

      {/* ── 매도 기준 ── */}
      <ColumnSectionTitle>
        어떻게 들어갔든, 매도 기준은 같다
      </ColumnSectionTitle>

      <ColumnCallout label="진입 타이밍과 무관한 출구 원칙">
        돌파 시점에 들어갔든, 중간에 들어갔든 매도 기준은 동일합니다.{" "}
        <strong>앗추 필터가 이탈하면 나온다.</strong> 이것이 폴 튜더 존스부터
        에드 세이코타까지 모든 추세 추종자들이 공유하는 원칙입니다.
        Faber (2007) 연구는 이 규칙이 MDD를 절반 이하로 줄이면서 수익률을
        유지한다는 것을 1901~2012년 데이터로 검증했습니다.
      </ColumnCallout>

      <ColumnFlowCard
        title="앗추 필터로 매도 판단"
        step={{
          icon: "●",
          label: "보유 종목의 앗추 필터 상태 확인",
          sub: "최근 20거래일 중 200일선 위 일수가 16일 미만으로 떨어졌는가?",
        }}
        branches={[
          {
            label: "16일 이상 유지 (추세 유효)",
            text: "계속 보유. 장기 상승 추세가 안정적으로 유지 중.",
            variant: "good",
          },
          {
            label: "15일 이하로 전환 (추세 이탈)",
            text: "매도 검토. 추세가 무너지고 있으며, 추가 하락 위험 증가.",
            variant: "bad",
          },
        ]}
      />

      {/* ── 투자자 섹션 ── */}
      <ColumnSectionTitle>전문가들의 관점</ColumnSectionTitle>

      <ColumnCardList>
        {ENTRY_EXPERTS.map((inv) => (
          <ColumnPersonCard key={inv.nameEn} name={inv.name} sub={inv.title}>
            <ColumnQuote en={inv.quoteEn}>"{inv.quote}"</ColumnQuote>
            <ColumnHighlight>{inv.highlight}</ColumnHighlight>
          </ColumnPersonCard>
        ))}
      </ColumnCardList>

      {/* ── 자산별 적합도 ── */}
      <ColumnSectionTitle>자산 유형별 적합도</ColumnSectionTitle>

      <ColumnCompareTable
        columns={["자산 유형", "앗추 필터 활용 효과", "적용 적합도"]}
        rows={[
          [
            "개별주",
            {
              value: "구조적 하락(GE -80%, 인텔 -70%) 조기 이탈",
              highlight: true,
            },
            { value: "적합", highlight: true },
          ],
          [
            "섹터 ETF",
            {
              value: "2022년 에너지 vs 기술 102%p 격차 방어",
              highlight: true,
            },
            { value: "적합", highlight: true },
          ],
          [
            "국가 ETF",
            {
              value: "54년 검증, 국가 모멘텀 연 +2.75%p 초과",
              highlight: true,
            },
            { value: "적합", highlight: true },
          ],
          [
            "선물 (Futures)",
            { value: "레버리지 10-20x, MA 신호 전 계좌 파괴", bad: true },
            { value: "부적합", bad: true },
          ],
          [
            "레버리지 ETF",
            { value: "변동성 감쇠로 장기 MA 무의미", bad: true },
            { value: "부적합", bad: true },
          ],
        ]}
      />

      {/* ── 선물 주의 ── */}
      <ColumnSectionTitle>선물·레버리지 ETF는 별개의 규칙이 필요하다</ColumnSectionTitle>

      <ColumnWarningCard
        title="선물: 레버리지 증폭으로 MA 신호 전에 계좌 파괴"
        example="ES 선물 1계약: 60포인트(1%) 하락에 마진콜 발동. 200일선 이탈은 200-400포인트 하락 후 발생. 2020년 3월 COVID: S&P 500 선물 3일 연속 -7%, -9.5%, -12% — 마진콜로 MA 신호와 무관하게 강제 청산."
      >
        선물은 10~20배 내재 레버리지를 가집니다. 200일 MA는 후행 지표이므로,
        신호 발생 시점에 이미 증거금의 수배 손실이 발생할 수 있습니다. 앗추
        필터의 진입·매도 기준은 레버리지 1배 현물 자산에서만 유효합니다.
      </ColumnWarningCard>

      <ColumnWarningCard
        title="레버리지 ETF: 일일 리밸런싱이 장기 MA를 무의미하게 만듦"
        example="2022년: QQQ -33% → TQQQ -71%. 기초지수가 원점 복귀해도 3배 레버리지 ETF는 경로 의존성으로 회복 불가."
      >
        레버리지 ETF는 매일 "고가에 사고 저가에 파는" 리밸런싱 구조입니다.
        횡보장에서도 가치가 지속적으로 감쇠하여 200일 MA 기반 분석 자체가
        왜곡됩니다.
      </ColumnWarningCard>

      <ColumnMythFact
        myth="앗추 필터 돌파 때 못 샀으면 그 종목은 이미 끝이다"
        fact="Jegadeesh & Titman (1993)에 따르면 모멘텀은 3~12개월 지속됩니다. Zarattini et al. (2024)은 수익의 대부분이 소수의 대형 추세에서 나온다는 것을 입증했습니다. 돌파 직후가 이상적이지만, 앗추 필터가 유효하고 과열이 아니라면 중간 진입도 충분히 의미 있는 선택입니다."
      />

      {/* ── 결론 ── */}
      <ColumnCallout label="결론: 가장 좋은 타이밍과 차선의 타이밍">
        <strong>가장 이상적인 진입: 앗추 필터 돌파 시점.</strong> 이때 들어가면
        추세의 시작부터 올라타고, 리스크 대비 기대수익이 가장 높습니다.
        <br />
        <br />
        <strong>현실적 차선: 3가지 조건을 충족한다면 중간 진입도 가능.</strong>{" "}
        필터 유효(16/20↑) + 과열 아님(200일선 +20% 이내) + 필터 점수 안정.
        <br />
        <br />
        <strong>어떻게 들어갔든 공통 원칙: 앗추 필터 이탈 시 나온다.</strong>{" "}
        스탠 와인스타인이 "Stage 4에서는 절대 보유 마라"라고 했고, 폴 튜더
        존스는 200일선 이탈 시 즉시 매도했습니다. 진입 타이밍이 어땠든, 출구
        규칙은 동일합니다.
      </ColumnCallout>

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
