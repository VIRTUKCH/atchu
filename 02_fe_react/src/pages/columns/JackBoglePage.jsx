import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnStatGrid,
  ColumnCallout,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "1975년", label: "뱅가드 창립", desc: "1976년 세계 최초 인덱스 뮤추얼 펀드 출시" },
  { value: "$10조+", label: "운용 자산", desc: "뱅가드 2025년 기준 규모" },
  { value: "50년", label: "업계 경력", desc: "투자 업계 전체를 직접 지켜봄" },
];

export default function JackBoglePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title={<>잭 보글:<br />"시장 타이밍은 아무도<br />성공하지 못했다"</>}
        desc="인덱스 투자의 아버지가 50년 경력 끝에 내린 결론."
      />

      <ColumnPullQuote
        attribution="Jack Bogle"
        role="뱅가드 그룹 창립자 · 인덱스펀드의 아버지"
      >
        50년 이 업계에 있으면서 시장 타이밍을 일관되게 성공한 사람을 단 한 명도 알지 못한다.
      </ColumnPullQuote>

      <ColumnStatGrid stats={STATS} />

      <ColumnCallout label="보글이 인덱스 투자를 만든 이유">
        1970년대, 보글은 충격적인 사실을 발견했습니다.
        대부분의 액티브 펀드가 장기적으로 S&P500 인덱스를 이기지 못한다는 것.
        그래서 비용을 최소화하고 시장 전체를 사는 방법을 만들었습니다.
        그것이 지금 수조 달러 규모가 된 인덱스펀드입니다.
      </ColumnCallout>

      <ColumnCallout label="보글과 앗추의 차이점">
        보글은 "절대 팔지 말고 영원히 보유하라"는 바이앤홀드를 지지했습니다.
        앗추는 이동평균선 기반 추세 데이터를 제공하여, 시장 상태를 한눈에 파악할 수 있게 합니다.
        어떤 접근이 맞는지는 투자자의 성향에 따라 다릅니다.
      </ColumnCallout>

      <ColumnMythFact
        myth="타이밍을 잘 잡으면 더 높은 수익을 낼 수 있다"
        fact="50년 경력의 전문가도 일관된 타이밍 성공 사례를 단 한 명도 본 적이 없습니다. 예외적인 타이밍 성공보다 일관된 시스템이 장기 성과를 결정합니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
