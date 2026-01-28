// src/types/device.ts

import type { FilterValues, OffsetPage, OffsetPaginationParams } from "./common";
import type { Compliance } from "./software";

/** กลุ่ม/ประเภท/OS ของอุปกรณ์ (โดเมน) */
export type DeviceGroup = "Assigned" | "Unassigned";
export type DeviceType = "Laptop" | "Desktop" | "VM" | "Mobile";
export type DeviceOS = "Windows" | "macOS" | "Linux" | "iOS" | "Android";

/**
 * ฟิลเตอร์ฝั่งโดเมน (ใช้ในตัว hook/service/mappers)
 * - ไม่มีค่าพิเศษ "All …" (ให้ UI จัดการเอง)
 */
export type DeviceDomainFilters = {
  deviceGroup?: DeviceGroup;
  deviceType?: DeviceType;
  os?: DeviceOS;
  search?: string;
};

/** อุปกรณ์หนึ่งรายการ (โดเมนหลักของหน้า Devices) */
export type DeviceItem = {
  id: string;
  name: string;
  type: DeviceType;
  assignedTo?: string | null;
  os: DeviceOS;
  compliance?: Compliance;
  lastScan?: string | null; // ISO string
};

/**
 * Query มาตรฐานสำหรับ service รายการอุปกรณ์ (API ภายในของคุณ)
 * - ใช้ OffsetPaginationParams เป็นฐาน
 * - ฟิลด์ filter ใช้ชนิดเดียวกับโดเมน
 */
export type DeviceListQuery = OffsetPaginationParams & {
  search?: string;
  deviceGroup?: DeviceGroup;
  deviceType?: DeviceType;
  os?: DeviceOS;
};

/** Response ของ service รายการอุปกรณ์ */
export type DeviceListResponse = OffsetPage<DeviceItem>;

/** ซอฟต์แวร์ที่ bundle อยู่ในอุปกรณ์ (สำหรับแท็บ/หน้ารายละเอียด) */
export type DeviceBundledSoftware = {
  id: string; // software id
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  policyCompliance?: "Compliant" | "Non-Compliant" | "Exception" | "Unknown";
  licenseStatus?: "Licensed" | "Unlicensed" | "Expired" | "Trial" | "Unknown";
  lastScan?: string | null; // ISO string
};

/** Query รายการซอฟต์แวร์ของอุปกรณ์ */
export type DeviceSoftwareQuery = OffsetPaginationParams & {
  sortBy?: "softwareName" | "manufacturer" | "version" | "category" | "lastScan";
  sortOrder?: "asc" | "desc";
  search?: string;
  manufacturer?: string;
  category?: string;
  compliance?: string;
};

/** Response รายการซอฟต์แวร์ของอุปกรณ์ */
export type DeviceSoftwareResponse = OffsetPage<DeviceBundledSoftware>;

/**
 * ฟิลเตอร์แบบ UI (ใช้กับ FilterBar/InventoryPageShell)
 * - ใช้มาตรฐาน FilterValues<TStatus, TType> ร่วมกับระบบตาราง
 * - status = DeviceGroup, type = DeviceType
 * - manufacturer ช่องนี้ปล่อยว่างไว้สำหรับบางหน้าที่ต้องใช้ (หน้า Device ไม่จำเป็น)
 */
export type DeviceFilterValues = FilterValues<DeviceGroup, DeviceType>;

/**
 * ค่าที่ใช้ตอนแก้ไข/สร้าง Device (สำหรับฟอร์ม)
 * - ใช้ string ตรงกับ input control (เช่น <input type="date"> ให้ string YYYY-MM-DD)
 * - map/validate ไปเป็นโดเมนจริงในชั้น service/action
 */
export interface DeviceEditValues {
  name: string;
  type: string;
  assignedTo?: string;
  os: string;
  compliance: string;
  lastScan?: string;
}
