// InstallationTable.tsx
"use client";
import React, { useMemo, useEffect } from "react";
import type { AppColumnDef as CoreAppColumnDef, DataTableProps } from "../../types/ui-table";
import { DataTable } from "components/table";

export type AppColumnDef<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

export type InstallationFilters = {
  query: string;
};

export function InstallationTable<R extends { id?: string | number }>({
  rows,
  columns,
  filters,
  page,
  pageSize,
  onPageChange,
  // (optionals เผื่ออนาคต)
  emptyMessage = "No data found.",
  maxBodyHeight = 340,

  /** ✅ callback แจ้งผลหลังกรอง/แบ่งหน้าให้ parent ใช้ทำ export ฯลฯ */
  onAfterFilter,
}: {
  rows: R[];
  columns: AppColumnDef<R>[];
  filters: InstallationFilters;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  emptyMessage?: string;
  maxBodyHeight?: number;
  onAfterFilter?: (meta: {
    totalRows: number;
    filteredRows: R[];
    pageRows: R[];
    pageIndex: number;    // เริ่ม 1
    totalPages: number;
  }) => void;
}) {
  const q = (filters.query ?? "").trim().toLowerCase();

  // 1) client-side filter
  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, q]);

  // 2) client-side pagination
  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  // ✅ แจ้งผลหลังกรอง/แบ่งหน้าให้ parent
  useEffect(() => {
    onAfterFilter?.({
      totalRows,
      filteredRows: filtered,
      pageRows,
      pageIndex: safePage,
      totalPages,
    });
  }, [onAfterFilter, totalRows, filtered, pageRows, safePage, totalPages]);

  // 3) map columns -> Core columns
  const mappedColumns: CoreAppColumnDef<R>[] = columns.map((c, idx) => {
    const id = String(idx);
    return {
      id,
      header: c.header,
      accessorKey: id,
      cell: (_value, row) => c.accessor(row as R),
    } as CoreAppColumnDef<R>;
  });

  // 4) props ให้ DataTable
  const dataTableProps: DataTableProps<R> = {
    columns: mappedColumns,
    rows: pageRows,
    totalRows,
    isLoading: false,
    isError: false,
    errorMessage: undefined,
    emptyMessage,
    maxBodyHeight,
    clientSideSort: false,
    variant: "default",
    size: "xs",
    pagination: {
      pageIndex: safePage,
      pageSize,
    },
    onPaginationChange: (next) => {
      if (next?.pageIndex && next.pageIndex !== safePage) {
        onPageChange(next.pageIndex);
      }
    },
    onRowClick: undefined,
    rowHref: undefined,
    defaultColMinWidth: 88,
    sorting: undefined,
    onSortingChange: undefined,
  };

  return <DataTable<R> {...dataTableProps} />;
}