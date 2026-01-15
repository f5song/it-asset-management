
// src/types/index.ts (หรือไฟล์ที่คุณ export ColumnDef อยู่)
import type React from 'react';

export type SortOrder = 'asc' | 'desc';

export type PaginationState = {
  pageIndex: number; // 0-based
  pageSize: number;
};

// ✅ ใช้ generic ให้ sortBy เป็น key ของแถวจริง
export type SortingState<T> = {
  sortBy?: keyof T;
  sortOrder?: SortOrder;
};

export type ColumnDef<T> = {
  /** column id ที่ใช้กับ sorting/filtering ให้เป็น string เสมอ */
  id: string;
  header: string;
  /** คีย์ข้อมูลในแถว */
  accessorKey: keyof T;
  width?: number;
  /** custom cell renderer */
  cell?: (value: any, row: T, rowIndex: number) => React.ReactNode; // ✅ ใช้ React.ReactNode จาก import เดียวกัน
  /** จัดแนวข้อความของคอลัมน์ */
  align?: 'left' | 'center' | 'right';
  /** className เพิ่มสำหรับ <th>/<td> */
  headerClassName?: string;
  cellClassName?: string;
  /** ใช้เมื่ออยาก sort ด้วยค่าที่แปลงก่อน เช่น parse number/date จาก string */
  getSortValue?: (row: T) => any;
};

export type DataTableProps<T extends { id?: string | number }> = {
  columns: ColumnDef<T>[];
  rows: T[];
  totalRows?: number;

  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;

  sorting?: SortingState<T>;
  onSortingChange?: (next: SortingState<T>) => void;

  variant?: 'default' | 'striped';
  size?: 'xs' | 'sm' | 'md';
  emptyMessage?: string;

  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;

  maxBodyHeight?: number;

  onRowClick?: (row: T) => void;
  rowHref?: (row: T) => string;

  defaultColMinWidth?: number;

  clientSideSort?: boolean;
};
