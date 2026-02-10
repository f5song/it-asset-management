// src/components/assign/AssignEmployeeExceptionsPage.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { useServerTableController } from "@/hooks/useServerTableController";
import { useEmployeesInventory } from "@/hooks/useEmployeeInventory";
import { DataTable } from "@/components/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

import type {
  EmployeeItem,
  EmployeeDomainFilters,
  EmployeesFilterValues,
  EmployeeStatus,
} from "@/types/employees";

import { employeeColumns } from "@/lib/tables/employeeInventoryColumns";
import {
  toDomainFilters,
  toSimpleFilters,
} from "@/lib/mappers/employeeFilterMappers";
import { useActiveExceptionDefinitions } from "@/hooks/useActiveExceptionDefinitions";
import { assignExceptionsToEmployees } from "@/services/exceptions.service.mock";
import EmployeeFilterBar from "@/components/filters/EmployeeFilterBar";
// ถ้ามี hook เดี่ยว ใช้ตัวนี้แทน (แนะนำ)
// import { useExceptionDefinition } from "@/hooks/useExceptionDefinition";

/* --------------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------------*/
const STATUS_OPTIONS: readonly EmployeeStatus[] = ["Active", "Resigned"];

const DEPARTMENT_OPTIONS: readonly string[] = [
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

/* --------------------------------------------------------------------------------
 * Page Component
 * ------------------------------------------------------------------------------*/
export default function AssignEmployeeExceptionsPage() {
  /* ------------------------ รับ exceptionId จาก URL ------------------------ */
  const params = useParams(); // Next.js App Router
  const exceptionId = String(params?.id ?? params?.exceptionId ?? "");

  /* --------------------------- Controller & Data --------------------------- */
  const [domainFilters, setDomainFilters] =
    React.useState<EmployeeDomainFilters>(toDomainFilters());

  const ctl = useServerTableController<
    EmployeeItem,
    EmployeeDomainFilters,
    EmployeesFilterValues
  >({
    pageSize: 10,
    defaultSort: { id: "firstNameTh", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: (df) => toSimpleFilters(df),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [
      domainFilters.status,
      domainFilters.department,
      domainFilters.search,
    ],
  });

  // ⭐ เพิ่มตรงนี้ใน AssignEmployeeExceptionsPage
  React.useEffect(() => {
    const isAll = ctl.simpleFilters.status == null; // undefined = All Status
    if (isAll) {
      ctl.setSorting([
        { id: "status_priority", desc: false }, // Active -> Resigned
        { id: "firstNameTh", desc: false }, // secondary sort
      ]);
    } else {
      ctl.setSorting([{ id: "firstNameTh", desc: false }]);
    }

    ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctl.simpleFilters.status]);

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useEmployeesInventory(ctl.serverQuery, domainFilters);

  /* ------------------------------ Selections ------------------------------ */
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<
    string[]
  >([]);
  const selectedIdSet = React.useMemo(
    () => new Set<string | number>(selectedEmployeeIds),
    [selectedEmployeeIds],
  );

  const handleSelectionChange = React.useCallback(
    (next: Set<string | number>) => {
      setSelectedEmployeeIds(Array.from(next).map(String));
    },
    [],
  );

  /* ----------------- Exception Definition ที่เลือกจาก URL ----------------- */
  // ทางเลือก B: ใช้ hook ที่มีอยู่ แล้วหา def จาก id
  const { defs, isLoading: loadingDefs } = useActiveExceptionDefinitions();
  const currentDef = React.useMemo(
    () => defs.find((d) => d.id === exceptionId),
    [defs, exceptionId],
  );

  // ทางเลือก A (ถ้ามี hook เดี่ยว):
  // const { def: currentDef, isLoading: loadingDefs } = useExceptionDefinition(exceptionId);

  /* --------------------------------- Form --------------------------------- */
  const [effectiveDate, setEffectiveDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = React.useState<string>("");

  const canSubmit = selectedEmployeeIds.length > 0 && !!exceptionId;

  /* -------------------------------- Submit -------------------------------- */
  const [submitting, setSubmitting] = React.useState(false);
  const [lastMsg, setLastMsg] = React.useState<string | null>(null);

  const onAssign = React.useCallback(async () => {
    if (!canSubmit || !exceptionId || selectedEmployeeIds.length === 0) return;

    setSubmitting(true);
    setLastMsg(null);

    try {
      // เตรียม payload ให้ตรงกับ signature ของ service (ต่อ definition, หลาย employee)
      const employeesPayload = selectedEmployeeIds.map((id) => ({
        employeeId: id,
        // ถ้าต้องการแนบชื่อ/แผนก ส่งเพิ่มตรงนี้ได้ เช่น employeeName, department
        notes: note.trim() || null,
      }));

      const res = await assignExceptionsToEmployees(
        String(exceptionId),
        employeesPayload,
        {
          // พฤติกรรมที่ใช้บ่อย: ถ้ามีอยู่แล้วให้ข้าม (ไม่ error)
          skipIfExists: true,
          // อัปเดตชื่อ/แผนกถ้าส่งมา (โค้ดนี้เราไม่ได้ส่ง ก็ไม่กระทบ)
          upsertNameAndDept: true,
          // ถ้าพิมพ์ note ใหม่ ให้ append ต่อท้าย (เปลี่ยนเป็น "replace" ได้ถ้าต้องการ)
          noteStrategy: note.trim() ? "append" : "keep-existing",
        },
      );

      const assignedCount = (res?.added ?? 0) + (res?.updated ?? 0);

      setLastMsg(
        `Assigned ${assignedCount} employee(s) → [${String(exceptionId)}] สำเร็จ ` +
          `(added ${res?.added ?? 0}, updated ${res?.updated ?? 0}, skipped ${res?.skipped ?? 0})`,
      );

      setSelectedEmployeeIds([]); // reset selection
    } catch (e: any) {
      setLastMsg(e?.message ?? "Assign ล้มเหลว (unknown error)");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, exceptionId, note, selectedEmployeeIds]);

  /* --------------------------------- Render -------------------------------- */
  const headerTitle = loadingDefs
    ? "Assign Exception → Employees"
    : currentDef
      ? `${currentDef.name}`
      : exceptionId
        ? `Exception ${exceptionId} (ไม่พบในรายการ Active)`
        : "Assign Exception → Employees";

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <PageHeader
        title={headerTitle} // ✅ แสดงชื่อ exception เป็นหัวข้อ
        breadcrumbs={[
          { label: "Exceptions", href: "/exceptions" },
          currentDef
            ? { label: currentDef.name, href: `/exceptions/${currentDef.id}` }
            : { label: "Exception", href: `/exceptions/${exceptionId}` },
          { label: "Assign to Employees", href: "#" },
        ]}
      />

      {/* Summary ⇒ 3 ใบ: Total Employees / Selected Employees / Exception */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card title="Total Employees" count={totalRows} compact />
        <Card
          title="Selected Employees"
          count={selectedEmployeeIds.length}
          compact
        />
        {/* <Card title="Exception" count="" compact>
          <p className="text-sm text-slate-600">
            {loadingDefs
              ? "กำลังโหลด..."
              : currentDef
              ? `${currentDef.name} (${currentDef.id})`
              : exceptionId
              ? `(${exceptionId}) ไม่พบในรายการ Active`
              : "-"}
          </p>
        </Card> */}
      </div>

      {/* Filter Bar */}
      <EmployeeFilterBar
        filters={ctl.simpleFilters}
        onFiltersChange={ctl.onSimpleFiltersChange}
        statusOptions={STATUS_OPTIONS}
        departmentOptions={DEPARTMENT_OPTIONS}
        rightExtra={
          <div className="flex items-center gap-2">
            {/* Confirm */}
            <button
              className="rounded bg-slate-900 text-white px-4 py-2 text-sm h-9 disabled:opacity-50"
              disabled={!canSubmit || submitting}
              onClick={onAssign}
              aria-disabled={!canSubmit || submitting}
            >
              {submitting ? "Assigning..." : "Confirm Assign"}
            </button>
          </div>
        }
        labels={{
          status: "All Status",
          type: "All Departments",
          allStatus: "All Status",
          allType: "All Departments",
          searchPlaceholder: "ค้นหา ID / ชื่อ / Department",
        }}
      />

      {/* Employees table */}
      <section>
        <DataTable
          columns={employeeColumns}
          rows={rows}
          totalRows={totalRows}
          pagination={ctl.pagination}
          onPaginationChange={ctl.setPagination}
          sorting={ctl.sorting}
          onSortingChange={ctl.setSorting}
          variant="striped"
          emptyMessage="ไม่พบพนักงาน"
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          maxBodyHeight={480}
          rowHref={(row) => `/employees/${row.id}`}
          selectable
          selectedIds={selectedIdSet}
          onSelectionChange={handleSelectionChange}
          getRowId={(row: EmployeeItem) => row.id}
          selectionScope="page"
        />
      </section>

      {lastMsg && <p className="text-sm text-slate-700">{lastMsg}</p>}
    </div>
  );
}
