
"use client";

import * as React from "react";
import { licenseEditFields } from "app/config/forms/licenseEditFields";
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { ActionToolbar } from "components/toolbar/ActionToolbar";
import type {
  ActionPathConfig,
  BreadcrumbItem,
  HistoryEvent,
  LicenseInstallationRow,
  LicenseItem,
  ToolbarAction,
} from "types";
import { mapLicenseItemToForm } from "lib/mappers/mapLicenseItemToForm";
import { demoHistory, demoInstallations } from "lib/demo/licenseDetailDemoData";
import { show } from "lib/show";
import { installationColumns } from "lib/tables/licenseInstallationColumns";

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

  // Installations tab data
  const rows = React.useMemo<LicenseInstallationRow[]>(
    () => (installations?.length ? installations : demoInstallations),
    [installations],
  );

  // History tab data
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  // Initial form values for Edit License Form
  const initialFormValues = React.useMemo(
    () => mapLicenseItemToForm(item),
    [item],
  );

  // Toolbar: action → page mapping
  const toolbarTo: Partial<Record<ToolbarAction, ActionPathConfig>> = {
    assign: `/software/license-management/${item.id}/assign`,
  };

  const headerRightExtra = (
    <ActionToolbar
      selectedIds={[]}
      to={toolbarTo}
      onAction={(act) => console.log("toolbar action:", act)}
      openInNewTab={false}
      enableDefaultMapping={false}
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
      headerRightExtra={headerRightExtra}
    />
  );
}
