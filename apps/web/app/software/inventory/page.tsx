
// src/pages/software/inventory/page.tsx
"use client";

import * as React from "react";
import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { useServerTableController } from "hooks/useServerTableController";
import { useSoftwareInventory } from "hooks/useSoftwareInventory";
import type {
  ColumnDef,
  SimpleFilters,
  SoftwareFilters,
  SoftwareItem,
  SoftwareStatus,
  SoftwareType
} from "types";

const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;

// 🔧 ปรับให้ค่าจาก UI (label) -> internal value ที่ service คาดหวัง
// ปรับ mapping ตามโดเมนจริงของโปรเจกต์คุณ
const normalizeStatus = (s?: string): string => {
  if (!s) return "";
  const map: Record<string, string> = {
    Active: "Active",
    Expired: "Expired",
    Expiring: "Expiring",
  };
  return map[s] ?? s.toLowerCase();
};

const normalizeType = (t?: string): string => {
  if (!t) return "";
  const map: Record<string, string> = {
    "Standard": "Standard",
    "Special": "Special",
    "Exception": "Exception",
  };
  return map[t] ?? t.toLowerCase();
};

export default function SoftwarePage() {
  // ฟิลเตอร์เริ่มเป็น undefined เพื่อสื่อว่า "ไม่กรอง"
  const [filters, setFilters] = React.useState<SoftwareFilters>({
    status: undefined,
    type: undefined,
    manufacturer: undefined,
    search: "",
  });

  // columns memo
  const columns = React.useMemo<ColumnDef<SoftwareItem>[]>(() => [
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
  ], []);

  // bridge: Domain <-> Simple (strongly-typed)
  const toSimple = React.useCallback(
    (): SimpleFilters<SoftwareStatus, SoftwareType> => ({
      status: toUndef(filters.status as SoftwareStatus | ""),
      type: toUndef(filters.type as SoftwareType | ""),
      manufacturer: toUndef(filters.manufacturer as string | ""),
      searchText: filters.search ?? "",
    }),
    [filters]
  );

  const fromSimple = React.useCallback(
    (sf: SimpleFilters<SoftwareStatus, SoftwareType>): SoftwareFilters => ({
      status: toUndef(sf.status),
      type: toUndef(sf.type),
      manufacturer: toUndef(sf.manufacturer),
      search: sf.searchText ?? "",
    }),
    []
  );

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
    // เลือกรีเซ็ตเฉพาะเมื่อ status/type/manufacturer เปลี่ยน
    resetDeps: [filters.status, filters.type, filters.manufacturer],
  });

  // ✅ แปลง simpleFilters -> service filters (normalize)
  const serviceFilters = React.useMemo(
    () => ({
      status: normalizeStatus(ctl.simpleFilters.status as string | undefined),
      type: normalizeType(ctl.simpleFilters.type as string | undefined),
      manufacturer: (ctl.simpleFilters.manufacturer as string | undefined) ?? "",
      search: ctl.simpleFilters.searchText ?? "",
    }),
    [ctl.simpleFilters]
  );

  // ✅ เรียก hook พร้อมส่ง filters เข้าไปด้วย (เหมือนหน้า License)
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

  const getRowHref = React.useCallback(
    (row: SoftwareItem) => `/software/inventory/${row.id}`,
    []
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
