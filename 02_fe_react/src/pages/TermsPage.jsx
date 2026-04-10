import React from "react";
import "../styles/column.css";

export default function TermsPage() {
  return (
    <div className="col-page">
      <div className="col-hero">
        <span className="col-hero-tag">법적 고지</span>
        <h1 className="col-hero-title">이용약관</h1>
        <p className="col-hero-desc">최종 업데이트: 2026년 4월</p>
      </div>

      <div className="col-body">

        <section className="col-section">
          <h2 className="col-section-title">1. 서비스 성격</h2>
          <p className="col-section-text">
            앗추(Atchu)는 미국 ETF의 200일 이동평균선 기반 추세 상태를 자동 추적하는
            <strong> 데이터 시각화 도구</strong>입니다.
          </p>
          <p className="col-section-text">
            본 서비스는 자본시장과 금융투자업에 관한 법률(자본시장법)상
            투자자문업자가 아니며, 투자 자문·투자 권유·투자 추천을 제공하지 않습니다.
            서비스가 표시하는 모든 지표와 신호는 과거 데이터 기반의 참고용 정보입니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">2. 면책 조항</h2>
          <p className="col-section-text">
            본 서비스가 제공하는 모든 수익률·통계·지표는 과거 백테스트 결과이며,
            미래의 수익을 보장하지 않습니다.
          </p>
          <p className="col-section-text">
            실제 거래 시 세금·수수료·슬리피지 등으로 인해 백테스트 결과와 다를 수 있습니다.
          </p>
          <p className="col-section-text">
            본 서비스를 통해 얻은 정보를 근거로 내린 투자 판단과 그에 따른 결과(손실 포함)에
            대한 책임은 전적으로 이용자 본인에게 있습니다. 앗추 운영자는 이용자의 투자
            결과에 대해 어떠한 법적 책임도 지지 않습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">3. 데이터 출처</h2>
          <p className="col-section-text">
            본 서비스의 가격 데이터는 EODHD(EOD Historical Data)에서 수집한 후
            자체 파이프라인으로 가공하여 제공합니다. 원본 데이터의 정확성·완전성을
            보장하지 않으며, 데이터 오류로 인한 손해에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">4. 서비스 변경 및 중단</h2>
          <p className="col-section-text">
            앗추는 사전 예고 없이 서비스의 일부 또는 전체를 변경·중단할 수 있습니다.
            서비스 변경·중단으로 인한 손해에 대해 별도로 보상하지 않습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">5. 적용 법령</h2>
          <p className="col-section-text">
            본 약관 및 서비스 이용과 관련된 분쟁에는 대한민국 법령이 적용됩니다.
          </p>
        </section>

      </div>

      <div className="col-disclaimer">
        본 콘텐츠는 정보 제공 목적이며 특정 금융상품의 매수·매도를 권유하지 않습니다.
        과거 데이터와 백테스트 결과는 미래 수익을 보장하지 않습니다.
        투자 판단과 그에 따른 결과는 투자자 본인의 책임입니다.
      </div>
    </div>
  );
}
