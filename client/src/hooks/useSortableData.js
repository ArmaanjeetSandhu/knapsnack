import { useMemo, useState } from "react";

export const useSortableData = (items, getSortValue, config = null) => {
  const [sortConfig, setSortConfig] = useState(
    config || { key: null, direction: "ascending" },
  );

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;

        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;

        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig, getSortValue]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    )
      direction = "descending";

    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  return { sortedItems, requestSort, getSortIcon, sortConfig };
};
