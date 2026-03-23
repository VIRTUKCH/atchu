import React from "react";

export default function EtfSummaryMovingAverages({ items, formatPrice, formatSignedPercent, cagrValue, cagrClass, mddValue, mddClass, cagrAlignmentValue, cagrAlignmentClass, mddAlignmentValue, mddAlignmentClass, cagrAtchuAlignValue, cagrAtchuAlignClass, mddAtchuAlignValue, mddAtchuAlignClass, dataStartLabel }) {
  const item = items[0];
  if (!item) return null;

  const diffClass =
    item.diff === null || item.diff === undefined
      ? ""
      : Number(item.diff) >= 0
      ? "change-up"
      : "change-down";
  const hasBreakout =
    item.breakoutDays !== null &&
    item.breakoutDays !== undefined &&
    !Number.isNaN(Number(item.breakoutDays));
  const breakoutWordClass =
    item.breakoutDirection === "down"
      ? "down"
      : item.breakoutDirection === "up"
      ? "up"
      : "";

  return (
    <dl className="index-ma-dl">
      <div className="index-ma-dl-row">
        <dt>200일선 가격</dt>
        <dd><strong>{formatPrice(item.value)}</strong></dd>
      </div>
      <div className="index-ma-dl-row">
        <dt>200일선 대비 이격률</dt>
        <dd><strong className={diffClass}>{formatSignedPercent(item.diff)}</strong></dd>
      </div>
      <div className="index-ma-dl-row">
        <dt>200일선 돌파 이후</dt>
        <dd>
          <strong>
            <span className={`index-ma-breakout-word ${breakoutWordClass}`}>
              {item.breakoutDirection === "up" ? "상향" : item.breakoutDirection === "down" ? "하향" : "-"}
            </span>{" "}
            {hasBreakout ? `${Number(item.breakoutDays)}일` : "-"}
          </strong>
        </dd>
      </div>
      {cagrValue && (
        <div className="index-ma-dl-row">
          <dt>연평균 수익률 (앗추 필터)</dt>
          <dd><strong className={cagrClass || ""}>{cagrValue}</strong></dd>
        </div>
      )}
      {mddValue && (
        <div className="index-ma-dl-row">
          <dt>최악의 낙폭 (앗추 필터)</dt>
          <dd><strong className={mddClass || ""}>{mddValue}</strong></dd>
        </div>
      )}
      {cagrAlignmentValue && (
        <div className="index-ma-dl-row">
          <dt>연평균 수익률 (정배열)</dt>
          <dd><strong className={cagrAlignmentClass || ""}>{cagrAlignmentValue}</strong></dd>
        </div>
      )}
      {mddAlignmentValue && (
        <div className="index-ma-dl-row">
          <dt>최악의 낙폭 (정배열)</dt>
          <dd><strong className={mddAlignmentClass || ""}>{mddAlignmentValue}</strong></dd>
        </div>
      )}
      {cagrAtchuAlignValue && (
        <div className="index-ma-dl-row">
          <dt>연평균 수익률 (앗추+정배열)</dt>
          <dd><strong className={cagrAtchuAlignClass || ""}>{cagrAtchuAlignValue}</strong></dd>
        </div>
      )}
      {mddAtchuAlignValue && (
        <div className="index-ma-dl-row">
          <dt>최악의 낙폭 (앗추+정배열)</dt>
          <dd><strong className={mddAtchuAlignClass || ""}>{mddAtchuAlignValue}</strong></dd>
        </div>
      )}
      {dataStartLabel && (
        <div className="index-ma-dl-row">
          <dt>데이터 시작</dt>
          <dd><strong>{dataStartLabel}~</strong></dd>
        </div>
      )}
    </dl>
  );
}
