import React from "react";
import "../styles/column.css";

export default function PrivacyPage() {
  return (
    <div className="col-page">
      <div className="col-hero">
        <span className="col-hero-tag">법적 고지</span>
        <h1 className="col-hero-title">개인정보 처리방침</h1>
        <p className="col-hero-desc">최종 업데이트: 2026년 4월</p>
      </div>

      <div className="col-body">

        <section className="col-section">
          <h2 className="col-section-title">1. 수집하는 정보</h2>
          <p className="col-section-text">
            앗추(Atchu)는 서비스 이용 과정에서 다음 정보를 자동으로 수집합니다.
          </p>
          <ul className="col-section-text" style={{ paddingLeft: "1.2em" }}>
            <li>방문 페이지, 체류 시간, 클릭 경로 등 이용 행태</li>
            <li>접속 기기 종류, 브라우저, 운영체제</li>
            <li>대략적인 접속 지역 (국가·도시 수준)</li>
            <li>쿠키 및 유사 식별자</li>
          </ul>
          <p className="col-section-text">
            회원가입·로그인·결제 기능이 없으므로 이름, 이메일, 연락처 등 식별 가능한 개인정보는 수집하지 않습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">2. 수집 목적</h2>
          <p className="col-section-text">
            수집된 데이터는 서비스 이용 현황 파악 및 기능 개선에만 사용됩니다.
            광고 타겟팅, 제3자 판매, 마케팅 발송에는 사용하지 않습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">3. 분석 도구 (Google Analytics 4)</h2>
          <p className="col-section-text">
            앗추는 Google Analytics 4(GA4)를 사용합니다. GA4는 쿠키를 통해 방문자 행태를 수집하며,
            수집된 데이터는 Google의 서버에 저장됩니다.
          </p>
          <p className="col-section-text">
            GA4 데이터 수집을 원하지 않으시면 브라우저 확장 프로그램인{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Google Analytics 옵트아웃 도구
            </a>
            를 사용하실 수 있습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">4. 보관 기간</h2>
          <p className="col-section-text">
            GA4 데이터 보관 기간은 기본 설정(14개월)을 따릅니다.
            보관 기간 경과 후 자동 삭제됩니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">5. 제3자 제공</h2>
          <p className="col-section-text">
            앗추는 Google Analytics 외에 개인정보를 제3자에게 제공하거나 공유하지 않습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">6. 이용자 권리</h2>
          <p className="col-section-text">
            본 방침 또는 개인정보 처리에 관한 문의는 Discord 서버를 통해 운영자에게 연락하실 수 있습니다.
          </p>
        </section>

        <section className="col-section">
          <h2 className="col-section-title">7. 방침 변경</h2>
          <p className="col-section-text">
            본 방침은 법령 변경 또는 서비스 변경에 따라 업데이트될 수 있습니다.
            변경 시 이 페이지에 최종 업데이트 날짜를 표시합니다.
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
