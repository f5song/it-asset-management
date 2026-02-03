// src/types/software.ts
import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";
import type { LicenseModel } from "./license";

export type SoftwareStatus = "Active" | "Expired" | "Expiring";
export type Compliance = "Compliant" | "Non-Compliant" | "Pending" | "Exception";
export type SoftwareType = "Standard" | "Special" | "Exception";
export type ClientServer = "Client" | "Server";

/** ฟิลเตอร์หน้า Software */
export type SoftwareFilters = {
  manufacturer?: string;
  status?: SoftwareStatus;
  type?: SoftwareType;
  search?: string;
};

export type SoftwareItem = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  expiryDate?: string | null; 
  status: SoftwareStatus;
  policyCompliance: Compliance;
  softwareType: SoftwareType;
  clientServer: ClientServer;
  licenseModel: LicenseModel;
};

export interface SoftwareEditValues {
  softwareName: string;
  manufacturer?: string;
  version?: string;
  category: string;
  licenseModel: string;
  policyCompliance: string;
}

export interface InstallationRow {
  id: string;
  deviceName?: string;
  userName?: string;
  licenseStatus?: string;
  licenseKey?: string;
  scannedLicenseKey?: string;
  workStation?: string;
}

/** Query มาตรฐาน (รวม pagination, sorting, searching, filters) */
export type SoftwareListQuery =
  OffsetPaginationParams &
  Searchable &
  SoftwareFilters;

/** Response แบบแบ่งหน้า */
export type SoftwareListResponse = OffsetPage<SoftwareItem>;