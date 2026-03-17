import React from "react";
import { Link } from "react-router-dom";
import "../styles/guide.css";

export default function TrendGuidePage() {
  return (
    <div className="guide-page">
      {/* Hero */}
      <section className="guide-hero">
        <div className="guide-section-inner">
          <p className="guide-eyebrow">3분 가이드</p>
          <h1 className="guide-hero-title">
            추세 조회 페이지,<br />이렇게 보세요
          </h1>
          <p className="guide-hero-desc">
            처음 보는 화면이 복잡해 보여도 괜찮습니다.<br />
            핵심만 알면 30초 만에 읽을 수 있어요.
          </p>
        </div>
      </section>

      {/* Step 1: 핵심 개념 */}
      <section className="guide-step-section">
        <div className="guide-section-inner">
          <div className="guide-step-header">
            <span className="guide-step-number">1</span>
            <h2 className="guide-step-title">200일 이동평균선이란?</h2>
          </div>
          <div className="guide-concept-cards">
            <div className="guide-concept-card">
              <div className="guide-concept-icon">📊</div>
              <strong>이동평균선</strong>
              <p>지난 200거래일의 <strong>평균 가격</strong>입니다. 하루가 지날 때마다 새로 계산됩니다.</p>
            </div>
            <div className="guide-concept-card">
              <div className="guide-concept-icon">📈</div>
              <strong>상승 추세</strong>
              <p>현재 가격이 200일선 <strong>위에</strong> 있으면 상승 추세입니다. <span className="guide-text-up">초록색</span>으로 표시됩니다.</p>
            </div>
            <div className="guide-concept-card">
              <div className="guide-concept-icon">📉</div>
              <strong>하락 추세</strong>
              <p>현재 가격이 200일선 <strong>아래에</strong> 있으면 하락 추세입니다. <span className="guide-text-down">빨간색</span>으로 표시됩니다.</p>
            </div>
          </div>
          <div className="guide-tip-box">
            <strong>핵심 한 줄:</strong> 200일선 위 = 상승 추세, 아래 = 하락 추세. 이것만 기억하세요!
          </div>
        </div>
      </section>

      {/* Trust: 전설적 투자자들 */}
      <section className="guide-trust-section">
        <div className="guide-section-inner">
          <p className="guide-trust-eyebrow">검증된 방법</p>
          <h2 className="guide-trust-title">앗추만의 이야기가 아닙니다</h2>
          <p className="guide-trust-desc">
            전설적 투자자들이 이동평균선 매매로 수십 년간 위기에서 살아남았습니다.<br />
            그리고 가장 많이 사용한 기준이 바로 200일선입니다.
          </p>
          <div className="guide-quote-grid">
            <Link to="/paul_tudor_jones" className="guide-quote-card">
              <blockquote className="guide-quote-text">
                "200일 이평선 규칙을 쓰면 모든 것을 잃는 상황을 피할 수 있다."
              </blockquote>
              <div className="guide-quote-person">
                <strong>폴 튜더 존스</strong>
                <span>헤지펀드 매니저 · 45년+ 운용</span>
              </div>
              <span className="guide-quote-link">칼럼 읽기 →</span>
            </Link>
            <Link to="/marty_schwartz" className="guide-quote-card">
              <blockquote className="guide-quote-text">
                "이동평균선은 매수·매도 중 어느 쪽이 우위인지 판단하는 가장 빠른 방법이다."
              </blockquote>
              <div className="guide-quote-person">
                <strong>마티 슈워츠</strong>
                <span>챔피언 트레이더 · Market Wizards 수록</span>
              </div>
              <span className="guide-quote-link">칼럼 읽기 →</span>
            </Link>
            <Link to="/faber_paper" className="guide-quote-card">
              <blockquote className="guide-quote-text">
                "10개월(≈200일) 이평선 하나만으로 100년 데이터를 검증했다."
              </blockquote>
              <div className="guide-quote-person">
                <strong>Mebane Faber 논문</strong>
                <span>SSRN 200,000+ 다운로드</span>
              </div>
              <span className="guide-quote-link">칼럼 읽기 →</span>
            </Link>
          </div>
          <Link to="/more" className="guide-trust-more">
            42개 칼럼에서 더 자세히 알아보기 →
          </Link>
        </div>
      </section>

      {/* Step 2: 카드 읽는 법 */}
      <section className="guide-step-section guide-step-section--alt">
        <div className="guide-section-inner">
          <div className="guide-step-header">
            <span className="guide-step-number">2</span>
            <h2 className="guide-step-title">ETF 카드 읽는 법</h2>
          </div>
          <p className="guide-step-desc">
            추세 조회 페이지에서 각 ETF는 카드 형태로 보입니다.<br />
            카드 오른쪽의 200일 이평선 칩이 가장 중요합니다.
          </p>
          <div className="guide-mock-card">
            <div className="guide-mock-left">
              <div className="guide-mock-ticker">SPY</div>
              <div className="guide-mock-price">$542.21</div>
              <div className="guide-mock-change guide-text-up">(+1.23%)</div>
            </div>
            <div className="guide-mock-right">
              <div className="guide-mock-chip">
                <span className="guide-mock-chip-label">200일</span>
                <strong>$498.30</strong>
                <em className="guide-text-up">+8.81%</em>
                <em className="guide-mock-chip-holding">상향 45D</em>
              </div>
              <div className="guide-mock-annotations">
                <div className="guide-mock-annotation">
                  <span className="guide-annotation-arrow">←</span>
                  <span>200일 평균 가격</span>
                </div>
                <div className="guide-mock-annotation">
                  <span className="guide-annotation-arrow">←</span>
                  <span>현재가보다 8.81% 위 (<span className="guide-text-up">상승 추세</span>)</span>
                </div>
                <div className="guide-mock-annotation">
                  <span className="guide-annotation-arrow">←</span>
                  <span>45일째 이평선 위 유지 — "상향"은 위, "하향"은 아래</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: 상세 페이지 */}
      <section className="guide-step-section">
        <div className="guide-section-inner">
          <div className="guide-step-header">
            <span className="guide-step-number">3</span>
            <h2 className="guide-step-title">상세 페이지 핵심</h2>
          </div>
          <p className="guide-step-desc">
            카드를 클릭하면 상세 페이지로 이동합니다. 처음엔 이것만 보세요.
          </p>
          <div className="guide-detail-tips">
            <div className="guide-detail-tip">
              <span className="guide-detail-tip-icon">🟢</span>
              <div>
                <strong>추세 신호</strong>
                <p>상단의 초록/빨강 신호로 상승/하락 추세를 즉시 확인</p>
              </div>
            </div>
            <div className="guide-detail-tip">
              <span className="guide-detail-tip-icon">📈</span>
              <div>
                <strong>그래프</strong>
                <p>검은 선이 주가, 빨간 점선이 200일선. 주가가 빨간선 위면 상승 추세</p>
              </div>
            </div>
            <div className="guide-detail-tip">
              <span className="guide-detail-tip-icon">💡</span>
              <div>
                <strong>나머지는 무시해도 됩니다</strong>
                <p>"심플 보기" 모드를 사용하면 복잡한 정보는 자동으로 숨겨집니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: 실전 */}
      <section className="guide-step-section guide-step-section--cta">
        <div className="guide-section-inner">
          <div className="guide-step-header">
            <span className="guide-step-number">4</span>
            <h2 className="guide-step-title">직접 확인해 보세요</h2>
          </div>
          <p className="guide-step-desc">
            미국 대표 지수 SPY로 시작하는 걸 추천합니다.
          </p>
          <div className="guide-cta-buttons">
            <Link to="/index_etf/SPY" className="guide-cta-primary">
              SPY 상세 보러가기 →
            </Link>
            <Link to="/index_etf" className="guide-cta-secondary">
              85개 ETF 전체 탐색 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
