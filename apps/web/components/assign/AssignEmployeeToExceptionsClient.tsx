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
import ExceptionFilterBar, {
  ExceptionUIFilters,
} from "@/components/filters/ExceptionFilterBar";
import BackButton from "../ui/BackButton";
import { assignExceptionsToEmployees } from "@/services/exceptions.service.mock";
import { fullName } from "@/lib/name";

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

  // ✅ บังคับ Active มาก่อน เมื่ออยู่ All Status (เหมือน ExceptionPage)
  React.useEffect(() => {
    const isAll = ctl.simpleFilters.status == null; // undefined = All
    if (isAll) {
      ctl.setSorting([
        { id: "status_priority", desc: false }, // Active -> Inactive
        { id: "name", desc: false }, // secondary
      ]);
    } else {
      // เมื่อเลือกสถานะเฉพาะแล้ว ไม่ต้องบังคับ priority
      ctl.setSorting([{ id: "name", desc: false }]);
    }
    // รีเซ็ตหน้าเพื่อ UX ที่ดี เมื่อกติกาเรียงเปลี่ยน
    ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctl.simpleFilters.status]);

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
      // เตรียม payload ให้ตรงกับ signature ปัจจุบันของ service
      const employeesPayload = [
        {
          employeeId: employee.id,
          // ชื่อ/แผนกถ้าไม่ได้ส่ง จะ auto จาก toDisplayName/“–”
          // employeeName: employee.name,
          // department: employee.department,
          notes: note.trim() || null,
        },
      ];

      const defs = selectedDefIds?.map(String) ?? [];
      if (defs.length === 0) throw new Error("ยังไม่ได้เลือก Exception");

      // เรียก service แบบต่อ definition แล้วรวมผลลัพธ์
      const results = await Promise.all(
        defs.map((defId) =>
          assignExceptionsToEmployees(defId, employeesPayload, {
            // ให้ behavior ใกล้เคียงเดิม: ถ้ามีอยู่แล้วให้ข้าม
            skipIfExists: true,
            // อัปเดตชื่อ/แผนกถ้าส่งมา (เราไม่ได้ส่งใน payload ข้างบนก็ไม่กระทบ)
            upsertNameAndDept: true,
            // ถ้ามี note ใหม่ให้ append ต่อท้าย (หรือเปลี่ยนเป็น "replace" ถ้าต้องการ)
            noteStrategy: note.trim() ? "append" : "keep-existing",
          }),
        ),
      );

      const addedTotal = results.reduce((n, r) => n + (r?.added ?? 0), 0);
      const updatedTotal = results.reduce((n, r) => n + (r?.updated ?? 0), 0);
      const skippedTotal = results.reduce((n, r) => n + (r?.skipped ?? 0), 0);

      setLastMsg(
        `Assigned ${defs.length} exception(s) ให้ ${fullName(employee)} สำเร็จ ` +
          `(added ${addedTotal}, updated ${updatedTotal}, skipped ${skippedTotal})`,
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
            label: `${fullName(employee)} (${employee.id})`,
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
          count={`${fullName(employee)} (${employee.id})`}
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
        statusOptions={["Active", "Inactive"]}
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
