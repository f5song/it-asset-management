"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import { useServerTableController } from "hooks/useServerTableController";
import { useSoftwareInventory } from "hooks/useSoftwareInventory";

import type { ExportFormat } from "types";
import type { SoftwareFilters, SoftwareItem, SoftwareType } from "types";
import type { SoftwareSimple } from "lib/mappers/softwareFilterMappers"; // ⬅ เพิ่มบรรทัดนี้

import { softwareColumns } from "@/lib/tables/softwareInventoryColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/softwareFilterMappers";

export default function SoftwarePage() {
  const [domainFilters, setDomainFilters] =
    React.useState<SoftwareFilters>(toDomainFilters());

  // ✅ V1: <TRow, DF, SF> และ SF = SoftwareSimple (ไม่มี status)
  const ctl = useServerTableController<SoftwareItem, SoftwareFilters, SoftwareSimple>({
    pageSize: 8,
    defaultSort: { id: "softwareName", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: () => toSimpleFilters(domainFilters),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [domainFilters.type, domainFilters.manufacturer],
  });

  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters]
  );

  const {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    typeOptions,
    manufacturerOptions,
  } = useSoftwareInventory(ctl.serverQuery, serviceFilters);

  const [selectedSoftwareIds, setSelectedSoftwareIds] = React.useState<string[]>([]);
  const getRowHref = React.useCallback(
    (row: SoftwareItem) => `/software/inventory/${row.id}`,
    []
  );

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export software format:", fmt);
    },
    [ctl.serverQuery, serviceFilters]
  );

  const rightExtra = (
    <InventoryActionToolbar
      entity="software"
      selectedIds={selectedSoftwareIds}
      basePath="/software"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "delete") console.log("delete software:", selectedSoftwareIds);
      }}
    />
  );

  return (
    //       TRow         TStatus   TType
    <InventoryPageShell<SoftwareItem, never, SoftwareType>
      title="Software Inventory"
      breadcrumbs={[{ label: "Software Inventory", href: "/software/inventory" }]}

      // FilterBar
      filters={ctl.simpleFilters}                 // ← SoftwareSimple = FilterValues<never, SoftwareType>
      onFiltersChange={ctl.onSimpleFiltersChange}
      hasType={true}
      typeOptions={typeOptions}                   // ← ตอนนี้ type ตรงชนิดแล้ว
      manufacturerOptions={manufacturerOptions}
      // ไม่มี status แล้ว จะไม่ส่ง statusOptions ก็ได้
      // allStatusLabel="All Status"             // (จะไม่ใช้แล้ว ตัดทิ้งได้)
      allTypeLabel="All Types"
      allManufacturerLabel="All Manufacturers"
      onExport={handleExport}
      filterBarRightExtra={rightExtra}

      // DataTable
      columns={softwareColumns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={getRowHref}

      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}

      // Selection
      selectedIds={selectedSoftwareIds}
      onSelectedIdsChange={setSelectedSoftwareIds}
    />
  );
}