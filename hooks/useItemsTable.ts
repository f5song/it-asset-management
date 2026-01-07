
// src/hooks/useItemsTable.ts
import { useQuery } from '@tanstack/react-query';
import { getItemsStock } from '../services/itemsService';
import type { Item, ItemStatus } from '../mock/mockSoftware';
import type { PaginationState, SortingState } from '../types/table';

export function useItemsTable(params: {
  pagination: PaginationState;
  sorting: SortingState<Item>;
  statusFilter?: ItemStatus;
}) {
  const { pagination, sorting, statusFilter } = params;

  const page = pagination.pageIndex + 1; // map 0-based -> 1-based
  const limit = pagination.pageSize;

  const queryKey = [
    'items-table',
    { page, limit, sortBy: sorting.sortBy, sortOrder: sorting.sortOrder, statusFilter },
  ];

  const q = useQuery({
    queryKey,
    queryFn: () =>
      getItemsStock({
        page,
        limit,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        statusFilter,
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
    errorMessage: q.error?.message,
    refetch: q.refetch,
  };
}
