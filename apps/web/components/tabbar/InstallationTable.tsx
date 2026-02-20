'use client';

import * as React from 'react';
import type { AppColumnDef } from '@/types/ui-table';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '../table';

export type InstallationFilters = {
  /** ค้นหาแบบเบา ๆ (รวม ๆ) */
  query?: string;
};

type AfterFilterPayload<R> = {
  filteredRows: R[];
  pageRows: R[];
  totalRows: number;
};

type Props<R extends { id?: string | number }> = {
  rows: R[];
  columns: AppColumnDef<R>[];

  /** 1-based */
  page: number;
  pageSize: number;

  /** client-side only */
  onPageChange?: (nextPage: number) => void;

  filters: InstallationFilters;
  onAfterFilter?: (payload: AfterFilterPayload<R>) => void;

  /** ===== Selection (optional) ===== */
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (next: Set<string | number>) => void;
  getRowId?: (row: R) => string | number;

  /** ===== Passthrough (optional) ===== */
  variant?: 'default' | 'striped'; // ✅ ให้ตรงกับ DataTable
  size?: 'xs' | 'sm' | 'md';
  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  maxBodyHeight?: number;
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;
  clientSideSort?: boolean;
  onRowClick?: (row: R) => void;
  /** ให้ type ตรงกับ DataTable; ถ้าอยากให้ส่ง undefined ได้ ให้ wrap ตอนส่งเข้า DataTable */
  rowHref?: (row: R) => string | undefined;
  defaultColMinWidth?: number;
};

export function InstallationTable<R extends { id?: string | number }>(props: Props<R>) {
  const {
    rows,
    columns,
    page,
    pageSize,
    onPageChange,
    filters,
    onAfterFilter,

    // selection
    selectable = false,
    selectedIds,
    onSelectionChange,
    getRowId,

    // passthrough
    variant = 'default', // ✅ default ถูกกับ DataTable
    size = 'xs',
    emptyMessage = 'ไม่พบข้อมูล',
    isLoading,
    isError,
    errorMessage,
    maxBodyHeight = 340,
    sorting,
    onSortingChange,
    clientSideSort = false,
    onRowClick,
    rowHref,
    defaultColMinWidth = 88,
  } = props;

  const rowId = React.useCallback(
    (r: R) => (getRowId ? getRowId(r) : (r as any)?.id),
    [getRowId],
  );

  // ---- filter (client-side) ----
  const filtered = React.useMemo(() => {
    const q = (filters.query ?? '').trim().toLowerCase();
    if (!q) return rows;

    const includesQ = (value: unknown) =>
      String(value ?? '').toLowerCase().includes(q);

    return rows.filter((r) => {
      for (const c of columns) {
        const anyC = c as any;
        // accessorKey
        if (typeof anyC.accessorKey === 'string') {
          const v = (r as any)?.[anyC.accessorKey];
          if (includesQ(v)) return true;
        }
        // cell
        if (typeof anyC.cell === 'function') {
          let v: unknown = undefined;
          if (typeof anyC.accessorKey === 'string') {
            v = (r as any)?.[anyC.accessorKey];
          }
          const out = anyC.cell(v, r);
          const text = reactNodeToText(out);
          if (includesQ(text)) return true;
        }
      }
      return false;
    });
  }, [rows, columns, filters.query]);

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / Math.max(1, pageSize)));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const pageRows = React.useMemo(() => {
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return filtered.slice(startIdx, endIdx);
  }, [filtered, safePage, pageSize]);

  // callback ส่งผลกรองให้ parent (client-side mode เท่านั้น)
  React.useEffect(() => {
    onAfterFilter?.({
      filteredRows: filtered,
      pageRows,
      totalRows,
    });
  }, [filtered, pageRows, totalRows, onAfterFilter]);

  // ✅ แปลง onPaginationChange ของ DataTable (0-based) -> onPageChange ของเรา (1-based)
  const handlePaginationChange = React.useCallback(
    (next: PaginationState) => {
      onPageChange?.(next.pageIndex + 1);
    },
    [onPageChange],
  );

  // ✅ สร้าง rowHref สำหรับ DataTable ให้แน่ใจว่า return string เสมอ (หรือไม่ส่ง prop ถ้าไม่มี)
  const dtRowHref = React.useMemo(() => {
    if (!rowHref) return undefined;
    return (row: R) => rowHref(row) ?? ''; // fallback เป็น '' ถ้า undefined
  }, [rowHref]);

  return (
    <DataTable<R>
      columns={columns}
      /** ✅ ส่งเฉพาะแถวของหน้านี้เข้า DataTable เพื่อให้ selection header ทำงานเฉพาะหน้า */
      rows={pageRows}
      totalRows={totalRows}
      /** ✅ DataTable ใช้ 0-based pageIndex */
      pagination={{ pageIndex: safePage - 1, pageSize }}
      onPaginationChange={onPageChange ? handlePaginationChange : undefined}
      /** passthrough */
      variant={variant}            // 'default' | 'striped'
      size={size}
      emptyMessage={emptyMessage}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      maxBodyHeight={maxBodyHeight}
      sorting={sorting}
      onSortingChange={onSortingChange}
      clientSideSort={clientSideSort}
      onRowClick={onRowClick}
      rowHref={dtRowHref as any}   // ✅ ให้ type ตรงกับ DataTable (คืน string เสมอ)
      defaultColMinWidth={defaultColMinWidth}
      /** selection */
      selectable={selectable}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      getRowId={getRowId}
    />
  );
}

function reactNodeToText(n: React.ReactNode): string {
  if (n == null || typeof n === 'boolean') return '';
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(reactNodeToText).join(' ');
  const props = (n as any)?.props;
  if (props?.children) return reactNodeToText(props.children);
  try {
    return String(n);
  } catch {
    return '';
  }
}