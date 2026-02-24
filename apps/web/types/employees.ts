import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";

/** สถานะพนักงาน (string union เหมือนกับโดเมนอื่น ๆ ในระบบ) */
export type EmployeeStatus = "Active" | "Resigned";

/** ประเภทพนักงาน (ถ้ามีการใช้งานในระบบ) */
export type EmployeeType = "Contract" | "Permanent";

/** คีย์ sort ที่ FE จะใช้ (map ไปคอลัมน์จริงใน backend ได้ภายหลัง) */
export type EmployeeSortKey =
  | "id"
  | "firstNameTh"
  | "lastNameTh"
  | "firstNameEn"
  | "lastNameEn"
  | "company"
  | "department"
  | "section"
  | "unit"
  | "position"
  | "email"
  | "phone"
  | "beginDate"
  | "resignDate"
  | "updatedAt"
  | "status"
  | "status_priority"; // เคสพิเศษ: เรียง Active -> Resigned

/** รูปแบบ sort รวม */
export type SortParam = {
  col?: EmployeeSortKey | string;      // เผื่อ backend รองรับคีย์อื่น ๆ
  desc?: boolean;
};

/** ฟิลเตอร์ของโดเมน Employees (ให้รูปแบบเหมือน device) */
export type EmployeeDomainFilters = {
  /** ใช้กับ FilterBar: ใช้ type เป็น department ใน UI */
  type?: string;
  status?: EmployeeStatus;
  search?: string;
  excludeAssignedForExceptionId?: number; //   add
};

/** โครงข้อมูลแถวพนักงานสำหรับตาราง/หน้ารายการ */
export interface EmployeeItem {
  /** Primary key (อ้างอิงในระบบ) */
  id: string;

  /** ===== ชื่อ-นามสกุล (ไทย/อังกฤษ) ===== */
  firstNameTh?: string;
  lastNameTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;

  /** ===== ข้อมูลสถานะ/งาน/ติดต่อ ===== */
  status: EmployeeStatus | "Unknown";
  empType?: EmployeeType; // Employee Type
  email?: string | null;
  phone?: string | null;
  position?: string | null; // ตำแหน่ง/ระดับ
  company?: string | null;
  department?: string | null;
  section?: string | null;
  unit?: string | null;

  /** อุปกรณ์หลักที่ผูกกับพนักงาน (ถ้ามี) */
  device?: string | null;

  /** วันที่สำคัญ (รองรับจาก backend ที่คุณให้ตัวอย่างมา) */
  beginDate?: string | null;   // ISO (yyyy-mm-dd)
  resignDate?: string | null;  // ISO
  updatedAt?: string | null;   // ISO
}

/**
 * Query มาตรฐานสำหรับ service รายการพนักงาน
 * - pagination: OffsetPaginationParams (เช่น pageIndex/pageSize) หรือจะใส่ page (1-based) ก็ได้
 * - search: Searchable
 * - filters: EmployeeDomainFilters
 * - sort: รองรับทั้งแบบแยก (sortBy/sortOrder) และรวม (sort:{col,desc})
 */
export type EmployeesListQuery =
  & OffsetPaginationParams
  & Searchable
  & EmployeeDomainFilters
  & {
      /** แบบแยก (เช่นมาจาก DataTable) */
      sortBy?: EmployeeSortKey | string;
      sortOrder?: "asc" | "desc";
      /** แบบรวม (ทางเลือก) */
      sort?: SortParam;
      /** เผื่อกรณีใช้ page 1-based */
      page?: number;
      
    };

/** Response ของรายการพนักงาน */
export type EmployeesListResponse = OffsetPage<EmployeeItem>;

/** ฟิลเตอร์แบบ UI (FilterBar) — ตั้งให้เหมือน device (custom shape) */
export type EmployeesFilterValues = {
  status?: EmployeeStatus;
  /** ใช้กับ FilterBar: ใช้ type เป็น department ใน UI */
  type?: string;
  search?: string;
  excludeAssignedForExceptionId?: number; //   add
};

/** ใช้ในฟอร์มแก้ไข/สร้าง (align กับ device ฝั่งฟอร์ม) */
export interface EmployeesEditValues {
  /** ===== ชื่อ-นามสกุล (ไทย/อังกฤษ) ===== */
  firstNameTh?: string;
  lastNameTh?: string;

  /** ===== ข้อมูลสถานะ/งาน/ติดต่อ ===== */
  status: EmployeeStatus;
  empType?: EmployeeType; // Employee Type
  phone?: string;         // ช่องกรอกเบอร์
  position?: string;      // ตำแหน่ง/ระดับ
  company?: string;
  department?: string;
  section?: string;
  unit?: string;

  /** อุปกรณ์หลักที่ผูกกับพนักงาน (ถ้ามี) */
  device?: string | null;
}