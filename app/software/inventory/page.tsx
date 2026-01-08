"use client";
// src/pages/ItemsPage.tsx
import React, { useState } from "react";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { useItemsTable } from "@/hooks/useItemsTable";
import { Item, ItemStatus } from "@/mock/mockSoftware";
import { PaginationState, SortingState } from "@/types/table";
import { SoftwareType } from "@/mock/types";

const columns: ColumnDef<Item>[] = [
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
  // เพิ่มคอลัมน์จากภาพที่สอง
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

export default function SoftwarePage() {
  // ---------- ฟิลเตอร์ (single source of truth) ----------
  const [status, setStatus] = useState<ItemStatus | undefined>(undefined);
  const [type, setType] = useState<SoftwareType | undefined>();
  const [mfgr, setMfgr] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");

  // ---------- ตาราง ----------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  const [sorting, setSorting] = useState<SortingState<Item>>({
    sortBy: "softwareName",
    sortOrder: "asc",
  });

  // ---------- ดึงข้อมูลพร้อมฟิลเตอร์ ----------
  const { rows, totalRows, isLoading, isError, errorMessage } = useItemsTable({
    pagination,
    sorting,
    statusFilter: status,
    typeFilter: type,
    manufacturerFilter: mfgr,
    searchText,
  });

  // ---------- Action handlers ----------
  const handleExport = (fmt: "CSV" | "XLSX" | "PDF") => {
    // TODO: ใส่ logic export จริง (client หรือ server)
    console.log("Export as:", fmt);
  };

  const handleAddSoftware = () => {
    // TODO: เปิด modal หรือไปหน้า create
    console.log("Add Software clicked");
  };
  console.log("Test", type, mfgr);
  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-3xl font-semibold mb-6">Software Inventory</h1>

      {/* Filter Bar แบบในภาพ */}

      <FilterBar
        statusFilter={status}
        setStatusFilter={setStatus}
        typeFilter={type}
        setTypeFilter={setType}
        manufacturerFilter={mfgr}
        setManufacturerFilter={setMfgr}
        searchText={searchText}
        setSearchText={setSearchText}
        onExport={handleExport}
        onAddSoftware={handleAddSoftware}
      />

      {/* เอา status dropdown เดิมออก เพราะซ้ำกับ FilterBar */}
      {/* ถ้าต้องการคงไว้ ให้ทำให้ sync กับ state เดียวกัน (status) */}

      <DataTable<Item>
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
        maxBodyHeight={420} // ถ้าตารางยาวจะ scroll แนวตั้ง
      />
    </div>
  );
}
