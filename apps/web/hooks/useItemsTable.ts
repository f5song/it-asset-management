
// src/hooks/useItemsTable.ts
import { useQuery } from '@tanstack/react-query';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { getItemsStock } from '../app/api/itemsService';
import { SoftwareItem, SoftwareStatus, SoftwareType } from '../types';

export type BaseItem = { id: string | number };

export type LegacySorting = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

function sortingToLegacy(sorting: SortingState | undefined): LegacySorting {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return { sortBy: first.id, sortOrder: first.desc ? 'desc' : 'asc' };
}

type ItemsResponse<TRow> = {
  data: TRow[];
  pagination: { total: number };
};

export function useItemsTable<
  TItem extends SoftwareItem,
  // ✅ จำกัด generic ให้เป็นซับเซ็ตของชนิดที่ service ต้องการ
  TStatus extends SoftwareStatus = SoftwareStatus,
  TType extends SoftwareType = SoftwareType
>(params: {
  pagination: PaginationState;
  sorting?: SortingState;
  legacySorting?: LegacySorting;

  statusFilter?: TStatus;
  typeFilter?: TType;
  manufacturerFilter?: string;
  vendorFilter?: string;
  searchText?: string;

  select?: (rows: unknown[]) => TItem[];
}) {
  const {
    pagination,
    sorting,
    legacySorting,
    statusFilter,
    typeFilter,
    manufacturerFilter,
    vendorFilter,
    searchText,
    select,
  } = params;

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;
  const sortParams = legacySorting ?? sortingToLegacy(sorting);
  const vendorOrManufacturer = vendorFilter ?? manufacturerFilter ?? null;

  const q = useQuery({
    queryKey: [
      'items-table',
      {
        page,
        limit,
        sortBy: sortParams.sortBy ?? undefined,
        sortOrder: sortParams.sortOrder,
        statusFilter: statusFilter ?? null,
        typeFilter: typeFilter ?? null,
        vendorOrManufacturer,
        searchText: searchText ?? '',
      },
    ] as const,
    queryFn: async () => {
      const res = await getItemsStock({
        page,
        limit,
        sortBy: sortParams.sortBy,
        sortOrder: sortParams.sortOrder,
        // ✅ cast ให้เข้ากับ signature service (ปลอดภัยเพราะ TStatus/TType ถูกจำกัดแล้ว)
        statusFilter: statusFilter as SoftwareStatus | undefined,
        typeFilter: typeFilter as SoftwareType | undefined,
        manufacturerFilter: vendorOrManufacturer ?? undefined,
        searchText,
      });

      const r = res as unknown as ItemsResponse<unknown>;
      const rows = select ? select(r.data) : (r.data as TItem[]);
      return { rows, total: r.pagination?.total ?? 0 };
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    rows: q.data?.rows ?? [],
    totalRows: q.data?.total ?? 0,
    isLoading: q.isLoading,
    isError: q.isError,
    errorMessage: (q.error as Error | undefined)?.message,
    refetch: q.refetch,
  };
}
