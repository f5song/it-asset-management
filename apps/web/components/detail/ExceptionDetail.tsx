// components/detail/ExceptionsDetail.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView, EditConfig } from "@/components/detail/DetailView";
import { InstallationSection } from "@/components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "@/components/toolbar/InventoryActionToolbar";

import type { BreadcrumbItem, HistoryEvent } from "@/types";
import type {
  ExceptionDefinitionRow, // ⬅️ ใช้ Row ที่มี id
  ExceptionAssignmentRow,
  ExceptionEditValues,
} from "@/types/exception";

import { show } from "@/lib/show";
import { exceptionAssignmentColumns } from "@/lib/tables/exceptionAssignmentColumns";
import { demoExceptionHistory } from "@/lib/demo/exceptionDetailDemoData";
import { formatDateSafe } from "@/lib/date";
import { toLocalInput } from "@/lib/date-input";
import { exceptionEditFields } from "@/config/forms/exceptionEditFields";
import { DetailInfoGrid } from "@/components/detail/DetailInfo";
import { HistoryList } from "@/components/detail/HistoryList";

import {
  getExceptionAssigneesPage,
  revokeAssignments,
} from "@/services/exceptions.service";

type ExceptionsDetailProps = {
  item: ExceptionDefinitionRow; // ⬅️ เปลี่ยนให้เป็น Row
  history?: HistoryEvent[];
  assignments?: ExceptionAssignmentRow[];
  breadcrumbs?: BreadcrumbItem[];
};

export default function ExceptionsDetail({
  item,
  history,
  assignments,
  breadcrumbs,
}: ExceptionsDetailProps) {
  const router = useRouter();

  const historyData = React.useMemo<HistoryEvent[]>(
    () => (Array.isArray(history) && history.length ? history : demoExceptionHistory),
    [history],
  );

  /* ------------------------------------------------------------------------
   * Assignments: Server-side pagination (API)
   * ----------------------------------------------------------------------*/
  const [page, setPage] = React.useState<number>(1); // 1-based
  const [pageSize, setPageSize] = React.useState<number>(8);
  const [totalRows, setTotalRows] = React.useState<number>(0);
  const [assignRows, setAssignRows] = React.useState<ExceptionAssignmentRow[]>([]);
  const [loadingAssign, setLoadingAssign] = React.useState<boolean>(false);
  const [assignError, setAssignError] = React.useState<string | null>(null);

  // selection (ใช้ emp_code เป็น id selection เพื่อส่งให้ revoke ตรง ๆ)
  const [selectedEmpCodes, setSelectedEmpCodes] = React.useState<Set<string | number>>(new Set());

  // 🔁 ตัวบังคับ reload เมื่อ unassign เสร็จ แม้ page/pageSize จะไม่เปลี่ยน
  const [reloadTick, setReloadTick] = React.useState(0);

  // โหลดเฉพาะ "Active assignees" ด้วย page 1-based
  React.useEffect(() => {
    if (!item?.id) {
      setAssignRows([]);
      setTotalRows(0);
      return;
    }
    const ac = new AbortController();
    setLoadingAssign(true);
    setAssignError(null);

    (async () => {
      try {
        const res = await getExceptionAssigneesPage(
          item.id,
          { page, pageSize, status: "active" }, //   1-based + เฉพาะ active
          ac.signal,
        );
        setAssignRows(res.items ?? []);
        setTotalRows(Number(res.totalCount ?? 0));
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("load assignees failed:", e);
          setAssignError(e?.message ?? "โหลดรายการผู้ได้รับสิทธิ์ไม่สำเร็จ");
          setAssignRows([]);
          setTotalRows(0);
        }
      } finally {
        setLoadingAssign(false);
      }
    })();

    return () => ac.abort();
  }, [item.id, page, pageSize, reloadTick]); // ⬅️ เพิ่ม reloadTick

  // ถ้าภายนอกส่ง assignments มา (เช่นจาก SSR) ให้ override หน้านั้น
  React.useEffect(() => {
    if (Array.isArray(assignments) && assignments.length) {
      setAssignRows(assignments);
      setTotalRows((t) => (t > 0 ? t : assignments.length));
    }
  }, [assignments]);

  // เรียง Active -> Resigned; ถ้าไม่มีสถานะ ให้ไปท้าย (เฉพาะในหน้า)
  const sortedRows = React.useMemo<ExceptionAssignmentRow[]>(() => {
    const pr = new Map<string, number>([
      ["active", 0],
      ["resigned", 1],
    ]);

    const getStatus = (r: any): string | undefined => {
      const s =
        r?.status ??
        r?.employeeStatus ??
        r?.employee?.status ??
        r?.user?.status ??
        r?.profile?.status;
      return typeof s === "string" ? s : undefined;
    };

    const getEmpId = (r: any) => r?.employeeId ?? r?.emp_code ?? r?.userId ?? r?.empId ?? "";

    return [...assignRows].sort((a: any, b: any) => {
      const sa = (getStatus(a) ?? "").toLowerCase();
      const sb = (getStatus(b) ?? "").toLowerCase();
      const pa = pr.get(sa) ?? 999;
      const pb = pr.get(sb) ?? 999;

      if (pa !== pb) return pa - pb;
      return String(getEmpId(a)).localeCompare(String(getEmpId(b)), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [assignRows]);

  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = React.useCallback(() => {
    console.log("Delete exception:", item.id);
  }, [item.id]);

  const handleAssign = React.useCallback(() => {
    router.push(`/exceptions/${item.id}/assign`);
  }, [item.id, router]);

  const toolbar = React.useMemo(
    () => (
      <InventoryActionToolbar
        entity="exceptions"
        selectedIds={[item.id]}
        basePath="/exceptions"
        enableDefaultMapping
        visibleActions={["Assign Exceptions"]}
        singleSelectionOnly
        toOverride={{
          "Assign Exceptions": `/exceptions/${item.id}/assign`,
        }}
        onAction={(act) => {
          if (act === "Assign Exceptions") handleAssign();
        }}
      />
    ),
    [item.id, handleAssign],
  );

  // Info panels (Definition-level)
  const infoLeft = React.useMemo(
    () => [
      { label: "Exception ID", value: show(item.exception_id) },
      { label: "Name", value: show(item.name) },
      { label: "Risk", value: show(item.risk) },
    ],
    [item.exception_id, item.name, item.risk],
  );

  const infoRight = React.useMemo(
    () => [
      { label: "Status", value: show(item.status) },
      { label: "Created At", value: formatDateSafe(item.createdAt) },
      { label: "Last Updated", value: formatDateSafe(item.lastUpdated) },
    ],
    [item.status, item.createdAt, item.lastUpdated],
  );

  const editConfig = React.useMemo<EditConfig<ExceptionEditValues>>(
    () => ({
      title: "Edit Exception",
      fields: exceptionEditFields,
      initialValues: {
        name: item.name ?? "",
        status: item.status,
        risk: item.risk ?? "Low",
        createdAt: toLocalInput(item.createdAt),
        lastUpdated: toLocalInput(item.lastUpdated ?? ""),
        description: item.description ?? "",
      },
      onSubmit: async (values) => {
        console.log("save exception:", values);
      },
      submitLabel: "Confirm",
      cancelLabel: "Cancel",
    }),
    [
      item.name,
      item.status,
      item.risk,
      item.createdAt,
      item.lastUpdated,
      item.description,
    ],
  );

  /* ------------------------------------------------------------------------
   * Unassign (รายแถว + modal ยืนยัน) + Bulk Unassign
   * ----------------------------------------------------------------------*/
  const [unassignOpen, setUnassignOpen] = React.useState(false);
  const [unassigning, setUnassigning] = React.useState(false);
  const [pendingEmpCodes, setPendingEmpCodes] = React.useState<string[]>([]);

  const openUnassignFor = React.useCallback((empCodes: string[]) => {
    setPendingEmpCodes(empCodes);
    setUnassignOpen(true);
  }, []);

  const closeUnassign = React.useCallback(() => {
    setUnassignOpen(false);
    setPendingEmpCodes([]);
  }, []);

  const resolveActor = React.useCallback((): string => {
    // หา actor จากแหล่งที่คุณมี (แก้ให้ตรงระบบ auth จริง)
    // ลำดับความสำคัญ: localStorage.userEmail -> localStorage.username -> 'system'
    try {
      if (typeof window !== "undefined") {
        const email = localStorage.getItem("userEmail");
        if (email) return email;
        const username = localStorage.getItem("username");
        if (username) return username;
      }
    } catch {}
    return "system";
  }, []);

  const confirmUnassign = React.useCallback(async () => {
    if (!item?.id || pendingEmpCodes.length === 0) return;
    setUnassigning(true);
    try {
      const actor = resolveActor();
      await revokeAssignments(item.id, pendingEmpCodes, actor);

      // ✅ รีโหลด: เพิ่ม tick + รีเซ็ตไปหน้า 1 เพื่อความปลอดภัย
      setPage(1);
      setReloadTick((t) => t + 1);

      // ล้าง selection
      setSelectedEmpCodes(new Set());
    } catch (e: any) {
      console.error("unassign failed:", e);
      // TODO: toast error
    } finally {
      setUnassigning(false);
      closeUnassign();
    }
  }, [item?.id, pendingEmpCodes, resolveActor, closeUnassign]);

  // สร้าง columns ใหม่ (เพิ่มปุ่ม Actions -> Unassign รายแถว)
  const assignmentColsWithActions = React.useMemo(
    () =>
      [
        ...exceptionAssignmentColumns,
        {
          id: "actions",
          header: "Actions",
          accessorKey: "__actions",
          align: "center",
          width: 120,
          cell: (_value: unknown, row: any) => {
            // เดา emp_code จากหลายฟิลด์
            const empCode =
              row?.emp_code ??
              row?.employeeId ??
              row?.empId ??
              row?.userId ??
              row?.id ??
              "";
            return (
              <button
                className="text-red-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  const code = String(empCode || "").trim();
                  if (!code) return;
                  openUnassignFor([code]);
                }}
              >
                Unassign
              </button>
            );
          },
        } as const,
      ] as const,
    [openUnassignFor],
  );

  // ปุ่ม Bulk (อยู่ทางขวาของแถบใน InstallationSection ผ่าน prop rightExtra)
  const rightExtra = React.useMemo(() => {
    const count = selectedEmpCodes.size;
    return (
      <button
        className="rounded bg-red-600 text-white px-3 py-2 text-sm disabled:opacity-50"
        disabled={count === 0 || loadingAssign}
        onClick={() => {
          const list = Array.from(selectedEmpCodes).map(String).filter(Boolean);
          if (list.length === 0) return;
          openUnassignFor(list);
        }}
        title={count > 0 ? `Unassign Selected (${count})` : "Select rows to unassign"}
      >
        {count > 0 ? `Unassign Selected (${count})` : "Unassign Selected"}
      </button>
    );
  }, [selectedEmpCodes, loadingAssign, openUnassignFor]);

  const tabs = React.useMemo(
    () => [
      {
        key: "detail",
        label: "Detail",
        content: <DetailInfoGrid left={infoLeft} right={infoRight} />,
      },
      {
        key: "assignments",
        label: "Assignments",
        content: (
          <InstallationSection<ExceptionAssignmentRow>
            rows={sortedRows}
            columns={assignmentColsWithActions}
            resetKey={`exception-${item.id}-${page}-${pageSize}-${reloadTick}`} // ⬅️ ผูก reloadTick
            initialPage={page} // 1-based
            pageSize={pageSize}
            totalRows={totalRows}
            isLoading={loadingAssign}
            errorMessage={assignError ?? undefined}
            onPageChange={(nextPage: number, nextSize?: number) => {
              if (typeof nextSize === "number" && nextSize !== pageSize) {
                setPageSize(nextSize);
                setPage(1); // เปลี่ยน page size แล้วรีเซ็ตหน้า
              } else {
                setPage(nextPage);
              }
            }}
            // ===== Selection สำหรับ Bulk Unassign =====
            selectable
            selectedIds={selectedEmpCodes}
            onSelectionChange={(next) => setSelectedEmpCodes(next)}
            // ใช้ emp_code เป็น id ของ selection เพื่อส่งให้ revoke ตรง ๆ
            getRowId={(row: any) =>
              row?.emp_code ??
              row?.employeeId ??
              row?.empId ??
              row?.userId ??
              row?.id
            }
            // ปุ่มด้านขวา (รวมกับ Export)
            rightExtra={rightExtra}
          />
        ),
      },
      {
        key: "history",
        label: "History",
        content: <HistoryList history={historyData} />,
      },
    ],
    [
      infoLeft,
      infoRight,
      sortedRows,
      assignmentColsWithActions,
      item.id,
      page,
      pageSize,
      totalRows,
      loadingAssign,
      assignError,
      historyData,
      selectedEmpCodes,
      rightExtra,
      reloadTick, // ⬅️ ให้คีย์ tabs เปลี่ยนเมื่อ reloadTick เปลี่ยน (ช่วยรีเฟรชบาง UI)
    ],
  );

  return (
    <>
      <DetailView
        title={show(item.name)}
        compliance={undefined}
        breadcrumbs={breadcrumbs}
        headerRightExtra={toolbar}
        tabs={tabs}
        defaultTabKey="assignments"
        onBack={handleBack}
        onDelete={handleDelete}
        editConfig={editConfig}
      />

      {/* ====== Modal ยืนยัน Unassign ====== */}
      {unassignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
            <h3 className="mb-2 text-base font-semibold">ยืนยันการยกเลิกสิทธิ์ (Unassign)</h3>
            <p className="mb-4 text-sm text-slate-700">
              จะยกเลิกสิทธิ์ของพนักงานจำนวน <strong>{pendingEmpCodes.length}</strong> รายการ
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="rounded border px-3 py-1 text-sm"
                onClick={closeUnassign}
                disabled={unassigning}
              >
                ยกเลิก
              </button>
              <button
                className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                onClick={confirmUnassign}
                disabled={unassigning}
              >
                {unassigning ? "กำลังยกเลิก..." : "ยืนยัน Unassign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
