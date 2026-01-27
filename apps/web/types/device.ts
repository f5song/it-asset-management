
// src/types/device.ts

import { FilterValues, OffsetPage, OffsetPaginationParams } from "./common";
import type { Compliance } from "./software";

/** ประเภท/กลุ่ม/OS */
export type DeviceGroup = "Assigned" | "Unassigned";
export type DeviceType = "Laptop" | "Desktop" | "VM" | "Mobile";
export type DeviceOS = "Windows" | "macOS" | "Linux" | "iOS" | "Android";

export type DeviceDomainFilters = {
  deviceGroup?: DeviceGroup;
  deviceType?: DeviceType;
  os?: DeviceOS;
  search?: string;
};


/** อุปกรณ์หนึ่งรายการ */
export type DeviceItem = {
  id: string;
  name: string;
  type: DeviceType;     // ✅ ตรึง
  assignedTo?: string | null;
  os: DeviceOS;         // ✅ ตรึง
  compliance?: Compliance;
  lastScan?: string | null;
};


/** Query มาตรฐานสำหรับรายการอุปกรณ์ (internal) */
export type DeviceListQuery = OffsetPaginationParams & {
  search?: string;
  deviceGroup?: string;
  deviceType?: string | "";
  os?: string | "";
};

/** Response สำหรับรายการอุปกรณ์ */
export type DeviceListResponse = OffsetPage<DeviceItem>;

/** Bundled Software ต่ออุปกรณ์ */
export type DeviceBundledSoftware = {
  id: string; // software id
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  policyCompliance?: "Compliant" | "Non-Compliant" | "Exception" | "Unknown";
  licenseStatus?: "Licensed" | "Unlicensed" | "Expired" | "Trial" | "Unknown";
  lastScan?: string | null;
};

export type DeviceSoftwareQuery = OffsetPaginationParams & {
  sortBy?: "softwareName" | "manufacturer" | "version" | "category" | "lastScan";
  sortOrder?: "asc" | "desc";
  search?: string;
  manufacturer?: string;
  category?: string;
  compliance?: string;
};

export type DeviceSoftwareResponse = OffsetPage<DeviceBundledSoftware>;

// ✅ ADDED: ฟิลเตอร์ฝั่งโดเมน (ใช้กับ hook/service)


// ✅ ADDED: ฟิลเตอร์แบบ UI (ใช้กับ FilterBar/InventoryPageShell)
export type DeviceFilterValues = FilterValues<DeviceGroup, DeviceType>;


export interface DeviceEditValues {
  name: string;
  type: string;
  assignedTo?: string;
  os: string;
  compliance: string;
  lastScan?: string;  // ใช้ string เพราะ <input type="date"> ส่งค่า string (YYYY-MM-DD)
}
export type DeviceFilterState = {
  // เก็บค่า "All …" เพื่อใช้กับ UI ปัจจุบัน
  deviceGroup: DeviceGroup | "All Device";
  deviceType: DeviceType | "All Type";
  os: DeviceOS | "All OS";
  search: string;
};