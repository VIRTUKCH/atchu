import React, { useState } from "react";

export default function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        type="button"
        className="collapsible-section-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="collapsible-section-title">{title}</span>
        {description && (
          <span className="collapsible-section-desc">{description}</span>
        )}
        <span className="collapsible-section-arrow">
          {isOpen ? "접기" : "펼치기"}
        </span>
      </button>
      {isOpen && <div className="collapsible-section-body">{children}</div>}
    </div>
  );
}
