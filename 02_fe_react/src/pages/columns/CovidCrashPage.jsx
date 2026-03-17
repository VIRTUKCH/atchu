import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnCompareRow,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "-34%", label: "S&P500 최대 낙폭", desc: "33일 만에 발생" },
  { value: "87조원", label: "국내 투자자 순매수", desc: "코로나 폭락기 동학개미" },
  { value: "42%", label: "개인 투자자 손실 비율", desc: "순매수에도 불구하고" },
];

export default function CovidCrashPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="위기 분석"
        title="2020년 코로나 폭락: 개인투자자 42%가 손실본 이유"
        desc="역사상 가장 빠른 폭락이자 가장 빠른 회복. 87조원 순매수에도 42%가 손실."
      />

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="33일 만에 -34%, 그리고 5개월 만에 신고점">
        2020년 2월 19일부터 3월 23일까지 단 33일 만에 S&P500은 -34% 폭락했습니다.
        역사상 가장 빠른 하락이었습니다. 그런데 5개월 후 신고점을 경신했고,
        1년 후에는 +75%가 상승해 있었습니다.
        역사상 가장 빠른 폭락이 역사상 가장 빠른 회복으로 연결됐습니다.
      </ColumnCallout>

      <ColumnCompareRow
        left={{ label: "코로나 이전 보유자", value: "빠른 회복", sub: "폭락 경험 후 5개월 만에 신고점", variant: "good" }}
        right={{ label: "폭락 후 공황 매도", value: "기회 상실", sub: "저점 후 반등을 놓침", variant: "bad" }}
      />

      <ColumnCallout label="동학개미는 왜 손실을 봤나">
        87조원을 순매수한 국내 개인 투자자 42%가 손실을 기록했습니다.
        문제는 '무엇을 샀느냐'가 아니라 '언제 팔았느냐'였습니다.
        추세 신호 없이 감정적으로 진입하고, 반등 중 공황 매도한 경우가 많았습니다.
        <strong>S&P500 ETF를 사고 보유했다면 1년 후 +75% 수익이었습니다.</strong>
      </ColumnCallout>

      <ColumnCallout label="추세 신호는 어떻게 작동했나">
        2020년 2월, S&P500은 200일 이평선 아래로 급격히 이탈했습니다.
        추세추종 시스템은 빠른 현금 전환 신호를 냈고, 최악의 하락을 회피했습니다.
        3월 말부터 회복이 시작되자 200일선 위로 복귀하는 신호가 발생했고,
        재진입 시점을 포착할 수 있었습니다.
      </ColumnCallout>

      <ColumnMythFact
        myth="폭락 때 더 사면 평균 단가가 낮아져 유리하다"
        fact="이론적으로는 맞지만, 추가 하락 시 심리적 고통이 극대화돼 오히려 저점 매도로 이어지는 경우가 많습니다. 추세 확인 후 진입이 심리적으로도, 수익률에서도 더 안전합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
