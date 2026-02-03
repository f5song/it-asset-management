

import { ServerSort } from "@/types/server-query";
import { SortingState } from "@tanstack/react-table";

export function sortingToServer(sorting: SortingState | undefined): ServerSort {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return {
    sortBy: String(first.id),
    sortOrder: first.desc ? "desc" : "asc",
  };
}
