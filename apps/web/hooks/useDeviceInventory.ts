
"use client";

import * as React from "react";
import { DeviceItem } from "../types/device";
import { SortingState } from "@tanstack/react-table";


// ฟิลเตอร์ในโดเมน Device (สอดคล้องกับภาพ)
// ใช้สตริง "All ..." เป็นค่าเริ่มต้น (align กับหน้า License)
export type DeviceFilters = {
  deviceGroup: string; // เช่น Laptop/Desktop/Mobile (หรือ Group ตามโดเมนจริง)
  deviceType: string;  // ตัวอย่าง: Corporate/BYOD (ปรับตามระบบจริง)
  os: string;          // Windows 11, Windows 10, macOS 14, ...
  search: string;
};

// data จำลอง (เปลี่ยนเป็น fetch จริงได้)
const MOCK: DeviceItem[] = [
  { id: "DEV-001", name: "LAPTOP-TH-BKK-01", type: "Laptop",  assignedTo: "Puttaraporn Jitpranee", os: "Windows 11", compliance: "Compliant",     lastScan: "2014-10-10" },
  { id: "DEV-002", name: "DESKTOP-HQ-ENG-02", type: "Desktop", assignedTo: "Puttaraporn Jitpranee", os: "Windows 10", compliance: "Compliant",     lastScan: "2014-10-10" },
  { id: "DEV-003", name: "MACBOOK-HR-03",     type: "Laptop",  assignedTo: "Puttaraporn Jitpranee", os: "macOS 14",    compliance: "Pending",       lastScan: "2014-10-10" },
  { id: "DEV-004", name: "LAPTOP-INT-04",     type: "Laptop",  assignedTo: "Puttaraporn Jitpranee", os: "Windows 11", compliance: "Non-compliant", lastScan: "2014-10-10" },
  { id: "DEV-005", name: "MACBOOK-HR-04",     type: "Mobile",  assignedTo: "Puttaraporn Jitpranee", os: "macOS 14",    compliance: "Pending",       lastScan: "2014-10-10" },
  { id: "DEV-006", name: "MACBOOK-HR-05",     type: "Mobile",  assignedTo: "Puttaraporn Jitpranee", os: "macOS 14",    compliance: "Compliant",     lastScan: "2014-10-10" },
  { id: "DEV-007", name: "LAPTOP-INT-05",     type: "Laptop",  assignedTo: "Puttaraporn Jitpranee", os: "Windows 11", compliance: "Pending",       lastScan: "2014-10-10" },
  { id: "DEV-008", name: "LAPTOP-INT-06",     type: "Laptop",  assignedTo: "Puttaraporn Jitpranee", os: "Windows 10", compliance: "Non-compliant", lastScan: "2014-10-10" },
  { id: "DEV-009", name: "DESKTOP-HQ-ENG-07", type: "Desktop", assignedTo: "Puttaraporn Jitpranee", os: "Windows 11", compliance: "Compliant",     lastScan: "2014-10-10" },
];

export function useDeviceInventory(defaultPageSize = 8) {
  // ฟิลเตอร์เริ่มต้น (เหมือนภาพ)
  const [filters, setFilters] = React.useState<DeviceFilters>({
    deviceGroup: "All Device",
    deviceType: "All Type",
    os: "All OS",
    search: "",
  });

  // ออปชันของแต่ละฟิลเตอร์ (ดึงจาก data จริง/คอนฟิกได้)
  const deviceGroupOptions = React.useMemo(() => ["Laptop", "Desktop", "Mobile"] as const, []);
  const deviceTypeOptions  = React.useMemo(() => ["Corporate", "BYOD"] as const, []); // ตัวอย่าง ปรับตามโดเมนจริง
  const osOptions          = React.useMemo(() => ["Windows 11", "Windows 10", "macOS 14"] as const, []);

  // กรองข้อมูล (client-side)
  const filtered = React.useMemo(() => {
    return MOCK.filter((r) => {
      // Device (map กับ status ใน FilterBar)
      if (filters.deviceGroup !== "All Device" && r.type !== filters.deviceGroup) return false;

      // Type (map กับ type ใน FilterBar) — ตัวอย่าง: Corporate/BYOD
      // ถ้าโดเมนจริงยังไม่มี field นี้ ให้ข้าม/หรือ map จาก name pattern/metadata อื่น
      if (filters.deviceType !== "All Type") {
        // ตัวอย่าง: แบ่ง group แบบง่ายจากชื่อ (Demo เท่านั้น)
        const isCorporate = r.name.toUpperCase().includes("HQ") || r.name.toUpperCase().includes("INT");
        const tag = isCorporate ? "Corporate" : "BYOD";
        if (tag !== filters.deviceType) return false;
      }

      // OS (map กับ manufacturer ใน FilterBar)
      if (filters.os !== "All OS" && r.os !== filters.os) return false;

      // Search
      const q = filters.search.trim().toLowerCase();
      if (q) {
        const hay = `${r.id} ${r.name} ${r.assignedTo} ${r.os}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [filters]);

  // pagination info
  const pageSize = defaultPageSize;
  const total = filtered.length;

  // expose helper for partial update (เหมือน useLicenseInventory)
  const setFilter = (partial: Partial<DeviceFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  return {
    filters,
    setFilter,
    rows: filtered,
    pageSize,
    deviceGroupOptions: Array.from(deviceGroupOptions),
    deviceTypeOptions: Array.from(deviceTypeOptions),
    osOptions: Array.from(osOptions),
    total,
  };
}

export function sortingToLegacy(sorting: SortingState | undefined): {
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