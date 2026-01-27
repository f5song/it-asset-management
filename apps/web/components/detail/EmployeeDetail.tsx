"use client";
import * as React from "react";

import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import type { Employees } from "types/employees";
import type { BreadcrumbItem, HistoryEvent } from "types";

import { show } from "lib/show";
import { employeesEditFields } from "app/config/forms/employeeEditFields";

import {
  employeeAssignmentColumns,
  EmployeeAssignmentRow,
} from "lib/tables/employeeAssignmentColumns";
import { demoAssignments, demoHistory } from "lib/demo/employeeDetailDemoData";

export default function EmployeeDetail({
  item,
  history,
  assignments,
  breadcrumbs,
}: {
  item: Employees;
  history: HistoryEvent[];
  assignments?: EmployeeAssignmentRow[];
  breadcrumbs?: BreadcrumbItem[];
}) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete employee:", item.id);
  }, [item.id]);

  const rows = assignments?.length ? assignments : demoAssignments;
  const historyData = history?.length ? history : demoHistory;

  const toolbar = (
    <InventoryActionToolbar
      entity="employees"
      selectedIds={[item.id]}
      basePath="/employees"
      enableDefaultMapping
      visibleActions={["assign"]} // ✅ ขอแสดงเฉพาะ assign
      singleSelectionOnly
      toOverride={{
        assign: `/employees/${item.id}/assign`, // ✅ path ชัดเจน
      }}
      onAction={(act) => {
        if (act === "assign") console.log("Assign license to", item.id);
      }}
    />
  );

  return (
    <DetailView
      title={show(item.name)}
      compliance={undefined}
      installationTabLabel="Assignments"
      info={{
        left: [
          { label: "Employee ID", value: show(item.id) },
          { label: "Email", value: show(item.email) },
          { label: "Department", value: show(item.department) },
        ],
        right: [
          { label: "Status", value: show(item.status) },
          { label: "Job Title", value: show(item.jobTitle) },
          { label: "Phone", value: show(item.phone) },
        ],
      }}
      installationSection={
        <InstallationSection<EmployeeAssignmentRow>
          rows={rows}
          columns={employeeAssignmentColumns}
          resetKey={`employee-${item.id}`}
          initialPage={1}
          pageSize={8}
        />
      }
      history={historyData}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit Employee",
        fields: employeesEditFields,
        initialValues: {
          name: item.name ?? "",
          department: item.department ?? "",
          status: item.status ?? "Active",
          phone: item.phone ?? "",
          jobTitle: item.jobTitle ?? "",
          device: item.device ?? "",
        },
        onSubmit: async (values) => {
          console.log("save employee:", values);
        },
        submitLabel: "Confirm",
        cancelLabel: "Cancel",
      }}
      breadcrumbs={breadcrumbs}
      headerRightExtra={toolbar}
    />
  );
}
