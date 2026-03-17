import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnStepList,
  ColumnStepItem,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnBackLink,
} from "../../components/column";

export default function DebtCyclePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title="달리오가 경고하는 '13번째 대규모 부채 사이클'"
        desc="역사상 13번 반복된 빅 사이클의 5단계. 2025년 현재 어디에 있는가."
      />

      <ColumnCallout label="달리오가 50년간 직접 경험한 부채 사이클">
        레이 달리오는 1971년 닉슨의 금본위제 폐지부터 2020년대까지를 직접 경험한 투자자입니다.
        그는 역사상 13번 반복된 큰 부채 사이클(Big Debt Cycle)을 분석하고,
        2025년 현재 미국이 유사한 패턴을 따르고 있다고 경고합니다.
      </ColumnCallout>

      <ColumnStepList>
        <ColumnStepItem step={1} title="건전한 화폐와 신용 기반">
          경제가 성장하고 부채가 적정 수준입니다.
          생산성이 높아지고 소득이 증가합니다.
          이 단계가 지속될수록 신용에 대한 신뢰가 쌓입니다.
        </ColumnStepItem>
        <ColumnStepItem step={2} title="부채 거품 확대">
          낮은 금리와 쉬운 신용이 과도한 차입을 유발합니다.
          자산 가격이 내재 가치를 초과해 올라갑니다.
          모든 사람이 "이번엔 다르다"고 생각하는 시점입니다.
        </ColumnStepItem>
        <ColumnStepItem step={3} title="정점과 전환점">
          부채 상환 비용이 소득 증가 속도를 넘어섭니다.
          중앙은행이 인플레이션을 제어하기 위해 금리를 인상합니다.
          자산 가격 하락이 시작되고 신용 위기가 발생합니다.
        </ColumnStepItem>
        <ColumnStepItem step={4} title="부채 축소 (Deleveraging)">
          차입자들이 동시에 부채를 줄이려 하면서 자산을 매각합니다.
          디플레이션 압력이 증가하고 경제가 위축됩니다.
          가장 고통스러운 단계로, 수년~수십 년이 걸릴 수 있습니다.
        </ColumnStepItem>
        <ColumnStepItem step={5} title="통화 완화와 새 사이클">
          중앙은행이 화폐를 찍어내며 부채 부담을 완화합니다.
          장기적으로 통화 가치가 하락하고 새로운 성장 사이클이 시작됩니다.
          금과 실물 자산의 상대적 가치가 높아집니다.
        </ColumnStepItem>
      </ColumnStepList>

      <ColumnTimeline>
        <ColumnTimelineItem year="1930년대" title="대공황 — 부채 축소 사례">
          과도한 주식 레버리지와 부채가 쌓인 후 1929년 폭락으로 이어진 사이클.
          루스벨트 대통령의 금 재평가와 뉴딜 정책으로 사이클 전환.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1945~1971년" title="브레턴우즈 체제">
          2차 대전 후 달러-금 연동 시스템. 미국 경제 황금기.
          1971년 닉슨의 금본위제 폐지로 새로운 사이클 시작.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2008년" title="금융위기 — 부채 축소">
          주택 담보 대출 버블 붕괴. Fed의 양적완화(QE)로 대응.
          10년간 저금리 환경에서 다시 부채 사이클 시작.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="2025년 현재" title="13번째 사이클 — ?">
          미국 국가 부채 35조 달러 초과. GDP 대비 120%+.
          달리오는 이 수준이 역사적으로 지속 불가능했다고 경고.
          추세 신호 모니터링의 중요성이 더 높아진 시점.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
