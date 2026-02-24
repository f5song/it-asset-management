//   ใช้ type จาก TanStack Table v8
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { ReactNode } from "react";

/** แถวพื้นฐานของตาราง */
export interface RowBase {
  id?: string | number;
}

/** คำอธิบายคอลัมน์สำหรับ DataTable */
export interface AppColumnDef<TRow extends RowBase = RowBase> {
  id: string | number;
  header: ReactNode;
  accessorKey: keyof TRow | string;
  width?: number;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
  getSortValue?: (row: TRow) => unknown;
  cell?: (value: unknown, row: TRow, rowIndex?: number) => ReactNode;
}

/** Props มาตรฐานของ DataTable */
export type DataTableProps<TRow extends RowBase> = {
  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[];
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

  /** หาก true ให้ DataTable sort client-side */
  clientSideSort?: boolean;
};
