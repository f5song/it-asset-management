
// src/components/installation/InstallationToolbar.tsx
"use client";
import React from "react";

import { ToolbarSummary } from "./ToolbarSummary";
import {
  ExportFormat,
  Filters,
  ToolbarAction,
} from "../../types/tab";
import { FilterBar } from "../ui/FilterBar";
import { SimpleFilters } from "../../types";


/** ---------- Helpers: map Installation <-> FilterBar(Simple) ---------- */

// สมมุติระบบเดิมเก็บ "ALL" เป็นค่าหมายถึงทั้งหมด
// ใน FilterBar(Simple) เราใช้ undefined แทน "ทั้งหมด"
function toSimpleFilters(
  f: Filters
): SimpleFilters<Filters["status"], string> {
  return {
    status: f.status && f.status !== "ALL" ? (f.status as any) : undefined,
    type: f.device && f.device !== "ALL" ? f.device : undefined, // device -> type
    manufacturer: f.user && f.user !== "ALL" ? f.user : undefined, // user -> manufacturer
    searchText: f.query ?? "",
  };
}

function fromSimpleFilters(
  sf: SimpleFilters<Filters["status"], string>,
  prev: Filters
): Filters {
  return {
    ...prev,
    status: (sf.status ?? "ALL") as Filters["status"],
    device: sf.type ?? "ALL",
    user: sf.manufacturer ?? "ALL",
    query: sf.searchText ?? "",
  };
}

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
  filters: Filters;
  users: string[];
  devices: string[];
  statuses?: Array<"Active" | "Expiring Soon" | "Expired">;
  onFiltersChange: (next: Filters) => void;
  onExport?: (format: ExportFormat) => void;
  onAction?: (action: ToolbarAction) => void;
}) {
  // แปลง filters (Installation) -> SimpleFilters สำหรับ FilterBar
  const simpleFilters = React.useMemo(() => toSimpleFilters(filters), [filters]);

  const handleSimpleChange = React.useCallback(
    (next: SimpleFilters<Filters["status"], string>) => {
      const mapped = fromSimpleFilters(next, filters);
      onFiltersChange(mapped);
    },
    [filters, onFiltersChange]
  );

  return (
    <div className="mt-4 space-y-3">
      {/* Summary */}
      <ToolbarSummary total={total} />

      {/* Filters + Actions (ใช้ FilterBar Simple) */}
      <FilterBar<Filters["status"], string>
        filters={simpleFilters}
        onFiltersChange={handleSimpleChange}
        // map options:
        // - statusOptions: ตรงๆ
        // - typeOptions: ใช้ devices
        // - manufacturerOptions: ใช้ users
        statusOptions={statuses as ReadonlyArray<Filters["status"]>}
        typeOptions={devices as ReadonlyArray<string>}
        manufacturerOptions={users as ReadonlyArray<string>}
        onExport={onExport}
        onAction={onAction}
        // ปรับ label ให้เข้ากับโดเมน Installation
        allStatusLabel="All License Status"
        allTypeLabel="All Device"
        allManufacturerLabel="All User"
      />
    </div>
  );
}
