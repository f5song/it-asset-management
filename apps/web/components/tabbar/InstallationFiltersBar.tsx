
// src/components/installation/InstallationFiltersBar.tsx
"use client";
import React from "react";
import { SelectField } from "./SelectField";
import { ExportSelect } from "./ExportSelect";
import { ActionSelect } from "./ActionSelect";
import { ExportFormat, InstallationFilters, ToolbarAction } from "../../types/tab";


type Props = {
  filters: InstallationFilters;
  users: string[];
  devices: string[];
  statuses: Array<"Active" | "Expiring Soon" | "Expired">;
  onFiltersChange: (next: InstallationFilters) => void;
  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;
};

export function InstallationFiltersBar({
  filters,
  users,
  devices,
  statuses,
  onFiltersChange,
  onExport,
  onAction,
}: Props) {
  const userOptions = React.useMemo(
    () => [{ label: "All User", value: "ALL" }, ...users.map((u) => ({ label: u, value: u }))],
    [users]
  );

  const deviceOptions = React.useMemo(
    () => [{ label: "All Device", value: "ALL" }, ...devices.map((d) => ({ label: d, value: d }))],
    [devices]
  );

  const statusOptions = React.useMemo(
    () => [{ label: "All License Status", value: "ALL" }, ...statuses.map((s) => ({ label: s, value: s }))],
    [statuses]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-600">Filter</span>

      <SelectField
        label="User"
        srOnlyLabel
        value={filters.user}
        options={userOptions}
        onChange={(v) => onFiltersChange({ ...filters, user: v as InstallationFilters["user"] })}
      />

      <SelectField
        label="Device"
        srOnlyLabel
        value={filters.device}
        options={deviceOptions}
        onChange={(v) => onFiltersChange({ ...filters, device: v as InstallationFilters["device"] })}
      />

      <SelectField
        label="License Status"
        srOnlyLabel
        value={filters.status}
        options={statusOptions}
        onChange={(v) => onFiltersChange({ ...filters, status: v as InstallationFilters["status"] })}
      />

      <div className="ml-auto flex items-center gap-2">
        {onExport && <ExportSelect onExport={onExport} />}
        {onAction && <ActionSelect onAction={onAction} />}
      </div>
    </div>
  );
}
