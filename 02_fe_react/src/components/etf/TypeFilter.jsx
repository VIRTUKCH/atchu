import React from "react";

export default function TypeFilter({ types, selectedType, onSelect, getTypeLabel }) {
  const labelResolver = getTypeLabel || ((value) => value);

  return (
    <div className="type-filter">
      <div className="type-button-group" role="group" aria-label="타입 선택">
        <button
          type="button"
          className={`type-button ${selectedType === "ALL" ? "active" : ""}`}
          onClick={() => onSelect("ALL")}
        >
          전체
        </button>
        {types.map((type) => (
          <button
            key={type}
            type="button"
            className={`type-button ${selectedType === type ? "active" : ""}`}
            onClick={() => onSelect(type)}
          >
            {labelResolver(type)}
          </button>
        ))}
      </div>
    </div>
  );
}
