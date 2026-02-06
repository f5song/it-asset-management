"use client";
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
} from "types/license";

import { licenseColumns } from "@/lib/tables/licenseInventoryColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/licenseFilterMappers";
import type { SummaryCardItem } from "components/inventory/InventoryPageShell";
import {
  buildLicenseSummaryCards,
  buildLicenseSummarySkeleton,
} from "@/lib/summary";
import { useLicenseSummary } from "@/hooks/useLicenseSummary";

export default function LicenseManagementPage() {
  const [domainFilters, setDomainFilters] =
    React.useState<LicenseFilters>(toDomainFilters());

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
    resetDeps: [
      domainFilters.status,
      domainFilters.licenseModel,
      domainFilters.manufacturer,
    ],
  });

  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

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

  // 🔹 Summary ทั้งระบบ (ไม่ผูก paging) รองรับฟิลเตอร์
  const { summary, isLoading: isLoadingSummary } = useLicenseSummary({
    status: domainFilters.status,
    licenseModel: domainFilters.licenseModel,
    manufacturer: domainFilters.manufacturer,
    search: domainFilters.search,
  });

  // 🔹 แปลง summary → การ์ด
  const summaryCards: SummaryCardItem[] = React.useMemo(
    () =>
      isLoadingSummary
        ? buildLicenseSummarySkeleton()
        : buildLicenseSummaryCards(summary),
    [isLoadingSummary, summary],
  );

  const [selectedLicenseIds, setSelectedLicenseIds] = React.useState<string[]>(
    [],
  );

  const getRowHref = React.useCallback(
    (row: LicenseItem) => `/software/license-management/${row.id}`,
    [],
  );
  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export license format:", fmt);
    },
    [ctl.serverQuery, serviceFilters],
  );

  const rightExtra = (
    <InventoryActionToolbar
      entity="licenses"
      selectedIds={selectedLicenseIds}
      basePath="/software/license-management"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "delete")
          console.log("delete selected license ids:", selectedLicenseIds);
      }}
    />
  );

  return (
    <InventoryPageShell<LicenseItem, LicenseStatus, LicenseModel>
      title="License Management"
      breadcrumbs={[
        { label: "License Management", href: "/software/license-management" },
      ]}
      // ✅ สรุปใต้งาน PageHeader (ไม่ผูก paging)
      summaryCards={summaryCards}
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
      hasType={true}
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
      // Selection
      selectedIds={selectedLicenseIds}
      onSelectedIdsChange={setSelectedLicenseIds}
    />
  );
}
