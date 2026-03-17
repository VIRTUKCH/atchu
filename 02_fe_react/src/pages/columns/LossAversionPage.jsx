import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareRow,
  ColumnStepList,
  ColumnStepItem,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

export default function LossAversionPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title="손실을 이득의 2배로 느끼는 뇌 — 손실 회피 심리학"
        desc="카너먼의 전망 이론. -10%의 고통이 +20%의 기쁨과 같은 이유."
      />

      <ColumnCallout label="노벨상을 받은 심리학 발견">
        1979년, 다니엘 카너먼과 아모스 트버스키는 인간이 손실을 이득보다
        약 2~2.5배 더 강하게 느낀다는 것을 증명했습니다.
        이것이 '손실 회피(Loss Aversion)'입니다.
        카너먼은 이 연구로 2002년 노벨경제학상을 받았습니다.
      </ColumnCallout>

      <ColumnCompareRow
        left={{ label: "-10% 손실의 고통", value: "2배 강도", sub: "뇌가 느끼는 심리적 충격", variant: "bad" }}
        right={{ label: "+20% 이득의 기쁨", value: "1배 강도", sub: "같은 금액이어도 절반만 느낀다", variant: "good" }}
      />

      <ColumnCallout label="투자에서 손실 회피가 만드는 함정">
        손실 회피는 진화적으로 유리한 특성이었습니다.
        자원을 잃는 것은 생존에 위협이었기 때문입니다.
        하지만 현대 투자에서는 이 심리가 오히려 수익률을 갉아먹습니다.
        <strong>일시적 -10% 하락을 보고 팔면, +20% 반등을 놓칩니다.</strong>
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="저점 매도">
          -15% 하락 시 고통이 극대화됩니다. "더 떨어지기 전에 팔아야 해"라는 생각이
          최악의 순간에 매도 버튼을 누르게 만듭니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="수익 조기 실현">
          +10% 수익이 나면 "이 이득을 지키고 싶다"는 욕구로 너무 일찍 팝니다.
          손실은 오래 보유하고, 이익은 빨리 실현하는 역행 패턴이 생깁니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="계좌 확인 중독">
          계좌를 자주 볼수록 손실을 더 자주 경험합니다. 주가는 단기적으로 하루에도
          여러 번 오르내리기 때문에, 잦은 확인이 손실 회피 심리를 자극합니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnTipBox>
        손실 회피를 극복하는 실전 방법:<br />
        1. 계좌 확인 횟수를 주 1회 이하로 줄이기<br />
        2. 매매 결정을 미리 정한 규칙(이평선 신호)에 위임하기<br />
        3. 단기 손익이 아닌 연간 수익률로 성과 측정하기
      </ColumnTipBox>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
