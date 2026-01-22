// app/employees/[id]/EmployeeDetail.tsx
"use client";

import * as React from "react";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";

// ปรับ path ให้ตรงกับโปรเจกต์ของคุณ
import type { Employees } from "types/employees";
import type { BreadcrumbItem, HistoryEvent, InstallationRow } from "types";

// (แบบเดียวกับหน้าอื่น) columns แบบสั้น: header + accessor
type SimpleColumn<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

// ฟังก์ชันแสดงค่าแบบมี fallback “—”
const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

/** ---------------- DEMO: Assignments (ใช้เมื่อ API ว่าง) ---------------- **/
const demoAssignments: InstallationRow[] = [
  // ปรับ field ให้ตรง schema ในโปรเจกต์ของคุณ
  { id: "a-1", device: "NB-201", user: "alice" } as any,
  { id: "a-2", device: "PC-304", user: "alice" } as any,
  { id: "a-3", device: "SRV-09", user: "alice" } as any,
];

/** ---------------- DEMO: History (ใช้เมื่อ API ว่าง) ---------------- **/
const demoHistory: HistoryEvent[] = [
  {
    id: "eh1",
    timestamp: new Date().toISOString(),
    actor: "system",
    action: "sync",
    detail: "Employee profile synced",
  } as any,
  {
    id: "eh2",
    timestamp: new Date().toISOString(),
    actor: "admin",
    action: "update",
    detail: "Department changed to Engineering",
  } as any,
];

export default function EmployeeDetail({
  item,
  history,
  assignments,
  breadcrumbs,
}: {
  item: Employees;
  history: HistoryEvent[];
  assignments?: InstallationRow[];
  breadcrumbs?: BreadcrumbItem[];
}) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete employee:", item.id);
  }, [item.id]);

  // คอลัมน์ฝั่งแท็บ Assignments (ปรับ accessor ให้ตรงกับฟิลด์จริง)
  const columns = React.useMemo<SimpleColumn<InstallationRow>[]>(() => {
    return [
      { header: "Device", accessor: (r) => show((r as any).device) },
      { header: "User", accessor: (r) => show((r as any).user ?? item.name) },
      // ถ้าคุณมีฟิลด์จริงใน InstallationRow ให้เปลี่ยน “—”/“Active” เป็นค่าจริงได้
      { header: "License Status", accessor: (_r) => "Active" },
      { header: "License Key", accessor: (_r) => "—" },
      { header: "Scanned License", accessor: (_r) => "—" },
      { header: "Workstation", accessor: (_r) => "—" },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.name]);

  // ใช้ demo ถ้าไม่มี assignments จาก API
  const rows = React.useMemo<InstallationRow[]>(
    () => (assignments?.length ? assignments : demoAssignments),
    [assignments],
  );

  // ใช้ demo history ถ้า history ว่าง → เพื่อให้แสดง Tab bar แน่นอน (เหมือนหน้าอื่น)
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  return (
    <DetailView
      title={show(item.name)}
      // ถ้า Employees ไม่มี compliance ให้ใส่ undefined
      compliance={undefined}
      // ให้ชื่อแท็บเหมือนกับโดเมนพนักงาน
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
        <InstallationSection<InstallationRow>
          rows={rows}
          columns={columns}
          resetKey={`employee-${item.id}`}
          initialPage={1}
          pageSize={10}
        />
      }
      history={historyData}
      onBack={onBack}
      onDelete={onDelete}
      // ถ้าต้องการแก้ไขข้อมูลพนักงาน ใส่ editConfig ได้ตามรูปแบบเดียวกับหน้าอื่น
      editConfig={{
        title: "Edit Employee",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "department", label: "Department", type: "text" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Active", "Inactive", "Contractor", "Intern"].map(
              (v) => ({ label: v, value: v }),
            ),
          },
        ],
        initialValues: {
          name: item.name ?? "",
          department: item.department ?? "",
          status: item.status ?? "Active",
        },
        onSubmit: async (values) => {
          console.log("save employee:", values);
        },
        submitLabel: "Confirm",
        cancelLabel: "Cancel",
      }}
      breadcrumbs={breadcrumbs}
    />
  );
}
