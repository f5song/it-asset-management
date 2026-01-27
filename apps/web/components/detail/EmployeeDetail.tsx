
"use client";

import * as React from "react";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";

// ปรับ path ให้ตรงกับโปรเจกต์ของคุณ
import type { Employees } from "types/employees";
import type { BreadcrumbItem, HistoryEvent } from "types";
import { employeesEditFields } from "app/config/forms/employeeEditFields";

/** ตาราง Assignments ในหน้า Employee (self-contained) */
type EmployeeAssignmentRow = {
  id: string;
  deviceName: string;          // ชื่อเครื่อง เช่น "NB-201"
  userName: string;            // ชื่อผู้ใช้ (โชว์ชื่อพนักงานหรือ user ที่ติดตั้ง)
  licenseStatus?: "Active" | "Pending" | "Expired";
  licenseKey?: string | null;
  scannedLicenseKey?: string | null;
  workStation?: string | null; // ถ้ามีฟิลด์สถานีทำงาน
};

// (แบบเดียวกับหน้าอื่น) columns แบบสั้น: header + accessor
type SimpleColumn<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

// ฟังก์ชันแสดงค่าแบบมี fallback “—”
const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

/** ---------------- DEMO: Assignments (ใช้เมื่อ API ว่าง) ---------------- **/
const demoAssignments: EmployeeAssignmentRow[] = [
  { id: "a-1", deviceName: "NB-201", userName: "alice", licenseStatus: "Active" },
  { id: "a-2", deviceName: "PC-304", userName: "alice", licenseStatus: "Active" },
  { id: "a-3", deviceName: "SRV-09", userName: "alice", licenseStatus: "Active" },
];

/** ---------------- DEMO: History (ใช้เมื่อ API ว่าง) ---------------- **/
const demoHistory: HistoryEvent[] = [
  {
    id: "eh1",
    timestamp: new Date().toISOString(),
    actor: "system",
    action: "sync",
    detail: "Employee profile synced",
  },
  {
    id: "eh2",
    timestamp: new Date().toISOString(),
    actor: "admin",
    action: "update",
    detail: "Department changed to Engineering",
  },
];

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

  // คอลัมน์ในแท็บ Assignments
  const columns = React.useMemo<SimpleColumn<EmployeeAssignmentRow>[]>(() => {
    return [
      { header: "Device", accessor: (r) => show(r.deviceName) },
      { header: "User", accessor: (r) => show(r.userName || item.name) },
      { header: "License Status", accessor: (r) => show(r.licenseStatus ?? "Active") },
      { header: "License Key", accessor: (r) => show(r.licenseKey) },
      { header: "Scanned License", accessor: (r) => show(r.scannedLicenseKey) },
      { header: "Workstation", accessor: (r) => show(r.workStation) },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.name]);

  // ใช้ assignments ที่ได้จาก props; ถ้าไม่มี ใช้ demo
  const rows = React.useMemo<EmployeeAssignmentRow[]>(
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
        <InstallationSection<EmployeeAssignmentRow>
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
    />
  );
}
