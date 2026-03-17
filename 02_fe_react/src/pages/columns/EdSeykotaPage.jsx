import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnCallout,
  ColumnSectionTitle,
  ColumnStepList,
  ColumnStepItem,
  ColumnHighlight,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function EdSeykotaPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title="에드 세이코타: 시스템 트레이딩의 아버지"
        desc="1970년대, 컴퓨터가 거의 없던 시절에 감정 없는 시스템 트레이딩을 시작한 선구자."
      />

      <ColumnPullQuote
        attribution="Ed Seykota"
        role="시스템 트레이딩 선구자 · Market Wizards 수록"
      >
        추세는 친구다. 이동평균선은 그 친구의 얼굴이다.
      </ColumnPullQuote>

      <ColumnCallout label="1970년대, 혁명적인 시도">
        당시로선 혁명적인 시도를 했습니다. 감정을 배제하고 규칙만으로 트레이딩하는
        시스템을 컴퓨터로 구현한 것입니다. 이것이 오늘날 알고리즘 트레이딩의 원형입니다.
        그의 계좌는 수천 퍼센트의 수익을 기록했습니다.
      </ColumnCallout>

      <ColumnSectionTitle>세이코타의 3가지 핵심 규칙</ColumnSectionTitle>

      <ColumnStepList>
        <ColumnStepItem step={1} title="손실을 줄여라">
          잘못된 포지션에서 빠르게 나오는 것이 모든 것보다 우선입니다.
          작은 손실은 시스템이 통제할 수 있지만, 큰 손실은 회복이 불가능할 수 있습니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="이익을 지속시켜라">
          추세가 살아있는 한 포지션을 끝까지 유지하세요.
          수익이 나는 포지션을 너무 일찍 정리하는 것이 대부분의 투자자가 저지르는 가장 큰 실수입니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="작게 베팅하라">
          한 번의 실수가 전체를 날리지 않도록 포지션 크기를 항상 제한하세요.
          살아남는 것이 이기는 것입니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnHighlight>감정을 배제한 시스템 = 세이코타 성공의 핵심</ColumnHighlight>

      <ColumnMythFact
        myth="실력 있는 트레이더는 느낌과 직관으로 매매한다"
        fact="세이코타는 50년간 규칙만으로 매매했습니다. 느낌과 직관은 시스템으로 대체할 수 있고, 시스템이 장기적으로 더 일관된 성과를 냅니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
