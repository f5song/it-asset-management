// src/components/installation/types.ts
export type InstallationFilters = {
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

