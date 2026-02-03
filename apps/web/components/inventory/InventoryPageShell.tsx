"use client";

import React from "react";

import { DataTable } from "components/table";
import { FilterBar } from "components/ui/FilterBar";
import { PageHeader } from "components/ui/PageHeader";
import { Card } from "components/ui/Card";

import type { AppColumnDef } from "types/ui-table";
import type { ExportFormat, FilterValues, ToolbarAction } from "types";

// แถวพื้นฐาน
type RowBase = { id?: string | number };

// ✅ โครงข้อมูลการ์ดแบบเบาๆ
export type SummaryCardItem = {
  id?: string;
  title: string;
  count: number | string;
  className?: string;
};

/**
 * Base props ที่ทุกโดเมนใช้ร่วมกัน
 */
type BaseShellProps<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string
> = {
  title: string;
  breadcrumbs: { label: string; href: string }[];

  // ===== Summary cards =====
  summaryCards?: SummaryCardItem[];
  summaryRender?: React.ReactNode;

  // FilterBar props
  /** ใช้ FilterValues<TStatus, TType> ให้สอดคล้องกับโดเมน */
  filters: FilterValues<TStatus, TType>;
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;

  /** สถานะ (ทำเป็น generic TStatus) */
  statusOptions?: readonly TStatus[];
  allStatusLabel?: string;

  /** ผู้ผลิต (ถ้าโดเมนมี) */
  manufacturerOptions?: readonly string[];
  allManufacturerLabel?: string;

  /** ช่องพิเศษทางขวาของ FilterBar (เช่นปุ่ม Bulk/Assign) */
  filterBarRightExtra?: React.ReactNode;

  // DataTable
  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[];
  totalRows: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (p: { pageIndex: number; pageSize: number }) => void;
  sorting: { id: string; desc: boolean }[];
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

  // ===== Selection (optional / backward-compatible) =====
  /** เปิด/ปิด checkbox selection ที่ตาราง */
  selectable?: boolean;

  /** ids ที่ถูกเลือก (controlled) */
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;

  /** ถ้า id ไม่ได้อยู่ใน field 'id' ให้ส่งฟังก์ชันอ่านค่า id ของแถว */
  getRowId?: (row: TRow) => string | number;

  /** 'page' = เลือกเฉพาะในหน้านี้ | 'all' = ทั้ง dataset (ถ้า backend รองรับ) */
  selectionScope?: "page" | "all";
};

/**
 * โหมดที่ "มี" type/category filter
 * - ต้องส่ง hasType = true และส่ง typeOptions/allTypeLabel ได้
 */
type WithTypeFilter<TType extends string> = {
  hasType: true;
  typeOptions: readonly TType[];
  allTypeLabel?: string;
};

/**
 * โหมดที่ "ไม่มี" type/category filter
 * - ห้ามส่ง typeOptions/allTypeLabel
 */
type WithoutTypeFilter = {
  hasType?: false;
  typeOptions?: never;
  allTypeLabel?: never;
};

/**
 * Props หลัก = Base + (WithTypeFilter | WithoutTypeFilter)
 */
type ShellProps<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string
> = BaseShellProps<TRow, TStatus, TType> &
  (WithTypeFilter<TType> | WithoutTypeFilter);

/**
 * InventoryPageShell
 * - ใส่ default generics: ถ้าเพจไม่มี status/type ให้ใช้ never แล้วไม่ต้องส่ง options
 */
export function InventoryPageShell<
  TRow extends RowBase,
  TStatus extends string = never,
  TType extends string = never
>(props: ShellProps<TRow, TStatus, TType>) {
  const {
    title,
    breadcrumbs,

    // Summary
    summaryCards,
    summaryRender,

    // FilterBar
    filters,
    onFiltersChange,
    statusOptions,
    allStatusLabel,

    // manufacturer
    manufacturerOptions,
    allManufacturerLabel,
    filterBarRightExtra,

    // DataTable
    columns,
    rows,
    totalRows,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    rowHref,

    // States
    emptyMessage = "ไม่พบรายการ",
    isLoading = false,
    isError = false,
    errorMessage,
    maxBodyHeight = 420,

    // Toolbar
    onExport,
    onAction,

    // Selection
    selectable = false,
    selectedIds,
    onSelectedIdsChange,
    getRowId,
    selectionScope = "page",
  } = props;

  // ✅ แปลง array <-> Set สำหรับ DataTable
  const selectedIdSet = React.useMemo(
    () =>
      selectedIds && Array.isArray(selectedIds)
        ? new Set<string | number>(selectedIds)
        : undefined,
    [selectedIds]
  );

  const handleSelectionChange = React.useCallback(
    (next: Set<string | number>) => {
      const asStrings = Array.from(next).map(String);
      onSelectedIdsChange?.(asStrings);
    },
    [onSelectedIdsChange]
  );

  // ✅ สร้าง UI ของ summary (ถ้ามี)
  const summaryArea = React.useMemo(() => {
    if (summaryRender) return summaryRender;
    if (!summaryCards || summaryCards.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {summaryCards.map((item) => (
            <Card
              key={item.id ?? item.title}
              title={item.title}
              count={item.count}
              compact
              className={item.className ?? "h-[88px]"}
            />
          ))}
        </div>
      </div>
    );
  }, [summaryCards, summaryRender]);

  // ✅ แยก hasType ออกมาเพื่อช่วย render แบบ type-safe
  const hasType = "hasType" in props && props.hasType === true;

  return (
    <div style={{ padding: 6 }}>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />

      {/* Summary Cards */}
      {summaryArea}

      <FilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        statusOptions={statusOptions as readonly string[] | undefined}
        typeOptions={
          hasType ? (props.typeOptions as readonly string[]) : undefined
        }
        manufacturerOptions={manufacturerOptions}
        onExport={onExport}
        onAction={onAction}
        labels={{
          allStatus: allStatusLabel,
          allType: hasType ? props.allTypeLabel : undefined,
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
        // Selection (optional)
        selectable={selectable}
        selectedIds={selectedIdSet}
        onSelectionChange={handleSelectionChange}
        getRowId={getRowId}
        selectionScope={selectionScope}
      />
    </div>
  );
}