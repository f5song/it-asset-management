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
  toDomainFilters,
  toServiceFilters, // ✅ ปรับให้รับ sorting เพิ่ม (ดูไฟล์ในข้อ 2)
  toSimpleFilters,
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
    defaultSort: { id: "employeeId", desc: false }, // ค่าเริ่มต้นทั่วไป
    domainFilters,
    setDomainFilters,
    toSimple: (df) => toSimpleFilters(df),
    fromSimple: (sf) => toDomainFilters(sf),
    // รีเซ็ตหน้าเมื่อฟิลเตอร์สำคัญเปลี่ยน
    resetDeps: [
      domainFilters.type,
      domainFilters.status,
      domainFilters.search,
    ],
  });

  // ✅ เมื่อเป็น "All Status" ให้ตั้ง multi-sort: status_priority -> employeeId
  React.useEffect(() => {
    const isAllStatus = ctl.simpleFilters.status == null;
    if (isAllStatus) {
      ctl.setSorting([
        { id: "status_priority", desc: false }, // Active(0) < Resigned(1)
        { id: "employeeId", desc: false },
      ]);
    } else {
      // เมื่อเลือกสถานะเฉพาะ → เรียงตาม employeeId ไปเลย
      ctl.setSorting([{ id: "employeeId", desc: false }]);
    }
    // กลับหน้า 1 เพราะกติกา sort เปลี่ยน
    ctl.setPagination({ pageIndex: 1, pageSize: ctl.pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctl.simpleFilters.status]);

  // ---- Simple -> Service params (✅ ส่ง sorting เข้าไปด้วย) ----
  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters, ctl.sorting),
    [ctl.simpleFilters, ctl.sorting],
  );

  // ---- Fetch rows ----
  // ✅ ปรับ hook ให้รับ orderBy/params เพิ่ม (ดูไฟล์ในข้อ 3)

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useEmployeesInventory(ctl.serverQuery, domainFilters);

  // ---- Options ----
  const statusOptions: readonly EmployeeStatus[] = ["Active", "Resigned"];
  const departmentOptions: readonly string[] = [
    "สำนักการตลาด",
    "สำนักข่าว",
    "สำนักผลิตรายการ",
    "สำนักกรรมการบริหาร",
    "สำนักกิจการและสื่อสารองค์กร",
    "สำนักสำนักทรัพยากรมนุษย์",
    "สำนักดิจิทัลและกลยุทธ์สื่อใหม่",
    "สำนักไฟฟ้ากำลัง",
    "สำนักเทคนิคโทรทัศน์",
    "สำนักการพาณิชย์",
  ];
  const manufacturerOptions: readonly string[] = []; // ไม่ใช้ในหน้านี้

  // ---- Selection (ใช้กับ Toolbar) ----
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<
    string[]
  >([]);

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export employees:", fmt, {
        serverQuery: ctl.serverQuery,
        serviceFilters,
      });
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

  const [deptSelected, setDeptSelected] = React.useState<readonly string[]>([]);

  return (
    <InventoryPageShell<EmployeeItem, EmployeeStatus, string>
      title="Employees"
      breadcrumbs={[{ label: "Employees", href: "/employees" }]}
      // ===== FilterBar =====
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      hasType={true}
      typeOptions={departmentOptions}
      allStatusLabel="All Status"
      allTypeLabel="All Departments"
      onExport={handleExport}
      // ⭐ เพิ่มบรรทัดนี้ เพื่อให้ Shell รู้ว่าหลังเคลียร์ควรกลับไป sort อะไร
      defaultSort={[{ id: "employeeId", desc: false }]}
      filterBarRightExtra={rightExtra}
      // ===== DataTable =====
      columns={employeeColumns}
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
      selectedIds={selectedEmployeeIds}
      onSelectedIdsChange={setSelectedEmployeeIds}
      
    />
  );
}
