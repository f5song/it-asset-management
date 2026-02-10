// src/types/software.ts
import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";
import type { LicenseModel } from "./license";

/** ===== Enums / Unions ===== */
export type Compliance = "Compliant" | "Non-Compliant";
export type SoftwareType = "Standard" | "Special";
export type ClientServer = "Client" | "Server";

/** ===== ฟิลเตอร์หน้า Software (UI-level เบา ๆ) ===== */
export type SoftwareFilters = {
  manufacturer?: string;       // single
  type?: SoftwareType;         // single
  search?: string;
};

/** ===== ฟิลเตอร์ฝั่งโดเมน/Service (superset ของ SoftwareFilters) ===== */
export type SoftwareDomainFilters = {
  manufacturer?: string;       // single
  manufacturers?: string[];    // multi
  type?: SoftwareType;
  compliance?: Compliance;
  clientServer?: ClientServer;
  licenseModel?: LicenseModel;

  search?: string;

  /** ช่วงวันหมดอายุ (ISO: YYYY-MM-DD) */
  expiryFrom?: string;
  expiryTo?: string;
};

/** ===== แถวข้อมูล ===== */
export type SoftwareItem = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  expiryDate?: string | null;

  policyCompliance: Compliance;
  softwareType: SoftwareType;
  clientServer: ClientServer;
  licenseModel: LicenseModel;

  /** (optional) KPI/รายงาน */
  seatsPurchased?: number;
  seatsUsed?: number;
  costPerSeat?: number;
};

/** ===== ฟอร์ม ===== */
export interface SoftwareEditValues {
  softwareName: string;
  manufacturer?: string;
  version?: string;
  category: string;
  licenseModel: string;
  policyCompliance: string;
}

/** ===== แถว installation ===== */
export interface InstallationRow {
  id: string;
  deviceName?: string;
  userName?: string;
  licenseStatus?: string;
  licenseKey?: string;
  scannedLicenseKey?: string;
  workStation?: string;
}

/** ===== Query มาตรฐาน (ใช้กับ service/list) =====
 * ⛳️ ปรับปรุง: รวม SoftwareDomainFilters + sorting fields
 */
export type SoftwareListQuery = OffsetPaginationParams &
  Searchable &
  SoftwareDomainFilters & {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    /** กรณี backend รองรับ raw ordering (เช่น CASE WHEN) */
    orderByRaw?: string[];
  };

/** ===== Response แบบแบ่งหน้า ===== */
export type SoftwareListResponse = OffsetPage<SoftwareItem>;

/** ===== ฟิลเตอร์บน FilterBar (UI) =====
 * ใช้ 'type' เป็น manufacturer (single) เพื่อสอดคล้องกับ FilterBar ของระบบคุณ
 */
export type SoftwareFilterValues = {
  type?: string; // manufacturer (single)
  search?: string;
  /** ถ้าต้องการในอนาคต: status?: "Active" | "Expired" | ... */
};

/** ===== สรุป KPI ของรายงาน ===== */
export type SoftwareReportSummary = {
  totalSoftwares: number;
  totalManufacturers: number;
  totalStandard: number;
  totalSpecial: number;
  totalClient: number;
  totalServer: number;
  nonCompliantCount: number;
  expiringIn30Days: number;
  totalCostEstimated?: number;
};