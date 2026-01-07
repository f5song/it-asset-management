// src/components/DataTable.tsx
import { PaginationState, SortingState } from "@/types/table";
import React from "react";

export type ColumnDef<T> = {
  id: string;
  header: string;
  accessorKey: keyof T;
  width?: number; // ความกว้างคอลัมน์ (optional)
  cell?: (value: any, row: T) => React.ReactNode;
};

export type DataTableProps<T> = {
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
};

export function DataTable<T>(props: DataTableProps<T>) {
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
  } = props;

  const totalPages =
    totalRows && pagination
      ? Math.ceil(totalRows / pagination.pageSize)
      : undefined;

  const tableClass = variant === "striped" ? "table-striped" : "table-default";

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
                <tr key={ri} style={{ borderBottom: "1px solid #f1f5f9" }}>
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

      {/* Pagination */}
      {pagination && onPaginationChange && (
        <div
          className="table-pagination"
          role="navigation"
          aria-label="Pagination"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            borderTop: "1px solid #e5e7eb",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() =>
              onPaginationChange({
                pageIndex: Math.max(0, pagination.pageIndex - 1),
                pageSize: pagination.pageSize,
              })
            }
            disabled={pagination.pageIndex === 0 || isLoading}
          >
            ก่อนหน้า
          </button>

          <span>
            หน้า {pagination.pageIndex + 1}
            {totalPages ? ` / ${totalPages}` : ""}
          </span>

          <button
            onClick={() =>
              onPaginationChange({
                pageIndex: pagination.pageIndex + 1,
                pageSize: pagination.pageSize,
              })
            }
            disabled={
              isLoading ||
              (totalPages ? pagination.pageIndex + 1 >= totalPages : false)
            }
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
