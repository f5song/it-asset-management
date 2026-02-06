// app/.../LicenseDetail.tsx (ไฟล์เดียวกับที่ส่งมา)
"use client";

import * as React from "react";

import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import { installationColumns } from "lib/tables/licenseInstallationColumns";
import { demoHistory, demoInstallations } from "lib/demo/licenseDetailDemoData";
import { mapLicenseItemToForm } from "lib/mappers/mapLicenseItemToForm";
import { show } from "lib/show";

import type {
  BreadcrumbItem,
  HistoryEvent,
  LicenseInstallationRow,
  LicenseItem,
} from "types";
import { licenseEditFields } from "@/config/forms/licenseEditFields";

interface LicenseDetailProps {
  item: LicenseItem;
  installations: LicenseInstallationRow[];
  history: HistoryEvent[];
  breadcrumb: BreadcrumbItem[];
}

export default function LicenseDetail({
  item,
  installations,
  history,
  breadcrumb,
}: LicenseDetailProps) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete", item.id);
  }, [item.id]);

  const rows = React.useMemo<LicenseInstallationRow[]>(
    () => (installations?.length ? installations : demoInstallations),
    [installations],
  );

  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  const initialFormValues = React.useMemo(
    () => mapLicenseItemToForm(item),
    [item],
  );

  // ✅ ให้ dropdown มีเฉพาะ "Assign" เท่านั้น
  const toolbar = (
    <InventoryActionToolbar
      entity="licenses"
      selectedIds={[item.id]}
      basePath="/software/license-management"
      enableDefaultMapping
      visibleActions={["assign"]}
      singleSelectionOnly
      toOverride={{
        assign: `/software/license-management/${item.id}/assign`,
      }}
      onAction={(act) => {
        if (act === "assign") {
          console.log("Assign license:", item.id);
        }
      }}
    />
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
        <InstallationSection<LicenseInstallationRow>
          rows={rows}
          columns={installationColumns}
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
      headerRightExtra={toolbar}
    />
  );
}