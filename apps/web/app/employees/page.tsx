// app/employees/page.tsx   (ถ้าใช้ Pages Router ให้ใช้: src/pages/employees.tsx)
"use client";

import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import { useServerTableController } from "hooks/useServerTableController";
import { useEmployeesInventory } from "hooks/useEmployeeInventory"; // ให้ export เป็น useEmployeesInventory

import type { ExportFormat } from "types";
import { Employees, EmployeesFilters, EmployeeStatus } from "types/employees";

import { employeeColumns } from "lib/tables/employeeColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/employeeFilterMappers";

export default function EmployeesPage() {
  // ---- Domain filters (undefined = ไม่กรอง) ----
  const [domainFilters, setDomainFilters] = React.useState<EmployeesFilters>(
    toDomainFilters(), // empty filters
  );

  // ---- Controller (pagination/sorting + simpleFilters) ----
  const ctl = useServerTableController<
    Employees,
    EmployeeStatus, // TStatus
    string,         // TType (department)
    EmployeesFilters
  >({
    pageSize: 10,
    defaultSort: { id: "id", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: () => toSimpleFilters(domainFilters),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [domainFilters.department, domainFilters.status],
  });

  // ---- Simple -> Service params ----
  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  // ---- Fetch rows ----
  const { rows, totalRows, isLoading, isError, errorMessage } =
    useEmployeesInventory(ctl.serverQuery, serviceFilters);

  // ---- Options ----
  const statusOptions: readonly EmployeeStatus[] = [
    EmployeeStatus.Active,
    EmployeeStatus.Inactive,
    EmployeeStatus.Contractor,
    EmployeeStatus.Intern,
  ];

  const departmentOptions: readonly string[] = [
    "Engineering",
    "Design",
    "Finance",
    "HR",
    "Operations",
    "Sales",
  ];

  // ไม่ใช้ manufacturer ในหน้านี้
  const manufacturerOptions: readonly string[] = [];

  // ---- Selection (ใช้กับ Toolbar) ----
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>(
    [],
  );

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export employees:", fmt);
      // TODO: exportEmployees(fmt, ctl.serverQuery, serviceFilters);
    },
    [ctl.serverQuery, serviceFilters],
  );

  const rightExtra = (
    <InventoryActionToolbar
      entity="employees"
      selectedIds={selectedEmployeeIds}
      basePath="/employees"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "delete") {
          console.log("delete employees:", selectedEmployeeIds);
        }
      }}
    />
  );

  return (
    <InventoryPageShell<Employees, EmployeeStatus, string>
      title="Employees"
      breadcrumbs={[{ label: "Employees", href: "/employees" }]}
      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={departmentOptions}
      manufacturerOptions={manufacturerOptions}
      allStatusLabel="All Status"
      allTypeLabel="All Departments"
      allManufacturerLabel="—"
      onExport={handleExport}
      filterBarRightExtra={rightExtra}
      // DataTable
      columns={employeeColumns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={(row) => `/employees/${row.id}`}
      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      // ✅ Selection (เหมือน devices)
      selectable
      selectedIds={selectedEmployeeIds}
      onSelectedIdsChange={setSelectedEmployeeIds}
    />
  );
}