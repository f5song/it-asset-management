
// src/pages/software/license-management/page.tsx (หรือไฟล์ที่คุณวางอยู่)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { ColumnDef, LicenseItem } from "../../../types";
import { useLicenseInventory } from "../../../hooks/useLicenseInventory";
import { PageHeader } from "../../../components/ui/PageHeader";
import { FilterBar, type SimpleFilters } from "../../../components/ui/FilterBar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDate } from "../../../utils/date";
import { DataTable } from "../../../components/table";
import type { ExportFormat, ToolbarAction } from "../../../types/tab";

// ----------------------------
// 1) กำหนดคอลัมน์ตาราง (ตามโดเมน License)
// ----------------------------
const columns: ColumnDef<LicenseItem>[] = [
  {
    id: "softwareName",
    header: "Software Name",
    accessorKey: "softwareName",
    width: 220,
    cell: (v, row) => (
      <a
        href={`/software/license-management/${row.id}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          color: "inherit",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        {String(v ?? "-")}
      </a>
    ),
  },
  { id: "manufacturer", header: "Manufacturer", accessorKey: "manufacturer", width: 160 },
  { id: "licenseType", header: "License Type", accessorKey: "licenseType", width: 140 },
  { id: "total", header: "Total License", accessorKey: "total", width: 120 },
  { id: "inUse", header: "In Use", accessorKey: "inUse", width: 100 },
  { id: "available", header: "Available", accessorKey: "available", width: 100 },
  {
    id: "expiryDate",
    header: "Expiry Date",
    accessorKey: "expiryDate",
    width: 140,
    cell: (v) => formatDate(typeof v === "string" ? v : undefined),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    width: 120,
    cell: (v, r) => <StatusBadge label={r.status ?? v ?? "-"} />,
  },
];

// ----------------------------
// 2) หน้า License (Client-side filtering + sorting + pagination)
// ----------------------------
export default function LicenseManagementPage() {
  /** ---------- ใช้ฮุค inventory ---------- */
  const {
    filters,
    setFilter,
    rows,
    pageSize,
    manufacturerOptions,
    licenseTypeOptions,
    statusOptions,
    total,
  } = useLicenseInventory(8); // default page size = 8

  /** ---------- ตาราง: pagination/sorting ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // เริ่มต้น sort ตามชื่อซอฟต์แวร์ (asc)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "softwareName", desc: false },
  ]);

  /** ---------- ทำให้ sorting “มีผลจริง” (client-side sort) ---------- */
  const sortedRows = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return rows;
    if (!sorting || sorting.length === 0) return rows;

    const [{ id, desc }] = sorting;
    const getVal = (r: LicenseItem) => (r as any)?.[id];

    const cmp = (a: any, b: any) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1;
      if (b == null) return 1;

      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }

      const da = new Date(a);
      const db = new Date(b);
      const aIsDate = !isNaN(da.valueOf());
      const bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return da.getTime() - db.getTime();

      return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
    };

    const copy = [...rows];
    copy.sort((ra, rb) => {
      const result = cmp(getVal(ra), getVal(rb));
      return desc ? -result : result;
    });
    return copy;
  }, [rows, sorting]);

  /** ---------- Client-side paginate หลังจาก sort แล้ว ---------- */
  const start = pagination.pageIndex * pagination.pageSize;
  const end = start + pagination.pageSize;
  const pageRows = useMemo(() => sortedRows.slice(start, end), [sortedRows, start, end]);

  /** ---------- รีเซ็ตหน้าเมื่อมีการเปลี่ยน filter / dataset ---------- */
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [filters, rows.length]);

  /** ---------- Adapter: map filters (domain) <-> FilterBar(Simple) ---------- */
  const toSimpleFilters = React.useCallback((): SimpleFilters<string, string> => {
    return {
      status: filters.status && filters.status !== "All Status" ? filters.status : undefined,
      type: filters.licenseType && filters.licenseType !== "All License Type" ? filters.licenseType : undefined,
      manufacturer:
        filters.manufacturer && filters.manufacturer !== "All manufacturer"
          ? filters.manufacturer
          : undefined,
      searchText: filters.search ?? "",
    };
  }, [filters]);

  const fromSimpleFilters = React.useCallback(
    (sf: SimpleFilters<string, string>) => {
      // แปลงกลับมาเก็บรูปแบบเดิม (ใช้สตริง "All …")
      setFilter({
        status: sf.status ?? "All Status",
        licenseType: sf.type ?? "All License Type",
        manufacturer: sf.manufacturer ?? "All manufacturer",
        search: sf.searchText ?? "",
      });
    },
    [setFilter]
  );

  const simpleFilters = useMemo(() => toSimpleFilters(), [toSimpleFilters]);

  /** ---------- Actions ---------- */
  const handleExport = (fmt: ExportFormat) => {
    // ExportFormat มักเป็น: 'csv' | 'xlsx' | 'pdf'
    console.log("Export as:", fmt.toUpperCase());
    // TODO: เรียกฟังก์ชันดาวน์โหลดจริงตาม fmt
  };

  const handleAction = (act: ToolbarAction) => {
      console.log("Add License");
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader
        title="License Management"
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
          { label: "License Management", href: "/software/license-management" },
        ]}
      />

      {/* Filter Bar — ใช้เวอร์ชัน Simple + adapter */}
      <FilterBar<string, string>
        filters={simpleFilters}
        onFiltersChange={fromSimpleFilters}
        // ❗️ไม่ต้องใส่ "All …" ใน options เพราะ FilterBar เติมเองแล้ว
        statusOptions={statusOptions as readonly string[]}
        typeOptions={licenseTypeOptions as readonly string[]}
        manufacturerOptions={manufacturerOptions as readonly string[]}
        onExport={handleExport}
        onAction={handleAction}
        // ปรับ label ให้ตรงโดเมน License
        allStatusLabel="All Status"
        allTypeLabel="All License Type"
        allManufacturerLabel="All manufacturer"
      />

      {/* DataTable */}
      <DataTable<LicenseItem>
        columns={columns}
        rows={pageRows}
        totalRows={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        variant="striped"
        emptyMessage="ไม่พบรายการ"
        isLoading={false}
        isError={false}
        errorMessage={undefined}
        maxBodyHeight={420}
        rowHref={(row) => `/software/license-management/${row.id}`}
      />
    </div>
  );
}
