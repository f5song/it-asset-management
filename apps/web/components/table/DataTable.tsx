
// src/components/datatable/DataTable.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { LoadingBody, ErrorBody, EmptyBody } from './DataTableStates';
import { DataTablePaginationBar } from './DataTablePaginationBar';
import { cn } from '../ui';

// ✅ ใช้ type กลางใหม่
import type { AppColumnDef, DataTableProps } from '../../types/table';

export function DataTable<TRow extends { id?: string | number }>(props: DataTableProps<TRow>) {
  const {
    columns,
    rows,
    totalRows,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    variant = 'default',
    size = 'xs',
    emptyMessage = 'ไม่มีข้อมูล',
    isLoading,
    isError,
    errorMessage,
    maxBodyHeight = 340,
    onRowClick,
    rowHref,
    defaultColMinWidth = 88,
    clientSideSort = false,
  } = props;

  const router = useRouter();

  const totalPages =
    totalRows && pagination ? Math.max(1, Math.ceil(totalRows / pagination.pageSize)) : undefined;

  const containerClass = cn('rounded-md border border-slate-200');
  const tableWrapperClass = 'overflow-x-auto overflow-y-auto';
  const tableClass = 'w-full min-w-[680px]';

  const handleRowNavigate = (row: TRow) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }
    if (rowHref) {
      const path = rowHref(row);
      if (path) router.push(path);
      return;
    }
    // ❌ ตัด fallback ที่ฮาร์ดโค้ดโดเมนออก เพื่อความ reusable
    // ถ้าอยากแจ้งเตือน:
    // console.warn('[DataTable] rowHref/onRowClick not provided. Navigation skipped.', row);
  };

  // ✅ toggleSort: TanStack style
  const toggleSort = (col: AppColumnDef<TRow>) => {
    const colId = String(col.accessorKey);
    const cur = sorting ?? [];
    const curFirst = cur[0];

    let next;
    if (curFirst && curFirst.id === colId) {
      next = [{ id: colId, desc: !curFirst.desc }];
    } else {
      next = [{ id: colId, desc: false }];
    }
    onSortingChange?.(next as any);
  };

  // ✅ (ตัวเลือก) ทำ client-side sort ที่นี่
  const effectiveRows = React.useMemo(() => {
    if (!clientSideSort) return rows;
    if (!sorting?.length) return rows;

    const { id, desc } = sorting[0];
    const col = columns.find((c) => String(c.accessorKey) === id);

    const getValue = (row: TRow) => {
      if (col?.getSortValue) return col.getSortValue(row);
      return (row as any)[id];
    };

    const cmp = (a: unknown, b: unknown) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1;
      if (b == null) return 1;

      if (typeof a === 'number' && typeof b === 'number') return a - b;

      const da = new Date(a as any);
      const db = new Date(b as any);
      const aIsDate = !isNaN(da.valueOf());
      const bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return da.getTime() - db.getTime();

      return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
    };

    const arr = [...rows]; // ✅ rows เป็น readonly ก็ clone มาก่อน
    arr.sort((ra, rb) => {
      const va = getValue(ra);
      const vb = getValue(rb);
      const res = cmp(va, vb);
      return desc ? -res : res;
    });
    return arr;
  }, [rows, sorting, columns, clientSideSort]);

  const colSpan = columns.length;

  return (
    <div className={containerClass}>
      <div className={tableWrapperClass} style={{ maxHeight: maxBodyHeight }}>
        <table className={tableClass}>
          <DataTableHeader<TRow>
            columns={columns}
            sorting={sorting}
            onToggleSort={toggleSort}
            size={size}
            defaultColMinWidth={defaultColMinWidth}
          />

          {isLoading && <LoadingBody colSpan={colSpan} size={size} />}
          {isError && !isLoading && <ErrorBody colSpan={colSpan} message={errorMessage} size={size} />}
          {!isLoading && !isError && effectiveRows.length === 0 && (
            <EmptyBody colSpan={colSpan} message={emptyMessage} size={size} />
          )}

          {!isLoading && !isError && effectiveRows.length > 0 && (
            <DataTableBody<TRow>
              columns={columns}
              rows={effectiveRows}
              variant={variant}
              size={size}
              defaultColMinWidth={defaultColMinWidth}
              onRowActivate={handleRowNavigate}
            />
          )}
        </table>
      </div>

      {pagination && onPaginationChange && (
        <DataTablePaginationBar
          pagination={pagination}
          totalPages={totalPages}
          onPaginationChange={onPaginationChange}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
