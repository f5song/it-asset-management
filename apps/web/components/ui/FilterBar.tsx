
"use client";

import React from "react";
import { ExportSelect } from "./ExportSelect";
import { ActionSelect } from "./ActionSelect";
import { SelectField } from "./SelectField";

import { SearchInput } from "./SearchInput";
import { ExportFormat, FilterValues, ToolbarAction } from "types";


export type FilterBarProps<TStatus extends string, TType extends string> = {
  /** state เดียว รวมทุกฟิลด์ */
  filters: FilterValues<TStatus, TType>;
  /** อัปเดตฟิลเตอร์ */
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;

  /** 🔁 ปรับ options ให้เป็น string[] เพื่อรับจากทุกหน้าได้ง่าย */
  statusOptions?: readonly string[];
  typeOptions?: readonly string[];
  manufacturerOptions?: readonly string[];

  /** action เสริม */
  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;

  /** ปรับข้อความ “All …” ได้เองถ้าต้องการ */
  allStatusLabel?: string;
  allTypeLabel?: string;
  allManufacturerLabel?: string;

  /** ✅ ช่องทางขวาพิเศษ (เช่น ActionToolbar) */
  rightExtra?: React.ReactNode;
};

export function FilterBar<TStatus extends string, TType extends string>({
  filters,
  onFiltersChange,
  statusOptions = [] as readonly string[],
  typeOptions = [] as readonly string[],
  manufacturerOptions = [] as readonly string[],
  onExport,
  onAction,
  allStatusLabel = "All Status",
  allTypeLabel = "All Types",
  allManufacturerLabel = "All Manufacturers",
  rightExtra, // ✅ รับเข้ามา
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
  const patch = <K extends keyof FilterValues<TStatus, TType>>(
    key: K,
    value: FilterValues<TStatus, TType>[K]
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

          {/* ✅ วางปุ่ม/คอมโพเนนต์พิเศษฝั่งขวา */}
          {rightExtra}
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
