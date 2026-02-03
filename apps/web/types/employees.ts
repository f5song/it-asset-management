// src/types/employees.ts

import type { FilterValues, OffsetPage, OffsetPaginationParams, Searchable } from "./common";

export enum EmployeeStatus {
  Active = "Active",
  Inactive = "Inactive",
  Contractor = "Contractor",
  Intern = "Intern",
}

export type Employees = {
  id: string;
  name: string;
  department: string;
  status: EmployeeStatus;
  email: string;
  jobTitle: string;
  phone: string;
  device: string;
};

/** ฟิลเตอร์ของ Employees (มาตรฐานเดียวกับระบบ: ใช้ search) */
export type EmployeesFilters = {
  department?: string;
  status?: EmployeeStatus;
  search?: string;
};

/** ค่าที่ใช้ตอนแก้ไข/สร้าง (สำหรับฟอร์ม) */
export interface EmployeesEditValues {
  name: string;
  department?: string;
  status: string;      // เก็บเป็น string ให้เข้ากับ input control; map เป็น enum ในชั้น service/action
  phone?: string;
  jobTitle?: string;
  device?: string;
}

/**
 * ฟิลเตอร์แบบ UI (FilterBar) ใช้มาตรฐาน FilterValues<TStatus, TType>
 * - ในโดเมน Employees ไม่มี type ชัดเจน ⇒ ให้ใช้ string หรือ never ก็ได้
 *   ถ้าอยาก strict กว่า แนะนำใช้ never (จะไม่มี field type ใน UI)
 */
export type EmployeesFilterValues = FilterValues<EmployeeStatus, string>; 
// หรือถ้าอยาก strict มากขึ้น: export type EmployeesFilterValues = FilterValues<EmployeeStatus, never>;

/** ✅ Query สำหรับ list (pagination + search + filters) */
export type EmployeesListQuery =
  OffsetPaginationParams &
  Searchable &
  EmployeesFilters;

/** ✅ Response สำหรับ list (รูปแบบเดียวกับโดเมนอื่น) */
export type EmployeesListResponse = OffsetPage<Employees>;