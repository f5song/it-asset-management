
// src/features/devices/DeviceFilters.tsx
"use client";

import * as React from "react";
import { FilterBar, type SimpleFilters } from "../../components/ui/FilterBar";
import type { ExportFormat, ToolbarAction } from "../../types/tab";

export type DeviceFilterState = {
  deviceGroup: string;
  deviceType: string;
  os: string;
  search: string;
};

export function DeviceFilters({
  filters,
  setFilter,
  deviceGroupOptions,
  deviceTypeOptions,
  osOptions,
  onExport,
  onAction,
}: {
  filters: DeviceFilterState;
  setFilter: (partial: Partial<DeviceFilterState>) => void;
  deviceGroupOptions: readonly string[];
  deviceTypeOptions: readonly string[];
  osOptions: readonly string[];
  onExport: (fmt: ExportFormat) => void;     // ✅ ใช้ ExportFormat
  onAction: (act: ToolbarAction) => void;    // ✅ ใช้ ToolbarAction
}) {
  const simpleFilters: SimpleFilters<string, string> = React.useMemo(
    () => ({
      status:       filters.deviceGroup !== "All Device" ? filters.deviceGroup : undefined,
      type:         filters.deviceType  !== "All Type"   ? filters.deviceType  : undefined,
      manufacturer: filters.os          !== "All OS"     ? filters.os          : undefined,
      searchText:   filters.search ?? "",
    }),
    [filters]
  );

  const handleChange = (sf: SimpleFilters<string, string>) => {
    setFilter({
      deviceGroup: sf.status       ?? "All Device",
      deviceType:  sf.type         ?? "All Type",
      os:          sf.manufacturer ?? "All OS",
      search:      sf.searchText   ?? "",
    });
  };

  return (
    <FilterBar<string, string>
      filters={simpleFilters}
      onFiltersChange={handleChange}
      statusOptions={deviceGroupOptions}
      typeOptions={deviceTypeOptions}
      manufacturerOptions={osOptions}
      onExport={onExport}
      onAction={onAction}
      allStatusLabel="All Device"
      allTypeLabel="All Type"
      allManufacturerLabel="All OS"
    />
  );
}
