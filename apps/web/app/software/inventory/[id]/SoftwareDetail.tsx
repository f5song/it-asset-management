
"use client";

import * as React from "react";
import { HistoryEvent, InstallationRow, SoftwareItem } from "../../../../types";
import { DetailView } from "../../../../components/detail/DetailView";
import { InstallationSection } from "../../../../components/tabbar/InstallationSection";
import { InstallationDisplayRow } from "../../../../types/tab";
import { softwareEditFields } from "../../../config/forms/softwareEditFields";

// (ตัวอย่าง mapper ถ้าคุณมีค่าที่เป็น Display -> Internal value)
// ปรับ mapping ตามโดเมนจริงของคุณ
const CATEGORY_MAP = { Free: "free", Paid: "paid", "Open Source": "open-source" } as const;
const LICENSE_MODEL_MAP = { Free: "free", Perpetual: "perpetual", Subscription: "subscription", Concurrent: "concurrent" } as const;
const POLICY_MAP = { Allowed: "allowed", Restricted: "restricted", Prohibited: "prohibited" } as const;

// const toFormValue = <T extends string>(
//   v: string | undefined,
//   map: Record<string, T>,
//   fallback: T
// ): T => (v && map[v] ? map[v] : fallback);

export default function SoftwareDetail({
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
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    // TODO: เรียก API/Server Action เพื่อลบ แล้ว redirect
    console.log("Delete", item.id);
  }, [item.id]);

  // ถ้า union ของ licenseStatus เป็น lowercase ให้แก้เป็น "active"
  const mapSoftwareInstallationRow = React.useCallback(
    (r: InstallationRow): InstallationDisplayRow => ({
      id: r.id,
      deviceName: r.device ?? "—",
      workStation: "—",
      user: r.user ?? "—",
      licenseKey: "—",
      licenseStatus: "Active", // ตรวจสอบให้ตรงกับชนิดจริง
      scannedLicenseKey: "—",
    }),
    []
  );

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.policyCompliance}
      info={{
        left: [
          { label: "Manufacturer", value: item.manufacturer ?? "-" },
          { label: "Version", value: item.version ?? "-" },
          { label: "License Type", value: item.licenseModel ?? "-" },
          { label: "Policy Compliance", value: item.policyCompliance ?? "-" },
        ],
        right: [
          { label: "Category", value: item.category ?? "-" },
          { label: "Expiry Date", value: item.expiryDate ?? "-" },
          { label: "Status", value: item.status ?? "-" },
          { label: "Client/Server", value: item.clientServer ?? "-" },
        ],
      }}
      installationSection={
        <InstallationSection<InstallationRow>
          rows={installations}
          mapRow={mapSoftwareInstallationRow}
          users={users}
          devices={devices}
          total={total}
          resetKey={`software-${item.id}`}
          initialPage={1}
          pageSize={10}
          onExport={(fmt) => console.log("Export:", fmt)}   // หรือใช้ handleExport ที่ memo ไว้
          onAction={(act) => console.log("Action:", act)}   // หรือใช้ handleAction ที่ memo ไว้
        />
      }
      history={history}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit Software Detail",
        fields: softwareEditFields,
        initialValues: {
          softwareName: item.softwareName ?? "",
          manufacturer: item.manufacturer ?? "",
          version: item.version ?? "", // เลี่ยงดีฟอลต์ที่ไม่ใช่โดเมน
          // ถ้า item.* เป็น internal value อยู่แล้ว สามารถใช้ตรง ๆ ได้
          // ถ้าเป็น display label ให้ map ด้วย toFormValue
          category: (item.category ?? "free").toString().toLowerCase(),
          licenseModel: (item.licenseModel ?? "free").toString().toLowerCase(),
          policyCompliance: (item.policyCompliance ?? "allowed").toString().toLowerCase(),
          // หรือแบบเข้มขึ้น (ถ้าต้นทางเป็น Display):
          // category: toFormValue(item.category, CATEGORY_MAP as any, "free"),
          // licenseModel: toFormValue(item.licenseModel, LICENSE_MODEL_MAP as any, "free"),
          // policyCompliance: toFormValue(item.policyCompliance, POLICY_MAP as any, "allowed"),
        },
        onSubmit: async (values) => {
          // TODO: call API update software
          console.log("save software:", values);
        },
        submitLabel: "Confirm",
        cancelLabel: "Cancel",
      }}
    />
  );
}
