
// src/components/datatable/DataTable.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { LoadingBody, ErrorBody, EmptyBody } from './DataTableStates';
import { DataTablePaginationBar } from './DataTablePaginationBar';
import { ColumnDef, DataTableProps, SortingState } from '../../types';
import { cn } from '../ui';

export function DataTable<T extends { id?: string | number }>(props: DataTableProps<T>) {
  const {
    columns,
    rows,
    totalRows,
    pagination,
    onPaginationChange,
    sorting,              // ✅ TanStack: [{ id, desc }]
    onSortingChange,      // ✅ TanStack handler
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

  const handleRowNavigate = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }
    if (rowHref) {
      const path = rowHref(row);
      if (path) router.push(path);
      return;
    }
    const id = row.id;
    if (id !== undefined && id !== null) {
      router.push(`/software/inventory/${id}`);
    } else {
      console.warn('[DataTable] Cannot navigate: row.id is missing and rowHref not provided.', row);
    }
  };

  // ✅ toggleSort: TanStack style
  const toggleSort = (col: ColumnDef<T>) => {
    const colId = String(col.accessorKey);
    const cur = sorting ?? [];
    const curFirst = cur[0];

    let next: SortingState;
    if (curFirst && curFirst.id === colId) {
      // toggle desc
      next = [{ id: colId, desc: !curFirst.desc }];
    } else {
      // เริ่ม sort คอลัมน์ใหม่ -> asc (desc=false)
      next = [{ id: colId, desc: false }];
    }
    onSortingChange?.(next);
  };

  // ✅ (ตัวเลือก) ทำ client-side sort ที่นี่ ด้วย TanStack sorting
  const effectiveRows = React.useMemo(() => {
    if (!clientSideSort) return rows;
    if (!sorting?.length) return rows;

    // ตอนนี้ใช้เฉพาะคอลัมน์แรก (รองรับ multi-column ได้ถ้าต้องการ)
    const { id, desc } = sorting[0];
    const col = columns.find((c) => String(c.accessorKey) === id);

    const getValue = (row: T) => {
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

    const arr = [...rows];
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
          <DataTableHeader<T>
            columns={columns}
            sorting={sorting}                // ✅ TanStack sorting
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
            <DataTableBody<T>
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
