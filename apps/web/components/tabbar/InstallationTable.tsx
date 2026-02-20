// components/tabbar/InstallationTable.tsx
"use client";

import React, { useMemo, useEffect } from "react";
import type {
  AppColumnDef,
  DataTableProps,
} from "../../types/ui-table";
import { DataTable } from "components/table";

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
  onPageChange?: (p: number) => void;
  emptyMessage?: string;
  maxBodyHeight?: number;
  onAfterFilter?: (meta: {
    totalRows: number;
    filteredRows: R[];
    pageRows: R[];
    pageIndex: number; // เริ่ม 1
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

  /**
   * 3) Map columns ให้เป็นรูปแบบที่ DataTable คาดหวัง
   *
   * เราไม่รู้แน่ชัดว่า AppColumnDef<R> (จาก types/ui-table) ที่ผู้ใช้ส่งมาจะมี key ไหน
   * จึงทำ adapter รองรับ 3 รูปแบบ:
   *  - c.cell?(value, row)            → ใช้เลย
   *  - c.accessor?(row)               → wrap เป็น cell
   *  - c.accessorKey?                 → ดึงค่าจาก row[key] แล้วส่งให้ cell
   * ถ้าไม่มีอะไรเลย จะ fallback เป็นค่าว่าง
   */
  const mappedColumns = useMemo(() => {
    return columns.map((c, idx) => {
      const anyC = c as any;

      // header
      const header = anyC.header;

      // id / accessorKey
      const id: string = anyC.id ?? String(idx);
      const accessorKey: string =
        typeof anyC.accessorKey === "string" ? anyC.accessorKey : id;

      // สร้าง cell จากตัวเลือกที่มี
      const cell =
        typeof anyC.cell === "function"
          ? (value: unknown, row: R) => anyC.cell(value, row)
          : typeof anyC.accessor === "function"
          ? (_value: unknown, row: R) => anyC.accessor(row)
          : anyC.accessorKey
          ? (_value: unknown, row: R) => {
              const k = anyC.accessorKey as keyof R;
              // คืนค่าดิบเพื่อให้ DataTable/renderer จัดการแสดงผลตามปกติ
              return (row as any)?.[k] ?? "";
            }
          : (_value: unknown, _row: R) => "";

      // คืนคอลัมน์ตาม spec ของ DataTable (ชนิดเดียวกับ AppColumnDef จาก types/ui-table)
      const coreCol: AppColumnDef<R> = {
        ...anyC,
        id,
        header,
        accessorKey,
        cell,
      };

      return coreCol;
    });
  }, [columns]);

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
      if (
        typeof next?.pageIndex === "number" &&
        next.pageIndex !== safePage
      ) {
        onPageChange?(next.pageIndex) : ""
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