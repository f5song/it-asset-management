
// hooks/useTableState.ts
'use client';

import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';

export type SortLegacy = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

function sortingToLegacy(sorting: SortingState | undefined): SortLegacy {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return { sortBy: first.id, sortOrder: first.desc ? 'desc' : 'asc' };
}

export type UseTableStateOptions<F> = {
  pageSize?: number;
  initialSort?: SortingState; // v8
  initialFilters: F;
};

export function useTableState<F>(opts: UseTableStateOptions<F>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: opts.pageSize ?? 10,
  });

  const [sorting, setSorting] = useState<SortingState>(opts.initialSort ?? []);
  const legacySorting = useMemo(() => sortingToLegacy(sorting), [sorting]);

  const [filters, setFilters] = useState<F>(opts.initialFilters);
  const [searchText, setSearchText] = useState('');

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    legacySorting, // เผื่อ hook ดึงข้อมูลเดิมยังใช้รูปแบบเก่า
    filters,
    setFilters,
    searchText,
    setSearchText,
  };
}
