
'use client';

import React from "react";
import {
  AssigenedRow, // (สะกดตามในโปรเจกต์)
  HistoryEvent,
  LicenseItem,
} from "../../../../types";
import { DetailView } from "../../../../features/detail-view/DetailView";
import { InstallationSection } from "../../../../features/detail-view/InstallationSection";
import { InstallationDisplayRow } from "../../../../types/tab";

// ⚙️ mapper: AssigenedRow -> InstallationDisplayRow (แบบปลอดภัย)
const mapLicenseAssignedRow = (r: AssigenedRow): InstallationDisplayRow => ({
  id: String((r as any).id ?? (r as any).assignmentId ?? crypto.randomUUID()),
  deviceName: (r as any).deviceName ?? (r as any).device ?? "—",
  workStation:
    (r as any).workStation ??
    (r as any).workstation ??
    (r as any).ws ??
    "—",
  user: (r as any).assignedTo ?? (r as any).user ?? "—",
  licenseKey: (r as any).licenseKey ?? (r as any).key ?? "—",
  licenseStatus: ((r as any).status ?? "Active") as InstallationDisplayRow["licenseStatus"],
  scannedLicenseKey:
    (r as any).scannedLicenseKey ?? (r as any).scanned ?? "—",
});

export default function ClientDetail({
  item,
  installations,
  users,      // ✅ optional
  devices,   // ✅ optional
  history,
  total,     // ✅ optional ถ้าไม่ส่ง จะ derive จาก rows
}: {
  item: LicenseItem;
  installations: AssigenedRow[] | AssigenedRow[][];
  users?: string[];
  devices?: string[];
  history: HistoryEvent[];
  total?: number;
}) {
  const onBack = () => window.history.back();

  const onDelete = () => {
    // TODO: เรียก API/Server Action เพื่อลบ แล้ว redirect
    console.log("Delete", item.id);
  };

  // ⚙️ flatten array ซ้อน -> 1 มิติ
  const flatInstallations: AssigenedRow[] = React.useMemo(
    () => (Array.isArray(installations) ? (installations as any).flat() : []),
    [installations]
  );

  // ถ้าไม่ส่ง total -> ใช้จำนวน rows
  const resolvedTotal = typeof total === "number" ? total : flatInstallations.length;

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.compliance}
      info={{
        left: [
          { label: "Manufacturer", value: item.manufacturer },
          { label: "License Type", value: item.licenseType },
          { label: "Policy Compliance", value: item.compliance },
        ],
        right: [
          { label: "Total", value: item.total },
          { label: "inUse", value: item.inUse },
          { label: "available", value: item.available },
          { label: "Expiry Date", value: item.expiryDate ?? "-" },
          { label: "Status", value: item.status },
        ],
      }}
      installationSection={
        <InstallationSection<AssigenedRow>
          rows={flatInstallations}
          mapRow={mapLicenseAssignedRow}
          // ถ้าอยากให้ระบบ derive users/devices จาก rows อัตโนมัติ ให้คอมเมนต์ 2 บรรทัดข้างล่างทิ้งได้
          users={users}
          devices={devices}
          total={resolvedTotal} // ให้ตรงกับ "กล่อง summary" ด้านบน
          resetKey={`license-${item.id}`}
          initialPage={1}
          pageSize={10}
          onExport={(fmt) => console.log("Export:", fmt)}
          onAction={(act) => console.log("Action:", act)}
        />
      }
      history={history}
      onBack={onBack}
      onDelete={onDelete}
    />
  );
}
