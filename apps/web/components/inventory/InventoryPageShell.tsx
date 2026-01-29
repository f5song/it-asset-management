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
 * ✅ ใช้ FilterValues<TStatus, TType> สำหรับ FilterBar
 * - TStatus/TType เป็น union string ที่สอดคล้องกับโดเมนของแต่ละเพจ
 * - manufacturer และ searchText อยู่ใน FilterValues เดิม
 */
type ShellProps<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string,
> = {
  title: string;
  breadcrumbs: { label: string; href: string }[];

  // FilterBar props (ใช้ FilterValues แทน SimpleFilters)
  filters: FilterValues<TStatus, TType>;
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;
  statusOptions?: readonly string[];
  typeOptions?: readonly string[];
  manufacturerOptions?: readonly string[];
  allStatusLabel?: string;
  allTypeLabel?: string;
  allManufacturerLabel?: string;

  // ✅ ช่องพิเศษทางขวาของ FilterBar (เช่นปุ่ม Bulk, ปุ่ม Assign)
  filterBarRightExtra?: React.ReactNode;

  // DataTable
  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[];
  totalRows: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (p: { pageIndex: number; pageSize: number }) => void;
  sorting: { id: string; desc: boolean }[]; // ใช้ any/struct ของคุณได้
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

  // ===== ✅ NEW: Selection (ทั้งหมด optional / backward-compatible) =====
  /** เปิด/ปิด checkbox selection ที่ตาราง */
  selectable?: boolean;
  /** ids ที่ถูกเลือก (controlled) */

  selectedIds?: string[]; // <- ปรับให้เป็น string[] ชัดเจน
  onSelectedIdsChange?: (ids: string[]) => void;

  /** ถ้า id ไม่ได้อยู่ใน field 'id' ให้ส่งฟังก์ชันอ่านค่า id ของแถว */
  getRowId?: (row: TRow) => string | number;
  /** 'page' = เลือกเฉพาะในหน้านี้ | 'all' = ทั้ง dataset (ถ้า backend รองรับ) */
  selectionScope?: "page" | "all";
};

export function InventoryPageShell<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string,
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

    // NEW: selection
    selectable = false,
    selectedIds,
    onSelectedIdsChange,
    getRowId,
    selectionScope = "page",
  } = props;

  // ✅ สะพาน array <-> Set สำหรับ DataTable
  const selectedIdSet = React.useMemo(
    () =>
      selectedIds && Array.isArray(selectedIds)
        ? new Set<string | number>(selectedIds)
        : undefined,
    [selectedIds],
  );

  const handleSelectionChange = React.useCallback(
    (next: Set<string | number>) => {
      const asStrings = Array.from(next).map(String);
      onSelectedIdsChange?.(asStrings);
    },
    [onSelectedIdsChange],
  );

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
        labels={{
          allStatus: allStatusLabel,
          allType: allTypeLabel,
          allManufacturer: allManufacturerLabel,
        }}
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
        // ✅ Selection (ส่งต่อแบบ optional)
        selectable={selectable}
        selectedIds={selectedIdSet}
        onSelectionChange={handleSelectionChange}
        getRowId={getRowId}
        selectionScope={selectionScope}
      />
    </div>
  );
}
