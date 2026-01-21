
// src/types/index.ts
import type React from 'react';

// ✅ ใช้ TanStack types โดยตรง (แนะนำให้ import จากไลบรารีที่ใช้จริงในโปรเจกต์)
import type {
  SortingState as TanSortingState,
  PaginationState as TanPaginationState,
} from '@tanstack/react-table';
import { ReactNode } from 'react';

/** ใช้ชื่อ alias เพื่อสื่อชัดว่าใช้ตาม TanStack */
export type PaginationState = TanPaginationState; // { pageIndex: number; pageSize: number }
export type SortingState = TanSortingState;       // { id: string; desc: boolean }[]

export type SimpleFilters<TStatus extends string, TType extends string> = {
  status?: TStatus;
  type?: TType;
  manufacturer?: string;
  searchText: string;
};

// แถวพื้นฐานสำหรับตารางทุกตัว
export interface RowBase {
  id?: string | number;
}

// AppColumnDef ที่ผูกกับแถว TRow

export interface AppColumnDef<TRow extends RowBase = RowBase> {
  id: string | number;
  header: ReactNode;
  accessorKey: keyof TRow | string;
  width?: number;

  /** จัดแนวคอลัมน์ (ตัวเลือก) */
  align?: 'left' | 'center' | 'right';

  /** class เฉพาะหัวตาราง/เซลล์ (ตัวเลือก) */
  headerClassName?: string;
  cellClassName?: string;

  /** ใช้ค่านี้แทน accessorKey เพื่อ sort ถ้าต้องการ (ตัวเลือก) */
  getSortValue?: (row: TRow) => unknown;

  /** renderer ของ cell: รองรับ rowIndex เป็นอาร์กิวเมนต์ตัวที่ 3 (ตัวเลือก) */
  cell?: (value: unknown, row: TRow, rowIndex?: number) => ReactNode;
}


// Props มาตรฐานของ DataTable
export type DataTableProps<TRow extends RowBase> = {
  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[]; // ✅ allow readonly
  totalRows: number;

  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;

  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;

  variant?: "default" | "striped";
  size?: "xs" | "sm" | "md";
  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  maxBodyHeight?: number;

  onRowClick?: (row: TRow) => void;
  rowHref?: (row: TRow) => string;

  defaultColMinWidth?: number;

  /** ถ้า true จะให้ DataTable sort client-side (กรณีที่คุณไม่ใช้ server-side) */
  clientSideSort?: boolean;
}