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
import { getExceptionAssigneesPage } from "@/services/exceptions.service";

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
    () =>
      Array.isArray(history) && history.length ? history : demoExceptionHistory,
    [history],
  );

  /* ------------------------------------------------------------------------
   * Assignments: Server-side pagination (API)
   * ----------------------------------------------------------------------*/
  const [page, setPage] = React.useState<number>(1); // 1-based
  const [pageSize, setPageSize] = React.useState<number>(8);
  const [totalRows, setTotalRows] = React.useState<number>(0);
  const [assignRows, setAssignRows] = React.useState<ExceptionAssignmentRow[]>(
    [],
  );
  const [loadingAssign, setLoadingAssign] = React.useState<boolean>(false);
  const [assignError, setAssignError] = React.useState<string | null>(null);

  // โหลดจาก API เมื่อ exception id / page / pageSize เปลี่ยน
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
          { pageIndex: page, pageSize },
          ac.signal,
        );
        setAssignRows(res.items ?? []);
        setTotalRows(Number(res.totalCount ?? 0));
        console.log("res.items sample:", res.items?.[0]);
        console.table(res.items);
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
  }, [item.id, page, pageSize]);

  // ✅ ถ้าภายนอกส่ง assignments มา (เช่นจาก SSR) ให้ override หน้านั้น
  React.useEffect(() => {
    if (Array.isArray(assignments) && assignments.length) {
      setAssignRows(assignments);
      // ถ้าไม่ได้ส่ง total มาด้วย ก็ใช้ความยาวของแถวเป็นค่าเริ่มต้น
      setTotalRows((t) => (t > 0 ? t : assignments.length));
    }
  }, [assignments]);

  // ✅ เรียง Active -> Resigned; ถ้าไม่มีสถานะ ให้ไปท้าย (เรียงเฉพาะภายใน "หน้านี้")
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

    const getEmpId = (r: any) => r?.employeeId ?? r?.userId ?? r?.empId ?? "";

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
    console.log("Assign exception:", item.id);
    // TODO: route ไปหน้า assign หรือเปิด modal
  }, [item.id]);

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
      // แสดงหมายเลขจริงของ exception
      { label: "Exception ID", value: show(item.exception_id) }, // ใช้ exception_id
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
            columns={exceptionAssignmentColumns}
            resetKey={`exception-${item.id}-${page}-${pageSize}`}
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
      item.id,
      page,
      pageSize,
      totalRows,
      loadingAssign,
      assignError,
      historyData,
    ],
  );

  return (
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
  );
}
