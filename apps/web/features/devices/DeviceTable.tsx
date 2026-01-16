"use client";

import * as React from "react";
import { DataTable } from "../../components/table";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { DeviceItem } from "../../types/device";
import type { ColumnDef } from "../../types";

export function DeviceTable({
  columns,
  rows,
  totalRows,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: {
  columns: ColumnDef<DeviceItem>[];
  rows: DeviceItem[];
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
}) {
  return (
    <DataTable<DeviceItem>
      columns={columns}
      rows={rows}
      totalRows={totalRows}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      variant="striped"
      emptyMessage="ไม่พบรายการ"
      isLoading={false}
      isError={false}
      errorMessage={undefined}
      maxBodyHeight={420}
      rowHref={(row) => `/devices/${row.id}`}
    />
  );
}
