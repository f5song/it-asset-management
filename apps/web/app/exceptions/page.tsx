"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useServerTableController } from "hooks/useServerTableController";

import type { ExportFormat } from "types";
import type { ExceptionDefinition, PolicyStatus, ExceptionCategory } from "types/exception";

import { exceptionInventoryColumns } from "lib/tables/exceptionInventoryColumns";
import { toDomainFilters, toServiceFilters, toSimpleFilters } from "lib/mappers/exceptionFilterMappers";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";
import { useExceptionInventory } from "hooks/useExceptionInventory";

export default function ExceptionPage() {
  const [domainFilters, setDomainFilters] = React.useState(toDomainFilters());

  const ctl = useServerTableController<
    ExceptionDefinition,
    PolicyStatus,
    ExceptionCategory,
    ReturnType<typeof toDomainFilters>
  >({
    pageSize: 8,
    defaultSort: { id: "createdAt", desc: true },
    domainFilters,
    setDomainFilters,
    toSimple: () => toSimpleFilters(domainFilters),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [
      domainFilters.status,
      domainFilters.category,
      domainFilters.search,
    ],
  });

  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useExceptionInventory(ctl.serverQuery, serviceFilters);

  const statusOptions: readonly PolicyStatus[] = ["Active", "Inactive", "Deprecated", "Archived"];
  const categoryOptions: readonly ExceptionCategory[] = ["AI", "USBDrive", "MessagingApp", "ADPasswordPolicy"];

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
    <InventoryPageShell<ExceptionDefinition, PolicyStatus, ExceptionCategory>
      title="Exceptions"
      breadcrumbs={[{ label: "Exceptions", href: "/exceptions" }]}

      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={categoryOptions}
      allStatusLabel="All Statuses"
      allTypeLabel="All Categories"
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