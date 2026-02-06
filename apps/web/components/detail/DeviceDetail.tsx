
"use client";

import * as React from "react";

// UI Components
import { DetailView } from "components/detail/DetailView";
import { InstallationSection } from "components/tabbar/InstallationSection";
import { ActionToolbar } from "components/toolbar/ActionToolbar";

// Types
import type {
  DeviceItem,
  HistoryEvent,
  BreadcrumbItem,
  ActionPathConfig,
  ToolbarAction,
} from "types";

// Form


// Hooks
import { useDeviceBundledSoftware } from "hooks/useDeviceBundledSoftware";

// Helpers
import { show } from "lib/show";
import { deviceInstallationColumns } from "lib/tables/deviceInstallationColumns";
import { mapDeviceItemToForm } from "lib/mappers/mapDeviceItemToForm";
import { demoDeviceSoftwareRows, demoHistory } from "lib/demo/deviceDetailDemoData";
import { deviceEditFields } from "@/config/forms/deviceEditFields";

// ---------------------------------------------
// Props
// ---------------------------------------------
interface DeviceDetailProps {
  item: DeviceItem;
  history?: HistoryEvent[];
  breadcrumbs?: BreadcrumbItem[];
}

// ---------------------------------------------
// Component
// ---------------------------------------------
export default function DeviceDetail({
  item,
  history,
  breadcrumbs,
}: DeviceDetailProps) {
  const onBack = React.useCallback(() => window.history.back(), []);

  const onDelete = React.useCallback(() => {
    console.log("Delete device:", item.id);
  }, [item.id]);

  // Load bundled software list (API)
  const { rows: apiRows } = useDeviceBundledSoftware(item.id, {
    pageIndex: 0,
    pageSize: 1000,
    sortBy: "softwareName",
    sortOrder: "asc",
    search: "",
  });

  // If API empty → fallback to demo
  const rows = React.useMemo(
    () => (apiRows?.length ? apiRows : demoDeviceSoftwareRows),
    [apiRows],
  );

  // History tab (fallback)
  const historyRows = React.useMemo(
    () => (history?.length ? history : demoHistory),
    [history],
  );

  // Initial form values
  const initialValues = React.useMemo(
    () => mapDeviceItemToForm(item),
    [item],
  );

  // Toolbar config
  const toolbarTo: Partial<Record<ToolbarAction, ActionPathConfig>> = {
    assign: `/devices/${item.id}/assign`,
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
      title={show(item.name)}
      compliance={item.compliance}
      breadcrumbs={breadcrumbs ?? []}
      installationTabLabel="Bundled Software"
      info={{
        left: [
          { label: "Device Name", value: show(item.name) },
          { label: "Type", value: show(item.type) },
          { label: "Assigned To", value: show(item.assignedTo) },
          { label: "OS", value: show(item.os) },
        ],
        right: [
          { label: "Compliance", value: show(item.compliance) },
          { label: "Last Scan", value: show(item.lastScan) },
        ],
      }}
      installationSection={
        <InstallationSection
          rows={rows}
          columns={deviceInstallationColumns}
          resetKey={`device-${item.id}`}
          initialPage={1}
          pageSize={10}
        />
      }
      history={historyRows}
      onBack={onBack}
      onDelete={onDelete}
      editConfig={{
        title: "Edit Device",
        fields: deviceEditFields,
        initialValues,
        onSubmit: async (values) => {
          console.log("save device:", values);
        },
        submitLabel: "Confirm",
        cancelLabel: "Cancel",
      }}
      headerRightExtra={toolbar}
    />
  );
}
