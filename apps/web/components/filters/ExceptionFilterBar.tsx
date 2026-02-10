"use client";

import * as React from "react";
import { FilterBar } from "@/components/ui/FilterBar";
import type { FilterValues } from "types";
import type { ExceptionDomainFilters, PolicyStatus } from "@/types/exception";

/** UI filters ที่หน้า Employee → Exception ใช้งาน */
export type ExceptionUIFilters = {
  status?: PolicyStatus;
  search?: string;
};

type Props = {
  /** UI filters (ของหน้านี้) */
  filters: ExceptionUIFilters;
  onFiltersChange: (next: ExceptionUIFilters) => void;

  /** options ของสถานะนโยบาย */
  statusOptions?: readonly PolicyStatus[];

  /** ปรับข้อความ label */
  labels?: {
    status?: string;
    searchPlaceholder?: string;
    allStatus?: string;
  };

  /** เสียบส่วน UI ฝั่งขวา / เพิ่มฟิลเตอร์พิเศษ */
  rightExtra?: React.ReactNode;
  extraFilters?: React.ReactNode;
};

export default function ExceptionFilterBar({
  filters,
  onFiltersChange,
  statusOptions = ["Active", "Inactive"],
  labels,
  rightExtra,
  extraFilters,
}: Props) {
  // map UI → FilterValues<TStatus, TType>
  const fbFilters: FilterValues<PolicyStatus, string> = {
    status: filters.status,
    type: undefined,              // ไม่มี type สำหรับ exception
    manufacturer: undefined,      // ไม่มี manufacturer
    search: filters.search ?? "",
  };

  // on change: map กลับเป็น UI filters
  const handleChange = (next: FilterValues<PolicyStatus, string>) => {
    onFiltersChange({
      status: next.status ?? undefined,
      search: next.search ?? "",
    });
  };

  return (
    <FilterBar<PolicyStatus, string>
      filters={fbFilters}
      onFiltersChange={handleChange}
      statusOptions={statusOptions}
      // ไม่มี type/manufacturer → ไม่ส่งหรือส่ง [] ก็ได้
      typeOptions={[]}
      manufacturerOptions={[]}
      labels={{
        status: labels?.status ?? "Status",
        searchPlaceholder: labels?.searchPlaceholder ?? "Search exception definitions",
        allStatus: labels?.allStatus ?? "All Status",
      }}
      rightExtra={rightExtra}
      extraFilters={extraFilters}
    />
  );
}