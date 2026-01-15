
// src/components/installation/InstallationToolbar.tsx
"use client";
import React from "react";

import { ToolbarSummary } from "./ToolbarSummary";
import { InstallationFiltersBar } from "./InstallationFiltersBar";
import { SearchInput } from "./SearchInput";
import { ExportFormat, InstallationFilters, ToolbarAction } from "../../types/tab";

export function InstallationToolbar({
  total,
  filters,
  users,
  devices,
  statuses = ["Active", "Expiring Soon", "Expired"],
  onFiltersChange,
  onExport,
  onAction,
}: {
  total: number;
  filters: InstallationFilters;
  users: string[];
  devices: string[];
  statuses?: Array<"Active" | "Expiring Soon" | "Expired">;
  onFiltersChange: (next: InstallationFilters) => void;
  onExport?: (format: ExportFormat) => void;
  onAction?: (action: ToolbarAction) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {/* Summary */}
      <ToolbarSummary total={total} />

      {/* Filters + Actions */}
      <InstallationFiltersBar
        filters={filters}
        users={users}
        devices={devices}
        statuses={statuses}
        onFiltersChange={onFiltersChange}
        onExport={onExport}
        onAction={onAction}
      />

      {/* Search */}
      <SearchInput
        value={filters.query}
        onChange={(q) => onFiltersChange({ ...filters, query: q })}
        placeholder="Search"
      />
    </div>
  );
}
