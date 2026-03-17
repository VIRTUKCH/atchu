import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareRow,
  ColumnStepList,
  ColumnStepItem,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function InformationParadoxPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="투자 심리"
        title="더 많은 정보가 왜 역효과인가"
        desc="정보 과다 → 손실 회피 심화 → 소극적 투자. 단순한 시스템이 이기는 역설."
      />

      <ColumnCallout label="정보가 많을수록 더 나쁜 결정을 내린다">
        1997년, 폴 앤드리슨의 연구에서 흥미로운 결과가 나왔습니다.
        더 많은 정보를 받은 투자자가 더 자신감 있지만, 정확도는 오히려 낮았습니다.
        정보가 많아질수록 뇌는 더 많은 '위험 신호'를 감지하고, 의사결정이 마비됩니다.
        <strong>이것을 '정보 과잉의 역설(Information Overload Paradox)'이라고 합니다.</strong>
      </ColumnCallout>

      <ColumnCompareRow
        left={{ label: "정보 과다 투자자", value: "연 2.2%", sub: "뉴스·리포트·SNS 과잉 소비", variant: "bad" }}
        right={{ label: "단순 시스템 투자자", value: "연 7.1%+", sub: "이평선 신호 하나만 따름", variant: "good" }}
      />

      <ColumnStepList>
        <ColumnStepItem step={1} title="정보 → 소음 증폭">
          뉴스, 유튜브, SNS의 투자 정보 대부분은 단기 소음입니다.
          이 소음이 많아질수록 장기 트렌드를 보는 능력이 저하됩니다.
          신호(이평선)와 소음(일일 뉴스)을 구분하는 능력이 필요합니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="소음 → 손실 회피 강화">
          부정적인 뉴스는 긍정적인 뉴스보다 클릭수가 3배 높습니다.
          미디어는 공포를 자극하는 콘텐츠를 더 많이 생산합니다.
          이 환경에 노출될수록 손실 회피 편향이 강해집니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="손실 회피 → 잘못된 행동">
          강화된 손실 회피가 공황 매도, 잦은 매매, 투자 포기로 이어집니다.
          단순한 규칙 하나가 이 모든 심리적 함정을 우회합니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnCallout label="단순함이 이기는 이유">
        거북이 트레이더들은 2주 교육 후 단순한 규칙만으로 5년간 1,874%를 달성했습니다.
        복잡한 분석 없이, 추세 신호 하나가 전부였습니다.
        Mebane Faber의 논문도 10개월 이평선 하나가 100년을 버텼다는 것을 보여줍니다.
        <strong>최고의 전략은 단순하고, 지킬 수 있고, 감정을 배제한 것입니다.</strong>
      </ColumnCallout>

      <ColumnMythFact
        myth="투자를 잘 하려면 매일 경제 뉴스를 열심히 봐야 한다"
        fact="연구에 따르면 정보 소비량과 투자 성과는 반비례할 수 있습니다. 단순한 시스템(이평선 신호)을 따르는 투자자가 정보 과잉 투자자보다 꾸준히 더 나은 결과를 보입니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
