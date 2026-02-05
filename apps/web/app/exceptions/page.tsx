"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useServerTableController } from "hooks/useServerTableController";

import type { ExportFormat } from "types";
import type { ExceptionDefinition, PolicyStatus } from "types/exception";

import { exceptionInventoryColumns } from "lib/tables/exceptionInventoryColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/exceptionFilterMappers";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";
import { useExceptionInventory } from "hooks/useExceptionInventory";

export default function ExceptionPage() {
  // สร้าง domain filters เริ่มต้นจากโดเมน (ไม่ควรมี category ถ้าคุณลบออกแล้ว)
  const [domainFilters, setDomainFilters] = React.useState(toDomainFilters());

  // ✅ ใช้ฮุคเวอร์ชันใหม่: ไม่ต้องใส่ generics, ส่งฟังก์ชัน mapping ตรง ๆ
  const ctl = useServerTableController({
    pageSize: 8,
    defaultSort: { id: "createdAt", desc: true } as const,
    domainFilters,
    setDomainFilters,
    toSimple: toSimpleFilters, // DF -> SF
    fromSimple: toDomainFilters, // SF -> DF
    // ❌ ลบ category ออกจาก resetDeps ถ้าไม่มีแล้วใน DF
    resetDeps: [domainFilters.status, domainFilters.search],
  });

  // แปลง simpleFilters -> serviceFilters เพื่อยิง API
  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  // ดึงข้อมูลในตาราง
  const { rows, totalRows, isLoading, isError, errorMessage } =
    useExceptionInventory(ctl.serverQuery, serviceFilters);

  // ตัวเลือกของสถานะ/ประเภท (ถ้า UI ยังต้องการ dropdown แสดง category ได้ตามเดิม)
  const statusOptions: readonly PolicyStatus[] = [
    "Active",
    "Inactive",
  ];
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
        if (act === "delete") {
          console.log("delete exceptions:", selectedIds);
          // TODO: call delete API
        }
      }}
    />
  );

  return (
    <InventoryPageShell<ExceptionDefinition, PolicyStatus>
      title="Exceptions"
      breadcrumbs={[{ label: "Exceptions", href: "/exceptions" }]}
      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      allStatusLabel="All Statuses"
      // ⛔️ ไม่ต้องส่ง typeOptions / allTypeLabel
      filterBarRightExtra={rightExtra}
      onExport={handleExport}
      // DataTable
      columns={exceptionInventoryColumns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={(row) => `/exceptions/${row.id}`}
      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      selectedIds={selectedIds}
      onSelectedIdsChange={setSelectedIds}
    />
  );
}
