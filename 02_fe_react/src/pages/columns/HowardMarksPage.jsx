import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnCallout,
  ColumnSectionTitle,
  ColumnStepList,
  ColumnStepItem,
  ColumnBackLink,
} from "../../components/column";

export default function HowardMarksPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title="하워드 마크스: 사이클을 읽으면 리스크가 보인다"
        desc="오크트리 캐피탈의 공동 창립자. 40년간 연평균 19%, 단 한 번의 큰 손실 없이."
      />

      <ColumnPullQuote
        attribution="Howard Marks"
        role="Oaktree Capital Management 공동 창립자"
      >
        훌륭한 투자자는 맞는 것보다 틀리지 않는 것을 더 중요하게 생각한다.
      </ColumnPullQuote>

      <ColumnCallout label="마크스가 말하는 투자의 핵심">
        높은 수익을 추구하는 것보다 리스크를 통제하는 것이 장기 성과를 결정합니다.
        잃지 않으면 이기는 게임입니다. -50%를 회복하려면 +100%가 필요하지만,
        -25%를 회복하려면 +33%로 충분합니다. <strong>드로다운을 줄이는 것이 복리의 핵심입니다.</strong>
      </ColumnCallout>

      <ColumnSectionTitle>시장 사이클 현재 위치 파악하는 법</ColumnSectionTitle>

      <ColumnStepList>
        <ColumnStepItem step={1} title="심리 온도계 확인">
          주변 투자자들이 탐욕적인가, 공포에 있는가?
          탐욕이 극에 달할수록 리스크가 높고, 공포가 극에 달할수록 기회가 많습니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="밸류에이션 확인">
          주식이 역사적으로 비싼 구간인가, 싼 구간인가?
          CAPE 비율, 버핏 지수 등 장기 밸류에이션 지표를 참고합니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="신용 사이클 확인">
          돈을 빌리기 쉬운가, 어려운가?
          신용이 느슨해지고 레버리지가 쌓이면 후기 사이클 신호입니다.
        </ColumnStepItem>
        <ColumnStepItem step={4} title="추세 확인">
          200일 이평선이 상향이면 추세 우호, 하향이면 주의가 필요합니다.
          심리와 밸류에이션과 추세를 함께 보면 사이클의 현재 위치가 보입니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnCallout label="리스크 관리가 수익률을 결정한다">
        마크스는 40년간 단 한 번도 큰 손실 없이 연평균 19%를 달성했습니다.
        비결은 공격적인 수익 추구가 아니라 철저한 리스크 통제였습니다.
        <strong>얼마나 버느냐보다 얼마나 잃지 않느냐가 더 중요합니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
