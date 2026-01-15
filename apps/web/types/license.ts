
// types/license.ts

import { Compliance } from "./software";

/** ฟิลเตอร์สำหรับหน้า License Management */
export type LicenseFilters = {
  /** ผู้ขาย/ผู้ผลิต (vendor) */
  vendor?: string;
  /** สถานะของ License */
  status?: LicenseStatus; // ใช้ enum value เพื่อให้สอดคล้องกับ UI และคอลัมน์
  // ถ้าอนาคตต้องการกรองตามประเภท license ให้เปิดบรรทัดล่างนี้:
  // licenseType?: LicenseType;
};

/** โมเดลลิขสิทธิ์ (ระดับสินค้า/ซอฟต์แวร์) — ใช้ในโดเมน Software มากกว่า */
export type LicenseModel = 'Free' | 'Paid' | 'Perpetual' | 'Subscription';

/** สถานะของ License บน UI (ตรงกับสีที่โชว์ในตาราง) */
export enum LicenseStatus {
  Active = 'Active',
  Pending = 'Pending',
  Expired = 'Expired',
}

/** ประเภทสัญญา/โมเดลลิขสิทธิ์ (ระดับ License) */


// ใช้ enum (มีค่า runtime)
export enum LicenseType {
  PerUser = 'Per User',
  PerDevice = 'Per Device',
  Subscription = 'Subscription',
  Perpetual = 'Perpetual',
}

// ใช้ได้: ดึง options จาก enum
export const LICENSE_TYPE_OPTIONS =
  Object.values(LicenseType) as readonly LicenseType[];


/** รายการ license ที่ใช้ในตาราง License Management */
export interface LicenseItem {
  id: string;
  softwareName: string;
  compliance: Compliance;
  manufacturer: string;
  licenseType: LicenseType;
  total: number;
  inUse: number;
  available: number;
  expiryDate: string;
  status: LicenseStatus;
}

export type AssigenedRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  expiryDate: string;
  AssignedDate: string;
  softwareId?: string;          // เช่น 'SW-3DSMAX', 'SW-AUTO-001'
  softwareName?: string;  
  status: LicenseStatus;   

};