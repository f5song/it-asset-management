
// app/devices/[id]/ClientDetail.tsx
"use client";

import * as React from "react";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { useDeviceBundledSoftware } from "hooks/useDeviceBundledSoftware";

import type { DeviceItem, HistoryEvent } from "types";
import type { DeviceSoftwareRow } from "services/device-software.service";

const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

// --- Demo rows: ถ้า API ไม่มีข้อมูล จะ fallback มาใช้ชุดนี้ ---
// ✅ ตอนนี้ demoRows สอดคล้องกับ DeviceSoftwareRow (ที่ extend field ใหม่ไว้แล้ว)
const demoRows: DeviceSoftwareRow[] = [
  { id: "sw-1",  softwareName: "Visual Studio Code", manufacturer: "Microsoft",       version: "1.94.2", category: "IDE",         status: "Active", softwareType: "Standard",   policyCompliance: "Compliant",     clientServer: "Client" },
  { id: "sw-2",  softwareName: "Adobe Photoshop",     manufacturer: "Adobe",           version: "2024",   category: "Design",      status: "Active", softwareType: "Special",    policyCompliance: "Compliant",     clientServer: "Client" },
  { id: "sw-3",  softwareName: "Figma",               manufacturer: "Figma Inc",       version: "latest", category: "Design",      status: "Active", softwareType: "Special",       policyCompliance: "Compliant",     clientServer: "Client" },
  { id: "sw-4",  softwareName: "Node.js",             manufacturer: "OpenJS Foundation", version: "20.3.0", category: "Runtime",   status: "Active", softwareType: "Standard",   policyCompliance: "Compliant",     clientServer: "Server" },
  { id: "sw-5",  softwareName: "Docker Desktop",      manufacturer: "Docker Inc",      version: "4.28",   category: "DevOps",      status: "Active", softwareType: "Standard",   policyCompliance: "Non-Compliant", clientServer: "Client" },
  { id: "sw-6",  softwareName: "Zotero",              manufacturer: "Zotero",          version: "6.0.35", category: "Productivity",status: "Active", softwareType: "Standard",       policyCompliance: "Compliant",     clientServer: "Client" },
  { id: "sw-7",  softwareName: "Slack",               manufacturer: "Slack",           version: "v12.1",  category: "Communication", status: "Active", softwareType: "Special",    policyCompliance: "Compliant",     clientServer: "Client" },
  { id: "sw-8",  softwareName: "MongoDB",             manufacturer: "MongoDB Inc",     version: "7.0",    category: "Database",    status: "Active", softwareType: "Standard",   policyCompliance: "Non-Compliant", clientServer: "Server" },
  { id: "sw-9",  softwareName: "Postman",             manufacturer: "Postman Inc",     version: "10.21",  category: "API Tools",   status: "Active", softwareType: "Standard",   policyCompliance: "Non-Compliant", clientServer: "Client" },
  { id: "sw-10", softwareName: "GitHub Desktop",      manufacturer: "GitHub",          version: "3.3.4",  category: "Dev Tools",   status: "Active", softwareType: "Standard",   policyCompliance: "Non-Compliant", clientServer: "Client" },
];

export default function DeviceDetail({
  item,
  history,
}: {
  item: DeviceItem;
  history: HistoryEvent[];
  total: number;
}) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete device:", item.id);
  }, [item.id]);

  // โหลดซอฟต์แวร์สำหรับอุปกรณ์
  const { rows: softwareRows } = useDeviceBundledSoftware(item.id, {
    pageIndex: 0,
    pageSize: 1000,
    sortBy: "softwareName",
    sortOrder: "asc",
    search: "",
  });

  // ถ้า API ไม่มีข้อมูล → ใช้ demo 10 rows
  const rows = React.useMemo<DeviceSoftwareRow[]>(
    () => (softwareRows?.length ? softwareRows : demoRows),
    [softwareRows]
  );

  // columns ของ Device tab (type-safe ตรงกับ DeviceSoftwareRow)
  const columns = React.useMemo(
    () => [
      { header: "Software",      accessor: (r: DeviceSoftwareRow) => r.softwareName },
      { header: "Manufacturer",  accessor: (r: DeviceSoftwareRow) => r.manufacturer },
      { header: "Version",       accessor: (r: DeviceSoftwareRow) => r.version },
      { header: "Category",      accessor: (r: DeviceSoftwareRow) => r.category },
      { header: "Status",        accessor: (r: DeviceSoftwareRow) => r.status ?? "Active" }, // เผื่อฟิลด์ว่าง
    ],
    []
  );

  return (
    <DetailView
      title={show(item.name)}
      compliance={item.compliance}
      installationTabLabel="Bundled Software"  // ⭐ เปลี่ยนชื่อ tab ได้
      info={{
        left: [
          { label: "Device Name", value: show(item.name) },
          { label: "Type", value: show(item.type) },
          { label: "Assigned To", value: show(item.assignedTo) },
          { label: "OS", value: show(item.os) },
        ],
        right: [
          { label: "Compliance", value: show(item.compliance) },
          { label: "Last Scan", value: show(item.lastScan) },
        ],
      }}
      installationSection={
        <InstallationSection<DeviceSoftwareRow>
          rows={rows}
          columns={columns}
          resetKey={`device-${item.id}`}
          initialPage={1}
          pageSize={10}
        />
      }
      history={history}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit Device Detail",
        fields: [
          { name: "name", label: "Device Name", type: "text", required: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: ["Laptop", "Desktop", "Server", "Mobile", "Tablet"].map(
              (v) => ({ label: v, value: v.toLowerCase() })
            ),
          },
          { name: "assignedTo", label: "Assigned To", type: "text" },
          {
            name: "os",
            label: "Operating System",
            type: "select",
            options: ["Windows", "macOS", "Linux", "iOS", "Android"].map(
              (v) => ({ label: v, value: v.toLowerCase() })
            ),
          },
          {
            name: "compliance",
            label: "Compliance",
            type: "select",
            options: ["Compliant", "Non-Compliant", "Unknown"].map((v) => ({
              label: v,
              value: v.toLowerCase(),
            })),
          },
          { name: "lastScan", label: "Last Scan", type: "date" },
        ],
        initialValues: {
          name: item.name ?? "",
          type: (item.type ?? "laptop").toString().toLowerCase(),
          assignedTo: item.assignedTo ?? "",
          os: (item.os ?? "windows").toString().toLowerCase(),
          compliance: (item.compliance ?? "unknown").toString().toLowerCase(),
          lastScan: item.lastScan ?? "",
        },
        onSubmit: async (values) => {
          console.log("save device:", values);
        },
        submitLabel: "Confirm",
        cancelLabel: "Cancel",
      }}
    />
  );
}
