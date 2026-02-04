
// src/components/datatable/DataTable.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { LoadingBody, ErrorBody, EmptyBody } from './DataTableStates';
import { DataTablePaginationBar } from './DataTablePaginationBar';
import { cn } from '../ui';

import type { AppColumnDef, DataTableProps as _DataTableProps } from '../../types/ui-table';

type ExtraSelectionProps<TRow extends { id?: string | number }> = {
  /** เปิด/ปิด checkbox selection */
  selectable?: boolean;
  /** ชุด ids ที่ถูกเลือก (controlled) */
  selectedIds?: Set<string | number>;
  /** รายงานค่า selection ใหม่เมื่อ tick/untick */
  onSelectionChange?: (next: Set<string | number>) => void;
  /** กำหนดวิธีอ่าน id ของแถว (ถ้าไม่ใช่ field 'id') */
  getRowId?: (row: TRow) => string | number;
  /** 'page' = เลือกเฉพาะในหน้านี้ | 'all' = ทั้ง dataset (ต้องมี backend รองรับ) */
  selectionScope?: 'page' | 'all';
};

export type DataTableProps<TRow extends { id?: string | number }> =
  _DataTableProps<TRow> & ExtraSelectionProps<TRow>;

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

    // selection
    selectable = false,
    selectedIds,
    onSelectionChange,
    getRowId,
  } = props;

  const router = useRouter();

  const rowId = React.useCallback(
    (r: TRow) => (getRowId ? getRowId(r) : (r.id as string | number)),
    [getRowId],
  );

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
  };

  // TanStack toggle sort style
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

  // (optional) client-side sort (ใช้เฉพาะตารางเล็ก / mock)
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

    const arr = [...rows]; // clone เผื่อ rows เป็น readonly
    arr.sort((ra, rb) => {
      const va = getValue(ra);
      const vb = getValue(rb);
      const res = cmp(va, vb);
      return desc ? -res : res;
    });
    return arr;
  }, [rows, sorting, columns, clientSideSort]);

  // +1 คอลัมน์ ถ้ามีช่อง checkbox
  const colSpan = columns.length + (selectable ? 1 : 0);

  // เลือกทีละแถว
  const toggleRow = React.useCallback(
    (row: TRow, checked: boolean) => {
      if (!onSelectionChange || !selectedIds) return;
      const id = rowId(row);
      const next = new Set(selectedIds);
      if (checked) next.add(id);
      else next.delete(id);
      onSelectionChange(next);
    },
    [onSelectionChange, selectedIds, rowId],
  );

  // เลือกทั้งหน้า
  const togglePage = React.useCallback(
    (checked: boolean) => {
      if (!onSelectionChange || !selectedIds) return;
      const next = new Set(selectedIds);
      effectiveRows.forEach((r) => {
        const id = rowId(r);
        if (checked) next.add(id);
        else next.delete(id);
      });
      onSelectionChange(next);
    },
    [onSelectionChange, selectedIds, effectiveRows, rowId],
  );

  const headerChecked = React.useMemo(() => {
    if (!selectedIds || !effectiveRows.length) return false;
    return effectiveRows.every((r) => selectedIds.has(rowId(r)));
  }, [selectedIds, effectiveRows, rowId]);

  const headerIndeterminate = React.useMemo(() => {
    if (!selectedIds || !effectiveRows.length) return false;
    const countChecked = effectiveRows.filter((r) => selectedIds.has(rowId(r))).length;
    return countChecked > 0 && countChecked < effectiveRows.length;
  }, [selectedIds, effectiveRows, rowId]);

  return (
    <div className={containerClass}>
      <div className={tableWrapperClass} style={{ maxHeight: maxBodyHeight }}>
        <table className={tableClass}>
          {/* ✅ Header */}
          <DataTableHeader<TRow>
            columns={columns}
            sorting={sorting}
            onToggleSort={toggleSort}
            size={size}
            defaultColMinWidth={defaultColMinWidth}
            // ✅ ช่องนำหน้า: checkbox select page
            leadingHeaderCell={
              selectable ? (
                <th className="w-10 px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    aria-label="Select page"
                    checked={headerChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = headerIndeterminate;
                    }}
                    onChange={(e) => togglePage(e.target.checked)}
                  />
                </th>
              ) : undefined
            }
          />

          {/* States */}
          {isLoading && <LoadingBody colSpan={colSpan} size={size} />}
          {isError && !isLoading && <ErrorBody colSpan={colSpan} message={errorMessage} size={size} />}
          {!isLoading && !isError && effectiveRows.length === 0 && (
            <EmptyBody colSpan={colSpan} message={emptyMessage} size={size} />
          )}

          {/* ✅ Body */}
          {!isLoading && !isError && effectiveRows.length > 0 && (
            <DataTableBody<TRow>
              columns={columns}
              rows={effectiveRows}
              variant={variant}
              size={size}
              defaultColMinWidth={defaultColMinWidth}
              onRowActivate={handleRowNavigate}
              // ✅ ส่งเฉพาะ “content” ของเซลล์ ไม่ใช่ <td> ครอบ
              renderLeadingCell={
                selectable
                  ? (row) => (
                      <input
                        type="checkbox"
                        checked={!!selectedIds?.has(rowId(row))}
                        onChange={(e) => toggleRow(row, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select row"
                      />
                    )
                  : undefined
              }
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
