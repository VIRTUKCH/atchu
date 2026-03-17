import React, { useState, useEffect, useCallback } from "react";
import "../../styles/guide-tour.css";

const TOUR_STEPS = [
  {
    targetSelector: ".type-filter",
    title: "ETF 타입",
    description: "'미국 대표 지수'부터 시작해 보세요. SPY, QQQ 같은 대표 ETF가 있습니다.",
    position: "bottom"
  },
  {
    targetSelector: ".index-card",
    title: "ETF 카드",
    description: "카드를 클릭하면 상세 정보를 볼 수 있어요. +면 현재가가 이평선 위, -면 아래에 있다는 뜻입니다.",
    position: "top"
  },
  {
    targetSelector: ".index-ma-chip:last-child",
    title: "200일 이평선",
    description: "+면 현재가가 200일 평균보다 위에 있다는 뜻이에요.",
    position: "left"
  }
];

const STORAGE_KEY = "atchu_guide_tour_done";

function calculateTooltipStyle(rect, position) {
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;
  const gap = 12;

  switch (position) {
    case "bottom":
      return {
        top: rect.bottom + scrollY + gap,
        left: Math.max(8, rect.left + scrollX + rect.width / 2 - 160)
      };
    case "top":
      return {
        top: rect.top + scrollY - gap,
        left: Math.max(8, rect.left + scrollX + rect.width / 2 - 160),
        transform: "translateY(-100%)"
      };
    case "left":
      return {
        top: rect.top + scrollY + rect.height / 2 - 60,
        left: Math.max(8, rect.left + scrollX - gap),
        transform: "translateX(-100%)"
      };
    default:
      return {
        top: rect.bottom + scrollY + gap,
        left: Math.max(8, rect.left + scrollX)
      };
  }
}

export default function GuideTour() {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [show, setShow] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "1"
  );

  const updateRect = useCallback(() => {
    if (!show) return;
    const el = document.querySelector(TOUR_STEPS[step]?.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [step, show]);

  useEffect(() => {
    if (!show) return;
    const el = document.querySelector(TOUR_STEPS[step]?.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const timer = setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [step, show]);

  useEffect(() => {
    if (!show) return;
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [show, updateRect]);

  const complete = useCallback(() => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      complete();
    }
  }, [step, complete]);

  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") complete();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, complete]);

  if (!show || !targetRect) return null;

  const current = TOUR_STEPS[step];
  const scrollY = window.scrollY || window.pageYOffset;
  const tooltipStyle = calculateTooltipStyle(targetRect, current.position);

  return (
    <>
      <div className="guide-tour-overlay" onClick={complete} />
      <div
        className="guide-tour-highlight"
        style={{
          top: targetRect.top + scrollY - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8
        }}
      />
      <div className={`guide-tour-tooltip guide-tour-tooltip--${current.position}`} style={tooltipStyle}>
        <div className="guide-tour-tooltip-header">
          <span className="guide-tour-step-badge">{step + 1} / {TOUR_STEPS.length}</span>
          <button type="button" className="guide-tour-skip" onClick={complete}>건너뛰기</button>
        </div>
        <strong className="guide-tour-tooltip-title">{current.title}</strong>
        <p className="guide-tour-tooltip-desc">{current.description}</p>
        <div className="guide-tour-tooltip-actions">
          {step > 0 && (
            <button type="button" className="guide-tour-prev" onClick={prev}>이전</button>
          )}
          <button type="button" className="guide-tour-next" onClick={next}>
            {step < TOUR_STEPS.length - 1 ? "다음" : "시작하기!"}
          </button>
        </div>
      </div>
    </>
  );
}
