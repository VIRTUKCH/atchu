import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStatGrid,
  ColumnResearchCard,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

const STATS = [
  { value: "100년+", label: "검증 기간", desc: "1900년~2000년대 미국 주식시장 데이터" },
  { value: "~50%", label: "드로다운 감소", desc: "매수보유 대비 최대 낙폭 감소 (백테스트)" },
  { value: "유사", label: "수익률", desc: "매수보유와 비슷한 장기 수익률 유지" },
];

export default function FaberPaperPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="추세 추종 기초"
        title={<>10개월 이평선의 100년 증거<br />— Mebane Faber 논문</>}
        desc="SSRN에서 200,000번 이상 다운로드된 이 논문은 단순한 질문 하나로 시작합니다. '이동평균선 하나만으로 충분한가?'"
      />

      <ColumnCallout label="논문이 던진 질문">
        복잡한 전략 없이 10개월(약 200일) 이동평균선 하나만 쓰는 전략이
        100년 이상의 데이터에서 어떤 성과를 냈는가?
        결론은 놀라웠습니다. <strong>수익률은 유사하고, 드로다운은 절반 수준</strong>이었습니다.
      </ColumnCallout>

      <ColumnStatGrid stats={STATS} />

      <ColumnResearchCard
        source="SSRN (Social Science Research Network)"
        year="2007"
        title="A Quantitative Approach to Tactical Asset Allocation"
        author="Mebane T. Faber"
        stat="200,000+ 다운로드 — 역대 최고 수준의 투자 논문"
      >
        1900년 이후 미국 주식시장 데이터로 10개월 이동평균선 기반 전략을 백테스트했습니다.
        규칙은 단순합니다. 월말 기준 종가가 10개월 이평선 위면 보유, 아래면 현금.
        결과는 매수보유와 비슷한 수익률이면서 2000년·2008년 같은 대폭락에서 드로다운이
        절반 수준으로 줄었습니다.
      </ColumnResearchCard>

      <ColumnCallout label="논문의 핵심 결론">
        복잡한 전략이 필요 없습니다. <strong>10개월 이동평균선 하나만으로 100년을 버텼습니다.</strong>
        단순한 규칙이 정교한 분석보다 더 나은 리스크 조정 수익률을 낸다는 증거입니다.
      </ColumnCallout>

      <ColumnMythFact
        myth="복잡하고 정교한 퀀트 전략이 단순한 이평선보다 낫다"
        fact="Faber 논문은 단순한 10개월 이평선 규칙이 복잡한 전략과 비슷하거나 더 나은 리스크 조정 수익률을 냄을 100년 데이터로 증명했습니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
