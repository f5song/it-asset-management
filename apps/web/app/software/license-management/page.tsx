import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import { useServerTableController } from "hooks/useServerTableController";
import { useLicenseInventory } from "hooks/useLicenseInventory";

import type { ExportFormat } from "types";
import type {
  LicenseItem,
  LicenseFilters,
  LicenseStatus,
  LicenseModel,
} from "types";

import { licenseColumns } from "lib/tables/licenseColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/licenseFilterMappers";

export default function LicenseManagementPage() {
  // ---- Domain Filters (undefined = ไม่กรอง) ----
  const [domainFilters, setDomainFilters] = React.useState<LicenseFilters>(
    toDomainFilters(), // empty filters
  );

  // ---- Controller (pagination/sorting + FilterValues bridge) ----
  const ctl = useServerTableController<
    LicenseItem,
    LicenseStatus,
    LicenseModel,
    LicenseFilters
  >({
    pageSize: 8,
    defaultSort: { id: "softwareName", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: () => toSimpleFilters(domainFilters),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [domainFilters.status, domainFilters.licenseModel, domainFilters.manufacturer],
  });

  // ---- Simple -> Service params ----
  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  // ---- Fetch + options ----
  const {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    statusOptions,
    licenseModelOptions,
    manufacturerOptions,
  } = useLicenseInventory(ctl.serverQuery, serviceFilters);

  // ---- Selection (ใช้กับ Toolbar) ----
  const [selectedLicenseIds, setSelectedLicenseIds] = React.useState<string[]>([]);

  // ---- Row link ----
  const getRowHref = React.useCallback(
    (row: LicenseItem) => `/software/license-management/${row.id}`,
    [],
  );

  // ---- Export ----
  const handleExport = React.useCallback((fmt: ExportFormat) => {
    console.log("Export license format:", fmt);
    // TODO: exportLicenses(fmt, ctl.serverQuery, serviceFilters);
  }, [ctl.serverQuery, serviceFilters]);

  // ---- Toolbar ด้านขวา (ใช้ wrapper กลาง) ----
  const rightExtra = (
    <InventoryActionToolbar
      entity="licenses"
      selectedIds={selectedLicenseIds}
      basePath="/software/license-management"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "delete") {
          console.log("delete selected license ids:", selectedLicenseIds);
        }
      }}
    />
  );

  return (
    <InventoryPageShell<LicenseItem, LicenseStatus, LicenseModel>
      title="License Management"
      breadcrumbs={[{ label: "License Management", href: "/software/license-management" }]}

      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={licenseModelOptions}
      manufacturerOptions={manufacturerOptions}
      allStatusLabel="All Status"
      allTypeLabel="All License Types"
      allManufacturerLabel="All Manufacturers"
      onExport={handleExport}
      filterBarRightExtra={rightExtra}

      // DataTable
      columns={licenseColumns}
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

      // ✅ Selection (เหมือน devices/employees/software)
      selectedIds={selectedLicenseIds}
      onSelectedIdsChange={setSelectedLicenseIds}
    />
  );
}