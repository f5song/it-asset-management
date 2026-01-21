
"use client";

import * as React from "react";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import { DeviceItem } from "types";



// sorting comparator เหมือนเดิม (รองรับ number/date/string)
function cmp(a: any, b: any) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;

  const da = new Date(a), db = new Date(b);
  const aIsDate = !isNaN(da.valueOf()), bIsDate = !isNaN(db.valueOf());
  if (aIsDate && bIsDate) return da.getTime() - db.getTime();

  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

export function useDeviceTableController(rows: DeviceItem[], initialPageSize: number) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "id", desc: false },   // เริ่มจาก Device ID เหมือนหน้าเดิม
  ]);

  const sortedRows = React.useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return rows;
    if (!sorting || sorting.length === 0) return rows;

    const [{ id, desc }] = sorting;
    const getVal = (r: DeviceItem) => (r as any)?.[id];
    const copy = [...rows];
    copy.sort((ra, rb) => {
      const result = cmp(getVal(ra), getVal(rb));
      return desc ? -result : result;
    });
    return copy;
  }, [rows, sorting]);

  const start = pagination.pageIndex * pagination.pageSize;
  const end   = start + pagination.pageSize;

  const pageRows = React.useMemo(
    () => sortedRows.slice(start, end),
    [sortedRows, start, end]
  );

  // รีเซ็ต pageIndex เมื่อ filters/data เปลี่ยนจากภายนอก
  const resetPageIndex = React.useCallback(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  return {
    pageRows,
    pagination, setPagination,
    sorting, setSorting,
    resetPageIndex,
  };
}
