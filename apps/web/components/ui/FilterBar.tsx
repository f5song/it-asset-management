// src/components/ui/FilterBar.tsx
"use client";
import React from "react";
import { ExportSelect } from "./ExportSelect";
import { SelectField } from "./SelectField";
import { MultiSelectField } from "./MultiSelectField";
import { SearchInput } from "./SearchInput";
import type { ExportFormat, FilterValues, ToolbarAction } from "types";

export type FilterBarProps<TStatus extends string, TType extends string> = {
  filters?: FilterValues<TStatus, TType>;
  onFiltersChange: (next: FilterValues<TStatus, TType>) => void;

  statusOptions?: readonly string[];
  typeOptions?: readonly string[];
  manufacturerOptions?: readonly string[];

  labels?: {
    status?: string;
    type?: string;
    manufacturer?: string;
    searchPlaceholder?: string;
    allStatus?: string;
    allType?: string;
    allManufacturer?: string;
    clear?: string;
  };

  onExport?: (fmt: ExportFormat) => void;
  onAction?: (act: ToolbarAction) => void;
  rightExtra?: React.ReactNode;
  extraFilters?: React.ReactNode;
  onClearFilters?: () => void;

  // Multi (optional)
  statusSelected?: readonly TStatus[];
  onStatusSelectedChange?: (values: readonly TStatus[]) => void;

  typeSelected?: readonly TType[];
  onTypeSelectedChange?: (values: readonly TType[]) => void;

  manufacturerSelected?: readonly string[];
  onManufacturerSelectedChange?: (values: readonly string[]) => void;
};

export function FilterBar<TStatus extends string, TType extends string>({
  filters,
  onFiltersChange,
  statusOptions = [],
  typeOptions = [],
  manufacturerOptions = [],

  labels,
  onExport,
  rightExtra,
  extraFilters,
  onClearFilters,

  statusSelected,
  onStatusSelectedChange,
  typeSelected,
  onTypeSelectedChange,
  manufacturerSelected,
  onManufacturerSelectedChange,
}: FilterBarProps<TStatus, TType>) {
  const {
    status: statusLabel = "Status",
    type: typeLabel = "Type",
    manufacturer: manufacturerLabel = "Manufacturer",
    searchPlaceholder = "Search",
    allStatus = "All Statuses",
    allType = "All Types",
    allManufacturer = "All Manufacturers",
    clear: clearLabel = "Clear",
  } = labels ?? {};

  const hasStatus = statusOptions.length > 0;
  const hasType = typeOptions.length > 0;
  const hasManufacturer = manufacturerOptions.length > 0;

  const ALL = "__ALL__" as const;
  const makeOptions = React.useCallback(
    (allLabel: string, list: readonly string[], includeAll = true) => [
      ...(includeAll ? [{ label: allLabel, value: ALL }] : []),
      ...list.map((v) => ({ label: v, value: v })),
    ],
    [],
  );

  // single-mode options → มี ALL item
  const statusSelectOptions = React.useMemo(
    () => makeOptions(allStatus, statusOptions, !statusSelected),
    [allStatus, statusOptions, statusSelected, makeOptions],
  );
  const typeSelectOptions = React.useMemo(
    () => makeOptions(allType, typeOptions, !typeSelected),
    [allType, typeOptions, typeSelected, makeOptions],
  );
  const manufacturerSelectOptions = React.useMemo(
    () =>
      makeOptions(allManufacturer, manufacturerOptions, !manufacturerSelected),
    [allManufacturer, manufacturerOptions, manufacturerSelected, makeOptions],
  );

  const safeFilters = filters ?? ({} as FilterValues<TStatus, TType>);
  const patch = <K extends keyof FilterValues<TStatus, TType>>(
    key: K,
    value: FilterValues<TStatus, TType>[K],
  ) => onFiltersChange({ ...safeFilters, [key]: value });

  const statusValue = (filters?.status ?? ALL) as string;
  const typeValue = (filters?.type ?? ALL) as string;
  const manufacturerValue = (filters?.manufacturer ?? ALL) as string;

  // type predicate helpers (ปลอดภัย + TS happy)
  const isTStatus = React.useCallback(
    (s: string): s is TStatus =>
      (statusOptions as readonly string[]).includes(s),
    [statusOptions],
  );
  const isTType = React.useCallback(
    (s: string): s is TType => (typeOptions as readonly string[]).includes(s),
    [typeOptions],
  );
  const isManufacturer = React.useCallback(
    (s: string): s is string =>
      (manufacturerOptions as readonly string[]).includes(s),
    [manufacturerOptions],
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center flex-wrap">
        {/* Status */}
        {hasStatus &&
          (Array.isArray(statusSelected) ? (
            <MultiSelectField
              label={statusLabel}
              srOnlyLabel
              options={statusOptions.map((s) => ({ label: s, value: s }))}
              value={[...statusSelected]}
              onChange={(arr) =>
                onStatusSelectedChange?.(arr.filter(isTStatus))
              }
              placeholder={allStatus}
            />
          ) : (
            <SelectField
              label={statusLabel}
              srOnlyLabel
              value={statusValue}
              options={statusSelectOptions}
              onChange={(v) =>
                patch("status", !v || v === ALL ? undefined : (v as TStatus))
              }
            />
          ))}

        {/* Type / Department */}
        {hasType &&
          (Array.isArray(typeSelected) ? (
            <MultiSelectField
              label={typeLabel}
              srOnlyLabel
              options={typeOptions.map((s) => ({ label: s, value: s }))}
              value={[...typeSelected]}
              onChange={(arr) => onTypeSelectedChange?.(arr.filter(isTType))}
              placeholder={allType}
            />
          ) : (
            <SelectField
              label={typeLabel}
              srOnlyLabel
              value={typeValue}
              options={typeSelectOptions}
              onChange={(v) =>
                patch("type", !v || v === ALL ? undefined : (v as TType))
              }
            />
          ))}

        {/* Manufacturer */}
        {hasManufacturer &&
          (Array.isArray(manufacturerSelected) ? (
            <MultiSelectField
              label={manufacturerLabel}
              srOnlyLabel
              options={manufacturerOptions.map((s) => ({ label: s, value: s }))}
              value={[...manufacturerSelected]}
              onChange={(arr) =>
                onManufacturerSelectedChange?.(arr.filter(isManufacturer))
              }
              placeholder={allManufacturer}
            />
          ) : (
            <SelectField
              label={manufacturerLabel}
              srOnlyLabel
              value={manufacturerValue}
              options={manufacturerSelectOptions}
              onChange={(v) =>
                patch(
                  "manufacturer",
                  !v || v === ALL ? undefined : (v as string),
                )
              }
            />
          ))}

        {extraFilters}
        {onClearFilters && (
          <button
            type="button"
            className="h-10 rounded border border-slate-300 px-3 text-sm"
            onClick={onClearFilters}
          >
            {clearLabel}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {onExport && <ExportSelect onExport={onExport} />}
          {rightExtra}
        </div>
      </div>

      <SearchInput
        value={filters?.search ?? ""}
        onChange={(q) => onFiltersChange({ ...safeFilters, search: q })}
        placeholder={searchPlaceholder}
      />
    </div>
  );
}
