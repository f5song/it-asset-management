'use client';

import React from "react";
import { HistoryEvent, InstallationRow, SoftwareItem } from "../../../types";
import { DetailView } from "../../../features/detail-view/DetailView";
import { InstallationSection } from "../../../features/detail-view/InstallationSection";


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
  // ✅ ทำ event handlers ใน client
  const onBack = () => window.history.back();
  const onEdit = () => {
    // TODO: เปิดหน้าแก้ไข หรือ modal
    console.log("Edit", item.id);
  };
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
        <InstallationSection rows={installations} users={users} devices={devices} total={total} />
      }
      history={history}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
