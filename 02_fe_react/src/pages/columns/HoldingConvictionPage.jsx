import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnCompareRow,
  ColumnResearchCard,
  ColumnPullQuote,
  ColumnStepList,
  ColumnStepItem,
  ColumnFlowCard,
  ColumnTipBox,
  ColumnMythFact,
  ColumnWarningCard,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  {
    value: "평균 −14%",
    label: "상승장에서도 발생하는 연간 내 하락",
    desc: "1980년 이후 S&P 500의 평균 연간 내 최대 하락(intra-year drawdown). 그럼에도 73%의 해가 양수 수익으로 마감. (Calamos / J.P. Morgan, 과거 데이터)",
  },
  {
    value: "−8.48%p",
    label: "2024년 투자자 vs 시장 성과 격차",
    desc: "평균 주식 투자자 수익률 16.54% vs S&P 500 25.02%. 잘못된 매매 타이밍이 주원인. (DALBAR QAIB 2025)",
  },
  {
    value: "$71,750 → $32,871",
    label: "최고의 10일을 놓치면",
    desc: "2005~2024년 S&P 500에 $10,000 투자 시, 풀 투자 vs 최고의 10일을 놓쳤을 때의 최종 자산. (J.P. Morgan Asset Management, 2025)",
  },
];

const meta = getFaqMeta("/holding_conviction");

export default function HoldingConvictionPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      <ColumnCallout label="상승장에서도 하락 뉴스는 끊이지 않습니다">
        S&P 500이 역사적 신고가를 경신하는 구간에서도
        "조정 임박", "버블 경고" 같은 뉴스는 매주 나옵니다.
        1980년 이후 데이터를 보면, S&P 500은 거의 매년(93%) −5% 이상의 하락을 경험했고,
        절반 가까운 해(47%)에서 −10% 이상의 하락이 있었습니다.
        하락 뉴스가 있다는 것 자체는 추세 전환의 근거가 되지 않았습니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 뉴스에 반응하면 무슨 일이 일어나는가 ── */}
      <ColumnSectionTitle>뉴스에 반응하면 무슨 일이 일어나는가</ColumnSectionTitle>

      <ColumnStepList>
        <ColumnStepItem step={1} title="하락 뉴스에 겁먹고 매도">
          앗추 필터는 이탈 신호를 내지 않았지만, 뉴스가 무서워서 매도합니다.
          Shefrin & Statman(1985)이 발견한 '처분 효과(disposition effect)' —
          이익 종목을 너무 빨리 파는 심리적 편향이 작동하는 순간입니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="시장이 빠르게 반등">
          1980년 이후, 두 자릿수 하락이 발생한 22개 연도 중 14개(64%)가
          연말에 양수 수익으로 마감했습니다. 하지만 이미 현금으로 전환한 상태입니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="재진입 타이밍을 놓침">
          "조금 더 빠지면 다시 사자"라고 기다리지만, 시장은 기다려주지 않습니다.
          DALBAR(2025)에 따르면 투자자가 매매 타이밍을 맞힌 비율(Guess Right Ratio)은
          25%에 불과했습니다 — 4번 중 3번은 틀린 시점에 행동한 것입니다.
        </ColumnStepItem>
        <ColumnStepItem step={4} title="FOMO와 후회">
          뒤늦게 재진입하면 "왜 팔았을까" 하는 후회가 남습니다.
          이 경험이 쌓이면 다음에는 반대로 하락장에서 버티다가 손실이 커질 수 있습니다.
          감정 기반 매매의 악순환입니다.
        </ColumnStepItem>
      </ColumnStepList>

      {/* ── 하락 뉴스가 나왔을 때 확인할 것 ── */}
      <ColumnSectionTitle>하락 뉴스가 나왔을 때 확인할 것</ColumnSectionTitle>

      <ColumnFlowCard
        title="뉴스 vs 신호 구분"
        step={{ label: "하락 뉴스 발생", sub: "언론 보도, SNS, 유튜브에서 하락 경고" }}
        branches={[
          {
            label: "앗추 필터: 추세 유효 (16/20 충족)",
            text: "필터 기준으로 추세가 유지 중입니다. 뉴스는 단기 소음일 가능성이 있습니다.",
            variant: "good",
          },
          {
            label: "앗추 필터: 추세 이탈 (16/20 미충족)",
            text: "데이터에 변화가 감지된 상태입니다. 포지션을 점검할 시점일 수 있습니다.",
            variant: "bad",
          },
        ]}
      />

      {/* ── 학술 연구가 말하는 것 ── */}
      <ColumnSectionTitle>학술 연구가 말하는 것</ColumnSectionTitle>

      <ColumnResearchCard
        source="DALBAR, Inc."
        year="2025"
        title="Investors Missed the Best of 2024's Market Gains"
        author="DALBAR QAIB (Quantitative Analysis of Investor Behavior)"
        stat="투자자 16.54% vs S&P 500 25.02% — 8.48%p 격차"
      >
        2024년, S&P 500이 25.02% 상승하는 동안 평균 주식 투자자의 수익률은 16.54%에 그쳤습니다.
        8.48%p의 격차는 지난 10년 중 두 번째로 큰 수준이었습니다.
        평균 투자자는 2009년 이후 <strong>15년 연속</strong> S&P 500에 뒤처졌으며,
        매매 타이밍을 맞힌 비율(Guess Right Ratio)은 25%로 역대 최저 수준을 기록했습니다.
        모든 분기에서 주식 펀드 자금 유출이 발생했고, 가장 큰 유출은 대규모 반등 직전에 일어났습니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Journal of Finance"
        year="2000"
        title="Trading Is Hazardous to Your Wealth"
        author="Brad M. Barber & Terrance Odean (UC Davis)"
        stat="잦은 매매자 연 11.4% vs 시장 17.9%"
      >
        1991~1996년 미국 대형 할인 증권사의 66,465 가구를 분석한 결과,
        가장 자주 매매한 투자자(상위 20%)의 연간 수익률은 11.4%로
        시장 수익률 17.9%에 크게 못 미쳤습니다.
        핵심 원인은 <strong>과잉 자신감(overconfidence)</strong> —
        뉴스나 직감을 근거로 매매 빈도를 높일수록 거래 비용이 누적되고 성과가 떨어졌습니다.
      </ColumnResearchCard>

      <ColumnResearchCard
        source="Journal of Finance"
        year="1985"
        title="The Disposition to Sell Winners Too Early and Ride Losers Too Long"
        author="Hersh Shefrin & Meir Statman"
        stat="이익 종목 조기 매도 + 손실 종목 과잉 보유"
      >
        행동재무학의 기념비적 논문입니다.
        투자자는 이익이 난 종목을 <strong>너무 빨리 팔고</strong>,
        손실이 난 종목은 <strong>너무 오래 보유</strong>하는 경향이 있습니다.
        원인은 손실 회피(loss aversion), 정신 회계(mental accounting),
        후회 회피(regret avoidance)의 복합 작용입니다.
        상승장에서 하락 뉴스를 보고 이익 실현을 서두르는 것이 이 편향의 전형적 사례입니다.
      </ColumnResearchCard>

      {/* ── 전설적 투자자들은 어떻게 했는가 ── */}
      <ColumnSectionTitle>전설적 투자자들은 어떻게 했는가</ColumnSectionTitle>

      <ColumnPullQuote
        attribution="피터 린치"
        role="마젤란 펀드 매니저 · 1977~1990 연평균 29.2%"
      >
        주식 시장의 조정에 대비하거나 조정을 예측하느라 잃은 돈이,
        실제 조정에서 잃은 돈보다 훨씬 많다.
        {"\n\n"}
        <em>
          "Far more money has been lost by investors preparing for corrections,
          or trying to anticipate corrections, than has been lost in corrections
          themselves." — Beating the Street (1993)
        </em>
      </ColumnPullQuote>

      <ColumnPullQuote
        attribution="워런 버핏"
        role="버크셔 해서웨이 회장 · 1988 주주서한"
      >
        우리가 가장 좋아하는 보유 기간은 영원입니다.
        {"\n\n"}
        <em>
          "Our favorite holding period is forever."
          — 1988 Berkshire Hathaway Annual Report
        </em>
      </ColumnPullQuote>

      <ColumnPullQuote
        attribution="제시 리버모어"
        role="Reminiscences of a Stock Operator (1923)"
      >
        돈은 거래가 아니라 기다림에서 벌린다.
        {"\n\n"}
        <em>
          "The money is made by sitting, not trading."
        </em>
      </ColumnPullQuote>

      {/* ── 비교 ── */}
      <ColumnCompareRow
        left={{
          label: "뉴스에 반응한 투자자",
          value: "상승분 미참여",
          sub: "하락 뉴스에 이탈 → 반등 후 재진입 시점 놓침",
          variant: "bad",
        }}
        right={{
          label: "신호 기반 투자자",
          value: "추세 유지",
          sub: "앗추 필터 이탈 신호 없으면 포지션 유지",
          variant: "good",
        }}
      />

      {/* ── 통설 vs 사실 ── */}
      <ColumnMythFact
        myth="하락 뉴스가 나오면 빨리 팔아야 손실을 줄인다"
        fact="J.P. Morgan Asset Management(2025) 연구에 따르면, 시장의 최고의 10일 중 7일은 최악의 10일 이후 2주 이내에 발생했습니다. 공포에 팔고 나면 가장 좋은 반등일을 놓칠 확률이 높습니다. 2005~2024년 기준, 최고의 10일만 놓쳐도 최종 자산이 절반 이하로 줄었습니다."
      />

      {/* ── 앗추의 설계 의도 ── */}
      <ColumnTipBox title="앗추 알림의 설계 의도">
        앗추 Discord 알림은 추세 상태가 변할 때만 발송됩니다.{"\n"}
        알림이 오지 않는다는 것은 추세가 유지되고 있다는 뜻입니다.{"\n"}
        매일 확인하지 않아도 되는 구조를 의도적으로 설계했습니다.{"\n"}
        {"\n"}
        하락 뉴스가 나와도 앗추에서 알림이 없다면,{"\n"}
        필터 기준으로는 추세가 유효한 상태입니다.
      </ColumnTipBox>

      {/* ── 한계 및 면책 ── */}
      <ColumnWarningCard title="앗추 필터가 모든 하락을 막는 것은 아닙니다">
        예: 2020년 3월 코로나 급락은 약 3주 만에 200일선을 이탈했습니다.
        이평선 신호는 후행 지표이며, 급격한 사건에는 반응이 늦습니다.{"\n"}
        {"\n"}
        이 글은 "뉴스를 무시하라"는 뜻이 아닙니다.
        앗추 필터의 이탈 신호가 없을 때, 뉴스만 보고 성급하게 행동하면
        오히려 불리한 결과로 이어졌다는 <strong>과거 데이터의 관찰</strong>을 공유하는 것입니다.{"\n"}
        모든 투자 판단과 그에 따른 결과는 투자자 본인의 책임입니다.
      </ColumnWarningCard>

      {/* ── 결론 ── */}
      <ColumnCallout label="결론: 신호가 없으면 소음일 수 있습니다">
        상승장에서 하락 뉴스가 나올 때, 앗추 필터에 이탈 신호가 없다면
        그 뉴스는 단기 소음일 가능성이 있습니다.
        과거 데이터에서 S&P 500은 매년 평균 −14% 하락을 겪으면서도
        73%의 해에서 양수 수익으로 마감했습니다.
        {"\n\n"}
        앗추 필터는 "언제 팔아라"가 아니라
        "아직 추세가 유지되고 있는지" 확인하는 도구입니다.
        추세가 살아있는 동안에는 뉴스보다 데이터를 참고하는 것이
        과거에는 더 나은 선택이었다는 관찰입니다.
      </ColumnCallout>

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
