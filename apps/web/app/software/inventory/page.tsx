// app/software/inventory/page.tsx
"use client";

import * as React from "react";
import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import { useServerTableController } from "hooks/useServerTableController";
import { useSoftwareInventory } from "hooks/useSoftwareInventory";

import type { ExportFormat } from "types";
import type { SoftwareFilters, SoftwareItem, SoftwareStatus, SoftwareType } from "types";

import { softwareColumns } from "lib/tables/softwareColumns";
import { toDomainFilters, toServiceFilters, toSimpleFilters } from "lib/mappers/softwareFilterMappers";

export default function SoftwarePage() {
  const [domainFilters, setDomainFilters] = React.useState<SoftwareFilters>(toDomainFilters());

  const ctl = useServerTableController<
    SoftwareItem,
    SoftwareStatus,
    SoftwareType,
    SoftwareFilters
  >({
    pageSize: 10,
    defaultSort: { id: "softwareName", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: () => toSimpleFilters(domainFilters),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [domainFilters.status, domainFilters.type, domainFilters.manufacturer],
  });

  const serviceFilters = React.useMemo(() => toServiceFilters(ctl.simpleFilters), [ctl.simpleFilters]);

  const {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    statusOptions,
    typeOptions,
    manufacturerOptions,
  } = useSoftwareInventory(ctl.serverQuery, serviceFilters);

  const [selectedSoftwareIds, setSelectedSoftwareIds] = React.useState<string[]>([]);

  const getRowHref = React.useCallback((row: SoftwareItem) => `/software/inventory/${row.id}`, []);
  const handleExport = React.useCallback((fmt: ExportFormat) => {
    console.log("Export software format:", fmt);
    // TODO: exportSoftware(fmt, ctl.serverQuery, serviceFilters)
  }, [ctl.serverQuery, serviceFilters]);

  const rightExtra = (
    <InventoryActionToolbar
      entity="software"
      selectedIds={selectedSoftwareIds}
      basePath="/software/inventory"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "delete") console.log("delete software:", selectedSoftwareIds);
      }}
    />
  );

  return (
    <InventoryPageShell<SoftwareItem, SoftwareStatus, SoftwareType>
      title="Software Inventory"
      breadcrumbs={[{ label: "Software Inventory", href: "/software/inventory" }]}
      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={typeOptions}
      manufacturerOptions={manufacturerOptions}
      allStatusLabel="All Status"
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
      // ✅ Selection (เหมือน devices/employees)
      selectedIds={selectedSoftwareIds}
      onSelectedIdsChange={setSelectedSoftwareIds}
    />
  );
}