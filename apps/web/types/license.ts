// src/types/license.ts
import type { Compliance } from "./software";
import type { ISODateString, OffsetPage, OffsetPaginationParams } from "./common";
import type { Employees } from "./employees";

/** โมเดลลิขสิทธิ์ (ระดับสินค้า/ซอฟต์แวร์) */
export type LicenseModel = "Per-User" | "Per-Device" | "Perpetual" | "Subscription";

// ถ้าต้องการให้รองรับ "Expiring" ด้วย (mock คุณใช้)
export type LicenseStatus = "Active" | "Expired" | "Expiring";
/** หน่วยการบริโภค */
export type ConsumptionUnit = "perUser" | "perDevice" | "concurrent";

/** อายุสัญญา */
export type LicenseTerm = "subscription" | "perpetual" | "unknown";

/** ฟิลเตอร์หน้า License (ใช้มาตรฐานเดียวกับทั้งระบบ) */
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
  licenseModel: LicenseModel; // "Per-User" | "Per-Device" | "Perpetual" | "Subscription"
  perType: "per_user" | "per_device"; // เก็บไว้ให้ UI ใช้สะดวก (derive จาก LicenseModel ได้ แต่เก็บตรง ๆ ก็โอเค)
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

/** ✅ Query/Response สำหรับ License (หน้าตาเหมือน Software) */
export type LicenseListQuery = OffsetPaginationParams & {
  // ถ้าคุณมี Searchable แยกใน common เช่น:
  // export type Searchable = { search?: string }
  // ก็สามารถทำ: OffsetPaginationParams & Searchable & LicenseFilters
  // แต่ถ้ายังไม่มี ให้รวม search ลงใน LicenseFilters (เราทำไว้แล้วข้างบน)
} & LicenseFilters;

export type LicenseListResponse = OffsetPage<LicenseItem>;

export type LicenseSummary = {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  warning: number;
  unknown: number;
  seatsTotal: number;
  seatsUsed: number;
  seatsAvailable: number;
  byModel: Record<string, number>;
  byManufacturer: Record<string, number>;
};
