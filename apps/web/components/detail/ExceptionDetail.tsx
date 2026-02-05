// components/detail/ExceptionsDetail.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView, EditConfig } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import type { BreadcrumbItem, HistoryEvent } from "types";
import type {
  ExceptionDefinition,
  ExceptionAssignmentRow,
  ExceptionEditValues,
} from "types/exception";

import { show } from "lib/show";
import { exceptionAssignmentColumns } from "lib/tables/exceptionAssignmentColumns";
import {
  demoExceptionAssignments,
  demoExceptionHistory,
} from "lib/demo/exceptionDetailDemoData";
import { exceptionEditFields } from "app/config/forms/exceptionEditFields";
import { formatDateSafe } from "@/lib/date";
import { toLocalInput } from "@/lib/date-input";


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
      Array.isArray(history) && history.length ? history : demoExceptionHistory,
    [history],
  );

  const rows = React.useMemo<ExceptionAssignmentRow[]>(
    () =>
      Array.isArray(assignments) && assignments.length
        ? assignments
        : demoExceptionAssignments,
    [assignments],
  );

  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = React.useCallback(() => {
    console.log("Delete exception:", item.id);
  }, [item.id]);

  const toolbar = React.useMemo(
    () => (
      <InventoryActionToolbar
        entity="exceptions"
        selectedIds={[item.id]}
        basePath="/exceptions"
        enableDefaultMapping
        visibleActions={["assign"]}
        singleSelectionOnly
        toOverride={{
          assign: `/exceptions/${item.id}/assign`,
        }}
        onAction={(act) => {
          if (act === "delete") handleDelete();
        }}
      />
    ),
    [item.id, handleDelete],
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
        notes: item.notes ?? "",
      },
      onSubmit: async (values) => {
        // const toISO = (local?: string | null) => (local ? new Date(local).toISOString() : null);
        // const payload = {
        //   ...values,
        //   createdAt: toISO(values.createdAt)!,
        //   lastUpdated: toISO(values.lastUpdated ?? undefined),
        //   reviewAt: toISO(values.reviewAt ?? undefined),
        // };
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

      item.notes,
    ],
  );

  return (
    <DetailView
      title={show(item.name)}
      compliance={undefined}
      installationTabLabel="Assignments"
      info={{ left: infoLeft, right: infoRight }}
      installationSection={
        <InstallationSection<ExceptionAssignmentRow>
          rows={rows}
          columns={exceptionAssignmentColumns}
          resetKey={`exception-${item.id}`}
          initialPage={1}
          pageSize={8}
        />
      }
      history={historyData}
      onBack={handleBack}
      onDelete={handleDelete}
      editConfig={editConfig}
      breadcrumbs={breadcrumbs}
      headerRightExtra={toolbar}
    />
  );
}
