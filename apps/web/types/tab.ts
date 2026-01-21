import { ClientServer, Compliance, LicenseStatus, SoftwareStatus, SoftwareType } from "types";


// src/components/installation/types.ts
export type Filters = {
  user: string | "ALL";
  device: string | "ALL";
  status: "Active" | "Expiring Soon" | "Expired" | "ALL";
  query: string;
};

export type ExportFormat = "csv" | "xlsx" | "pdf";
export type ToolbarAction = "delete" | "reassign" | "scan";

export type Option = { label: string; value: string };

// src/components/installation/types.ts
export type InstallationDisplayRow = {
  id: string;
  deviceName: string;
  workStation: string;
  user: string;
  licenseKey: string;
  licenseStatus: "Active" | "Expiring Soon" | "Expired";
  scannedLicenseKey: string;
};

export type AssigenedDisplayRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  expiryDate: string;
  AssignedDate: string;
  softwareId?: string;          // เช่น 'SW-3DSMAX', 'SW-AUTO-001'
  softwareName?: string;  
  status: LicenseStatus;   
};

export type BundledSoftwareRow = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  expiryDate?: string | null; // ISO date string, optional
  status: SoftwareStatus;
  policyCompliance: Compliance;
  softwareType: SoftwareType;
  clientServer: ClientServer;
};

