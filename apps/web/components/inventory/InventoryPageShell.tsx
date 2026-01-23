
// app/(whatever)/InventoryPageShell.tsx
"use client";

import React from "react";

import { DataTable } from "components/table";
import { FilterBar } from "components/ui/FilterBar";
import { PageHeader } from "components/ui/PageHeader";

import type { AppColumnDef } from "types/ui-table";
import type { ExportFormat, FilterValues, ToolbarAction } from "types";

// แถวพื้นฐาน
type RowBase = { id?: string | number };

/**
 * ✅ แทนที่ SimpleFilters เดิมด้วย FilterValues
 * - ใช้ status/type เป็น union generic เพื่อให้ type-safe กับเพจแต่ละโดเมน
 * - manufacturer เป็น string
 * - searchText เป็น string (สอดคล้อง UI ส่วนใหญ่)
 */

type ShellProps<TRow extends RowBase, TStatus extends string, TType extends string> = {
  title: string;
  breadcrumbs: { label: string; href: string }[];

  // FilterBar props (ใช้ FilterValues แทน SimpleFilters)
  filters: FilterValues<TStatus, TType>;
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;
  statusOptions: readonly string[];
  typeOptions: readonly string[];
  manufacturerOptions: readonly string[];
  allStatusLabel: string;
  allTypeLabel: string;
  allManufacturerLabel: string;

  // ✅ ช่องพิเศษทางขวาของ FilterBar (เช่นปุ่ม Bulk, ปุ่ม Assign)
  filterBarRightExtra?: React.ReactNode;

  // DataTable
  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[];
  totalRows: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (p: { pageIndex: number; pageSize: number }) => void;
  sorting: { id: string; desc: boolean }[]; // ถ้าโค้ดที่อื่นใช้ any อยู่ จะคง any ไว้ชั่วคราวก็ได้
  onSortingChange: (s: { id: string; desc: boolean }[]) => void;
  rowHref?: (row: TRow) => string;

  // States
  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  maxBodyHeight?: number;

  // Toolbar
  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;
};

export function InventoryPageShell<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string
>(props: ShellProps<TRow, TStatus, TType>) {
  const {
    title,
    breadcrumbs,
    filters,
    onFiltersChange,
    statusOptions,
    typeOptions,
    manufacturerOptions,
    allStatusLabel,
    allTypeLabel,
    allManufacturerLabel,
    filterBarRightExtra,

    columns,
    rows,
    totalRows,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    rowHref,

    emptyMessage = "ไม่พบรายการ",
    isLoading = false,
    isError = false,
    errorMessage,
    maxBodyHeight = 420,

    onExport,
    onAction,
  } = props;

  return (
    <div style={{ padding: 6 }}>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />

      <FilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        manufacturerOptions={manufacturerOptions}
        onExport={onExport}
        onAction={onAction}
        allStatusLabel={allStatusLabel}
        allTypeLabel={allTypeLabel}
        allManufacturerLabel={allManufacturerLabel}
        rightExtra={filterBarRightExtra}
      />

      <DataTable
        columns={columns}
        rows={rows}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        variant="striped"
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        maxBodyHeight={maxBodyHeight}
        rowHref={rowHref}
      />
    </div>
  );
}
