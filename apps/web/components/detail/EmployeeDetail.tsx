"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import type { Employees } from "types/employees";
import type { BreadcrumbItem, HistoryEvent } from "types";

import { show } from "lib/show";
import { employeesEditFields } from "app/config/forms/employeeEditFields";

import {
  employeeAssignmentColumns,
  type EmployeeAssignmentRow,
} from "lib/tables/employeeAssignmentColumns";
import {
  demoAssignments,
  demoHistory,
} from "lib/demo/employeeDetailDemoData";

/* -------------------------------------------------------
 *  TYPES
 * ------------------------------------------------------- */
type EmployeeDetailProps = {
  item: Employees;
  history?: HistoryEvent[];
  assignments?: EmployeeAssignmentRow[];
  breadcrumbs?: BreadcrumbItem[];
};

/* -------------------------------------------------------
 *  COMPONENT
 * ------------------------------------------------------- */
export default function EmployeeDetail(props: EmployeeDetailProps) {
  const { item, history, assignments, breadcrumbs } = props;
  const router = useRouter();

  /* -------------------------------------------------------
   *  MEMOIZED DATA
   * ------------------------------------------------------- */
  const rows = React.useMemo<EmployeeAssignmentRow[]>(
    () => (assignments?.length ? assignments : demoAssignments),
    [assignments]
  );

  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history]
  );

  /* -------------------------------------------------------
   *  CALLBACKS
   * ------------------------------------------------------- */
  const handleBack = React.useCallback(() => {
    // ใช้ router.back() ปลอดภัยกว่า window.history.back()
    router.back();
  }, [router]);

  const handleDelete = React.useCallback(() => {
    console.log("Delete employee:", item.id);
    // TODO: call delete service
  }, [item.id]);

  const handleAssign = React.useCallback(() => {
    console.log("Assign license to", item.id);
    // TODO: navigate to assign page or open modal
  }, [item.id]);

  /* -------------------------------------------------------
   *  TOOLBAR
   * ------------------------------------------------------- */
  const toolbar = React.useMemo(
    () => (
      <InventoryActionToolbar
        entity="employees"
        selectedIds={[item.id]}
        basePath="/employees"
        enableDefaultMapping
        visibleActions={["assign"]}     // แสดงเฉพาะ assign
        singleSelectionOnly
        toOverride={{
          assign: `/employees/${item.id}/assign`,
        }}
        onAction={(act) => {
          if (act === "assign") handleAssign();
        }}
      />
    ),
    [item.id, handleAssign]
  );

  /* -------------------------------------------------------
   *  EDIT CONFIG
   * ------------------------------------------------------- */
  const editConfig = React.useMemo(
    () => ({
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
      onSubmit: async (values: any) => {
        console.log("save employee:", values);
        // TODO: call update service, handle optimistic UI if needed
      },
      submitLabel: "Confirm",
      cancelLabel: "Cancel",
    }),
    [item.device, item.department, item.jobTitle, item.name, item.phone, item.status]
  );

  /* -------------------------------------------------------
   *  RENDER
   * ------------------------------------------------------- */
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
      onBack={handleBack}
      onDelete={handleDelete}
      editConfig={editConfig}
      breadcrumbs={breadcrumbs}
      headerRightExtra={toolbar}
    />
  );
}