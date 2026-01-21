
"use client";

import * as React from "react";
import { HistoryEvent, InstallationRow, SoftwareItem } from "../../../../types";
import { DetailView } from "../../../../components/detail/DetailView";
import { InstallationSection } from "../../../../components/tabbar/InstallationSection";

// (แบบเดียวกับ DeviceDetail) columns แบบสั้น: header + accessor
type SimpleColumn<R> = {
  header: string;
  accessor: (r: R) => React.ReactNode;
};

// ฟังก์ชันแสดงค่าแบบมี fallback เครื่องหมาย "—"
const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

export default function SoftwareDetail({
  item,
  installations,
  history,
}: {
  item: SoftwareItem;
  installations: InstallationRow[];
  history: HistoryEvent[];
}) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    // TODO: เรียก API/Server Action เพื่อลบ แล้ว redirect
    console.log("Delete", item.id);
  }, [item.id]);

  // ✅ คอลัมน์แบบเดียวกับ DeviceDetail (header + accessor)
  const columns = React.useMemo<SimpleColumn<InstallationRow>[]>(() => {
    return [
      { header: "Device",           accessor: (r) => show((r as any).device) },
      { header: "User",             accessor: (r) => show((r as any).user) },
      // ถ้ามีฟิลด์จริงใน InstallationRow ให้เปลี่ยนเครื่องหมาย "—"/"Active" เป็นค่าใน r เช่น r.licenseStatus, r.licenseKey, ...
      { header: "License Status",   accessor: (_r) => "Active" },
      { header: "License Key",      accessor: (_r) => "—" },
      { header: "Scanned License",  accessor: (_r) => "—" },
      { header: "Workstation",      accessor: (_r) => "—" },
    ];
  }, []);

  // ✅ rows ใช้ installations ตรง ๆ
  const rows = React.useMemo<InstallationRow[]>(
    () => installations,
    [installations],
  );

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.policyCompliance}
      // 🔁 ให้ตรงกับที่ต้องการ: "Installations"
      installationTabLabel="Installations"
      info={{
        left: [
          { label: "Manufacturer", value: show(item.manufacturer) },
          { label: "Version", value: show(item.version) },
          { label: "License Type", value: show(item.licenseModel) },
          { label: "Policy Compliance", value: show(item.policyCompliance) },
        ],
        right: [
          { label: "Category", value: show(item.category) },
          { label: "Expiry Date", value: show(item.expiryDate) },
          { label: "Status", value: show(item.status) },
          { label: "Client/Server", value: show(item.clientServer) },
        ],
      }}

      installationSection={
        <InstallationSection<InstallationRow>
          rows={rows}
          columns={columns}
          resetKey={`software-${item.id}`}
          initialPage={1}
          pageSize={10}
        />
      }
      history={history}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit Software Detail",
        fields: require("../../../config/forms/softwareEditFields")
          .softwareEditFields,
        initialValues: {
          softwareName: item.softwareName ?? "",
          manufacturer: item.manufacturer ?? "",
          version: item.version ?? "",
          category: (item.category ?? "free").toString().toLowerCase(),
          licenseModel: (item.licenseModel ?? "free").toString().toLowerCase(),
          policyCompliance: (item.policyCompliance ?? "allowed")
            .toString()
            .toLowerCase(),
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
