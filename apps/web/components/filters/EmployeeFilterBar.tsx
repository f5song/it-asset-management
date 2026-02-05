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
  const fbFilters: FilterValues<EmployeeStatus, string> = {
    status: filters.status,
    type: filters.department ?? undefined,
    manufacturer: undefined,
    search: filters.search ?? "",
  };

  const handleChange = (next: FilterValues<EmployeeStatus, string>) => {
    onFiltersChange({
      status: next.status ?? undefined,
      department: (next.type as string | undefined) ?? undefined,
      search: next.search ?? "",
    });
  };

  return (
    <FilterBar<EmployeeStatus, string>
      filters={fbFilters}
      onFiltersChange={handleChange}
      statusOptions={statusOptions as unknown as readonly string[]}
      typeOptions={departmentOptions as unknown as readonly string[]}
      manufacturerOptions={[]}
      labels={{
        status: labels?.status ?? "Status",
        type: labels?.type ?? "Department",
        searchPlaceholder: labels?.searchPlaceholder ?? "Search employees",
        allStatus: labels?.allStatus ?? "All Status",
        allType: labels?.allType ?? "All Departments",
      }}
      rightExtra={rightExtra}
      extraFilters={extraFilters}
    />
  );
}