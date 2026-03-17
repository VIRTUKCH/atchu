import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnPullQuote,
  ColumnCompareRow,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function MartySchwartzPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title={<>마티 슈워츠:<br />이동평균선이 방향을 바꾼 트레이더</>}
        desc="9년의 실패, 그리고 단 하나의 전환점. 개인 투자자에게 가장 공감되는 스토리."
      />

      <ColumnCallout label="9년의 실패, 그리고 전환점">
        마티 슈워츠는 9년간 기본분석(재무제표, 기업가치 분석)으로 투자했지만 계속 손실이 났습니다.
        그러다 이동평균선 기반 기술분석을 접한 후 인생이 바뀌었습니다.
        미국 트레이딩 챔피언십에서 역대 최고 수익률을 기록하게 됩니다.
      </ColumnCallout>

      <ColumnPullQuote
        attribution="Marty Schwartz"
        role="챔피언 트레이더 · Market Wizards 수록"
      >
        이동평균선은 매수 측과 매도 측 중 어느 쪽이 우위에 있는지 판단하는 가장 빠른 방법이다.
      </ColumnPullQuote>

      <ColumnCompareRow
        left={{ label: "기본분석 시절 (9년)", value: "지속 손실", sub: "기업 가치 분석에 집중", variant: "bad" }}
        right={{ label: "이평선 도입 후", value: "챔피언십 우승", sub: "추세를 기준으로 매매", variant: "good" }}
      />

      <ColumnCallout label="개인 투자자에게 가장 공감되는 스토리">
        슈워츠는 처음부터 잘한 게 아니었습니다. 전문 교육을 받은 애널리스트였지만
        시장에서 계속 졌습니다. <strong>올바른 도구를 찾은 것이 전부였습니다.</strong>
        그의 전환점은 누구에게나 열려 있습니다.
      </ColumnCallout>

      <ColumnMythFact
        myth="투자를 잘 하려면 기업을 깊이 분석하고 재무제표를 꿰뚫어야 한다"
        fact="슈워츠는 기업 분석 전문가였지만 계속 실패했습니다. 이평선으로 전환한 후 성공했습니다. 분석의 깊이가 아니라 사용하는 도구가 중요합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
