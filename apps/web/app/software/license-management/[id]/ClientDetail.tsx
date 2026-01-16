"use client";

import React from "react";
import { DetailView } from "../../../../features/detail-view/DetailView";
import { licenseEditFields } from "../../../../features/license/editFields";
import type {
  HistoryEvent,
  InstallationRow,
  LicenseItem,
} from "../../../../types";
import { InstallationSection } from "../../../../features/detail-view/InstallationSection";
import { InstallationDisplayRow } from "../../../../types/tab";

// ...ส่วน mapping/installationSection เหมือนเดิม

export default function ClientDetail({
  item,
  installations,
  users,
  devices,
  history,
  total,
}: {
  item: LicenseItem;
  installations: any;
  users?: string[];
  devices?: string[];
  history: HistoryEvent[];
  total?: number;
}) {
  const onBack = () => window.history.back();

  // mock submit: เปลี่ยนเป็น call API จริงของพี่
  const onSubmit = async (values: any) => {
    console.log("save license:", values);
    // await api.updateLicense(item.id, values);
  };
  const onDelete = () => {
    // TODO: เรียก API/Server Action เพื่อลบ แล้ว redirect
    console.log("Delete", item.id);
  };

  const mapSoftwareInstallationRow = (
    r: InstallationRow
  ): InstallationDisplayRow => ({
    id: r.id,
    deviceName: r.device ?? "—",
    workStation: "—",
    user: r.user ?? "—",
    licenseKey: "—",
    licenseStatus: "Active", // ✅ ใช้ literal ที่อยู่ใน union
    scannedLicenseKey: "—",
  });

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
          { label: "In Use", value: item.inUse },
          { label: "Available", value: item.available },
          { label: "Expiry Date", value: item.expiryDate ?? "-" },
          { label: "Status", value: item.status },
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
      // ✅ ตรงนี้คือการส่ง config ให้ EditModal
      editConfig={{
        title: "Edit License",
        fields: licenseEditFields,
        initialValues: {
          productName: item.softwareName,
          // licenseKey: item.licenseKey ?? "",
          licenseType: item.licenseType
            ? String(item.licenseType).toLowerCase()
            : "per-user",
          total: item.total,
          inUse: item.inUse,
          expiryDate: item.expiryDate ?? "",
          status: item.status ? String(item.status).toLowerCase() : "active",
          vendor: item.manufacturer ?? "",
          licenseCost: (item as any).cost ?? 0,
          maintenanceCost: (item as any).maintenanceCost ?? 0,
          notes: (item as any).notes ?? "",
        },
        onSubmit, // ฟังก์ชันบันทึก
        submitLabel: "Save", // ป้ายปุ่ม
        cancelLabel: "Cancel",
      }}
    />
  );
}
