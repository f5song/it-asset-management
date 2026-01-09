"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../pagination/Pagination";
import { PaginationState, SortingState } from "@/types";

export type ColumnDef<T> = {
  id: string;
  header: string;
  accessorKey: keyof T;
  width?: number;
  cell?: (value: any, row: T) => React.ReactNode;
};

export type DataTableProps<T extends { id?: string | number }> = {
  columns: ColumnDef<T>[];
  rows: T[];
  totalRows?: number;

  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;

  sorting?: SortingState<T>;
  onSortingChange?: (next: SortingState<T>) => void;

  variant?: "default" | "striped";
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

export function DataTable<T extends { id?: string | number }>(
  props: DataTableProps<T>
) {
  const {
    columns,
    rows,
    totalRows,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    variant = "default",
    emptyMessage = "ไม่มีข้อมูล",
    isLoading,
    isError,
    errorMessage,
    maxBodyHeight = 420,
    onRowClick,
    rowHref,
  } = props;

  const router = useRouter();

  const totalPages =
    totalRows && pagination
      ? Math.ceil(totalRows / pagination.pageSize)
      : undefined;

  const tableClass = variant === "striped" ? "table-striped" : "table-default";

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
        "[DataTable] Cannot navigate: row.id is missing and rowHref not provided.",
        row
      );
    }
  };

  return (
    <div
      className={tableClass}
      style={{ border: "1px solid #e5e7eb", borderRadius: 8 }}
    >
      {/* Body (แนวนอน/แนวตั้ง scroll ได้) */}
      <div
        className="table-scroll-both"
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: maxBodyHeight,
        }}
      >
        {/* Header + Sorting (แนวนอน scroll ได้) */}
        <table style={{ minWidth: 1000, width: "100%" }}>
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#f9fafb",
              zIndex: 1,
            }}
          >
            <tr>
              {columns.map((col) => {
                const isActive = sorting?.sortBy === col.accessorKey;
                const nextOrder: SortingState<T> = {
                  sortBy: col.accessorKey,
                  sortOrder:
                    isActive && sorting?.sortOrder === "asc" ? "desc" : "asc",
                };
                return (
                  <th
                    key={col.id}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      minWidth: col.width ?? 140,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      onClick={() => onSortingChange?.(nextOrder)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      aria-pressed={isActive}
                    >
                      {col.header}
                      {isActive
                        ? sorting?.sortOrder === "asc"
                          ? " 🔼"
                          : " 🔽"
                        : ""}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>

        {isLoading && <div style={{ padding: 16 }}>กำลังโหลด...</div>}

        {isError && !isLoading && (
          <div style={{ padding: 16, color: "#b91c1c" }}>
            {errorMessage ?? "เกิดข้อผิดพลาด"}
          </div>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <div style={{ padding: 16 }}>{emptyMessage}</div>
        )}

        {!isLoading && !isError && rows.length > 0 && (
          <table style={{ minWidth: 1000, width: "100%" }}>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                  }}
                  onClick={() => handleRowNavigate(row)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleRowNavigate(row);
                  }}
                >
                  {columns.map((c) => {
                    const value = (row as any)[c.accessorKey];
                    return (
                      <td
                        key={c.id}
                        style={{
                          padding: "10px 12px",
                          minWidth: c.width ?? 140,
                          whiteSpace: "nowrap",
                        }}
                        // ป้องกันปุ่ม/ลิงก์ภายในเซลล์ทำให้แถว trigger navigate
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button,a,[role="button"]'))
                            e.stopPropagation();
                        }}
                      >
                        {c.cell ? c.cell(value, row) : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && onPaginationChange && (
        <div
          className="table-pagination"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
            // --- Adapter props ---
            pagination={pagination} // { pageIndex: 0-based, pageSize }
            totalPages={totalPages} // ถ้ามี (server-side) → totalCount จะถูกคำนวณให้อัตโนมัติ
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
