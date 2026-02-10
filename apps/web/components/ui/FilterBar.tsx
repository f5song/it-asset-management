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

  /** เดิมเคยใช้บังคับลำดับ แต่เวอร์ชันเรียบง่ายนี้จะ "รับไว้เฉย ๆ" เพื่อไม่ให้ breaking */
  optionOrder?: Partial<{
    status: readonly string[];
    type: readonly string[];
    manufacturer: readonly string[];
  }>;

  /** เดิมเคยใช้ sort ขั้นสูง — เวอร์ชันนี้จะไม่ใช้งาน เพื่อความเรียบง่าย */
  optionSort?: Partial<{
    status: (a: string, b: string) => number;
    type: (a: string, b: string) => number;
    manufacturer: (a: string, b: string) => number;
  }>;
};

export function FilterBar<TStatus extends string, TType extends string>({
  filters,
  onFiltersChange,
  statusOptions = [] as readonly string[],
  typeOptions = [] as readonly string[],
  manufacturerOptions = [] as readonly string[],

  labels,
  onExport,
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

  // --- helpers (เรียบง่าย): สร้าง options และอัปเดต state ---
  const makeOptions = (allLabel: string, list: readonly string[]) => [
    { label: allLabel, value: "ALL" },
    ...list.map((v) => ({ label: v, value: v })),
  ];

  const patch = <K extends keyof FilterValues<TStatus, TType>>(
    key: K,
    value: FilterValues<TStatus, TType>[K],
  ) => onFiltersChange({ ...filters, [key]: value });

  const statusValue = (filters?.status ?? "ALL") as string;
  const typeValue = (filters?.type ?? "ALL") as string;
  const manufacturerValue = (filters?.manufacturer ?? "ALL") as string;

  return (
    <div className="space-y-3">
      {/* แถวบน: Dropdowns + Export + Extra */}
      <div className="flex gap-3 items-center flex-wrap">
        {hasStatus && (
          <SelectField
            label={statusLabel}
            srOnlyLabel
            value={statusValue}
            options={makeOptions(allStatus, statusOptions)}
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
            options={makeOptions(allType, typeOptions)}
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
            options={makeOptions(allManufacturer, manufacturerOptions)}
            onChange={(v) =>
              patch(
                "manufacturer",
                !v || v === "ALL" ? undefined : (v as string),
              )
            }
          />
        )}

        {/* ช่องเสียบฟิลเตอร์เพิ่มเติม */}
        {extraFilters}

        {/* ด้านขวา */}
        <div className="ml-auto flex items-center gap-2">
          {onExport && <ExportSelect onExport={onExport} />}
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