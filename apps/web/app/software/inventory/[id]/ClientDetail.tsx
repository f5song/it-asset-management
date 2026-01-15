
'use client';

import React from "react";
import { HistoryEvent, InstallationRow, SoftwareItem } from "../../../../types";
import { DetailView } from "../../../../features/detail-view/DetailView";
import { InstallationSection } from "../../../../features/detail-view/InstallationSection";
import { InstallationDisplayRow } from "../../../../types/tab";

// --- mapper: Software InstallationRow -> InstallationDisplayRow ---

const mapSoftwareInstallationRow = (r: InstallationRow): InstallationDisplayRow => ({
  id: r.id,
  deviceName: r.device ?? "—",
  workStation: "—",
  user: r.user ?? "—",
  licenseKey: "—",
  licenseStatus: "Active", // ✅ ใช้ literal ที่อยู่ใน union
  scannedLicenseKey: "—",
});


export default function ClientDetail({
  item,
  installations,
  users,
  devices,
  history,
  total,
}: {
  item: SoftwareItem;
  installations: InstallationRow[];
  users: string[];
  devices: string[];
  history: HistoryEvent[];
  total: number;
}) {
  const onBack = () => window.history.back();

  const onDelete = () => {
    // TODO: เรียก API/Server Action เพื่อลบ แล้ว redirect
    console.log("Delete", item.id);
  };

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.compliance}
      info={{
        left: [
          { label: "Manufacturer", value: item.manufacturer },
          { label: "Version", value: item.version },
          { label: "License Type", value: item.licenseType ?? item.licenseModel },
          { label: "Policy Compliance", value: item.policyCompliance ?? item.compliance },
        ],
        right: [
          { label: "Category", value: item.category },
          { label: "Expiry Date", value: item.expiryDate ?? "-" },
          { label: "Status", value: item.status },
          { label: "Client/Server", value: item.clientServer },
        ],
      }}
      installationSection={
        <InstallationSection<InstallationRow>
          rows={installations}
          mapRow={mapSoftwareInstallationRow}
          // ส่ง users/devices จาก prop ได้ (หรือจะไม่ส่งก็ได้ ระบบจะ derive จาก rows ให้)
          users={users}
          devices={devices}
          // ถ้ามี total จาก API ให้ส่งมา (ถ้าไม่ส่ง ระบบจะใช้ rows.length)
          total={total}
          // สำคัญ: reset state ของ filter/page เมื่อเปลี่ยน software
          resetKey={`software-${item.id}`}
          // ตั้งค่า page/pageSize เริ่มต้นได้
          initialPage={1}
          pageSize={10}
          // ปุ่มบน Toolbar
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
