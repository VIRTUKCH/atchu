import React from "react";
import "../../styles/column.css";

export function ColumnPage({ children }) {
  return (
    <div className="col-page">
      {children}
      <div className="col-disclaimer">
        본 콘텐츠는 정보 제공 목적이며 특정 금융상품의 매수·매도를 권유하지 않습니다.
        과거 데이터와 백테스트 결과는 미래 수익을 보장하지 않습니다.
        투자 판단과 그에 따른 결과는 투자자 본인의 책임입니다.
      </div>
    </div>
  );
}
