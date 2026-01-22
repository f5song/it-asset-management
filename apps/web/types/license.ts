
// types/license.ts

import { Employees } from "./employees";
import { Compliance } from "./software";

/** ฟิลเตอร์สำหรับหน้า License Management */
export type LicenseFilters = {
  manufacturer?: string;
  /** สถานะของ License */
  status?: LicenseStatus; // ใช้ enum value เพื่อให้สอดคล้องกับ UI และคอลัมน์
  // ถ้าอนาคตต้องการกรองตามประเภท license ให้เปิดบรรทัดล่างนี้:
  licenseModel?: LicenseModel;
  search?: string;
};

/** โมเดลลิขสิทธิ์ (ระดับสินค้า/ซอฟต์แวร์) — ใช้ในโดเมน Software มากกว่า */
export enum LicenseModel {
  "Per-User" = 'Per-User' ,
  "Per-Device" = 'Per-Device',
  Perpetual = 'Perpetual',
  Subscription= 'Subscription'

} 

/** สถานะของ License บน UI (ตรงกับสีที่โชว์ในตาราง) */
export enum LicenseStatus {
  Active = 'Active',
  Pending = 'Pending',
  Expired = 'Expired',
}

/** ประเภทสัญญา/โมเดลลิขสิทธิ์ (ระดับ License) */


/** รายการ license ที่ใช้ในตาราง License Management */
export interface LicenseItem {
  id: string;
  softwareName: string;
  compliance: Compliance;
  manufacturer: string;
  licenseModel: LicenseModel;
  total: number;
  inUse: number;
  available: number;
  expiryDate: string;
  status: LicenseStatus;
}


export type LicenseAction =
  | "Assign"
  | "Deallocate"
  | "Request Approved"
  | "Request Rejected";

export type LicenseActivity = {
  date: string | Date;     // วันที่ (สามารถเป็น Date หรือ string)
  action: LicenseAction;   // การกระทำ
  software: string;        // ชื่อซอฟต์แวร์
  employee: string;        // ชื่อพนักงาน
};


export type ConsumptionUnit = "perUser" | "perDevice" | "concurrent";
export type LicenseTerm = "subscription" | "perpetual" | "unknown";

export type LicenseSummary = {
  id: string;
  productName: string;
  vendor?: string;
  licenseModel: string; // raw เช่น "Per-User" / "Per-Device" / "Subscription ..."
  total: number;
  inUse: number;
  available: number;
  expiryDate?: string;
  // normalized
  consumptionUnit: ConsumptionUnit;
  term: LicenseTerm;
};



// types สำหรับฟอร์ม (ปรับ path ให้ตรงกับโปรเจกต์คุณ)
export type PolicyDecision = "Allowed" | "NeedsReview" | "Restricted";

export type AssignRow = {
  employeeId: string;
  deviceCount?: number;
  decision?: PolicyDecision;
  exception?: boolean;
  reason?: string;
};

export type LicenseAssignFormValues = {
  licenseId: string;
  employees: Employees[];       // หรือ Employees[]
  mapping: AssignRow[];
  seatMode: "partial" | "all-or-nothing";
  installedOn: string;    // YYYY-MM-DD
};
