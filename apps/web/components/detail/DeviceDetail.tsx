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
} from "types";

// Hooks
import { useDeviceBundledSoftware } from "hooks/useDeviceBundledSoftware";

// Helpers
import { show } from "lib/show";
import { deviceInstallationColumns } from "lib/tables/deviceInstallationColumns";
import { mapDeviceItemToForm } from "lib/mappers/mapDeviceItemToForm";
import {
  demoDeviceSoftwareRows,
  demoHistory,
} from "lib/demo/deviceDetailDemoData";
import { deviceEditFields } from "@/config/forms/deviceEditFields";

// Components
import { DetailInfoGrid } from "./DetailInfo";
import { HistoryList } from "components/detail/HistoryList";

interface DeviceDetailProps {
  item: DeviceItem;
  history?: HistoryEvent[];
  breadcrumbs?: BreadcrumbItem[];
}

export default function DeviceDetail({
  item,
  history,
  breadcrumbs,
}: DeviceDetailProps) {
  const onBack = React.useCallback(() => window.history.back(), []);

  const onDelete = React.useCallback(() => {
    console.log("Delete device:", item.id);
  }, [item.id]);

  // Load Bundled Software via API
  const { rows: apiRows } = useDeviceBundledSoftware(item.id, {
    pageIndex: 0,
    pageSize: 1000,
    sortBy: "softwareName",
    sortOrder: "asc",
    search: "",
  });

  // fallback demo
  const bundledRows = React.useMemo(
    () => (apiRows?.length ? apiRows : demoDeviceSoftwareRows),
    [apiRows]
  );

  const historyRows = React.useMemo(
    () => (history?.length ? history : demoHistory),
    [history]
  );

  const initialValues = React.useMemo(
    () => mapDeviceItemToForm(item),
    [item]
  );

  // Toolbar (right side)
  const toolbar = (
    <ActionToolbar
      selectedIds={[]}
      onAction={(act) => console.log("toolbar action:", act)}
      enableDefaultMapping={false}
      openInNewTab={false}
    />
  );

  return (
    <DetailView
      title={item.name}
      compliance={item.compliance}
      breadcrumbs={breadcrumbs}
      headerRightExtra={toolbar}
      defaultTabKey="bundled"
      tabs={[
        {
          key: "detail",
          label: "Detail",
          content: (
            <DetailInfoGrid
              left={[
                { label: "Device Name", value: show(item.name) },
                { label: "Type", value: show(item.type) },
                { label: "Assigned To", value: show(item.assignedTo) },
                { label: "OS", value: show(item.os) },
              ]}
              right={[
                { label: "Compliance", value: show(item.compliance) },
                { label: "Last Scan", value: show(item.lastScan) },
              ]}
            />
          ),
        },
        {
          key: "bundled",
          label: "Bundled Software",
          content: (
            <InstallationSection
              rows={bundledRows}
              columns={deviceInstallationColumns}
              resetKey={`device-${item.id}-bundled`}
              initialPage={1}
              pageSize={8}
            />
          ),
        },
        {
          key: "history",
          label: "History",
          content: <HistoryList history={historyRows} />,
        },
      ]}
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
    />
  );
}