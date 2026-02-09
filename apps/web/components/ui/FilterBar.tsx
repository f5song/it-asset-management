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

  /** ✅ กำหนด “ลำดับที่ต้องมาก่อน” ต่อฟิลด์ เช่น { status: ["Active", "Inactive"] } */
  optionOrder?: Partial<{
    status: readonly string[];
    type: readonly string[];
    manufacturer: readonly string[];
  }>;

  /** ✅ ฟังก์ชัน sort ขั้นสูงต่อฟิลด์ (ถ้ามีจะ override optionOrder) */
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
  onAction,
  rightExtra,
  extraFilters,

  optionOrder,
  optionSort,
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

  // ---------- helpers: order & sort ----------
  const reorderByPriority = (
    items: readonly string[],
    priority?: readonly string[],
  ) => {
    if (!priority || priority.length === 0) return [...items];
    const set = new Set(items);
    const head: string[] = [];
    const tail: string[] = [];

    // ดึงตัวที่อยู่ใน priority มาไว้หัว แต่อยู่เฉพาะที่มีจริงใน items
    for (const p of priority) {
      if (set.has(p)) {
        head.push(p);
        set.delete(p);
      }
    }
    // ที่เหลือเรียงตามลำดับเดิม
    for (const it of items) {
      if (set.has(it)) tail.push(it);
    }
    return [...head, ...tail];
  };

  const buildSelectOptions = React.useCallback(
    (
      raw: readonly string[],
      allLabel: string,
      field: "status" | "type" | "manufacturer",
    ) => {
      let list = [...raw];

      // 1) ถ้ามี optionSort[field] ใช้เป็น comparator
      const cmp = optionSort?.[field];
      if (typeof cmp === "function") {
        list.sort(cmp);
      } else {
        // 2) ถ้าไม่มี comparator ใช้ optionOrder[field] เป็น priority list
        const priority = optionOrder?.[field];
        list = reorderByPriority(list, priority);
      }

      // ใส่ ALL ไว้หัวเสมอ
      return [
        { label: allLabel, value: "ALL" },
        ...list.map((s) => ({ label: s, value: s })),
      ];
    },
    [optionOrder, optionSort],
  );

  // เตรียม options ให้ SelectField เฉพาะฟิลด์ที่มีข้อมูล
  const statusSelectOptions = React.useMemo(
    () =>
      hasStatus ? buildSelectOptions(statusOptions, allStatus, "status") : [],
    [hasStatus, statusOptions, allStatus, buildSelectOptions],
  );

  const typeSelectOptions = React.useMemo(
    () => (hasType ? buildSelectOptions(typeOptions, allType, "type") : []),
    [hasType, typeOptions, allType, buildSelectOptions],
  );

  const manufacturerSelectOptions = React.useMemo(
    () =>
      hasManufacturer
        ? buildSelectOptions(
            manufacturerOptions,
            allManufacturer,
            "manufacturer",
          )
        : [],
    [hasManufacturer, manufacturerOptions, allManufacturer, buildSelectOptions],
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

  // ภายใน FilterBar
  React.useEffect(() => {
    if (statusSelectOptions.length) {
      console.log(
        "[FilterBar] statusSelectOptions:",
        statusSelectOptions.map((o) => o.label),
      );
    }
  }, [statusSelectOptions]);
  
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
