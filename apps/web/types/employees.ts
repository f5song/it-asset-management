// src/types/employees.ts

import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";

/** สถานะพนักงาน (string union เหมือนกับโดเมนอื่น ๆ ในระบบ) */
export type EmployeeStatus = "Active" | "Resigned";

/** ฟิลเตอร์ของโดเมน Employees (ให้รูปแบบเหมือน device) */
export type EmployeeDomainFilters = {
  type?: string;
  status?: EmployeeStatus;
  search?: string;
  
};
export type EmployeeType = "Contract" | "Permanent";

export interface EmployeeItem {
  /** Primary key (อ้างอิงในระบบ) */
  id: string;

  /** ===== ชื่อ-นามสกุล (ไทย/อังกฤษ) ===== */
  firstNameTh?: string;
  lastNameTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;

  /** ===== ข้อมูลสถานะ/งาน/ติดต่อ ===== */
  status: EmployeeStatus;
  empType?: EmployeeType; // Employee Type
  email?: string;
  phone?: string;
  position?: string; // ตำแหน่ง/ระดับ (อีกชื่อหนึ่ง ถ้าแยกใช้)
  company?: string;
  department?: string;
  section?: string;
  unit?: string;

  /** อุปกรณ์หลักที่ผูกกับพนักงาน (ถ้ามี) */
  device?: string | null;
}

/**
 * Query มาตรฐานสำหรับ service รายการพนักงาน
 * ใช้มาตรฐานเดียวกับ Device/Software/License:
 * - pagination: OffsetPaginationParams
 * - search: Searchable
 * - filters: EmployeeDomainFilters
 */
export type EmployeesListQuery = OffsetPaginationParams &
  Searchable &
  EmployeeDomainFilters;

/** Response ของรายการพนักงาน */
export type EmployeesListResponse = OffsetPage<EmployeeItem>;

/** ฟิลเตอร์แบบ UI (FilterBar) — ตั้งให้เหมือน device (custom shape) */
export type EmployeesFilterValues = {
  status?: EmployeeStatus;
  /** ใช้กับ FilterBar: ใช้ type เป็น department ใน UI */
  type?: string;
  search?: string;
};

/** ใช้ในฟอร์มแก้ไข/สร้าง (align กับ device ฝั่งฟอร์ม) */
export interface EmployeesEditValues {
  /** ===== ชื่อ-นามสกุล (ไทย/อังกฤษ) ===== */
  firstNameTh?: string;
  lastNameTh?: string;

  /** ===== ข้อมูลสถานะ/งาน/ติดต่อ ===== */
  status: EmployeeStatus;
  empType?: EmployeeType; // Employee Type
  phone?: string; // ตำแหน่งงาน (text)
  position?: string; // ตำแหน่ง/ระดับ (อีกชื่อหนึ่ง ถ้าแยกใช้)
  company?: string;
  department?: string;
  section?: string;
  unit?: string;

  /** อุปกรณ์หลักที่ผูกกับพนักงาน (ถ้ามี) */
  device?: string | null;
}
