import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnSectionTitle,
  ColumnCompareTable,
  ColumnCompareRow,
  ColumnTipBox,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";
import { getFaqMeta } from "../../config/faqItems";

const STATS = [
  {
    value: "3%",
    label: "전체 자산 대비 실질 수익",
    desc: "자산 1억에 3천만 원 투자, 수익률 10% → 300만 원. 전체 자산 대비 고작 3%.",
  },
  {
    value: "-55%",
    label: "S&P 500 최대 낙폭",
    desc: "2007~2009년 금융 위기. 이게 무서워서 큰 돈을 넣지 못한다.",
  },
  {
    value: "-25%",
    label: "추세추종 최대 낙폭",
    desc: "200일선 기반 전략. 같은 기간 손실을 절반 이하로 줄였다.",
  },
];

const meta = getFaqMeta("/why_mdd_matters");

export default function WhyMddMattersPage() {
  return (
    <ColumnPage>
      <ColumnHero tag="FAQ" title={meta.label} desc={meta.heroDesc} />

      {/* ── 문제: 소액 투자의 함정 ── */}
      <ColumnCallout label="슈카의 지적">
        "자산 1억에 주식 3천만 원 투자, 수익률 10%면 3백만 원 —
        전체 자산 대비 고작 3%."<br /><br />
        수익률 10%는 훌륭한 숫자입니다.
        하지만 넣은 돈이 적으면 실질 수익금은 의미가 없습니다.<br /><br />
        <strong>의미 있는 수익을 내려면 가진 돈의 상당 부분을 넣어야 합니다.</strong>
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      {/* ── 왜 큰 돈을 못 넣는가 ── */}
      <ColumnSectionTitle>왜 큰 돈을 넣지 못하는가</ColumnSectionTitle>

      <ColumnCallout label="MDD가 무섭기 때문입니다">
        S&P 500의 연평균 수익률은 약 10%입니다.
        하지만 이 숫자 뒤에는 <strong>-55%</strong>라는 최대 낙폭이 숨어 있습니다.<br /><br />
        1억을 넣었다면 4,500만 원이 됩니다.
        그 사이에 결혼, 자녀 등록금, 부모님 병원비가 생기면?<br /><br />
        이 공포가 비중을 줄이게 만듭니다.
        결국 소액만 넣고, 소액의 10%는 의미 없는 돈이 되고,
        "주식은 별로다"라는 결론에 도달합니다.<br /><br />
        <strong>문제는 수익률이 아니라 MDD였습니다.</strong>
      </ColumnCallout>

      {/* ── 해법: MDD를 줄이면 비중을 높일 수 있다 ── */}
      <ColumnSectionTitle>MDD를 줄이면 비중을 높일 수 있습니다</ColumnSectionTitle>

      <ColumnCompareRow
        left={{ label: "Buy & Hold", value: "MDD -55%", sub: "1억 → 4,500만 원. 비중을 높이기 두렵다", variant: "bad" }}
        right={{ label: "추세추종", value: "MDD -25%", sub: "1억 → 7,500만 원. 비중을 높일 수 있다", variant: "good" }}
      />

      <ColumnCallout label="핵심 논리">
        연평균 수익률을 크게 줄이지 않으면서 MDD를 반으로 낮출 수 있다면,
        더 큰 비중을 넣을 수 있습니다.<br /><br />
        <strong>MDD가 낮아야 큰 비중을 넣을 수 있고,
        큰 비중이어야 실질 수익금이 의미 있습니다.</strong><br /><br />
        3천만 원의 10%는 300만 원이지만,
        8천만 원의 8%는 640만 원입니다.
        수익률은 낮아도 실질 수익금은 2배 이상입니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["지표", "Buy & Hold", "추세추종 (200일선)"]}
        rows={[
          ["CAGR (연평균 수익률)", { value: "~10%" }, { value: "~8–9%" }],
          ["최대 낙폭 (MDD)", { value: "-55%", bad: true }, { value: "-25%", highlight: true }],
          ["소르티노 비율", { value: "~0.75" }, { value: "~0.95", highlight: true }],
        ]}
      />

      <ColumnCallout label="소르티노 비율 — 진짜 효율">
        CAGR만 비교하면 Buy & Hold가 1~2%p 높습니다.
        하지만 <strong>소르티노 비율</strong>(수익률 ÷ 하락 변동성)을 보면 추세추종이 앞섭니다.<br /><br />
        수익률이 조금 낮아도 하락이 절반이면,
        <strong>리스크 대비 효율은 추세추종이 더 좋습니다.</strong>
        효율이 좋으니 비중을 높일 수 있고, 비중이 높으니 실질 수익금이 커집니다.
      </ColumnCallout>

      <ColumnTipBox title="앗추에서 확인하는 방법">
        추세 조회 상세 페이지에서 각 ETF의 심화 지표를 펼치면{"\n"}
        Buy & Hold와 앗추 필터의 소르티노 비율·MDD를 직접 비교할 수 있습니다.{"\n"}
        숫자로 직접 확인하세요.
      </ColumnTipBox>

      <ColumnMythFact
        myth="수익률이 높으면 비중은 적어도 괜찮다"
        fact="수익률 10% × 3천만 원 = 300만 원. 전체 자산 대비 3%입니다. 의미 있는 수익을 내려면 비중을 높여야 하고, 비중을 높이려면 MDD를 줄여야 합니다. MDD를 반으로 낮추는 방법이 이동평균선 매매입니다."
      />

      <ColumnBackLink to="/faq">← FAQ로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
