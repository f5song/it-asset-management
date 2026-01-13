
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Pagination } from '../pagination/Pagination';
import type { PaginationState, SortingState } from '@tanstack/react-table';

export type ColumnDef<T> = {
  /** column id ที่ใช้กับ sorting/filtering ให้เป็น string เสมอ */
  id: string;
  header: string;
  /** คีย์ข้อมูลในแถว */
  accessorKey: keyof T;
  width?: number;
  /** custom cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
};

export type DataTableProps<T extends { id?: string | number }> = {
  columns: ColumnDef<T>[];
  rows: T[];
  totalRows?: number;

  /** TanStack v8 pagination state */
  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;

  /** TanStack v8: Array<{ id: string; desc: boolean }> */
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;

  variant?: 'default' | 'striped';
  emptyMessage?: string;

  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;

  /** สูงสุดของตาราง (px) ถ้าเกินจะ scroll แนวตั้ง */
  maxBodyHeight?: number;

  /** คลิกแถวแล้วทำอะไร (ถ้าส่งมา จะใช้อันนี้ก่อน) */
  onRowClick?: (row: T) => void;

  /** สร้างเส้นทางของแถว เช่น row => `/software/${row.id}` */
  rowHref?: (row: T) => string;
};

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
    emptyMessage = 'ไม่มีข้อมูล',
    isLoading,
    isError,
    errorMessage,
    maxBodyHeight = 420,
    onRowClick,
    rowHref,
  } = props;

  const router = useRouter();

  const totalPages =
    totalRows && pagination ? Math.ceil(totalRows / pagination.pageSize) : undefined;

  const tableClass = variant === 'striped' ? 'table-striped' : 'table-default';

  const handleRowNavigate = (row: T) => {
    // หากมี onRowClick ให้ใช้ก่อน
    if (onRowClick) {
      onRowClick(row);
      return;
    }
    // ถ้ามี rowHref ใช้ path ที่ส่งมา
    if (rowHref) {
      const path = rowHref(row);
      if (path) router.push(path);
      return;
    }
    // Fallback: ใช้ id ของ row
    const id = row.id;
    if (id !== undefined && id !== null) {
      router.push(`/software/${id}`);
    } else {
      // ถ้าไม่มี id และไม่มี rowHref → ไม่ทำอะไร
      console.warn(
        '[DataTable] Cannot navigate: row.id is missing and rowHref not provided.',
        row,
      );
    }
  };

  /**
   * Toggle logic สำหรับ sorting v8:
   * - ถ้าคอลัมน์นี้ active → สลับ desc
   * - ถ้าไม่ active → ตั้งให้ sort asc (desc=false)
   * - ตัวอย่างนี้ใช้ single-sort → reset เป็น 1 รายการ
   */
  const toggleSort = (colId: string) => {
    const current: SortingState = Array.isArray(sorting) ? sorting : [];
    const active = current.find((s) => s.id === colId);
    const next: SortingState = [{ id: colId, desc: active ? !active.desc : false }];
    onSortingChange?.(next);
  };

  return (
    <div className={tableClass} style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
      {/* Body (แนวนอน/แนวตั้ง scroll ได้) */}
      <div
        className="table-scroll-both"
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: maxBodyHeight,
        }}
      >
        <table style={{ minWidth: 1000, width: '100%' }}>
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: '#f9fafb',
              zIndex: 1,
            }}
          >
            <tr>
              {columns.map((col) => {
                const colId = col.id; // ใช้ id (string) เป็นตัวอ้างอิง sort
                const safeSorting: SortingState = Array.isArray(sorting) ? sorting : [];
                const active = safeSorting.find((s) => s.id === colId);
                const indicator = active ? (active.desc ? ' 🔽' : ' 🔼') : ''; // asc=🔼, desc=🔽

                return (
                  <th
                    key={col.id}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      minWidth: col.width ?? 140,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(colId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      aria-pressed={!!active}
                    >
                      {col.header}
                      {indicator}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

            {/* Loading/Error/Empty states: render เป็น row เดียวใน tbody เพื่อ layout คงที่ */}
            {isLoading && (
              <tbody>
                <tr>
                  <td colSpan={columns.length} style={{ padding: 16 }}>
                    กำลังโหลด...
                  </td>
                </tr>
              </tbody>
            )}

            {isError && !isLoading && (
              <tbody>
                <tr>
                  <td colSpan={columns.length} style={{ padding: 16, color: '#b91c1c' }}>
                    {errorMessage ?? 'เกิดข้อผิดพลาด'}
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={columns.length} style={{ padding: 16 }}>
                    {emptyMessage}
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && !isError && rows.length > 0 && (
              <tbody>
                {rows.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRowNavigate(row)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleRowNavigate(row);
                    }}
                  >
                    {columns.map((c) => {
                      const value = (row as any)[c.accessorKey];
                      return (
                        <td
                          key={c.id}
                          style={{
                            padding: '10px 12px',
                            minWidth: c.width ?? 140,
                            whiteSpace: 'nowrap',
                          }}
                          // ป้องกันปุ่ม/ลิงก์ภายในเซลล์ทำให้แถว trigger navigate
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button,a,[role="button"]')) e.stopPropagation();
                          }}
                        >
                          {c.cell ? c.cell(value, row) : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            )}
        </table>
      </div>

      {pagination && onPaginationChange && (
        <div className="table-pagination" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            // --- Adapter props ---
            pagination={pagination} // { pageIndex: 0-based, pageSize }
            totalPages={totalPages} // ถ้ามี (server-side)
            onPaginationChange={onPaginationChange} // ({ pageIndex, pageSize }) 0-based
            // --- Options ---
            siblingCount={2}
            onPageSizeChange={(size) => {
              // จะวิ่งเข้า adapter → onPaginationChange({ pageIndex: 0, pageSize: size })
            }}
            pageSizeOptions={[10, 20, 50, 100]}
            // --- Lock ทั้ง component ระหว่างโหลด ---
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
