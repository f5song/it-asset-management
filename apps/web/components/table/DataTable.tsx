
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
    sorting,
    onSortingChange,
    variant = 'default',
    size = 'xs', // ✅ เล็กสุดเป็นค่าเริ่มต้น
    emptyMessage = 'ไม่มีข้อมูล',
    isLoading,
    isError,
    errorMessage,
    maxBodyHeight = 340,          // ✅ ลดความสูงเล็กลงเพื่อบีบพื้นที่
    onRowClick,
    rowHref,
    defaultColMinWidth = 88,      // ✅ ลด minWidth เพื่อใส่คอลัมน์ได้มากขึ้น
    clientSideSort = false,       // ✅ ถ้าต้องการ sort ใน client
  } = props;

  const router = useRouter();

  const totalPages =
    totalRows && pagination ? Math.max(1, Math.ceil(totalRows / pagination.pageSize)) : undefined;

  const containerClass = cn('rounded-md border border-slate-200');
  const tableWrapperClass = 'overflow-x-auto overflow-y-auto';
  const tableClass = 'w-full min-w-[680px]'; // ✅ ลดลงอีกเพื่อให้ยืดหยุ่นขึ้น

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

  // ✅ toggleSort แบบ generic: ใช้ accessorKey เป็น sortBy
  const toggleSort = (col: ColumnDef<T>) => {
    const current: SortingState<T> = sorting ?? {};
    const isSameCol = current.sortBy === col.accessorKey;
    const next: SortingState<T> = {
      sortBy: col.accessorKey,
      sortOrder: isSameCol ? (current.sortOrder === 'asc' ? 'desc' : 'asc') : 'asc',
    };
    onSortingChange?.(next);
  };

  // ✅ (ตัวเลือก) ทำ client-side sort ที่นี่ — ถ้าไม่ใช้ ให้ตั้ง clientSideSort=false แล้วไปทำ server-side แทน
  const effectiveRows = React.useMemo(() => {
    if (!clientSideSort || !sorting?.sortBy) return rows;

    const { sortBy, sortOrder = 'asc' } = sorting;
    const col = columns.find((c) => c.accessorKey === sortBy);

    const getValue = (row: T) => {
      if (col?.getSortValue) return col.getSortValue(row);
      return (row as any)[sortBy];
    };

    const arr = [...rows];
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va == null && vb == null) return 0;
      if (va == null) return sortOrder === 'asc' ? -1 : 1;
      if (vb == null) return sortOrder === 'asc' ? 1 : -1;
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }, [rows, sorting, columns, clientSideSort]);

  const colSpan = columns.length;

  return (
    <div className={containerClass}>
      {/* Scrollable body */}
      <div className={tableWrapperClass} style={{ maxHeight: maxBodyHeight }}>
        <table className={tableClass}>
          <DataTableHeader<T>
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
