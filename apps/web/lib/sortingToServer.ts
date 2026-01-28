
// src/lib/table/sortingToServer.ts
import { SortingState } from "@/types";
import { ServerSort } from "@/types/server-query";

export function sortingToServer(sorting: SortingState | undefined): ServerSort {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return {
    sortBy: String(first.id),
    sortOrder: first.desc ? "desc" : "asc",
  };
}
