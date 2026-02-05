"use client";

import React from "react";
import { ExportSelect } from "./ExportSelect";
import { SelectField } from "./SelectField";
import { SearchInput } from "./SearchInput";
import { ExportFormat, FilterValues, ToolbarAction } from "types";

export type FilterBarProps<TStatus extends string, TType extends string> = {
  /** state เดียว รวมทุกฟิลด์ */
  filters?: FilterValues<TStatus, TType>;
  /** อัปเดตฟิลเตอร์ */
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;

  /** 🔁 ปรับ options ให้เป็น string[] เพื่อรับจากทุกหน้าได้ง่าย */
  statusOptions?: readonly string[];
  typeOptions?: readonly string[];
  manufacturerOptions?: readonly string[];

  /** ปรับข้อความ label รายฟิลด์ */
  labels?: {
    status?: string;
    type?: string;
    manufacturer?: string;
    searchPlaceholder?: string;
    allStatus?: string;
    allType?: string;
    allManufacturer?: string;
  };

  /** action เสริม */
  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;

  /** ✅ ช่องทางขวาพิเศษ (เช่น ActionToolbar) */
  rightExtra?: React.ReactNode;

  /** ✅ พื้นที่ไว้เสียบฟิลเตอร์เพิ่มเติมแบบ custom */
  extraFilters?: React.ReactNode;
};

export function FilterBar<TStatus extends string, TType extends string>({
  filters,
  onFiltersChange,
  statusOptions = [] as readonly string[],
  typeOptions = [] as readonly string[],
  manufacturerOptions = [] as readonly string[],

  labels,
  onExport,
  onAction,
  rightExtra,
  extraFilters,
}: FilterBarProps<TStatus, TType>) {
  const {
    status: statusLabel = "Status",
    type: typeLabel = "Type",
    manufacturer: manufacturerLabel = "Manufacturer",
    searchPlaceholder = "Search",
    allStatus = "All Statuses",
    allType = "All Types",
    allManufacturer = "All Manufacturers",
  } = labels ?? {};

  const hasStatus = Array.isArray(statusOptions) && statusOptions.length > 0;
  const hasType = Array.isArray(typeOptions) && typeOptions.length > 0;
  const hasManufacturer =
    Array.isArray(manufacturerOptions) && manufacturerOptions.length > 0;

  // เตรียม options ให้ SelectField เฉพาะฟิลด์ที่มีข้อมูล
  const statusSelectOptions = React.useMemo(
    () =>
      hasStatus
        ? [
            { label: allStatus, value: "ALL" },
            ...statusOptions.map((s) => ({ label: s, value: s })),
          ]
        : [],
    [hasStatus, statusOptions, allStatus],
  );

  const typeSelectOptions = React.useMemo(
    () =>
      hasType
        ? [
            { label: allType, value: "ALL" },
            ...typeOptions.map((t) => ({ label: t, value: t })),
          ]
        : [],
    [hasType, typeOptions, allType],
  );

  const manufacturerSelectOptions = React.useMemo(
    () =>
      hasManufacturer
        ? [
            { label: allManufacturer, value: "ALL" },
            ...manufacturerOptions.map((m) => ({ label: m, value: m })),
          ]
        : [],
    [hasManufacturer, manufacturerOptions, allManufacturer],
  );

  // map undefined ↔ "ALL"
  const statusValue = (filters?.status ?? "ALL") as string;
  const typeValue = (filters?.type ?? "ALL") as string;
  const manufacturerValue = (filters?.manufacturer ?? "ALL") as string;

  // updater สั้น ๆ

  const patch = <K extends keyof FilterValues<TStatus, TType>>(
    k: K,
    value: FilterValues<TStatus, TType>[K],
  ) => onFiltersChange({ ...filters, [k]: value });

  return (
    <div className="space-y-3">
      {/* แถวบน: Filters + Export + Action */}
      <div className="flex gap-3 items-center flex-wrap">
        {hasStatus && (
          <SelectField
            label={statusLabel}
            srOnlyLabel
            value={statusValue}
            options={statusSelectOptions}
            onChange={(v) =>
              patch("status", !v || v === "ALL" ? undefined : (v as TStatus))
            }
          />
        )}

        {hasType && (
          <SelectField
            label={typeLabel}
            srOnlyLabel
            value={typeValue}
            options={typeSelectOptions}
            onChange={(v) =>
              patch("type", !v || v === "ALL" ? undefined : (v as TType))
            }
          />
        )}

        {hasManufacturer && (
          <SelectField
            label={manufacturerLabel}
            srOnlyLabel
            value={manufacturerValue}
            options={manufacturerSelectOptions}
            onChange={(v) =>
              patch(
                "manufacturer",
                !v || v === "ALL" ? undefined : (v as string),
              )
            }
          />
        )}

        {/* ✅ เสียบฟิลเตอร์พิเศษตามหน้าได้ เช่น <UserSelect /> */}
        {extraFilters}

        <div className="ml-auto flex items-center gap-2">
          {onExport && <ExportSelect onExport={onExport} />}
          {/* ✅ วางปุ่ม/คอมโพเนนต์พิเศษฝั่งขวา */}
          {rightExtra}
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={filters?.search ?? ""}
        onChange={(q) => onFiltersChange({ ...filters, search: q })}
        placeholder={searchPlaceholder}
      />
    </div>
  );
}
