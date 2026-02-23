import { useMemo, useState } from "react";
import type { SortDirection } from "../lib/resultsHelpers";

export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export interface UseSortableDataReturn<T> {
  sortedItems: T[];
  requestSort: (key: string) => void;
  getSortIcon: (key: string) => string | null;
  sortConfig: SortConfig;
}

export const useSortableData = <T>(
  items: T[],
  getSortValue: (item: T, key: string) => string | number,
  config: SortConfig | null = null,
): UseSortableDataReturn<T> => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    config ?? { key: null, direction: "ascending" },
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return [...items];

    return [...items].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key!);
      const bValue = getSortValue(b, sortConfig.key!);

      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig, getSortValue]);

  const requestSort = (key: string): void => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const getSortIcon = (key: string): string | null => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  return { sortedItems, requestSort, getSortIcon, sortConfig };
};
