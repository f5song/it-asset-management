// src/pages/devices/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { StatusBadge } from "components/ui/StatusBadge";
import { ActionToolbar } from "components/toolbar/ActionToolbar";
// import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import { useDeviceInventory } from "hooks/useDeviceInventory";
import { useServerTableController } from "hooks/useServerTableController";

import type { AppColumnDef, ExportFormat, ToolbarAction } from "types";
import type {
  DeviceItem,
  DeviceGroup,
  DeviceType,
  DeviceOS,
  DeviceDomainFilters,
  DeviceFilterValues,
} from "types/device";

/* ---------------- Utilities ---------------- */

// แปลง "" -> undefined ป้องกันส่งค่าว่างไป service
const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;

// Normalizers: UI label -> internal

// หลัง (แนะนำ)
const normalizeDeviceGroup = (g?: string): "" | "assigned" | "unassigned" => {
  const k = (g ?? "").toLowerCase().trim();
  if (k === "assigned") return "assigned";
  if (k === "unassigned") return "unassigned";
  return "";
};

const normalizeDeviceType = (t?: string): string => {
  if (!t) return "";
  const map: Record<string, string> = {
    Laptop: "laptop",
    Desktop: "desktop",
    VM: "vm",
    Mobile: "mobile",
    laptop: "laptop",
    desktop: "desktop",
    vm: "vm",
    mobile: "mobile",
  };
  return map[t] ?? t.toLowerCase();
};

const normalizeOS = (os?: string): string => {
  if (!os) return "";
  const map: Record<string, string> = {
    Windows: "windows",
    macOS: "macos",
    Linux: "linux",
    iOS: "ios",
    Android: "android",
    windows: "windows",
    macos: "macos",
    linux: "linux",
    ios: "ios",
    android: "android",
  };
  return map[os] ?? os.toLowerCase();
};

/* ---------------- Page ---------------- */

export default function DevicesPage() {
  const router = useRouter();

  // ฟิลเตอร์เริ่มเป็น undefined (หมายถึงไม่กรอง)
  const [filters, setFilters] = React.useState<DeviceDomainFilters>({
    deviceGroup: undefined,
    deviceType: undefined,
    os: undefined,
    search: "",
  });

  // columns
  const columns = React.useMemo<AppColumnDef<DeviceItem>[]>(
    () => [
      { id: "id", header: "Device ID", accessorKey: "id", width: 140 },
      { id: "name", header: "Device Name", accessorKey: "name", width: 220 },
      { id: "type", header: "Type", accessorKey: "type", width: 120 },
      {
        id: "assignedTo",
        header: "Assigned to",
        accessorKey: "assignedTo",
        width: 200,
      },
      { id: "os", header: "OS", accessorKey: "os", width: 140 },
      {
        id: "compliance",
        header: "Compliant status",
        accessorKey: "compliance",
        width: 160,
        cell: (v) => <StatusBadge label={String(v ?? "-")} />,
      },
      {
        id: "lastScan",
        header: "Last Scan",
        accessorKey: "lastScan",
        width: 140,
      },
    ],
    [],
  );

  // Bridge: Domain Filters ↔ FilterValues (แทน SimpleFilters เดิม)
  // map: status = deviceGroup, type = deviceType, manufacturer = os
  const toSimple = React.useCallback(
    (): DeviceFilterValues => ({
      status: toUndef(filters.deviceGroup as DeviceGroup | ""),
      type: toUndef(filters.deviceType as DeviceType | ""),
      manufacturer: toUndef(filters.os as string | ""),
      searchText: filters.search ?? "",
    }),
    [filters],
  );

  const fromSimple = React.useCallback(
    (sf: DeviceFilterValues): DeviceDomainFilters => ({
      deviceGroup: toUndef(sf.status),
      deviceType: toUndef(sf.type),
      os: toUndef(sf.manufacturer),
      search: sf.searchText ?? "",
    }),
    [],
  );

  // Controller
  const ctl = useServerTableController<
    DeviceItem,
    DeviceGroup,
    DeviceType,
    DeviceDomainFilters
  >({
    pageSize: 8,
    defaultSort: { id: "id", desc: false },
    domainFilters: filters,
    setDomainFilters: setFilters,
    toSimple,
    fromSimple,
    resetDeps: [filters.deviceGroup, filters.deviceType, filters.os],
  });

  // simpleFilters -> service filters (normalize) แล้วส่งเข้า hook
  const serviceFilters = React.useMemo(
    () => ({
      deviceGroup: normalizeDeviceGroup(
        ctl.simpleFilters.status as string | undefined,
      ),
      deviceType: normalizeDeviceType(
        ctl.simpleFilters.type as string | undefined,
      ),
      os: normalizeOS(ctl.simpleFilters.manufacturer as string | undefined),
      search: ctl.simpleFilters.searchText ?? "",
    }),
    [ctl.simpleFilters],
  );

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useDeviceInventory(ctl.serverQuery, serviceFilters);

  // options
  const deviceGroupOptions: readonly DeviceGroup[] = ["Assigned", "Unassigned"];
  const deviceTypeOptions: readonly DeviceType[] = [
    "Laptop",
    "Desktop",
    "VM",
    "Mobile",
  ];
  const osOptions: readonly DeviceOS[] = [
    "Windows",
    "macOS",
    "Linux",
    "iOS",
    "Android",
  ];

  const getRowHref = React.useCallback(
    (row: DeviceItem) => `/devices/${row.id}`,
    [],
  );

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export format:", fmt);
      // TODO: exportDevices(fmt, ctl.serverQuery, serviceFilters);
    },
    [ctl.serverQuery, serviceFilters],
  );

  // selection จาก DataTable
  const [selectedDeviceIds, setSelectedDeviceIds] = React.useState<string[]>(
    [],
  );

  const rightExtra = (
    <ActionToolbar
      selectedIds={selectedDeviceIds}
      enableDefaultMapping={false}
      to={{
        add: "/devices/add",
        reassign: ({
          action,
          selectedIds,
        }: {
          action: ToolbarAction;
          selectedIds: string[];
        }) =>
          `/devices/reassign?ids=${encodeURIComponent(selectedIds.join(","))}`,
        delete: ({
          action,
          selectedIds,
        }: {
          action: ToolbarAction;
          selectedIds: string[];
        }) =>
          `/devices/delete?ids=${encodeURIComponent(selectedIds.join(","))}`,
      }}
      onAction={(act) => {
        if (act === "delete") {
          console.log("delete selected:", selectedDeviceIds);
        }
      }}
    />
  );

  return (
    <InventoryPageShell<DeviceItem, DeviceGroup, DeviceType>
      title="Devices"
      breadcrumbs={[{ label: "Devices", href: "/devices" }]}
      // FilterBar
      filters={ctl.simpleFilters} // ← เป็น FilterValues แล้ว
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={deviceGroupOptions}
      typeOptions={deviceTypeOptions}
      manufacturerOptions={osOptions}
      allStatusLabel="All Device Groups"
      allTypeLabel="All Types"
      allManufacturerLabel="All OS"
      filterBarRightExtra={rightExtra}
      onExport={handleExport}
      // DataTable
      columns={columns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={getRowHref}
      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    />
  );
}
