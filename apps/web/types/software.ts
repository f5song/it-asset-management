
// src/types/software.ts
import type { LicenseModel } from "./license";

export type SoftwareStatus = "Active" | "Expired" | "Expiring";
export type Compliance = "Compliant" | "Non-Compliant" | "Pending";
export type SoftwareType = "Standard" | "Special" | "Exception";
export type ClientServer = "Client" | "Server";

/** ฟิลเตอร์หน้า Software */
export type SoftwareFilters = {
  manufacturer?: string;
  status?: SoftwareStatus | string;
  type?: SoftwareType | string;
  search?: string;
};

export type SoftwareItem = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  expiryDate?: string | null;      // ISO date
  status: SoftwareStatus;
  policyCompliance: Compliance;
  softwareType: SoftwareType;
  clientServer: ClientServer;
  licenseModel: LicenseModel;
};
