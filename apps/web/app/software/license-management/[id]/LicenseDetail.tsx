
"use client";

import * as React from "react";
import { licenseEditFields } from "app/config/forms/licenseEditFields";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import type { BreadcrumbItem, HistoryEvent, InstallationRow, LicenseItem } from "types";

type SimpleColumn<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

const show = (v: unknown) => (v === undefined || v === null || v === "" ? "—" : String(v));

/** ---------------- DEMO: Installations (ใช้เมื่อ API ว่าง) ---------------- **/
const demoInstallations: InstallationRow[] = [
  { id: "lic-ins-1", device: "NB-201", user: "mike" } as any,
  { id: "lic-ins-2", device: "PC-304", user: "nina" } as any,
  { id: "lic-ins-3", device: "SRV-09", user: "system" } as any,
];

/** ---------------- DEMO: History (ใช้เมื่อ API ว่าง) ---------------- **/
const demoHistory: HistoryEvent[] = [
  { id: "lh1", timestamp: new Date().toISOString(), actor: "system", action: "sync",   detail: "License sync finished" } as any,
  { id: "lh2", timestamp: new Date().toISOString(), actor: "admin",  action: "update", detail: "Adjusted license seats" } as any,
];

export default function LicenseDetail({
  item,
  installations,
  history,
  breadcrumb
}: {
  item: LicenseItem;
  installations: InstallationRow[];
  history: HistoryEvent[];
  breadcrumb: BreadcrumbItem[];
}) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete", item.id);
  }, [item.id]);

  const columns = React.useMemo<SimpleColumn<InstallationRow>[]>(() => {
    return [
      { header: "Device",           accessor: (r) => show((r as any).device) },
      { header: "User",             accessor: (r) => show((r as any).user) },
      { header: "License Status",   accessor: (_r) => "Active" }, // TODO: show(r.licenseStatus)
      { header: "License Key",      accessor: (_r) => "—" },      // TODO: show(r.licenseKey)
      { header: "Scanned License",  accessor: (_r) => "—" },      // TODO: show(r.scannedLicenseKey)
      { header: "Workstation",      accessor: (_r) => "—" },      // TODO: show(r.workStation)
    ];
  }, []);

  // ✅ ใช้ demo ถ้า API ว่าง
  const rows = React.useMemo<InstallationRow[]>(
    () => (installations?.length ? installations : demoInstallations),
    [installations]
  );

  // ✅ ใช้ demo history ถ้า API ว่าง
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history]
  );

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
    [item]
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
        <InstallationSection<InstallationRow>
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
    />
  );
}
