"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";
import { useServerTableController } from "hooks/useServerTableController";
import { useEmployeesInventory } from "hooks/useEmployeeInventory";
import type { ExportFormat } from "types";

import type {
  EmployeeItem,
  EmployeeStatus,
  EmployeeDomainFilters,
  EmployeesFilterValues,
} from "types/employees";

import { employeeColumns } from "@/lib/tables/employeeInventoryColumns";
import {
  toDomainFilters, // (sf?: Partial<EmployeesFilterValues>) => EmployeeDomainFilters
  toServiceFilters, // (sf: EmployeesFilterValues) => Partial<EmployeesListQuery>
  toSimpleFilters, // (df: EmployeeDomainFilters) => EmployeesFilterValues
} from "lib/mappers/employeeFilterMappers";

export default function EmployeesPage() {
  // ---- Domain filters (undefined = ไม่กรอง) ----
  const [domainFilters, setDomainFilters] =
    React.useState<EmployeeDomainFilters>(toDomainFilters()); // empty filters

  // ---- Controller (pagination/sorting + simpleFilters) ----
  const ctl = useServerTableController<
    EmployeeItem, // TRow
    EmployeeDomainFilters, // DF
    EmployeesFilterValues // SF (UI)
  >({
    pageSize: 8,
    defaultSort: { id: "id", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: (df) => toSimpleFilters(df),
    fromSimple: (sf) => toDomainFilters(sf),
    // รีเซ็ตหน้าเมื่อฟิลเตอร์สำคัญเปลี่ยน
    resetDeps: [
      domainFilters.department,
      domainFilters.status,
      domainFilters.search,
    ],
  });

  // ---- Simple -> Service params ----
  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  // ---- Fetch rows ----
  // ผูก query จาก controller + domain filters ให้ hook ไป compose เป็น EmployeesListQuery
  const { rows, totalRows, isLoading, isError, errorMessage } =
    useEmployeesInventory(ctl.serverQuery, domainFilters);

  // ---- Options ----
  const statusOptions: readonly EmployeeStatus[] = [
    "Active",
    "Inactive",
    "OnLeave",
    "Resigned",
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
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<
    string[]
  >([]);

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
    <InventoryPageShell<EmployeeItem, EmployeeStatus, string>
      title="Employees"
      breadcrumbs={[{ label: "Employees", href: "/employees" }]}
      // ===== FilterBar =====
      filters={ctl.simpleFilters} // EmployeesFilterValues (shape: {status?, department?, search?})
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions} // EmployeeStatus[]
      // ✅ บอกว่าเพจนี้มี type/category filter (department)
      hasType={true}
      typeOptions={departmentOptions} // department (string[])
      manufacturerOptions={manufacturerOptions} // ไม่ใช้ในหน้านี้
      allStatusLabel="All Status"
      allTypeLabel="All Departments"
      allManufacturerLabel="—"
      onExport={handleExport}
      filterBarRightExtra={rightExtra}
      // ===== DataTable =====
      columns={employeeColumns} // columns map กับ EmployeeItem
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={(row) => `/employees/${row.id}`}
      // ===== States =====
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      // ===== Selection =====
      // ถ้าต้องการให้มี checkbox selection ในตาราง
      selectedIds={selectedEmployeeIds}
      onSelectedIdsChange={setSelectedEmployeeIds}
    />
  );
}
