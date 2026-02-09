"use client";

import * as React from "react";
import { FilterBar } from "@/components/ui/FilterBar";
import type { FilterValues } from "types";
import type { EmployeeStatus, EmployeesFilterValues } from "@/types/employees";

type Props = {
  /** ใช้ filters ของ UI ฝั่ง Employee (EmployeesFilterValues = { status?, department?, search? }) */
  filters: EmployeesFilterValues;
  onFiltersChange: (next: EmployeesFilterValues) => void;

  /** options */
  statusOptions?: readonly EmployeeStatus[];
  departmentOptions?: readonly string[];

  labels?: {
    status?: string;
    type?: string; // ใช้แทน department บน FilterBar
    searchPlaceholder?: string;
    allStatus?: string;
    allType?: string; // All Departments
  };

  rightExtra?: React.ReactNode;
  extraFilters?: React.ReactNode;
};

export default function EmployeeFilterBar({
  filters,
  onFiltersChange,
  statusOptions = ["Active", "Resigned"],
  departmentOptions = [],
  labels,
  rightExtra,
  extraFilters,
}: Props) {
  // map UI → FilterValues<TStatus, TType> (department → type)
  const fbFilters: FilterValues<EmployeeStatus, string> = React.useMemo(
    () => ({
      status: filters.status,                    // undefined = All
      type: filters.department ?? undefined,     // map department -> type
      manufacturer: undefined,
      search: filters.search ?? "",
    }),
    [filters.status, filters.department, filters.search]
  );

  const handleChange = React.useCallback(
    (next: FilterValues<EmployeeStatus, string>) => {
      onFiltersChange({
        status: next.status ?? undefined,
        department: (next.type as string | undefined) ?? undefined,
        search: next.search ?? "",
      });
    },
    [onFiltersChange]
  );

  // labels (default + merge)
  const mergedLabels = React.useMemo(
    () => ({
      status: labels?.status ?? "Status",
      type: labels?.type ?? "Department",
      searchPlaceholder: labels?.searchPlaceholder ?? "Search employees",
      allStatus: labels?.allStatus ?? "All Status",
      allType: labels?.allType ?? "All Departments",
    }),
    [labels]
  );

  // แปลงเป็น readonly string[] (ไม่ต้อง as unknown as)
  const statusOptsAsString = React.useMemo(
    () => statusOptions.map(s => s as string) as readonly string[],
    [statusOptions]
  );
  const deptOptsAsString = React.useMemo(
    () => departmentOptions.map(d => d as string) as readonly string[],
    [departmentOptions]
  );

  return (
    <FilterBar<EmployeeStatus, string>
      filters={fbFilters}
      onFiltersChange={handleChange}
      statusOptions={statusOptsAsString}
      typeOptions={deptOptsAsString}
      manufacturerOptions={[]}
      labels={mergedLabels}
      rightExtra={rightExtra}
      extraFilters={extraFilters}
      optionOrder={{
        status: ["Active", "Resigned"],
        // ถ้าต้องการให้บาง department ขึ้นหัวก่อน ก็เพิ่มตรงนี้ได้:
        // type: ["Engineering", "HR"],
      }}
    />
  );
}
