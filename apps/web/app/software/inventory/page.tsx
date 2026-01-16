// src/pages/software/inventory/page.tsx (หรือที่วางอยู่)
"use client";

import React, { useMemo, useState } from "react";

import {
  ColumnDef,
  SoftwareItem,
  SoftwareStatus,
  SoftwareType,
} from "../../../types";
import { useItemsTable } from "../../../hooks/useItemsTable";
import { PageHeader } from "../../../components/ui/PageHeader";
import {
  FilterBar,
  type SimpleFilters,
} from "../../../components/ui/FilterBar";
import { DataTable } from "../../../components/table";
import { PaginationState, SortingState } from "@tanstack/react-table";
import type { ExportFormat, ToolbarAction } from "../../../types/tab";

// ----------------------------
// 1) กำหนดคอลัมน์ตาราง
// ----------------------------
const columns: ColumnDef<SoftwareItem>[] = [
  {
    id: "softwareName",
    header: "Software Name",
    accessorKey: "softwareName",
    width: 200,
  },
  {
    id: "manufacturer",
    header: "Manufacturer",
    accessorKey: "manufacturer",
    width: 160,
  },
  { id: "version", header: "Version", accessorKey: "version", width: 100 },
  { id: "category", header: "Category", accessorKey: "category", width: 140 },
  {
    id: "policyCompliance",
    header: "Policy Compliance",
    accessorKey: "policyCompliance",
    width: 160,
  },
  {
    id: "expiryDate",
    header: "Expiry Date",
    accessorKey: "expiryDate",
    width: 140,
  },
  { id: "status", header: "Status", accessorKey: "status", width: 120 },
  {
    id: "softwareType",
    header: "Software Type",
    accessorKey: "softwareType",
    width: 140,
  },
  {
    id: "licenseModel",
    header: "License Model",
    accessorKey: "licenseModel",
    width: 140,
  },
  {
    id: "clientServer",
    header: "Client/Server",
    accessorKey: "clientServer",
    width: 140,
  },
];

// ----------------------------
// 2) แปลง SortingState (v8) → legacy สำหรับ useItemsTable
// ----------------------------
function sortingToLegacy(sorting: SortingState | undefined): {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return {
    sortBy: first.id,
    sortOrder: first.desc ? "desc" : "asc",
  };
}

export default function SoftwarePage() {
  /** ---------- ฟิลเตอร์ (state แยกของหน้า) ---------- */
  const [status, setStatus] = useState<SoftwareStatus | undefined>(undefined);
  const [type, setType] = useState<SoftwareType | undefined>(undefined);
  const [mfgr, setMfgr] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState("");

  /** ---------- ตาราง ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  // v8 SortingState (array ของ column sort)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "softwareName", desc: false },
  ]);

  // ถ้าฮุคยังเป็นแบบ legacy → สร้างค่า legacySorting จาก v8
  const legacySorting = useMemo(() => sortingToLegacy(sorting), [sorting]);

  /** ---------- ดึงข้อมูลพร้อมฟิลเตอร์ ---------- */
  const { rows, totalRows, isLoading, isError, errorMessage } = useItemsTable<
    SoftwareItem,
    SoftwareStatus,
    SoftwareType
  >({
    pagination,
    // ✅ ถ้า useItemsTable รองรับ v8 แล้ว ให้ส่ง `sorting` ได้เลย และลบ `legacySorting`
    legacySorting,
    statusFilter: status,
    typeFilter: type,
    manufacturerFilter: mfgr,
    searchText,
  });

  /** ---------- Adapter: map split-state ↔ FilterBar(Simple) ---------- */
  const simpleFilters: SimpleFilters<SoftwareStatus, SoftwareType> = useMemo(
    () => ({
      status: status ?? undefined,
      type: type ?? undefined,
      manufacturer: mfgr ?? undefined,
      searchText,
    }),
    [status, type, mfgr, searchText]
  );

  const handleSimpleChange = (
    next: SimpleFilters<SoftwareStatus, SoftwareType>
  ) => {
    // อัปเดต state แยกให้ตรงกับค่าใน FilterBar(Simple)
    setStatus(next.status ?? undefined);
    setType(next.type ?? undefined);
    setMfgr(next.manufacturer ?? undefined);
    setSearchText(next.searchText ?? "");
    // เคสนี้เราไม่ได้ใช้ "ALL" string ใด ๆ → ตรงกับ FilterBar(Simple)
  };

  /** ---------- Action handlers ---------- */
  const handleExport = (fmt: ExportFormat) => {
    const upper = fmt.toUpperCase() as "CSV" | "XLSX" | "PDF";
    console.log("Export as:", upper);

    // ตัวอย่างการเรียกจริง
    // if (fmt === 'csv') downloadCSV();
    // else if (fmt === 'xlsx') downloadXLSX();
    // else if (fmt === 'pdf') downloadPDF();
  };

  const handleAction = (act: ToolbarAction) => {
    // ตัวอย่าง: กดจาก ActionSelect
    console.log("Action:", act);
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader
        title="Software Inventory"
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
        ]}
      />

      {/* Filter Bar (Simple + adapter) */}
      <FilterBar<SoftwareStatus, SoftwareType>
        filters={simpleFilters}
        onFiltersChange={handleSimpleChange}
        statusOptions={["Active", "Expired", "Expiring"]}
        typeOptions={["Standard", "Special", "Exception"]}
        manufacturerOptions={["Adobe", "Autodesk", "Microsoft"]}
        onExport={handleExport}
        onAction={handleAction}
        // (เลือกได้) ปรับข้อความป้าย "All ..." ได้
        allStatusLabel="All Status"
        allTypeLabel="All Types"
        allManufacturerLabel="All Manufacturers"
      />

      {/* DataTable */}
      <DataTable<SoftwareItem>
        columns={columns}
        rows={rows}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        variant="striped"
        emptyMessage="ไม่พบรายการ"
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        maxBodyHeight={420}
      />
    </div>
  );
}
