// components/detail/ExceptionsDetail.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView, EditConfig } from "@/components/detail/DetailView";
import { InstallationSection } from "@/components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "@/components/toolbar/InventoryActionToolbar";

import type { BreadcrumbItem, HistoryEvent } from "@/types";
import type {
  ExceptionDefinition,
  ExceptionAssignmentRow,
  ExceptionEditValues,
} from "@/types/exception";

import { show } from "@/lib/show";
import { exceptionAssignmentColumns } from "@/lib/tables/exceptionAssignmentColumns";
import {
  demoExceptionAssignments,
  demoExceptionHistory,
} from "@/lib/demo/exceptionDetailDemoData";
import { formatDateSafe } from "@/lib/date";
import { toLocalInput } from "@/lib/date-input";
import { exceptionEditFields } from "@/config/forms/exceptionEditFields";
import { DetailInfoGrid } from "@/components/detail/DetailInfo";
import { HistoryList } from "@/components/detail/HistoryList";

type ExceptionsDetailProps = {
  item: ExceptionDefinition;
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
      Array.isArray(history) && history.length
        ? history
        : demoExceptionHistory,
    [history],
  );

  // ข้อมูลดิบ
  const rawRows = React.useMemo<ExceptionAssignmentRow[]>(
    () =>
      Array.isArray(assignments) && assignments.length
        ? assignments
        : demoExceptionAssignments,
    [assignments],
  );

  // ✅ เรียง Active -> Resigned; ถ้าไม่มีสถานะ ให้ไปท้าย
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

    return [...rawRows].sort((a: any, b: any) => {
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
  }, [rawRows]);

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
      { label: "Exception ID", value: show(item.id) },
      { label: "Name", value: show(item.name) },
      { label: "Risk", value: show(item.risk) },
    ],
    [item.id, item.name, item.risk],
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
            resetKey={`exception-${item.id}`}
            initialPage={1}
            pageSize={8}
          />
        ),
      },
      {
        key: "history",
        label: "History",
        content: <HistoryList history={historyData} />,
      },
    ],
    [infoLeft, infoRight, sortedRows, item.id, historyData],
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