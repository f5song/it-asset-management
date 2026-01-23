
// app/employees/[id]/LicenseDetail.tsx  <-- ปรับ path ตรงกับไฟล์จริงของคุณ
"use client";

import * as React from "react";
import { licenseEditFields } from "app/config/forms/licenseEditFields";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { ActionToolbar } from "components/toolbar/ActionToolbar";

import type {
  ActionPathConfig,
  BreadcrumbItem,
  HistoryEvent,
  LicenseInstallationRow,
  LicenseItem,
  ToolbarAction,
 // ✅ ต้องมี export จาก barrel "types" (หรือเปลี่ยนเป็น "types/actions")
} from "types";

/** แถวข้อมูลสำหรับแท็บ Installations ของหน้า License (self-contained) */

// คอลัมน์แบบสั้น: header + accessor
type SimpleColumn<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

// ฟังก์ชันแสดงค่าแบบมี fallback “—”
const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

/** ---------------- DEMO: Installations (ใช้เมื่อ API ว่าง) ---------------- **/
const demoInstallations: LicenseInstallationRow[] = [
  { id: "lic-ins-1", deviceName: "NB-201", userName: "mike",   licenseStatus: "Active" },
  { id: "lic-ins-2", deviceName: "PC-304", userName: "nina",   licenseStatus: "Active" },
  { id: "lic-ins-3", deviceName: "SRV-09", userName: "system", licenseStatus: "Active" },
];

/** ---------------- DEMO: History (ใช้เมื่อ API ว่าง) ---------------- **/
const demoHistory: HistoryEvent[] = [
  {
    id: "lh1",
    timestamp: new Date().toISOString(),
    actor: "system",
    action: "sync",
    detail: "License sync finished",
  },
  {
    id: "lh2",
    timestamp: new Date().toISOString(),
    actor: "admin",
    action: "update",
    detail: "Adjusted license seats",
  },
];

export default function LicenseDetail({
  item,
  installations,
  history,
  breadcrumb,
}: {
  item: LicenseItem;
  installations: LicenseInstallationRow[];
  history: HistoryEvent[];
  breadcrumb: BreadcrumbItem[];
}) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete", item.id);
  }, [item.id]);

  // คอลัมน์ในแท็บ Installations (ไม่มี any/แคสแล้ว)
  const columns = React.useMemo<SimpleColumn<LicenseInstallationRow>[]>(() => {
    return [
      { header: "Device", accessor: (r) => show(r.deviceName) },
      { header: "User", accessor: (r) => show(r.userName) },
      { header: "License Status", accessor: (r) => show(r.licenseStatus ?? "Active") },
      { header: "License Key", accessor: (r) => show(r.licenseKey) },
      { header: "Scanned License", accessor: (r) => show(r.scannedLicenseKey) },
      { header: "Workstation", accessor: (r) => show(r.workStation) },
    ];
  }, []);

  // ✅ ใช้ demo ถ้า API ว่าง
  const rows = React.useMemo<LicenseInstallationRow[]>(
    () => (installations?.length ? installations : demoInstallations),
    [installations],
  );

  // ✅ ใช้ demo history ถ้า API ว่าง
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  // ค่าตั้งต้นของฟอร์มแก้ไข (ให้สอดคล้อง type ใหม่ของ LicenseItem)
  const initialFormValues = React.useMemo(
    () => ({
      productName: item.softwareName ?? "",
      licenseModel: item.licenseModel ?? "Per-User",
      total: item.total ?? 0,
      inUse: item.inUse ?? 0,
      expiryDate: item.expiryDate ?? "",
      status: item.status ?? "Active",
      vendor: item.manufacturer ?? "",
      licenseCost: (item as any).cost ?? 0,
      maintenanceCost: (item as any).maintenanceCost ?? 0,
      notes: (item as any).notes ?? "",
    }),
    [item],
  );

  // เส้นทางไปหน้า Assign ของ License นี้
  const toolbarTo: Partial<Record<ToolbarAction, ActionPathConfig>> = {
    assign: `/software/license-management/${item.id}/assign`,
  };

  const headerRightExtra = (
    <ActionToolbar
      selectedIds={[]} // หน้านี้ไม่มี selection ก็ปล่อย [] ได้
      to={toolbarTo}
      onAction={(act) => console.log("toolbar action:", act)}
      openInNewTab={false}
      enableDefaultMapping={false}
    />
  );

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.compliance}
      installationTabLabel="Installations"
      info={{
        left: [
          { label: "Manufacturer", value: show(item.manufacturer) },
          { label: "License Type", value: show(item.licenseModel) },
          { label: "Policy Compliance", value: show(item.compliance) },
        ],
        right: [
          { label: "Total", value: show(item.total) },
          { label: "In Use", value: show(item.inUse) },
          { label: "Available", value: show(item.available) },
          { label: "Expiry Date", value: show(item.expiryDate) },
          { label: "Status", value: show(item.status) },
        ],
      }}
      installationSection={
        <InstallationSection<LicenseInstallationRow>
          rows={rows}
          columns={columns}
          resetKey={`license-${item.id}`}
          initialPage={1}
          pageSize={8}
        />
      }
      history={historyData}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit License",
        fields: licenseEditFields,
        initialValues: initialFormValues,
        onSubmit: async (values) => {
          console.log("save license:", values);
        },
        submitLabel: "Save",
        cancelLabel: "Cancel",
      }}
      breadcrumbs={breadcrumb}
      headerRightExtra={headerRightExtra}
    />
  );
}
