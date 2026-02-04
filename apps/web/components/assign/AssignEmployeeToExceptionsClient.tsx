"use client";

import * as React from "react";
import { useServerTableController } from "@/hooks/useServerTableController";
import { ExceptionDefinition, ExceptionDomainFilters, PolicyStatus } from "@/types/exception";
import { EmployeeItem } from "@/types";
import { assignExceptionsToEmployees } from "@/services/exception.service.mock";
import { PageHeader } from "../ui/PageHeader";
import { Card } from "../ui/Card";
import { DataTable } from "../table";
import { exceptionInventoryColumns } from "@/lib/tables/exceptionInventoryColumns";


// UI Filters ของหน้านี้ (เรียบง่าย)
type ExceptionUIFilters = {
  status?: PolicyStatus;
  search?: string;
};

function toDomainFilters(ui: ExceptionUIFilters): ExceptionDomainFilters {
  return {
    status: ui.status ?? undefined,
    search: ui.search ?? undefined,
  };
}
function toSimpleFilters(df: ExceptionDomainFilters): ExceptionUIFilters {
  return {
    status: df.status ?? undefined,
    search: df.search ?? "",
  };
}

export default function AssignEmployeeToExceptionsClient({ employee }: { employee: EmployeeItem }) {
  // ----------------- Filters/Controller ของตาราง Exception Definitions -----------------
  const [domainFilters, setDomainFilters] = React.useState<ExceptionDomainFilters>(
    toDomainFilters({}),
  );

  const ctl = useServerTableController<
    ExceptionDefinition,
    ExceptionDomainFilters,
    ExceptionUIFilters
  >({
    pageSize: 10,
    defaultSort: { id: "name", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: (df) => toSimpleFilters(df),
    fromSimple: (sf) => toDomainFilters(sf),
    resetDeps: [domainFilters.status, domainFilters.search],
  });

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useExceptionDefinitionsInventory(ctl.serverQuery, domainFilters);

  // ----------------- Selection ของ DataTable (Definitions) -----------------
  const [selectedDefIds, setSelectedDefIds] = React.useState<string[]>([]);
  const selectedIdSet = React.useMemo(
    () => new Set<string | number>(selectedDefIds),
    [selectedDefIds],
  );
  const handleSelectionChange = React.useCallback((next: Set<string | number>) => {
    setSelectedDefIds(Array.from(next).map(String));
  }, []);

  // ----------------- ฟอร์ม (วันที่เริ่มใช้/หมดอายุ + หมายเหตุ) -----------------
  const [effectiveDate, setEffectiveDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [expiresAt, setExpiresAt] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");

  const canSubmit = selectedDefIds.length > 0;

  // ----------------- Submit -----------------
  const [submitting, setSubmitting] = React.useState(false);
  const [lastMsg, setLastMsg] = React.useState<string | null>(null);

  const onAssign = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setLastMsg(null);
    try {
      const res = await assignExceptionsToEmployees({
        employeeIds: [employee.id],
        definitionIds: selectedDefIds,
        effectiveDate,
        expiresAt: expiresAt?.trim() ? expiresAt : undefined,
        notes: note.trim() || undefined,
      });

      setLastMsg(
        res.ok
          ? `Assigned ${res.definitionIds.length} exception(s) ให้ ${employee.name} สำเร็จ`
          : "Assign ล้มเหลว",
      );

      // เคลียร์ selection ตามต้องการ
      setSelectedDefIds([]);
    } catch (e: any) {
      setLastMsg(e?.message ?? "Assign ล้มเหลว (unknown error)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="Assign Exceptions → Employee"
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: `${employee.name} (${employee.id})`, href: `/employees/${employee.id}` },
          { label: "Assign Exceptions", href: `/employees/${employee.id}/exceptions/assign` },
        ]}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card title="Employee" count={`${employee.name} (${employee.id})`} compact />
        <Card title="Selected Exceptions" count={selectedDefIds.length} compact />
        <Card title="Total Exceptions" count={totalRows} compact />
      </div>

      {/* Simple Filters */}
      <section className="rounded-md border border-slate-200 p-4">
        <h2 className="font-semibold mb-3">ตัวกรอง</h2>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <label className="text-sm">
            Status:
            <select
              className="ml-2 rounded border border-slate-300 px-2 py-1"
              value={ctl.simpleFilters.status ?? ""}
              onChange={(e) =>
                ctl.onSimpleFiltersChange({
                  ...ctl.simpleFilters,
                  status: (e.target.value || undefined) as PolicyStatus | undefined,
                })
              }
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Deprecated">Deprecated</option>
              <option value="Archived">Archived</option>
            </select>
          </label>

          <label className="text-sm flex-1">
            Search:
            <input
              type="text"
              className="ml-2 rounded border border-slate-300 px-2 py-1 w-full"
              placeholder="ค้นหา ID / ชื่อ / หมายเหตุ"
              value={ctl.simpleFilters.search ?? ""}
              onChange={(e) =>
                ctl.onSimpleFiltersChange({
                  ...ctl.simpleFilters,
                  search: e.target.value,
                })
              }
            />
          </label>

          <button
            className="rounded bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-50"
            disabled={!canSubmit || submitting}
            onClick={onAssign}
          >
            {submitting ? "Assigning..." : "Confirm Assign"}
          </button>
        </div>

        <div className="mt-3 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <label className="text-sm">
            Effective date:
            <input
              type="date"
              className="ml-2 rounded border border-slate-300 px-2 py-1"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </label>

          <label className="text-sm">
            Expires at:
            <input
              type="date"
              className="ml-2 rounded border border-slate-300 px-2 py-1"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </label>

          <label className="text-sm flex-1">
            Note:
            <input
              type="text"
              className="ml-2 rounded border border-slate-300 px-2 py-1 w-full"
              placeholder="เหตุผล/หมายเหตุ (ถ้ามี)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>

        {lastMsg && <p className="mt-3 text-sm text-slate-700">{lastMsg}</p>}
      </section>

      {/* ตาราง Exception Definitions */}
      <section>
        <DataTable
          columns={exceptionInventoryColumns}
          rows={rows}
          totalRows={totalRows}
          pagination={ctl.pagination}
          onPaginationChange={ctl.setPagination}
          sorting={ctl.sorting}
          onSortingChange={ctl.setSorting}
          variant="striped"
          emptyMessage="ไม่พบข้อยกเว้น"
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          maxBodyHeight={480}
          // Selection
          selectable={true}
          selectedIds={selectedIdSet}
          onSelectionChange={handleSelectionChange}
          getRowId={(row: ExceptionDefinition) => row.id}
          selectionScope="page"
        />
      </section>
    </div>
  );
}
function useExceptionDefinitionsInventory(serverQuery: { pageIndex: number; pageSize: number; sortBy: string | undefined; sortOrder: "asc" | "desc" | undefined; }, domainFilters: ExceptionDomainFilters): { rows: any; totalRows: any; isLoading: any; isError: any; errorMessage: any; } {
    throw new Error("Function not implemented.");
}

