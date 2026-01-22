
// src/pages/employees/page.tsx
"use client";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { ActionToolbar } from "components/toolbar/ActionToolbar";
import { StatusBadge } from "components/ui/StatusBadge";
import { useEmployeesInventory } from "hooks/useEmployeeInventory"; // <-- ยึด path ตามที่คุณใช้อยู่
import { useServerTableController } from "hooks/useServerTableController";
import * as React from "react";
import {
  AppColumnDef,
  ExportFormat,
  SimpleFilters,
} from "types";
import { Employees, EmployeesFilters, EmployeeStatus } from "types/employees";

// utility: แปลง "" -> undefined ป้องกันส่งค่าว่างไป service
const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;

// ---- Normalizers: UI label -> internal value ----
const normalizeEmployeeStatus = (s?: string): EmployeeStatus | "" => {
  if (!s) return "";
  const map: Record<string, EmployeeStatus> = {
    Active: EmployeeStatus.Active,
    Inactive: EmployeeStatus.Inactive,
    Contractor: EmployeeStatus.Contractor,
    Intern: EmployeeStatus.Intern,
    active: EmployeeStatus.Active,
    inactive: EmployeeStatus.Inactive,
    contractor: EmployeeStatus.Contractor,
    intern: EmployeeStatus.Intern,
  };
  return map[s] ?? "";
};

const normalizeDepartment = (d?: string): string => {
  if (!d) return "";
  return d.trim();
};

export default function EmployeesPage() {
  // ฟิลเตอร์เริ่มเป็น undefined (หมายถึงไม่กรอง)
  const [filters, setFilters] = React.useState<EmployeesFilters>({
    department: undefined,
    status: undefined,
    search: "",
  });

  // (ถ้าคุณมี selection จาก DataTable: ให้แทน state นี้ด้วย state selection จริงของคุณ)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>([]);

  // columns
  const columns = React.useMemo<AppColumnDef<Employees>[]>(() => [
    { id: "id", header: "Employee ID",   accessorKey: "id",         width: 140 },
    { id: "name", header: "Employee Name", accessorKey: "name",     width: 220 },
    { id: "department", header: "Department", accessorKey: "department", width: 180 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 140,
      cell: (v) => <StatusBadge label={String(v ?? "-")} />,
    },
  ], []);

  // ---- Bridge: Domain Filters ↔ SimpleFilters ----
  // map: status = EmployeeStatus, type = Department, manufacturer (ไม่ใช้)
  const toSimple = React.useCallback(
    (): SimpleFilters<EmployeeStatus, string> => ({
      status: toUndef(filters.status as EmployeeStatus | ""),
      type: toUndef(filters.department as string | ""),
      manufacturer: undefined, // ไม่ใช้ในหน้า Employees
      searchText: filters.search ?? "",
    }),
    [filters],
  );

  const fromSimple = React.useCallback(
    (sf: SimpleFilters<EmployeeStatus, string>): EmployeesFilters => ({
      status: toUndef(sf.status as EmployeeStatus),
      department: toUndef(sf.type as string),
      search: sf.searchText ?? "",
    }),
    [],
  );

  // ---- Pagination/Sorting Controller ----
  const ctl = useServerTableController<
    Employees,
    EmployeeStatus,
    string,
    EmployeesFilters
  >({
    pageSize: 10,
    defaultSort: { id: "id", desc: false },
    domainFilters: filters,
    setDomainFilters: setFilters,
    toSimple,
    fromSimple,
    resetDeps: [filters.department, filters.status],
  });

  // ✅ simpleFilters -> service filters (normalize) แล้วส่งเข้า hook
  const serviceFilters = React.useMemo(
    () => ({
      status: normalizeEmployeeStatus(ctl.simpleFilters.status as string | undefined),
      department: normalizeDepartment(ctl.simpleFilters.type as string | undefined),
      search: ctl.simpleFilters.searchText ?? "",
    }),
    [ctl.simpleFilters],
  );

  // ---- Data Source: ใช้ hook ฝั่ง Employees ----
  const { rows, totalRows, isLoading, isError, errorMessage } =
    useEmployeesInventory(ctl.serverQuery, serviceFilters);

  // ---- Filter options (ภายหลังอาจโหลดจาก service) ----
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

  // manufacturerOptions ไม่ใช้ในหน้านี้ → ส่ง [] ไป (ตาม signature InventoryPageShell)
  const manufacturerOptions: readonly string[] = [];

  const getRowHref = React.useCallback(
    (row: Employees) => `/employees/${row.id}`,
    [],
  );

  const handleExport = React.useCallback((fmt: ExportFormat) => {
    console.log("Export employees:", fmt);
    // TODO: เรียก service export พนักงาน เช่น exportEmployees(fmt, ctl.serverQuery, serviceFilters);
  }, []);

  // ✅ Toolbar ฝั่งขวาของ FilterBar (แทน onAction เดิม)
  const rightExtra = (
    <ActionToolbar
      selectedIds={selectedEmployeeIds}
      enableDefaultMapping={false} // ❌ ไม่มี /installations/ fallback
      to={{
        add: "/employees/add", // ไปหน้าเพิ่มพนักงาน
        reassign: ({ selectedIds }) =>
          `/employees/reassign?ids=${encodeURIComponent(selectedIds.join(","))}`,
        delete: ({ selectedIds }) =>
          `/employees/delete?ids=${encodeURIComponent(selectedIds.join(","))}`,
        // หากมี flow scan/อื่น ๆ สำหรับ employees: ใส่เพิ่มได้
        // scan: ({ selectedIds }) => `/employees/scan?ids=${encodeURIComponent(selectedIds.join(","))}`,
      }}
      onAction={(act) => {
        if (act === "delete") {
          // คุณอาจเปิด modal ยืนยัน/ตรวจสิทธิ์ที่นี่
          console.log("delete selected employees:", selectedEmployeeIds);
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
      // ❌ ไม่ต้องส่ง onAction แล้ว เพราะใช้ ActionToolbar ทางขวาแทน
      // onAction={handleAction}
      filterBarRightExtra={rightExtra} // ✅ ใส่ ActionToolbar ทางขวา

      // DataTable
      columns={columns}
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
    />
  );
}
