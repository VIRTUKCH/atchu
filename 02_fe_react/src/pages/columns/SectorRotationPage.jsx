import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnCallout,
  ColumnCompareTable,
  ColumnTipBox,
  ColumnBackLink,
} from "../../components/column";

export default function SectorRotationPage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="거시경제"
        title="섹터 로테이션: 경제 사이클에 따라 승자가 바뀐다"
        desc="초기 회복엔 기술주, 확장기엔 에너지/금융, 후기엔 방어주, 침체엔 채권/금."
      />

      <ColumnCallout label="경제 사이클과 섹터 성과의 관계">
        경제는 순환합니다. 초기 회복, 확장, 후기 사이클, 침체를 반복합니다.
        각 단계마다 가장 잘 성과를 내는 섹터가 다릅니다.
        이 패턴을 이해하면 시장의 흐름을 읽는 데 도움이 됩니다.
      </ColumnCallout>

      <ColumnCompareTable
        columns={["경제 국면", "유리한 섹터", "예시 ETF"]}
        rows={[
          ["초기 회복 (금리 하락)", { value: "기술, 임의소비재" }, { value: "QQQ, XLY" }],
          ["확장 (성장 지속)", { value: "에너지, 금융, 소재" }, { value: "XLE, XLF, XLB" }],
          ["후기 사이클 (물가 상승)", { value: "에너지, 헬스케어, 필수소비재" }, { value: "XLE, XLV, XLP" }],
          ["침체 (경기 수축)", { value: "채권, 금, 방어주" }, { value: "TLT, GLD, XLU" }],
        ]}
      />

      <ColumnCallout label="달리오 사이클과 연결해서 보기">
        달리오의 올웨더 포트폴리오는 4계절(경기×물가)에 모두 대응합니다.
        섹터 로테이션은 그 세부 전술입니다.
        현재 경제 국면에서 어느 섹터의 추세가 강한지 확인하면
        섹터 로테이션의 현재 위치를 파악할 수 있습니다.
      </ColumnCallout>

      <ColumnTipBox>
        섹터별 추세 상태를 확인하는 간단한 방법:<br />
        - 섹터 ETF (XLK, XLE, XLF 등)의 200일 이동평균선 위치를 확인<br />
        - 이평선 위: 해당 섹터가 상승 추세<br />
        - 이평선 아래: 해당 섹터가 하락 추세<br />
        - 섹터 간 추세 차이를 비교하면 현재 경제 사이클 국면을 추론할 수 있습니다.
      </ColumnTipBox>

      <ColumnCallout label="섹터 로테이션의 한계">
        섹터 로테이션 전략은 이론적으로 매력적이지만,
        실전에서는 경제 국면을 정확히 예측하기 어렵습니다.
        실제로 많은 섹터 로테이션 펀드가 인덱스를 하회합니다.
        <strong>S&P500 추세 신호를 기본으로 하고, 섹터는 참고 정도로 활용하는 것이 현실적입니다.</strong>
      </ColumnCallout>

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
