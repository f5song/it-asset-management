"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useServerTableController } from "hooks/useServerTableController";

import type { ExportFormat } from "types";

import type {
  ExceptionItem,
  ExceptionGroup,
  ExceptionCategory,
  ExceptionScope,
} from "types/exception";

import { exceptionInventoryColumns } from "lib/tables/exceptionInventoryColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/exceptionFilterMappers";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";
import { useExceptionInventory } from "hooks/useExceptionInventory";

export default function ExceptionPage() {
  /* -------------------------------------------------------
   *  FILTER + TABLE CONTROLLER
   * ------------------------------------------------------- */
  const [domainFilters, setDomainFilters] = React.useState(
    toDomainFilters(), // empty filters
  );

  const ctl = useServerTableController<
    ExceptionItem,
    ExceptionGroup,    // TStatus
    ExceptionCategory, // TType
    ReturnType<typeof toDomainFilters>
  >({
    pageSize: 8,
    defaultSort: { id: "createdAt", desc: true },
    domainFilters,
    setDomainFilters,
    toSimple: () => toSimpleFilters(domainFilters),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [
      domainFilters.group,
      domainFilters.category,
      domainFilters.scope,
      domainFilters.searchText,
    ],
  });

  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useExceptionInventory(ctl.serverQuery, serviceFilters);

  /* -------------------------------------------------------
   *  OPTIONS
   * ------------------------------------------------------- */
  const statusOptions: readonly ExceptionGroup[] = [
    "Approved",
    "Pending",
    "Expired",
    "Revoked",
  ];

  const categoryOptions: readonly ExceptionCategory[] = [
    "AI",
    "USBDrive",
    "MessagingApp",
    "ADPasswordPolicy",
  ];

  const scopeOptions: readonly ExceptionScope[] = [
    "User",
    "Device",
    "Group",
    "Tenant",
  ];

  /* -------------------------------------------------------
   *  TOOLBAR + EXPORT HANDLER
   * ------------------------------------------------------- */

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export exceptions as:", fmt);
      // TODO: exportExceptions(fmt, ctl.serverQuery, serviceFilters)
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

  /* -------------------------------------------------------
   *  RENDER
   * ------------------------------------------------------- */

  return (
    <InventoryPageShell<ExceptionItem, ExceptionGroup, ExceptionCategory>
      title="Exceptions"
      breadcrumbs={[{ label: "Exceptions", href: "/exceptions" }]}
      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={categoryOptions}
      manufacturerOptions={scopeOptions}              // <-- ใช้ prop เดิม เป็น Scope
      allStatusLabel="All Statuses"
      allTypeLabel="All Categories"
      allManufacturerLabel="All Scopes"
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