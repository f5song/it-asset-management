
"use client";

import React from "react";
import { InstallationDisplayRow, Filters } from "../../types/tab";
import { InstallationToolbar } from "../../components/tabbar/InstallationToolbar";
import { InstallationTable } from "../../components/tabbar/InstallationTable";

/** หา unique แบบง่าย */
function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** ฟิลเตอร์เริ่มต้น */
const defaultFilters: Filters = {
  user: "ALL",
  device: "ALL",
  status: "ALL",
  query: "",
};

type SectionProps<R> = {
  /** แถวดิบจาก context ใดๆ (Software, License ฯลฯ) */
  rows: R[];

  /** ตัวแปลงจาก R -> InstallationDisplayRow (บังคับ) */
  mapRow: (raw: R) => InstallationDisplayRow;

  /** optional: ถ้าอยากคุม options เอง ส่งมาได้; ไม่ส่งจะ derive จาก rows ให้อัตโนมัติ */
  users?: string[];
  devices?: string[];
  statuses?: Array<"Active" | "Expiring Soon" | "Expired">;

  /** Summary บนกล่อง; ไม่ส่งจะใช้จำนวนแถวหลังแปลง */
  total?: number;

  /** ใช้ reset state เมื่อ context เปลี่ยน เช่น `software-${softwareId}` / `license-${licenseId}` */
  resetKey?: string;

  /** ตั้งหน้าปัจจุบัน/ขนาด */
  initialPage?: number;
  pageSize?: number;

  /** callback จาก Toolbar */
  onExport?: (fmt: "csv" | "xlsx" | "pdf") => void;
  onAction?: (act: "delete" | "reassign" | "scan") => void;
};

export function InstallationSection<R>({
  rows,
  mapRow,
  users: usersProp,
  devices: devicesProp,
  statuses: statusesProp,
  total,
  resetKey,
  initialPage = 1,
  pageSize = 10,
  onExport,
  onAction,
}: SectionProps<R>) {
  // --- State ---
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  const [page, setPage] = React.useState<number>(initialPage);

  // --- Reset เมื่อ context เปลี่ยน ---
  React.useEffect(() => {
    setFilters(defaultFilters);
    setPage(initialPage);
  }, [resetKey, initialPage]);

  // --- แปลง rows -> displayRows ---
  const displayRows = React.useMemo<InstallationDisplayRow[]>(
    () => rows.map(mapRow),
    [rows, mapRow]
  );

  // --- Derive options ถ้า parent ไม่ส่งมา ---
  const users = React.useMemo(() => {
    if (usersProp?.length) return usersProp;
    const list = displayRows.map((r) => r.user).filter((v) => v && v !== "—");
    return uniq(list);
  }, [usersProp, displayRows]);

  const devices = React.useMemo(() => {
    if (devicesProp?.length) return devicesProp;
    const list = displayRows.map((r) => r.deviceName).filter((v) => v && v !== "—");
    return uniq(list);
  }, [devicesProp, displayRows]);

  const statuses = React.useMemo(
    () => statusesProp ?? (["Active", "Expiring Soon", "Expired"] as const),
    [statusesProp]
  );

  // --- Summary total ---
  const effectiveTotal = total ?? displayRows.length;

  return (
    <>
      <InstallationToolbar
        total={effectiveTotal}
        filters={filters}
        users={users}
        devices={devices}
        statuses={statuses as Array<"Active" | "Expiring Soon" | "Expired">}
        onFiltersChange={setFilters}
        onExport={onExport}
        onAction={onAction}
      />

      <InstallationTable
        rows={displayRows}
        filters={filters}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </>
  );
}
