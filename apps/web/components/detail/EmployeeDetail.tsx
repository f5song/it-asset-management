"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import type {
  BreadcrumbItem,
  EmployeeAssignmentRow,
  EmployeeItem,
  HistoryEvent,
} from "types";

import { show } from "lib/show";
import {
  demoAssignments,
  demoHistory,
} from "@/lib/demo/employeeDetailDemoData";
import { employeeAssignmentColumns } from "@/lib/tables/employeeAssignmentColumns";
import { employeesEditFields } from "@/config/forms/employeeEditFields";
import { fullName } from "@/lib/name";

/* -------------------------------------------------------
 *  TYPES
 * ------------------------------------------------------- */
type EmployeeDetailProps = {
  item: EmployeeItem;
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
    [assignments],
  );

  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
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
        visibleActions={["Assign Exceptions"]} // แสดงเฉพาะ assign
        singleSelectionOnly
        toOverride={{
          "Assign Exceptions": `/employees/${item.id}/exceptions/assign`,
        }}
        onAction={(act) => {
          if (act === "Assign Exceptions") handleAssign();
        }}
      />
    ),
    [item.id, handleAssign],
  );

  /* -------------------------------------------------------
   *  EDIT CONFIG
   * ------------------------------------------------------- */
  const editConfig = React.useMemo(
    () => ({
      title: "Edit Employee",
      fields: employeesEditFields,
      initialValues: {
        firstNameTh: item.firstNameTh ?? "",
        lastNameTh: item.lastNameTh ?? "",
        department: item.department ?? "",
        status: item.status ?? "Active",
        phone: item.phone ?? "",
        position: item.position ?? "",
        device: item.device ?? "",
        empType: item.empType ?? "", // Employee Type
        company: item.company ?? "",
        section: item.section ?? "",
        unit: item.unit ?? "",
      },
      onSubmit: async (values: any) => {
        console.log("save employee:", values);
        // TODO: call update service, handle optimistic UI if needed
      },
      submitLabel: "Confirm",
      cancelLabel: "Cancel",
    }),
    [
      item.device,
      item.department,
      item.position,
      item.firstNameTh,
      item.lastNameTh,
      item.phone,
      item.status,
    ],
  );

  /* -------------------------------------------------------
   *  RENDER
   * ------------------------------------------------------- */
  return (
    <DetailView
      title={show(`${item.firstNameTh} ${item.lastNameTh}`)}
      compliance={undefined}
      installationTabLabel="Assignments"
      info={{
        left: [
          { label: "Employee ID", value: show(item.id) },
          // ===== เฉพาะภาษาไทย =====
          // { label: "ชื่อ (ไทย)", value: show(item.firstNameTh) },
          // { label: "นามสกุล (ไทย)", value: show(item.lastNameTh) },

          // ===== เฉพาะภาษาอังกฤษ =====
          { label: "Name", value: fullName(item) },

          { label: "Email", value: show(item.email) },
          { label: "Employee Type", value: show(item.empType) },
          { label: "Phone", value: show(item.phone) },
        ],
        right: [
          { label: "Company", value: show(item.company) },
          { label: "Department", value: show(item.department) },
          { label: "Section", value: show(item.section) },
          { label: "Unit", value: show(item.unit) },
          { label: "Status", value: show(item.status) },
          { label: "Position", value: show(item.position || item.position) },
          { label: "Device", value: show(item.device) },
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
