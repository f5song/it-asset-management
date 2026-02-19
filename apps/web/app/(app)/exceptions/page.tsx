"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useServerTableController } from "hooks/useServerTableController";

import type { ExportFormat } from "types";
import type { ExceptionDefinitionRow, PolicyStatus } from "types/exception";

import { exceptionInventoryColumns } from "lib/tables/exceptionInventoryColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/exceptionFilterMappers";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";
import { useExceptionInventory } from "hooks/useExceptionInventory";

export default function ExceptionPage() {
  // สร้าง domain filters เริ่มต้นจากโดเมน
  const [domainFilters, setDomainFilters] = React.useState(toDomainFilters());

  // Controller
  const ctl = useServerTableController({
    pageSize: 8,
    defaultSort: { id: "name", desc: false } as const,
    domainFilters,
    setDomainFilters,
    toSimple: toSimpleFilters,    // DF -> SF
    fromSimple: toDomainFilters,  // SF -> DF
    resetDeps: [domainFilters.status, domainFilters.search],
  });

  // ✅ บังคับให้ Active มาก่อน เมื่ออยู่ All Status
  React.useEffect(() => {
    const isAll = ctl.simpleFilters.status == null; // undefined = All Status
    if (isAll) {
      ctl.setSorting([
        { id: "status_priority", desc: false }, // Active -> Inactive (ถ้า server รองรับ)
        { id: "name",            desc: false }, // secondary
      ]);
    } else {
      ctl.setSorting([{ id: "name", desc: false }]);
    }
    // รีเซ็ตหน้าเพื่อ UX ที่ดีเมื่อเกณฑ์เรียงเปลี่ยน
    ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctl.simpleFilters.status]);

  // แปลง simpleFilters -> serviceFilters เพื่อยิง API
  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  // ดึงข้อมูลในตาราง (ให้ hook คืน rows: ExceptionDefinitionRow[])
  const { rows, totalRows, isLoading, isError, errorMessage } =
    useExceptionInventory(ctl.serverQuery, serviceFilters);

  // ตัวเลือกสถานะ
  const statusOptions: readonly PolicyStatus[] = ["Active", "Inactive"];
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export exceptions as:", fmt);
      // TODO: exportExceptionDefinitions(fmt, ctl.serverQuery, serviceFilters)
    },
    [ctl.serverQuery, serviceFilters],
  );

  const rightExtra = (
    <InventoryActionToolbar
      entity="exceptions"
      selectedIds={selectedIds}
      basePath="/exceptions"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "Delete") {
          console.log("delete exceptions:", selectedIds);
          // TODO: call delete API
        }
      }}
    />
  );

  return (
    <InventoryPageShell<ExceptionDefinitionRow, PolicyStatus>
      title="Exceptions"
      breadcrumbs={[{ label: "Exceptions", href: "/exceptions" }]}

      // {/* FilterBar */}
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      allStatusLabel="All Statuses"
      filterBarRightExtra={rightExtra}
      onExport={handleExport}

      // {/* DataTable */}
      columns={exceptionInventoryColumns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={(row) => `/exceptions/${row.id}`} // ใช้ id (ที่ map จาก exception_id)

      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}

      // Selection
      selectedIds={selectedIds}
      onSelectedIdsChange={setSelectedIds}
    />
  );
}