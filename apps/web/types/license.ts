// src/types/license.ts
import type { Compliance } from "./software";
import type { ISODateString } from "./common";
import type { Employees } from "./employees";

/** โมเดลลิขสิทธิ์ (ระดับสินค้า/ซอฟต์แวร์) */
export enum LicenseModel {
  "Per-User" = "Per-User",
  "Per-Device" = "Per-Device",
  Perpetual = "Perpetual",
  Subscription = "Subscription",
}

/** สถานะของ License */
export enum LicenseStatus {
  Active = "Active",
  Expired = "Expired",
}

/** หน่วยการบริโภค */
export type ConsumptionUnit = "perUser" | "perDevice" | "concurrent";

/** อายุสัญญา */
export type LicenseTerm = "subscription" | "perpetual" | "unknown";

/** ฟิลเตอร์หน้า License */
export type LicenseFilters = {
  manufacturer?: string;
  status?: LicenseStatus;
  licenseModel?: LicenseModel;
  search?: string;
};

/** รายการ License (ข้อมูลหลัก) */
export interface LicenseItem {
  id: string;
  softwareName: string;
  manufacturer: string;

  // ใช้สำหรับการ Assign
  licenseModel: LicenseModel; // "Per-User" | "Per-Device" | ...
  perType: "per_user" | "per_device"; // แปลงจาก LicenseModel เพื่อใช้งานใน UI
  sku?: string;
  edition?: string;
  version?: string;
  consumptionUnit: ConsumptionUnit; // seat/device/instance/core...
  term: LicenseTerm; // subscription/perpetual/unknown

  // จำนวน seat
  total: number;
  inUse: number;
  available: number;

  // วงจรสัญญา
  expiryDate: ISODateString;
  status: LicenseStatus;
  contractId?: string;
  costCenter?: string;
  purchaseDate?: ISODateString;
  renewDate?: ISODateString;

  // Compliance
  compliance: Compliance;

  // Metadata
  createdAt?: string;
  updatedAt?: string;

  cost: number;
  maintenanceCost: number;
  notes: string;
  licenseKey: string;
}

/** กิจกรรมที่เกี่ยวกับ License */
export type LicenseAction =
  | "Assign"
  | "Deallocate"
  | "Request Approved"
  | "Request Rejected";

export type LicenseActivity = {
  date: string | Date; // อนุญาตทั้ง Date และ string
  action: LicenseAction;
  software: string;
  employee: string;
};

/** ใช้ในฟอร์ม Assign */
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
  employees: Employees[];
  mapping: AssignRow[];
  seatMode: "partial" | "all-or-nothing";
  installedOn: ISODateString; // YYYY-MM-DD
};

export type LicenseEditValues = {
  productName: string;
  licenseKey: string;
  licenseModel: LicenseModel;
  total: number;
  inUse: number;
  expiryDate: string; // <input type=date> compatible
  status: LicenseStatus;
  manufacturer: string;
  licenseCost?: number;
  maintenanceCost?: number;
  notes?: string;
};
