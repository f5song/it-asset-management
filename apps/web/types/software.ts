// src/types/software.ts
import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";
import type { LicenseModel } from "./license";


export type Compliance = "Compliant" | "Non-Compliant";
export type SoftwareType = "Standard" | "Special";
export type ClientServer = "Client" | "Server";

/** ฟิลเตอร์หน้า Software */
export type SoftwareFilters = {
  manufacturer?: string;
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