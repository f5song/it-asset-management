
// InstallationTable.tsx (refactor ใช้ DataTable สไตล์เดียวกับของคุณ)
"use client";
import React, { useMemo } from "react";
// <— ปรับ path ให้ถูกกับโครงสร้างโปรเจกต์ของคุณ
import type { AppColumnDef as CoreAppColumnDef, DataTableProps } from "../../types/ui-table"; // <— ใช้ type กลาง
import { DataTable } from "components/table";
// ^^^ ปรับ path ให้ตรงของจริง

// ---------- types ของเวอร์ชันเดิม ----------
export type AppColumnDef<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

export type InstallationFilters = {
  query: string;
};

// ---------- InstallationTable ใหม่ (wrapper DataTable) ----------
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
}: {
  rows: R[];
  columns: AppColumnDef<R>[];
  filters: InstallationFilters;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  emptyMessage?: string;
  maxBodyHeight?: number;
}) {
  const q = (filters.query ?? "").trim().toLowerCase();

  // 1) client-side filter (เทียบเท่าเดิม)
  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, q]);

  // 2) client-side pagination (เทียบเท่าเดิม)
  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  // 3) map simple columns -> Core AppColumnDef ของ DataTable
  //    - ใช้ accessorKey เป็น string index ที่ไม่ชนกัน
  //    - ใช้ cell เพื่อ render จาก accessor(r)
  const mappedColumns: CoreAppColumnDef<R>[] = columns.map((c, idx) => {
    const id = String(idx); // กำหนด id / accessorKey เป็น index ตามลำดับ
    return {
      id,
      header: c.header,
      accessorKey: id, // จำเป็นตามสัญญา DataTable
      cell: (_value, row) => c.accessor(row as R),
      // (optional) กำหนด min width เริ่มต้นให้สอดคล้อง DataTableHeader ถ้าต้องการ
      // minWidth: 88,
    } as CoreAppColumnDef<R>;
  });

  // 4) สร้าง props ให้ DataTable
  const dataTableProps: DataTableProps<R> = {
    columns: mappedColumns,
    rows: pageRows,            // แสดงเฉพาะ rows ที่ถูก paginate แล้ว
    totalRows,                 // ให้ DataTablePaginationBar คำนวณ totalPages ได้
    isLoading: false,
    isError: false,
    errorMessage: undefined,
    emptyMessage,
    maxBodyHeight,
    // ปิด sorting ฝั่ง client (ของเดิมไม่มี)
    clientSideSort: false,

    // ใช้สไตล์/ขนาดตาม default ของ DataTable
    variant: "default",
    size: "xs",

    // ส่ง pagination ให้ DataTable แสดง PaginationBar แบบกลาง
    pagination: {
      pageIndex: safePage,     // ใช้เลขหน้าเริ่ม 1 (ให้ตรงกับของเดิม)
      pageSize,
    },
    onPaginationChange: (next) => {
      // DataTable จะส่ง back { pageIndex, pageSize }
      // ที่นี่สนใจแค่ pageIndex เพื่อให้ behavior เหมือนของเดิม
      if (next?.pageIndex && next.pageIndex !== safePage) {
        onPageChange(next.pageIndex);
      }
    },

    // (optional) กรณีคลิกแถวเพื่อนำทาง/เปิดรายละเอียดในอนาคต
    onRowClick: undefined,
    rowHref: undefined,

    // (optional) ให้ DataTableHeader กำหนด min width
    defaultColMinWidth: 88,

    // (optional) sorting props ถ้าอยากเปิดภายหลัง
    sorting: undefined,
    onSortingChange: undefined,
  };

  return <DataTable<R> {...dataTableProps} />;
}
