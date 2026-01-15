
// components/page/ListPageShell.tsx
'use client';

import React, { useMemo, useState } from 'react';

import { PageHeader } from '../ui/PageHeader';
import { ColumnDef} from '../../types';
import { DataTable } from '../table';
import { PaginationState, SortingState } from '@tanstack/react-table';

type Breadcrumb = { label: string; href: string };
type ExportFmt = 'CSV' | 'XLSX' | 'PDF';

// รองรับทั้ง v8 และ legacy sorting
export type LegacySorting = { sortBy?: string; sortOrder?: 'asc' | 'desc' };

type ListPageShellProps<TItem, TFilter> = {
  title: string;
  breadcrumbs: Breadcrumb[];
  columns: ColumnDef<TItem>[];

  /** ค่าเริ่มต้นของ grid */
  initialPageSize?: number;
  initialSorting?: SortingState;

  /** ส่วน Filter UI (คุณใส่ FilterBar ของหน้าแต่ละหน้าเข้ามาได้) */
  renderFilterBar?: (ctx: {
    filters: TFilter;
    setFilters: React.Dispatch<React.SetStateAction<TFilter>>;
    searchText: string;
    setSearchText: (s: string) => void;
    onExport: (fmt: ExportFmt) => void;
    onAdd?: () => void;
  }) => React.ReactNode;

  /** แปลง filters ของหน้านี้ → พารามิเตอร์ที่ useQueryHook ต้องการ */
  mapFiltersToQueryParams: (filters: TFilter) => Record<string, unknown>;

  /** ฟังก์ชันดึงข้อมูล */
  useQueryHook: (params: {
    pagination: PaginationState;
    sorting: SortingState | LegacySorting; // รองรับทั้ง v8 และ legacy
    searchText: string;
    queryParams: Record<string, unknown>;
  }) => {
    rows: TItem[];
    totalRows: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
  };

  /** action บนแถบ filter */
  onExport?: (fmt: ExportFmt) => void;
  onAdd?: () => void;

  /** ค่าเริ่มต้นของ filters */
  initialFilters: TFilter;
};

/** adapter: v8 SortingState → legacy */
function sortingToLegacy(sorting: SortingState | undefined): LegacySorting {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return { sortBy: first.id, sortOrder: first.desc ? 'desc' : 'asc' };
}

export function ListPageShell<TItem extends { id?: string | number }, TFilter>({
  title,
  breadcrumbs,
  columns,
  initialPageSize = 8,
  initialSorting = [{ id: 'id', desc: false }],
  renderFilterBar,
  mapFiltersToQueryParams,
  useQueryHook,
  onExport = () => {},
  onAdd,
  initialFilters,
}: ListPageShellProps<TItem, TFilter>) {
  /** ---------- filters + search ---------- */
  const [filters, setFilters] = useState<TFilter>(initialFilters);
  const [searchText, setSearchText] = useState('');

  /** ---------- table states ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  /** ---------- query params ---------- */
  const queryParams = useMemo(
    () => mapFiltersToQueryParams(filters),
    [filters, mapFiltersToQueryParams]
  );

  /** ---------- เรียก hook ดึงข้อมูล ---------- */
  // NOTE: ถ้า hook รองรับ v8 แล้ว เปลี่ยนเป็นส่ง `sorting` ได้เลย
  const { rows, totalRows, isLoading, isError, errorMessage } = useQueryHook({
    pagination,
    sorting: sortingToLegacy(sorting),
    searchText,
    queryParams,
  });

  return (
    <main>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />

      {/* Filter Region */}
      {renderFilterBar?.({
        filters,
        setFilters,
        searchText,
        setSearchText,
        onExport,
        onAdd,
      })}

      {/* Table */}
      <DataTable<TItem>
        columns={columns}
        rows={rows}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        variant="striped"
        emptyMessage="ไม่พบรายการ"
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        maxBodyHeight={420}
      />
    </main>
  );
}
