// src/hooks/useItemsTable.ts
import { useQuery } from "@tanstack/react-query";
import { getItemsStock } from "../services/itemsService";
import type { Item, ItemStatus } from "../mock/mockSoftware";
import type { PaginationState, SortingState } from "../types/table";
import { SoftwareType } from "@/mock/types";

export function useItemsTable(params: {
  pagination: PaginationState;
  sorting: SortingState<Item>;
  statusFilter?: ItemStatus;
  typeFilter?: SoftwareType;
  manufacturerFilter?: string;
  searchText?: string;
}) {
  const {
    pagination,
    sorting,
    statusFilter,
    typeFilter,
    manufacturerFilter,
    searchText,
  } = params;

  const page = pagination.pageIndex + 1; // 0-based -> 1-based
  const limit = pagination.pageSize;

  const queryKey = [
    "items-table",
    {
      page,
      limit,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
      statusFilter: statusFilter ?? null,
      typeFilter: typeFilter ?? null,
      manufacturerFilter: manufacturerFilter ?? null,
      searchText: searchText ?? "",
    },
  ] as const;

  const q = useQuery({
    queryKey,
    queryFn: () =>
      getItemsStock({
        page,
        limit,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        statusFilter,
        typeFilter,
        manufacturerFilter,
        searchText,
      }),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    rows: q.data?.data ?? [],
    totalRows: q.data?.pagination.total ?? 0,
    isLoading: q.isLoading,
    isError: q.isError,
    errorMessage: (q.error as Error | undefined)?.message,
    refetch: q.refetch,
  };
}
