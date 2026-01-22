
// src/pages/software/inventory/page.tsx
"use client";

import * as React from "react";
import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useServerTableController } from "hooks/useServerTableController";
import { useSoftwareInventory } from "hooks/useSoftwareInventory";

import type {
  AppColumnDef,
  ExportFormat,
  SimpleFilters,
  SoftwareFilters,
  SoftwareItem,
  SoftwareStatus,
  SoftwareType,
} from "types";
import { ActionToolbar } from "components/toolbar/ActionToolbar";

// ❌ ไม่ใช้ next/router ใน App Router
// import router from "next/router";

// helper: "" -> undefined
const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;

// 🔧 ปรับ label -> internal value ตามโดเมนจริง
const normalizeStatus = (s?: string): string => {
  if (!s) return "";
  const map: Record<string, string> = {
    Active: "Active",
    Expired: "Expired",
    Expiring: "Expiring",
    active: "Active",
    expired: "Expired",
    expiring: "Expiring",
  };
  return map[s] ?? s.toString();
};

const normalizeType = (t?: string): string => {
  if (!t) return "";
  const map: Record<string, string> = {
    Standard: "Standard",
    Special: "Special",
    Exception: "Exception",
    standard: "Standard",
    special: "Special",
    exception: "Exception",
  };
  return map[t] ?? t.toString();
};

export default function SoftwarePage() {
  // ฟิลเตอร์เริ่มเป็น undefined (หมายถึงไม่กรอง)
  const [filters, setFilters] = React.useState<SoftwareFilters>({
    status: undefined,
    type: undefined,
    manufacturer: undefined,
    search: "",
  });

  // (ถ้าคุณมี Selection ของตาราง ให้แทนที่ด้วย state จริง)
  const [selectedSoftwareIds, setSelectedSoftwareIds] = React.useState<string[]>([]);

  // columns
  const columns = React.useMemo<AppColumnDef<SoftwareItem>[]>(() => [
    { id: "softwareName",    header: "Software Name",     accessorKey: "softwareName",    width: 200 },
    { id: "manufacturer",    header: "Manufacturer",      accessorKey: "manufacturer",    width: 160 },
    { id: "version",         header: "Version",           accessorKey: "version",         width: 100 },
    { id: "category",        header: "Category",          accessorKey: "category",        width: 140 },
    { id: "policyCompliance",header: "Policy Compliance", accessorKey: "policyCompliance",width: 160 },
    { id: "expiryDate",      header: "Expiry Date",       accessorKey: "expiryDate",      width: 140 },
    { id: "status",          header: "Status",            accessorKey: "status",          width: 120 },
    { id: "softwareType",    header: "Software Type",     accessorKey: "softwareType",    width: 140 },
    { id: "licenseModel",    header: "License Model",     accessorKey: "licenseModel",    width: 140 },
    { id: "clientServer",    header: "Client/Server",     accessorKey: "clientServer",    width: 140 },
  ], []);

  // Bridge: Domain <-> Simple
  const toSimple = React.useCallback(
    (): SimpleFilters<SoftwareStatus, SoftwareType> => ({
      status: toUndef(filters.status as SoftwareStatus | ""),
      type: toUndef(filters.type as SoftwareType | ""),
      manufacturer: toUndef(filters.manufacturer as string | ""),
      searchText: filters.search ?? "",
    }),
    [filters],
  );

  const fromSimple = React.useCallback(
    (sf: SimpleFilters<SoftwareStatus, SoftwareType>): SoftwareFilters => ({
      status: toUndef(sf.status),
      type: toUndef(sf.type),
      manufacturer: toUndef(sf.manufacturer),
      search: sf.searchText ?? "",
    }),
    [],
  );

  // Controller
  const ctl = useServerTableController<
    SoftwareItem,
    SoftwareStatus,
    SoftwareType,
    SoftwareFilters
  >({
    pageSize: 10,
    defaultSort: { id: "softwareName", desc: false },
    domainFilters: filters,
    setDomainFilters: setFilters,
    toSimple,
    fromSimple,
    resetDeps: [filters.status, filters.type, filters.manufacturer],
  });

  // Normalize filters -> hook
  const serviceFilters = React.useMemo(
    () => ({
      status: normalizeStatus(ctl.simpleFilters.status as string | undefined),
      type: normalizeType(ctl.simpleFilters.type as string | undefined),
      manufacturer: (ctl.simpleFilters.manufacturer as string | undefined) ?? "",
      search: ctl.simpleFilters.searchText ?? "",
    }),
    [ctl.simpleFilters],
  );

  // ดึงข้อมูล
  const {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    statusOptions,
    typeOptions,
    manufacturerOptions,
  } = useSoftwareInventory(ctl.serverQuery, serviceFilters);

  // คลิกรายการ -> ไปหน้ารายละเอียด
  const getRowHref = React.useCallback(
    (row: SoftwareItem) => `/software/inventory/${row.id}`,
    [],
  );

  // Export (คุณจะเชื่อม API จริงในภายหลังได้)
  const handleExport = React.useCallback((fmt: ExportFormat) => {
    console.log("Export software format:", fmt);
    // ตัวอย่าง client-side CSV (เร็ว) หรือเรียก /api/software/export?fmt=...
    // ดูโค้ดตัวอย่าง export ที่ผมให้ในคำตอบก่อนหน้าได้เลย
  }, []);

  // ✅ Toolbar ทางขวาของ FilterBar: กำหนด path สำหรับโดเมน "software"
  const rightExtra = (
    <ActionToolbar
      selectedIds={selectedSoftwareIds}
      enableDefaultMapping={false} // ❌ ไม่ใช้ /installations/ กลาง
      to={{
        add: "/software/add",
        // ถ้าคุณมีหน้าย้าย/ผูกซอฟต์แวร์กับอย่างอื่น
        reassign: ({ selectedIds }) =>
          `/software/reassign?ids=${encodeURIComponent(selectedIds.join(","))}`,
        delete: ({ selectedIds }) =>
          `/software/delete?ids=${encodeURIComponent(selectedIds.join(","))}`,
      }}
      onAction={(act) => {
        if (act === "delete") {
          // คุณจะเปิด modal ยืนยันก็ได้
          console.log("delete selected software ids:", selectedSoftwareIds);
        }
      }}
    />
  );

  return (
    <InventoryPageShell<SoftwareItem, SoftwareStatus, SoftwareType>
      title="Software Inventory"
      breadcrumbs={[{ label: "Software Inventory", href: "/software/inventory" }]}

      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={typeOptions}
      manufacturerOptions={manufacturerOptions}
      allStatusLabel="All Status"
      allTypeLabel="All Types"
      allManufacturerLabel="All Manufacturers"
      onExport={handleExport}
      // ไม่ต้องส่ง onAction แล้ว เพราะเราใช้ ActionToolbar ด้านขวาแทน
      // onAction={handleAction}
      filterBarRightExtra={rightExtra}  // ✅ ใส่ Toolbar ทางขวา

      // DataTable
      columns={columns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={getRowHref}

      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    />
  );
}
