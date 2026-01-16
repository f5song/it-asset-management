
"use client";

import React from "react";
import { DetailView } from "../../../../features/detail-view/DetailView";
import { licenseEditFields } from "../../../../features/license/editFields";
import type { HistoryEvent, LicenseItem } from "../../../../types";

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
        // ...InstallationSection ของพี่ตามเดิม
        <div />
      }
      history={history}
      onBack={onBack}
      onDelete={() => console.log("delete", item.id)}

      // ✅ ตรงนี้คือการส่ง config ให้ EditModal
      editConfig={{
        title: "Edit License",
        fields: licenseEditFields,
        initialValues: {
          productName: item.softwareName,
          // licenseKey: item.licenseKey ?? "",
          licenseType: item.licenseType ? String(item.licenseType).toLowerCase() : "per-user",
          total: item.total,
          inUse: item.inUse,
          expiryDate: item.expiryDate ?? "",
          status: item.status ? String(item.status).toLowerCase() : "active",
          vendor: item.manufacturer ?? "",
          licenseCost: (item as any).cost ?? 0,
          maintenanceCost: (item as any).maintenanceCost ?? 0,
          notes: (item as any).notes ?? "",
        },
        onSubmit,                 // ฟังก์ชันบันทึก
        submitLabel: "Save",      // ป้ายปุ่ม
        cancelLabel: "Cancel",
      }}
    />
  );
}
