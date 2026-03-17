import { useCallback, useState } from "react";

export default function useIndexEtfControls() {
  const [selectedType, setSelectedType] = useState("ALL");
  const [sortMode, setSortMode] = useState("type");

  const toggleType = useCallback((type) => {
    setSelectedType(type);
  }, []);

  return {
    selectedType,
    toggleType,
    sortMode,
    setSortMode
  };
}
