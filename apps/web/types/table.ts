
// src/types/index.ts
import type React from 'react';

// ✅ ใช้ TanStack types โดยตรง (แนะนำให้ import จากไลบรารีที่ใช้จริงในโปรเจกต์)
import type {
  SortingState as TanSortingState,
  PaginationState as TanPaginationState,
} from '@tanstack/react-table';
import { Compliance } from './software';

/** ใช้ชื่อ alias เพื่อสื่อชัดว่าใช้ตาม TanStack */
export type PaginationState = TanPaginationState; // { pageIndex: number; pageSize: number }
export type SortingState = TanSortingState;       // { id: string; desc: boolean }[]

/** โครงคอลัมน์ของตารางแบบ generic */
export type ColumnDef<T> = {
  id: string;
  header: string | React.ReactNode;
  accessorKey: keyof T & string;  // ยัง type-safe กับแถว
  width?: number;
  cell?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  headerClassName?: string;
  cellClassName?: string;
  getSortValue?: (row: T) => unknown; // ถ้าจะ sort ด้วยค่าที่แปลงเอง
};

/** Props ของ DataTable แบบ generic (ปรับให้ใช้ TanStack state) */
export type DataTableProps<T extends { id?: string | number }> = {
  columns: ColumnDef<T>[];
  rows: T[];
  totalRows?: number;

  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;

  sorting?: SortingState;                    // ✅ TanStack
  onSortingChange?: (next: SortingState) => void;

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

/** ตัวอย่างโดเมน */
export type LicenseItem = {
  id: string | number;
  softwareName: string;
  manufacturer: string;
  licenseType?: string;
  compliance: Compliance;
  total: number;
  inUse: number;
  available?: number;
  expiryDate?: string | null;
  status?: string;
};
