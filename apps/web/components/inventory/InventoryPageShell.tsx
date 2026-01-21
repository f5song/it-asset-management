
// src/components/inventory/InventoryPageShell.tsx
"use client";

import { DataTable } from "components/table";
import { FilterBar } from "components/ui/FilterBar";
import { PageHeader } from "components/ui/PageHeader";
import React from "react";

import { AppColumnDef, ExportFormat, SimpleFilters, ToolbarAction } from "types";

type RowBase = { id?: string | number };

type ShellProps<TRow extends RowBase, TStatus extends string, TType extends string> = {
  title: string;
  breadcrumbs: { label: string; href: string }[];

  // FilterBar props
  filters: SimpleFilters<TStatus, TType>;
  onFiltersChange: (next: SimpleFilters<TStatus, TType>) => void;
  statusOptions: readonly string[];
  typeOptions: readonly string[];
  manufacturerOptions: readonly string[];
  allStatusLabel: string;
  allTypeLabel: string;
  allManufacturerLabel: string;

  // DataTable
  columns: AppColumnDef<TRow>[];
  rows: readonly TRow[];
  totalRows: number;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (p: any) => void;
  sorting: any;
  onSortingChange: (s: any) => void;
  rowHref?: (row: TRow) => string;

  // Others
  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  maxBodyHeight?: number;

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

      <FilterBar<TStatus, TType>
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
      />

      <DataTable<TRow>
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
