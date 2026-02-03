// src/types/device.ts

import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";
import type { Compliance } from "./software";

/** กลุ่ม/ประเภท/OS ของอุปกรณ์ในระบบ */
export type DeviceGroup = "Assigned" | "Unassigned";
export type DeviceType = "Laptop" | "Desktop" | "VM" | "Mobile";
export type DeviceOS = "Windows" | "macOS" | "Linux" | "iOS" | "Android";

/** ฟิลเตอร์ของโดเมน Device */
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
  type: DeviceType;
  assignedTo?: string | null;
  os: DeviceOS;
  compliance?: Compliance;
  lastScan?: string | null; // ISO datetime string
};

/**
 * Query มาตรฐานสำหรับ service รายการอุปกรณ์
 * ใช้มาตรฐานเดียวกับ Software / License:
 * - pagination: OffsetPaginationParams
 * - search: Searchable
 * - filters: DeviceDomainFilters
 */
export type DeviceListQuery =
  OffsetPaginationParams &
  Searchable &
  DeviceDomainFilters;

/** Response ของรายการอุปกรณ์ */
export type DeviceListResponse = OffsetPage<DeviceItem>;

/** ซอฟต์แวร์ที่ bundle อยู่ในอุปกรณ์ */
export type DeviceBundledSoftware = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  policyCompliance?: "Compliant" | "Non-Compliant" | "Exception" | "Unknown";
  licenseStatus?: "Licensed" | "Unlicensed" | "Expired" | "Trial" | "Unknown";
  lastScan?: string | null;
};

/** Query รายการซอฟต์แวร์ในอุปกรณ์ */
export type DeviceSoftwareQuery =
  OffsetPaginationParams &
  Searchable & {
    sortBy?: "softwareName" | "manufacturer" | "version" | "category" | "lastScan";
    sortOrder?: "asc" | "desc";
    manufacturer?: string;
    category?: string;
    compliance?: string;
  };

export type DeviceSoftwareResponse = OffsetPage<DeviceBundledSoftware>;

/** ฟิลเตอร์แบบ UI */
export type DeviceFilterValues = {
  status?: DeviceGroup;       // alias of group
  type?: DeviceType;
  manufacturer?: string;
  search?: string;        // UI อาจยังใช้ชื่อนี้ได้
};

/** ใช้ในฟอร์มแก้ไข/สร้าง */
export interface DeviceEditValues {
  name: string;
  type: string;
  assignedTo?: string;
  os: string;
  compliance: string;
  lastScan?: string;
}