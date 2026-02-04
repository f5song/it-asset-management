// src/types/assign.ts
import type { ISODateString } from "./common";
import { EmployeeItem } from "./employees";
import type { LicenseItem } from "./license";

// โหมดการทำงาน
export type AssignMode = "licenseToEmployee" | "employeeToLicense";

// โหนดที่ต้องใช้บ่อย
export type Id = string;

// โครง payload ฝั่ง License → Employee (มีอยู่แล้วในโปรเจกต์พี่)
export type AssignRow = {
  employeeId: string;
  deviceCount?: number;  // ถ้า per_device
  decision?: "Allowed" | "NeedsReview" | "Restricted";
  exception?: boolean;
  reason?: string;
};

export type LicenseAssignFormValues = {
  licenseId: string;
  employees: EmployeeItem[];
  mapping: AssignRow[];
  seatMode: "partial" | "all-or-nothing";
  installedOn: ISODateString; // YYYY-MM-DD
};

// ✅ โครง payload ใหม่ ฝั่ง Employee → License
export type EmployeeLicenseMap = {
  licenseId: string;
  deviceCount?: number;      // ถ้า per_device
  deviceIds?: string[];      // รายชื่อเครื่องจริง (optional)
};

export type EmployeeAssignFormValues = {
  employeeId: string;
  licenses: {
    item: LicenseItem;
    map: EmployeeLicenseMap;
  }[];
  seatMode: "partial" | "all-or-nothing";
  installedOn: ISODateString;
};

// ตัวช่วย interface ส่งค่าเพิ่ม (เช่น mapping device)
export type AssignExtras = {
  deviceIdsByEmployee?: Record<string, string[]>; // license → employee โหมด
  deviceIdsByLicense?: Record<string, string[]>;  // employee → license โหมด
};

// กลยุทธ์ seat: ให้ common utils ใช้
export type SeatCountUnit = {
  licenseId: string;  // ไลเซนส์ที่ใช้ที่นั่ง
  amount: number;     // จำนวนที่นั่งที่กินจริง
};