"use client";
import * as React from "react";

import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useDeviceInventory } from "hooks/useDeviceInventory";
import { useServerTableController } from "hooks/useServerTableController";

import type { ExportFormat } from "types";
import type {
  DeviceItem,
  DeviceGroup,
  DeviceType,
  DeviceOS,
  DeviceDomainFilters,
  DeviceFilterValues, // = FilterValues<DeviceGroup, DeviceType>
} from "types/device";

import { deviceInventoryColumns } from "lib/tables/deviceInventoryColumns";
import {
  toDomainFilters,
  toServiceFilters,
  toSimpleFilters,
} from "lib/mappers/deviceFilterMappers";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

export default function DevicesPage() {
  /* -------------------------------------------------------
   *  FILTER + TABLE CONTROLLER
   * ------------------------------------------------------- */
  const [domainFilters, setDomainFilters] = React.useState<DeviceDomainFilters>(
    toDomainFilters(), // empty filters
  );

  const ctl = useServerTableController<
    DeviceItem,
    DeviceGroup, // TStatus
    DeviceType, // TType
    DeviceDomainFilters
  >({
    pageSize: 8,
    defaultSort: { id: "id", desc: false },
    domainFilters,
    setDomainFilters,
    toSimple: (): DeviceFilterValues => toSimpleFilters(domainFilters),
    fromSimple: (sf: DeviceFilterValues) => toDomainFilters(sf),
    resetDeps: [
      domainFilters.deviceGroup,
      domainFilters.deviceType,
      domainFilters.os,
    ],
  });

  const serviceFilters = React.useMemo(
    () => toServiceFilters(ctl.simpleFilters),
    [ctl.simpleFilters],
  );

  const { rows, totalRows, isLoading, isError, errorMessage } =
    useDeviceInventory(ctl.serverQuery, domainFilters);

  /* -------------------------------------------------------
   *  OPTIONS
   * ------------------------------------------------------- */
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

  /* -------------------------------------------------------
   *  TOOLBAR + EXPORT HANDLER
   * ------------------------------------------------------- */

  const [selectedDeviceIds, setSelectedDeviceIds] = React.useState<string[]>(
    [],
  );

  const handleExport = React.useCallback(
    (fmt: ExportFormat) => {
      console.log("Export format:", fmt);
      // TODO: exportDevices(fmt, ctl.serverQuery, serviceFilters)
    },
    [ctl.serverQuery, serviceFilters],
  );

  const rightExtra = (
    <InventoryActionToolbar
      entity="devices"
      selectedIds={selectedDeviceIds}
      basePath="/devices"
      enableDefaultMapping
      onAction={(act) => {
        if (act === "delete") {
          console.log("delete devices:", selectedDeviceIds);
        }
      }}
    />
  );

  /* -------------------------------------------------------
   *  RENDER
   * ------------------------------------------------------- */

  return (
    <InventoryPageShell<DeviceItem, DeviceGroup, DeviceType>
      title="Devices"
      breadcrumbs={[{ label: "Devices", href: "/devices" }]}
      // FilterBar
      filters={ctl.simpleFilters}
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
      columns={deviceInventoryColumns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={(row) => `/devices/${row.id}`}
      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      selectedIds={selectedDeviceIds}
      onSelectedIdsChange={setSelectedDeviceIds}
    />
  );
}
