
// hooks/useSoftwareQuery.ts
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { SoftwareItem } from '../types/software';
import type { LegacySorting } from '../components/page/ListPageShell';

export function useSoftwareQuery({
  pagination,
  sorting,
  searchText,
  queryParams,
}: {
  pagination: PaginationState;
  sorting: SortingState | LegacySorting;
  searchText: string;
  queryParams: Record<string, unknown>;
}) {
  // 1) normalize sorting → v8
  const normalizedSorting: SortingState =
    Array.isArray(sorting)
      ? sorting
      : sorting?.sortBy
      ? [{ id: sorting.sortBy!, desc: sorting.sortOrder === 'desc' }]
      : [];

  // 2) TODO: call API/data source
  // const { data, isLoading, isError, error } = useQuery(...)
  // ตัวอย่าง mock:
  const rows: SoftwareItem[] = [];
  const totalRows = 0;
  const isLoading = false;
  const isError = false;
  const errorMessage = undefined;

  return { rows, totalRows, isLoading, isError, errorMessage };
}
