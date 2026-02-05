// src/components/assign/AssignEmployeeExceptionsPage.tsx
"use client";

import * as React from "react";

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
import type { ExceptionDefinition } from "@/types/exception";

import { employeeColumns } from "@/lib/tables/employeeInventoryColumns";
import {
  toDomainFilters,
  toSimpleFilters,
} from "@/lib/mappers/employeeFilterMappers";
import { assignExceptionsToEmployees } from "@/services/exception.service.mock";
import EmployeeFilterBar from "@/components/filters/EmployeeFilterBar";
import { useActiveExceptionDefinitions } from "@/hooks/useActiveExceptionDefinitions";

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
  /* --------------------------- Controller & Data --------------------------- */
  const [domainFilters, setDomainFilters] =
    React.useState<EmployeeDomainFilters>(toDomainFilters());

  const ctl = useServerTableController<
    EmployeeItem,
    EmployeeDomainFilters,
    EmployeesFilterValues
  >({
    pageSize: 10,
    defaultSort: { id: "name", desc: false },
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

  /* -------------------- Exception Definitions (Active) -------------------- */
  const { defs, isLoading: loadingDefs } = useActiveExceptionDefinitions();
  const [checkedDefIds, setCheckedDefIds] = React.useState<string[]>([]);

  const toggleDef = React.useCallback((id: string, checked: boolean) => {
    setCheckedDefIds((prev) => {
      const s = new Set(prev);
      checked ? s.add(id) : s.delete(id);
      return Array.from(s);
    });
  }, []);

  /* --------------------------------- Form --------------------------------- */
  const [effectiveDate, setEffectiveDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = React.useState<string>("");

  const canSubmit = selectedEmployeeIds.length > 0 && checkedDefIds.length > 0;

  /* -------------------------------- Submit -------------------------------- */
  const [submitting, setSubmitting] = React.useState(false);
  const [lastMsg, setLastMsg] = React.useState<string | null>(null);

  const onAssign = React.useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setLastMsg(null);
    try {
      const res = await assignExceptionsToEmployees({
        employeeIds: selectedEmployeeIds,
        definitionIds: checkedDefIds,
        effectiveDate,
        notes: note.trim() || undefined,
      });

      setLastMsg(
        res.ok
          ? `Assigned ${res.assignedCount} employee(s) → [${res.definitionIds.join(", ")}] สำเร็จ`
          : "Assign ล้มเหลว",
      );
      setSelectedEmployeeIds([]); // reset selection (ตาม UX ที่ต้องการ)
    } catch (e: any) {
      setLastMsg(e?.message ?? "Assign ล้มเหลว (unknown error)");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, checkedDefIds, effectiveDate, note, selectedEmployeeIds]);

  /* --------------------------------- Render -------------------------------- */
  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <PageHeader
        title="Assign Exceptions → Employees"
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: "Assign Exceptions", href: "/exceptions/assign" },
        ]}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card
          title="Selected Employees"
          count={selectedEmployeeIds.length}
          compact
        />
        <Card title="Chosen Exceptions" count={checkedDefIds.length} compact />
        <Card title="Total Employees" count={totalRows} compact />
      </div>

      {/* Exceptions (Active) — under FilterBar like the first image */}
      <section className="rounded-md border border-slate-200 p-3">
        <div className="font-semibold mb-2">Exceptions (Active)</div>
        {loadingDefs ? (
          <p className="text-sm text-slate-600">กำลังโหลด...</p>
        ) : defs.length === 0 ? (
          <p className="text-sm text-slate-600">ไม่มี Definition ที่ Active</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {defs.map((d) => (
              <label
                key={d.id}
                className="inline-flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checkedDefIds.includes(d.id)}
                  onChange={(e) => toggleDef(d.id, e.target.checked)}
                  aria-label={`Select exception ${d.name}`}
                />
                <span>
                  {d.name}
                  <span className="ml-2 text-xs text-slate-500">({d.id})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Filter Bar (Top row: Status + Department + Effective date + Note + Confirm on right) */}
      <EmployeeFilterBar
        filters={ctl.simpleFilters}
        onFiltersChange={ctl.onSimpleFiltersChange}
        statusOptions={STATUS_OPTIONS}
        departmentOptions={DEPARTMENT_OPTIONS}
        rightExtra={
          <button
            className="rounded bg-slate-900 text-white px-4 py-2 text-sm h-9 disabled:opacity-50"
            disabled={!canSubmit || submitting}
            onClick={onAssign}
            aria-disabled={!canSubmit || submitting}
          >
            {submitting ? "Assigning..." : "Confirm Assign"}
          </button>
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
