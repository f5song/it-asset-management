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
} from "types";

import { softwareEditFields } from "app/config/forms/softwareEditFields";
import { demoHistory, demoSoftwareInstallations } from "lib/demo/softwareDetailDemoData";
import { mapSoftwareItemToForm } from "lib/mappers/mapSoftwareItemToForm";
import { softwareInstallationColumns } from "lib/tables/softwareInstallationColumns";
import { show } from "lib/show";

interface SoftwareDetailProps {
  item: SoftwareItem;
  installations: InstallationRow[];
  history: HistoryEvent[];
  breadcrumb?: BreadcrumbItem[];
}

export default function SoftwareDetail({
  item,
  installations,
  history,
  breadcrumb,
}: SoftwareDetailProps) {
  const onBack = React.useCallback(() => window.history.back(), []);
  const onDelete = React.useCallback(() => {
    console.log("Delete", item.id);
  }, [item.id]);

  // Derive installations
  const rows = React.useMemo<InstallationRow[]>(
    () => (installations?.length ? installations : demoSoftwareInstallations),
    [installations],
  );

  // Derive history data
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  const initialValues = React.useMemo(
    () => mapSoftwareItemToForm(item),
    [item],
  );

  // Toolbar (ใช้ standardized inventory toolbar)
  const toolbar = (
    <InventoryActionToolbar
      entity="software"
      selectedIds={[item.id]}
      basePath="/software/inventory"
      enableDefaultMapping
      toOverride={{
        delete: `/software/inventory/${item.id}/delete`,
      }}
      onAction={(act) => console.log("action:", act)}
    />
  );

  return (
    <DetailView
      title={item.softwareName}
      compliance={item.policyCompliance}
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
          columns={softwareInstallationColumns}
          resetKey={`software-${item.id}`}
          initialPage={1}
          pageSize={8}
        />
      }
      history={historyData}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit Software",
        fields: softwareEditFields,
        initialValues,
        onSubmit: async (values) => {
          console.log("save software:", values);
        },
        submitLabel: "Confirm",
        cancelLabel: "Cancel",
      }}
      breadcrumbs={breadcrumb}
      headerRightExtra={toolbar}
    />
  );
}