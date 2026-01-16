// src/components/common/FilterBar.tsx
"use client";

import React from "react";
import { ExportSelect } from "./ExportSelect";
import { ActionSelect } from "./ActionSelect";
import { SelectField } from "./SelectField";
import { ExportFormat, ToolbarAction } from "../../types/tab";
import { SearchInput } from "./SearchInput";

/** ฟิลเตอร์ที่เป็น single object */
export type SimpleFilters<TStatus extends string, TType extends string> = {
  status?: TStatus;
  type?: TType;
  manufacturer?: string;
  searchText: string;
};

export type FilterBarProps<TStatus extends string, TType extends string> = {
  /** state เดียว รวมทุกฟิลด์ */
  filters: SimpleFilters<TStatus, TType>;
  /** อัปเดตฟิลเตอร์ */
  onFiltersChange: (next: SimpleFilters<TStatus, TType>) => void;

  /** ตัวเลือก dropdown */
  statusOptions?: readonly TStatus[];
  typeOptions?: readonly TType[];
  manufacturerOptions?: readonly string[];

  /** action เสริม */
  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;

  /** ปรับข้อความ “All …” ได้เองถ้าต้องการ */
  allStatusLabel?: string;
  allTypeLabel?: string;
  allManufacturerLabel?: string;
};

export function FilterBar<TStatus extends string, TType extends string>({
  filters,
  onFiltersChange,
  statusOptions = [] as readonly TStatus[],
  typeOptions = [] as readonly TType[],
  manufacturerOptions = [] as readonly string[],
  onExport,
  onAction,
  allStatusLabel = "All Status",
  allTypeLabel = "All Types",
  allManufacturerLabel = "All Manufacturers",
}: FilterBarProps<TStatus, TType>) {
  // เตรียม options ให้ SelectField
  const statusSelectOptions = React.useMemo(
    () => [
      { label: allStatusLabel, value: "ALL" },
      ...statusOptions.map((s) => ({ label: s, value: s })),
    ],
    [statusOptions, allStatusLabel]
  );

  const typeSelectOptions = React.useMemo(
    () => [
      { label: allTypeLabel, value: "ALL" },
      ...typeOptions.map((t) => ({ label: t, value: t })),
    ],
    [typeOptions, allTypeLabel]
  );

  const manufacturerSelectOptions = React.useMemo(
    () => [
      { label: allManufacturerLabel, value: "ALL" },
      ...manufacturerOptions.map((m) => ({ label: m, value: m })),
    ],
    [manufacturerOptions, allManufacturerLabel]
  );

  // map undefined ↔ "ALL"
  const statusValue = (filters.status ?? "ALL") as string;
  const typeValue = (filters.type ?? "ALL") as string;
  const manufacturerValue = (filters.manufacturer ?? "ALL") as string;

  // updater สั้น ๆ
  const patch = <K extends keyof SimpleFilters<TStatus, TType>>(
    key: K,
    value: SimpleFilters<TStatus, TType>[K]
  ) => onFiltersChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3">
      {/* แถวบน: Filters + Export + Action */}
      <div className="flex gap-3 items-center">
        <SelectField
          label="Status"
          srOnlyLabel
          value={statusValue}
          options={statusSelectOptions}
          onChange={(v) =>
            patch("status", !v || v === "ALL" ? undefined : (v as TStatus))
          }
        />

        <SelectField
          label="Type"
          srOnlyLabel
          value={typeValue}
          options={typeSelectOptions}
          onChange={(v) =>
            patch("type", !v || v === "ALL" ? undefined : (v as TType))
          }
        />

        <SelectField
          label="Manufacturer"
          srOnlyLabel
          value={manufacturerValue}
          options={manufacturerSelectOptions}
          onChange={(v) =>
            patch("manufacturer", !v || v === "ALL" ? undefined : (v as string))
          }
        />

        <div className="ml-auto flex items-center gap-2">
          {onExport && <ExportSelect onExport={onExport} />}
          {onAction && <ActionSelect onAction={onAction} />}
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={filters.searchText}
        onChange={(q) => onFiltersChange({ ...filters, searchText: q })}
        placeholder="Search"
      />
    </div>
  );
}
