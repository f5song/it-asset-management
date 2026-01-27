
"use client";

import * as React from "react";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { ActionToolbar } from "components/toolbar/ActionToolbar";
import type {
  BreadcrumbItem,
  HistoryEvent,
  InstallationRow,
  SoftwareItem,
  ActionPathConfig,
  ToolbarAction,
} from "types";
import { show } from "lib/show";
import { softwareEditFields } from "app/config/forms/softwareEditFields";
import { demoHistory, demoSoftwareInstallations } from "lib/demo/softwareDetailDemoData";
import { mapSoftwareItemToForm } from "lib/mappers/mapSoftwareItemToForm";
import { softwareInstallationColumns } from "lib/tables/softwareInstallationColumns";

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

  // Installations tab rows (fallback demo)
  const rows = React.useMemo<InstallationRow[]>(
    () => (installations?.length ? installations : demoSoftwareInstallations),
    [installations],
  );

  // History tab data (fallback demo)
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  // Initial form values
  const initialValues = React.useMemo(
    () => mapSoftwareItemToForm(item),
    [item],
  );

  // Toolbar path mapping
  const toolbarTo: Partial<Record<ToolbarAction, ActionPathConfig>> = {
    assign: `/software/software-management/${item.id}/assign`,
  };

  const toolbar = (
    <ActionToolbar
      selectedIds={[]}
      to={toolbarTo}
      onAction={(act) => console.log("toolbar:", act)}
      openInNewTab={false}
      enableDefaultMapping={false}
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
          pageSize={10}
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
