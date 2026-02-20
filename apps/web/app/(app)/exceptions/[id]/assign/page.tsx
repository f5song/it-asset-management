// src/components/assign/AssignEmployeeExceptionsPage.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { useServerTableController } from "@/hooks/useServerTableController";
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
import { assignExceptionsToEmployees, getExceptionDefinitionById } from "@/services/exceptions.service";
import { useEmployeesInventory } from "@/hooks/useEmployeeInventory";
import EmployeeFilterBar from "@/components/filters/EmployeeFilterBar";

/* --------------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------------*/
const STATUS_OPTIONS: readonly EmployeeStatus[] = ["Active", "Resigned"];

// (คงเดิม) ตัวอย่าง department แบบฮาร์ดโค้ด
const DEPARTMENT_OPTIONS: readonly string[] = [
  "สำนักการตลาด",
  "สำนักข่าว",
  "สำนักผลิตรายการ",
  "สำนักกรรมการบริหาร",
  "สำนักกิจการและสื่อสารองค์กร",
  "สำนักทรัพยากรมนุษย์",
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
  // รองรับทั้ง /exceptions/[id]/assign และ /exceptions/[exceptionId]/assign
  const exceptionId = React.useMemo(
    () => String((params as any)?.id ?? (params as any)?.exceptionId ?? ""),
    [params],
  );

  // แปลงเป็น number (หรือ null ถ้าไม่ใช่ตัวเลข)
  const exceptionIdNum = React.useMemo(() => {
    const n = Number(exceptionId);
    return Number.isFinite(n) ? n : null;
  }, [exceptionId]);

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

    // ✅ รวม excludeAssignedForExceptionId เพื่อ trigger refetch เมื่อ exception เปลี่ยน
    resetDeps: [
      domainFilters.status,
      domainFilters.type,
      domainFilters.search,
      (domainFilters as any).excludeAssignedForExceptionId,
    ],
  });

  // ✅ เมื่อ exceptionId เปลี่ยน → filter ให้ backend "ซ่อนพนักงานที่ active ใน exception นี้"
  React.useEffect(() => {
    setDomainFilters((prev) => {
      const next = exceptionIdNum ?? undefined;
      if ((prev as any).excludeAssignedForExceptionId === next) return prev;
      return { ...prev, excludeAssignedForExceptionId: next as any };
    });
    // รีเซ็ตหน้าไปหน้าแรก & ล้าง selection
    ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
    setSelectedEmployeeIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exceptionIdNum]);

  // บังคับเรียง Active ก่อนเมื่อ All Status (คงเดิม)
  React.useEffect(() => {
    const isAll = ctl.simpleFilters.status == null; // undefined = All Status
    if (isAll) {
      ctl.setSorting([
        { id: "status_priority", desc: false }, // Active -> Resigned
        { id: "firstNameTh", desc: false },     // secondary sort
      ]);
    } else {
      ctl.setSorting([{ id: "firstNameTh", desc: false }]);
    }
    // รีเซ็ตหน้าเมื่อเงื่อนไขเรียงเปลี่ยน
    ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctl.simpleFilters.status]);

  // ✅ hook นี้จะส่ง domainFilters (ที่มี excludeAssignedForExceptionId) เข้า service → API
  const { rows, totalRows, isLoading, isError, errorMessage } =
    useEmployeesInventory(ctl.serverQuery, domainFilters);

  /* ------------------------------ Selections ------------------------------ */
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>(
    [],
  );
  const selectedIdSet = React.useMemo(
    () => new Set<string | number>(selectedEmployeeIds),
    [selectedEmployeeIds],
  );

  const handleSelectionChange = React.useCallback((next: Set<string | number>) => {
    setSelectedEmployeeIds(Array.from(next).map(String));
  }, []);

  /* ----------------- Exception Definition ที่เลือกจาก URL ----------------- */
  const { defs, isLoading: loadingDefs } =
    useActiveExceptionDefinitions();

  const currentDef = React.useMemo(
    () => defs.find((d) => d.id === exceptionId),
    [defs, exceptionId],
  );

  // ✅ ดึงชื่อจาก backend รายตัว (ไม่จำกัด Active) เพื่อใช้เป็นหัวข้อเสมอ
  const [titleName, setTitleName] = React.useState<string | null>(null);
  const [loadingTitle, setLoadingTitle] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!exceptionId) {
      setTitleName(null);
      return;
    }
    const ac = new AbortController();
    setLoadingTitle(true);
    (async () => {
      try {
        const def = await getExceptionDefinitionById(exceptionId, ac.signal);
        setTitleName(def?.name ?? null);
      } catch (_e) {
        setTitleName(null);
      } finally {
        setLoadingTitle(false);
      }
    })();
    return () => ac.abort();
  }, [exceptionId]);

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
      const res = await assignExceptionsToEmployees(
        exceptionId,
        selectedEmployeeIds,
        undefined, // assignedBy
      );

      const inserted = Number(res.inserted ?? 0);
      const reactivated = Number(res.reactivated ?? 0);

      setLastMsg(`สำเร็จ: เพิ่ม ${inserted} รายการ, เปิดใช้งานใหม่ ${reactivated} รายการ`);
      setSelectedEmployeeIds([]); // reset selection
      // หลัง assign สำเร็จ ควร refetch เพื่อให้รายการอัปเดต (คนที่เพิ่ง assign จะถูกซ่อน)
      ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
    } catch (e: any) {
      setLastMsg(e?.message ?? "Assign ล้มเหลว (unknown error)");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, exceptionId, selectedEmployeeIds, ctl]);

  /* --------------------------------- Render -------------------------------- */
  const headerTitle =
    loadingTitle || loadingDefs
      ? "Assign Exception → Employees"
      : titleName
        ? titleName
        : exceptionId
          ? `Exception ${exceptionId} (ไม่พบในรายการ Active)`
          : "Assign Exception → Employees";

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <PageHeader
        title={headerTitle}
        breadcrumbs={[
          { label: "Exceptions", href: "/exceptions" },
          currentDef
            ? { label: currentDef.name, href: `/exceptions/${currentDef.id}` }
            : titleName
              ? { label: titleName, href: `/exceptions/${exceptionId}` }
              : { label: "Exception", href: `/exceptions/${exceptionId}` },
          { label: "Assign to Employees", href: "#" },
        ]}
      />

      {/* Summary ⇒ 2 ใบ: Total / Selected */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card title="Total Employees" count={totalRows} compact />
        <Card title="Selected Employees" count={selectedEmployeeIds.length} compact />
      </div>

      {/* Filter Bar */}
      <section>
        <EmployeeFilterBar
          filters={ctl.simpleFilters}
          onFiltersChange={ctl.onSimpleFiltersChange}
          statusOptions={STATUS_OPTIONS}
          departmentOptions={DEPARTMENT_OPTIONS}
          rightExtra={
            <div className="flex items-center gap-2">
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
      </section>

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