// src/types/employees.ts

import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";

/** สถานะพนักงาน (string union เหมือนกับโดเมนอื่น ๆ ในระบบ) */
export type EmployeeStatus = "Active" | "Inactive" | "OnLeave" | "Resigned";

/** ฟิลเตอร์ของโดเมน Employees (ให้รูปแบบเหมือน device) */
export type EmployeeDomainFilters = {
  department?: string;
  status?: EmployeeStatus;
  search?: string;
};

/** ข้อมูลพนักงานหนึ่งรายการ (align กับ DeviceItem) */
export type EmployeeItem = {
  id: string;
  name: string;
  department?: string;
  status: EmployeeStatus;
  email?: string;
  jobTitle?: string;
  phone?: string;
  device?: string | null;
};

/**
 * Query มาตรฐานสำหรับ service รายการพนักงาน
 * ใช้มาตรฐานเดียวกับ Device/Software/License:
 * - pagination: OffsetPaginationParams
 * - search: Searchable
 * - filters: EmployeeDomainFilters
 */
export type EmployeesListQuery =
  OffsetPaginationParams &
  Searchable &
  EmployeeDomainFilters;

/** Response ของรายการพนักงาน */
export type EmployeesListResponse = OffsetPage<EmployeeItem>;

/** ฟิลเตอร์แบบ UI (FilterBar) — ตั้งให้เหมือน device (custom shape) */
export type EmployeesFilterValues = {
  status?: EmployeeStatus;
  department?: string;
  search?: string;
};

/** ใช้ในฟอร์มแก้ไข/สร้าง (align กับ device ฝั่งฟอร์ม) */
export interface EmployeesEditValues {
  name: string;
  department?: string;
  status: string;      // เก็บเป็น string ให้เข้ากับ input control; map เป็น EmployeeStatus ที่ชั้น service/action
  phone?: string;
  jobTitle?: string;
  device?: string;
}