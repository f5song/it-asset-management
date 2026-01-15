
"use client";

import React, { useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { ColumnDef, DataTable } from "../../../components/table/DataTable";
import { SoftwareItem, SoftwareStatus, SoftwareType } from "../../../types";
import { useItemsTable } from "../../../hooks/useItemsTable";
import { PageHeader } from "../../../components/ui/PageHeader";
import { FilterBar } from "../../../components/ui/FilterBar";


// ----------------------------
// 1) กำหนดคอลัมน์ตาราง
// ----------------------------
const columns: ColumnDef<SoftwareItem>[] = [
  { id: "softwareName", header: "Software Name", accessorKey: "softwareName", width: 200 },
  { id: "manufacturer", header: "Manufacturer", accessorKey: "manufacturer", width: 160 },
  { id: "version", header: "Version", accessorKey: "version", width: 100 },
  { id: "category", header: "Category", accessorKey: "category", width: 140 },
  { id: "policyCompliance", header: "Policy Compliance", accessorKey: "policyCompliance", width: 160 },
  { id: "expiryDate", header: "Expiry Date", accessorKey: "expiryDate", width: 140 },
  { id: "status", header: "Status", accessorKey: "status", width: 120 },
  { id: "softwareType", header: "Software Type", accessorKey: "softwareType", width: 140 },
  { id: "licenseModel", header: "License Model", accessorKey: "licenseModel", width: 140 },
  { id: "clientServer", header: "Client/Server", accessorKey: "clientServer", width: 140 },
];

// ----------------------------
// 2) แปลง SortingState (v8) → legacy สำหรับ useItemsTable (ถ้าฮุคยังใช้แบบเดิม)
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
  /** ---------- ฟิลเตอร์ ---------- */
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
  const {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
  } = useItemsTable<SoftwareItem, SoftwareStatus, SoftwareType>({
    pagination,
    // ✅ ถ้า useItemsTable รองรับ v8 แล้ว ให้ส่ง `sorting` ได้เลย และลบ `legacySorting`
    // sorting,
    legacySorting,            // ❗ ถ้าฮุคยังรับแบบ legacy ให้ใช้บรรทัดนี้
    statusFilter: status,
    typeFilter: type,
    manufacturerFilter: mfgr,
    searchText,
  });

  /** ---------- Action handlers ---------- */
  const handleExport = (fmt: "CSV" | "XLSX" | "PDF") => {
    console.log("Export as:", fmt);
  };
  const handleAddSoftware = () => {
    console.log("Add Software clicked");
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader
        title="Software Inventory"
        breadcrumbs={[{ label: "Software Inventory", href: "/software/inventory" }]}
      />

      {/* Filter Bar (generic) */}
      <FilterBar<SoftwareStatus, SoftwareType>
        statusFilter={status}
        setStatusFilter={setStatus}
        typeFilter={type}
        setTypeFilter={setType}
        manufacturerFilter={mfgr}
        setManufacturerFilter={setMfgr}
        searchText={searchText}
        setSearchText={setSearchText}
        onExport={handleExport}
        onAdd={() => handleAddSoftware()}
        // ⬇️ สามารถปรับ options ได้ตามโดเมนจริงของคุณ
        statusOptions={["Active", "Expired", "Expiring"]}
        typeOptions={["Standard", "Special", "Exception"]}
        manufacturerOptions={["Adobe", "Autodesk", "Microsoft"]}
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
