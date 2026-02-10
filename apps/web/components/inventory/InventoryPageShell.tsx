// src/components/inventory/InventoryPageShell.tsx
"use client";
import React from "react";
import { DataTable } from "components/table";
import { FilterBar } from "components/ui/FilterBar";
import { PageHeader } from "components/ui/PageHeader";
import { Card } from "components/ui/Card";
import type { AppColumnDef } from "types/ui-table";
import type { ExportFormat, FilterValues, ToolbarAction } from "types";

type RowBase = { id?: string | number };
export type SummaryCardItem = { id?: string; title: string; count: number | string; className?: string; };

type BaseShellProps<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string
> = {
  title: string;
  breadcrumbs: { label: string; href: string }[];

  summaryCards?: SummaryCardItem[];
  summaryRender?: React.ReactNode;

  filters?: FilterValues<TStatus, TType>;
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;

  statusOptions?: readonly TStatus[];
  allStatusLabel?: string;

  manufacturerOptions?: readonly string[];
  allManufacturerLabel?: string;

  filterBarRightExtra?: React.ReactNode;

  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[];
  totalRows: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (p: { pageIndex: number; pageSize: number }) => void;
  sorting: { id: string; desc: boolean }[];
  onSortingChange: (s: { id: string; desc: boolean }[]) => void;
  rowHref?: (row: TRow) => string;

  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  maxBodyHeight?: number;

  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;

  selectable?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  getRowId?: (row: TRow) => string | number;
  selectionScope?: "page" | "all";

  onClearFilters?: () => void;
  defaultSort?: { id: string; desc: boolean }[];

  // multi forwards
  statusSelected?: readonly TStatus[];
  onStatusSelectedChange?: (values: readonly TStatus[]) => void;

  hasType?: boolean;
  typeOptions?: readonly TType[];
  allTypeLabel?: string;
  typeSelected?: readonly TType[];
  onTypeSelectedChange?: (values: readonly TType[]) => void;

  manufacturerSelected?: readonly string[];
  onManufacturerSelectedChange?: (values: readonly string[]) => void;
};

type WithTypeFilter<TType extends string> = {
  hasType: true;
  typeOptions?: readonly TType[];
  allTypeLabel?: string;
};
type WithoutTypeFilter = { hasType?: false; typeOptions?: never; allTypeLabel?: never; };

type ShellProps<
  TRow extends RowBase,
  TStatus extends string,
  TType extends string
> = BaseShellProps<TRow, TStatus, TType> & (WithTypeFilter<TType> | WithoutTypeFilter);

export function InventoryPageShell<
  TRow extends RowBase,
  TStatus extends string = never,
  TType extends string = never
>(props: ShellProps<TRow, TStatus, TType>) {
  const {
    title,
    breadcrumbs,

    summaryCards,
    summaryRender,

    filters,
    onFiltersChange,
    statusOptions,
    allStatusLabel,

    manufacturerOptions,
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

    selectable = false,
    selectedIds,
    onSelectedIdsChange,
    getRowId,
    selectionScope = "page",

    onClearFilters,
    defaultSort,

    statusSelected,
    onStatusSelectedChange,
    typeSelected,
    onTypeSelectedChange,
    manufacturerSelected,
    onManufacturerSelectedChange,
  } = props;

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

  const hasType = "hasType" in props && props.hasType === true;

  const clearAll = React.useCallback(() => {
    onFiltersChange({
      status: undefined,
      type: undefined,
      manufacturer: undefined,
      search: "",
    } as FilterValues<any, any>);

    if (defaultSort && defaultSort.length > 0) {
      onSortingChange(defaultSort);
    }

    onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });
  }, [onFiltersChange, onSortingChange, onPaginationChange, defaultSort, pagination.pageSize]);

  // ⭐ ถ้ามี onClearFilters จากเพจ → เรียกก่อน แล้วค่อยเคลียร์ของ Shell ต่อ
  const handleClearClick = React.useCallback(() => {
    onClearFilters?.();
    clearAll();
  }, [onClearFilters, clearAll]);

  return (
    <div>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />

      {summaryArea}

      <FilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        statusOptions={statusOptions as readonly string[] | undefined}
        typeOptions={hasType ? (props.typeOptions as readonly string[]) : undefined}
        manufacturerOptions={manufacturerOptions}
        onExport={onExport}
        onAction={onAction}
        labels={{
          allStatus: allStatusLabel,
          allType: hasType ? props.allTypeLabel : undefined,
          allManufacturer: allManufacturerLabel,
          clear: "Clear",
        }}
        rightExtra={filterBarRightExtra}
        onClearFilters={handleClearClick}
        statusSelected={statusSelected}
        onStatusSelectedChange={onStatusSelectedChange}
        typeSelected={typeSelected}
        onTypeSelectedChange={onTypeSelectedChange}
        manufacturerSelected={manufacturerSelected}
        onManufacturerSelectedChange={onManufacturerSelectedChange}
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
        selectable={selectable}
        selectedIds={selectedIdSet}
        onSelectionChange={handleSelectionChange}
        getRowId={getRowId}
        selectionScope={selectionScope}
      />
    </div>
  );
}