// src/components/assign/AssignEmployeeToExceptionsClient.tsx
"use client";

import * as React from "react";
import { useServerTableController } from "@/hooks/useServerTableController";
import { useExceptionDefinitionsInventory } from "@/hooks/useExceptionDefinitionsInventory";
import type { ExceptionDefinition, PolicyStatus } from "@/types/exception";
import type { EmployeeItem } from "@/types";
import { DataTable } from "@/components/table";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { exceptionInventoryColumns } from "@/lib/tables/exceptionInventoryColumns";
import { assignExceptionsToEmployees } from "@/services/exception.service.mock";
import ExceptionFilterBar, {
  ExceptionUIFilters,
} from "@/components/filters/ExceptionFilterBar";
import BackButton from "../ui/BackButton";



type ExceptionDomainFilters = { status?: PolicyStatus; search?: string };

function toDomainFilters(ui: ExceptionUIFilters): ExceptionDomainFilters {
  return { status: ui.status, search: ui.search };
}
function toSimpleFilters(df: ExceptionDomainFilters): ExceptionUIFilters {
  return { status: df.status, search: df.search ?? "" };
}

export default function AssignEmployeeToExceptionsClient({
  employee,
}: {
  employee: EmployeeItem;
}) {
  const [domainFilters, setDomainFilters] =
    React.useState<ExceptionDomainFilters>(toDomainFilters({}));

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

  // Selection
  const [selectedDefIds, setSelectedDefIds] = React.useState<string[]>([]);
  const selectedIdSet = React.useMemo(
    () => new Set<string | number>(selectedDefIds),
    [selectedDefIds],
  );
  const handleSelectionChange = React.useCallback(
    (next: Set<string | number>) => {
      setSelectedDefIds(Array.from(next).map(String));
    },
    [],
  );

  // Form
  const [effectiveDate, setEffectiveDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [expiresAt, setExpiresAt] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");

  const canSubmit = selectedDefIds.length > 0;
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
      setSelectedDefIds([]);
    } catch (e: any) {
      setLastMsg(e?.message ?? "Assign ล้มเหลว (unknown error)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <BackButton />
      <PageHeader
        title="Assign Exceptions → Employee"
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          {
            label: `${employee.name} (${employee.id})`,
            href: `/employees/${employee.id}`,
          },
          {
            label: "Assign Exceptions",
            href: `/employees/${employee.id}/exceptions/assign`,
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card
          title="Employee"
          count={`${employee.name} (${employee.id})`}
          compact
        />
        <Card
          title="Selected Exceptions"
          count={selectedDefIds.length}
          compact
        />
        <Card title="Total Exceptions" count={totalRows} compact />
      </div>

      {/* ✅ ใช้ ExceptionFilterBar แทน UI ฟิลเตอร์เดิม */}
      <ExceptionFilterBar
        filters={ctl.simpleFilters}
        onFiltersChange={ctl.onSimpleFiltersChange}
        statusOptions={["Active", "Inactive", "Deprecated", "Archived"]}
        labels={{
          status: "Status",
          searchPlaceholder: "ค้นหา ID / ชื่อ / หมายเหตุ",
          allStatus: "All Status",
        }}
        rightExtra={
          <button
            className="rounded bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-50"
            disabled={!canSubmit || submitting}
            onClick={onAssign}
          >
            {submitting ? "Assigning..." : "Confirm Assign"}
          </button>
        }
        extraFilters={
          <div className="flex flex-wrap gap-4 items-center">
            {/* Status already handled by ExceptionFilterBar */}

            {/* Effective date */}
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span>Effective date:</span>
              <input
                type="date"
                className="rounded border border-slate-300 px-2 py-1 h-9"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </label>

            {/* Expires at */}
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span>Expires at:</span>
              <input
                type="date"
                className="rounded border border-slate-300 px-2 py-1 h-9"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </label>
          </div>
        }
      />

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
          selectable={true}
          selectedIds={selectedIdSet}
          onSelectionChange={handleSelectionChange}
          getRowId={(row: ExceptionDefinition) => row.id}
          selectionScope="page"
        />
      </section>

      {lastMsg && <p className="text-sm text-slate-700">{lastMsg}</p>}
    </div>
  );
}
