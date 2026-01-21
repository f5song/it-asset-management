
"use client";

import * as React from "react";
import { licenseEditFields } from "app/config/forms/licenseEditFields";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import type { HistoryEvent, InstallationRow, LicenseItem } from "types";
import type { InstallationDisplayRow } from "types/tab";

// --- (ตัวอย่าง) Mapping Display -> Internal form values (ปรับให้ตรงโดเมนจริงของโปรเจกต์) ---
/**
 * ถ้าในระบบคุณ item.* เป็น internal อยู่แล้ว (เช่น "per-user", "active") ให้ตัด MAP พวกนี้ทิ้งได้
 *และใช้ค่าเดิมตรง ๆ
 */
const LICENSE_MODEL_MAP: Record<string, string> = {
  "Per User": "Per-User",
  "Per Device": "Per-Device",
  "Perpetual": "Perpetual",
  "Subscription": "Subscription",
  "Concurrent": "Concurrent",
};

const STATUS_MAP: Record<string, string> = {
  Active: "Active",
  Inactive: "Inactive",
  Expired: "Expired",
};

const toFormValue = <T extends string>(
  v: string | undefined,
  map: Record<string, T>,
  fallback: T
): T => (v && map[v] ? map[v] : fallback);

// --- แปลง "" ให้เป็น dash สำหรับแสดงผล ---
const show = (v: unknown) => (v === undefined || v === null || v === "" ? "-" : String(v));

// --- Mapper: InstallationRow -> InstallationDisplayRow ---
const useInstallationRowMapper = () => {
  // NOTE: ถ้า union ของ licenseStatus เป็น lowercase ให้แก้เป็น "active" ไม่ใช่ "Active"
  return React.useCallback(
    (r: InstallationRow): InstallationDisplayRow => ({
      id: r.id,
      deviceName: r.device ?? "—",
      workStation: "—",
      user: r.user ?? "—",
      licenseKey: "—",
      licenseStatus: "Active", // ✅ ให้ตรงกับ union ภายในของระบบ
      scannedLicenseKey: "—",
    }),
    []
  );
};

export default function ClientDetail({
  item,
  installations,
  users,
  devices,
  history,
  total,
}: {
  item: LicenseItem;
  installations: InstallationRow[];   // ❌ เดิมเป็น any -> ✅ ใส่ชนิดจริง
  users?: string[];
  devices?: string[];
  history: HistoryEvent[];
  total?: number;
}) {
  // ✅ memoized handlers ลด re-render
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    // TODO: เรียก API/Server Action เพื่อลบ แล้ว redirect
    console.log("Delete", item.id);
  }, [item.id]);

  const onSubmit = React.useCallback(async (values: unknown) => {
    console.log("save license:", values);
    // await api.updateLicense(item.id, values);
  }, [item.id]);

  const mapSoftwareInstallationRow = useInstallationRowMapper();

  // ✅ initial values แบบ type-safe และมี mapping display -> internal
  const initialFormValues = React.useMemo(
    () => ({
      productName: item.softwareName ?? "",
      // licenseKey: item.licenseKey ?? "",
      licenseModel: toFormValue(item.licenseModel, LICENSE_MODEL_MAP, "Per-User"),
      total: item.total ?? 0,
      inUse: item.inUse ?? 0,
      expiryDate: item.expiryDate ?? "",
      status: toFormValue(item.status, STATUS_MAP, "active"),
      vendor: item.manufacturer ?? "",
      licenseCost: (item as any).cost ?? 0,
      maintenanceCost: (item as any).maintenanceCost ?? 0,
      notes: (item as any).notes ?? "",
    }),
    [item]
  );

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.compliance}
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
        <InstallationSection<InstallationRow>
          rows={installations}
          mapRow={mapSoftwareInstallationRow}
          users={users}
          devices={devices}
          total={total}
          // 🔄 ใช้คีย์ตามโดเมน "license-..." (สอดคล้องกับ Software ที่ใช้ "software-...")
          resetKey={`license-${item.id}`}
          initialPage={1}
          pageSize={8}
          onExport={(fmt) => console.log("Export:", fmt)}
          onAction={(act) => console.log("Action:", act)}
        />
      }
      history={history}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit License",
        fields: licenseEditFields,
        initialValues: initialFormValues,
        onSubmit,
        submitLabel: "Save",
        cancelLabel: "Cancel",
      }}
    />
  );
}
