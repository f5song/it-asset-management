"use client";

import * as React from "react";

import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import type {
  BreadcrumbItem,
  HistoryEvent,
  InstallationRow,
  SoftwareItem,
  LicenseItem, // ✅ เพิ่ม
} from "types";
import {
  demoHistory,
  demoSoftwareInstallations,
} from "lib/demo/softwareDetailDemoData";
import { mapSoftwareItemToForm } from "lib/mappers/mapSoftwareItemToForm";
import { softwareInstallationColumns } from "lib/tables/softwareInstallationColumns";
import { show } from "lib/show";
import { softwareEditFields } from "@/config/forms/softwareEditFields";

import { DetailInfoGrid } from "components/detail/DetailInfo";
import { HistoryList } from "components/detail/HistoryList";
import { licenseColumns } from "@/lib/tables/licenseInventoryColumns";

interface SoftwareDetailProps {
  item: SoftwareItem;
  installations: InstallationRow[];
  history: HistoryEvent[];
  breadcrumb?: BreadcrumbItem[];
  /** ✅ เพิ่ม: ถ้ามีข้อมูล license แยก */
  licenses?: LicenseItem[];
}

export default function SoftwareDetail({
  item,
  installations,
  history,
  breadcrumb,
  licenses, // ✅ รับเข้ามา (ออปชัน)
}: SoftwareDetailProps) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete", item.id);
  }, [item.id]);

  // Derive installations
  const rows = React.useMemo<InstallationRow[]>(
    () => (installations?.length ? installations : demoSoftwareInstallations),
    [installations]
  );

  // Derive history data
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history]
  );

  const initialValues = React.useMemo(() => mapSoftwareItemToForm(item), [item]);

  // Toolbar (ใช้ standardized inventory toolbar)
  const toolbar = (
    <InventoryActionToolbar
      entity="software"
      selectedIds={[item.id]}
      basePath="/software/inventory"
      enableDefaultMapping
      toOverride={{
        Delete: `/software/inventory/${item.id}/delete`,
      }}
      onAction={(act) => console.log("action:", act)}
    />
  );

  // ✅ เตรียมแถวสำหรับแท็บ Licenses (ถ้าไม่มี ให้เป็นอาร์เรย์ว่าง)
  const licenseRows = React.useMemo<LicenseItem[]>(
    () => (licenses && licenses.length ? licenses : []),
    [licenses]
  );

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.policyCompliance}
      breadcrumbs={breadcrumb}
      headerRightExtra={toolbar}
      defaultTabKey="installations"
      tabs={[
        {
          key: "detail",
          label: "Detail",
          content: (
            <DetailInfoGrid
              left={[
                { label: "Manufacturer", value: show(item.manufacturer) },
                { label: "Version", value: show(item.version) },
                { label: "License Type", value: show(item.licenseModel) },
                { label: "Policy Compliance", value: show(item.policyCompliance) },
              ]}
              right={[
                { label: "Category", value: show(item.category) },
                { label: "Expiry Date", value: show(item.expiryDate) },
                { label: "Client/Server", value: show(item.clientServer) },
              ]}
            />
          ),
        },
        {
          key: "installations",
          label: "Installations",
          content: (
            <InstallationSection<InstallationRow>
              rows={rows}
              columns={softwareInstallationColumns}
              resetKey={`software-${item.id}`}
              initialPage={1}
              pageSize={8}
            />
          ),
        },
        {
          key: "licenses",
          label: "Licenses",
          // (ออปชัน) badge แสดงจำนวน license
          // badge: <span className="rounded bg-slate-100 px-1 text-xs">{licenseRows.length}</span>,
          content: (
            <InstallationSection<LicenseItem>
              rows={licenseRows}
              columns={licenseColumns}
              resetKey={`software-${item.id}-licenses`}
              initialPage={1}
              pageSize={8}
              searchPlaceholder="Search licenses..."
              exportFileBaseName={`licenses-${item.softwareName}`}
            />
          ),
        },
        {
          key: "history",
          label: "History",
          content: <HistoryList history={historyData} />,
        },
      ]}
      onBack={onBack}
      onDelete={onDelete}
      onEdit={() => {
        console.log("open edit for", item.id, "with", initialValues);
      }}
    />
  );
}
