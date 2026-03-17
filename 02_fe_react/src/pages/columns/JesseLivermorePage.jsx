import React from "react";
import {
  ColumnPage,
  ColumnHero,
  ColumnPullQuote,
  ColumnCallout,
  ColumnSectionTitle,
  ColumnTimeline,
  ColumnTimelineItem,
  ColumnMythFact,
  ColumnBackLink,
} from "../../components/column";

export default function JesseLivermorePage() {
  return (
    <ColumnPage>
      <ColumnHero
        tag="전설적 투자자"
        title="제시 리버모어: 추세추종의 원조 (1900년대)"
        desc="컴퓨터도, ETF도 없던 1900년대에 추세추종의 핵심 원칙을 발견한 월스트리트의 전설."
      />

      <ColumnPullQuote
        attribution="Jesse Livermore"
        role="월스트리트 역사상 가장 유명한 투기자"
      >
        절대로 추세를 거스르지 마라. 돈은 인내심을 갖고 앉아 있는 사람이 번다.
      </ColumnPullQuote>

      <ColumnCallout label="100년 전 원칙이 지금도 통한다">
        리버모어는 1900년대에 이미 추세추종의 핵심 원칙을 몸으로 터득했습니다.
        그의 원칙들은 100년이 지난 지금도 변하지 않았습니다.
        시장의 본질은 기술이 아니라 <strong>인간의 심리</strong>이기 때문입니다.
      </ColumnCallout>

      <ColumnSectionTitle>리버모어의 전설적 거래들</ColumnSectionTitle>

      <ColumnTimeline>
        <ColumnTimelineItem year="1907" title="금융공황 공매도로 300만 달러 수익">
          시장의 패닉 조짐을 미리 포착하고 공매도 포지션을 구축.
          당시로는 천문학적인 금액인 300만 달러 수익을 냈습니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="1929" title="대공황 예측으로 1억 달러 이상 수익">
          하락 추세를 확인하고 공격적인 공매도 포지션을 구축.
          대공황의 최대 수혜자이자 역사상 가장 성공한 공매도 트레이더로 기록됩니다.
        </ColumnTimelineItem>
        <ColumnTimelineItem year="교훈" title="원칙을 어겼을 때의 대가">
          리버모어는 여러 번 큰 손실을 입기도 했습니다.
          공통점은 단 하나 — 자신이 세운 원칙을 어겼을 때였습니다.
          추세를 거스르는 역방향 베팅이 파산으로 이어졌습니다.
        </ColumnTimelineItem>
      </ColumnTimeline>

      <ColumnMythFact
        myth="손실이 나면 평균 단가를 낮춰서 회복을 기다려라"
        fact="리버모어는 '손실을 빠르게 잘라내는 것'이 투자의 가장 중요한 원칙이라고 강조했습니다. 물타기는 작은 손실을 큰 손실로 만드는 가장 빠른 방법입니다."
      />

      <ColumnBackLink to="/more">← 칼럼으로 돌아가기</ColumnBackLink>
    </ColumnPage>
  );
}
