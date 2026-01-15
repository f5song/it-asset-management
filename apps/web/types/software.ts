import { LicenseModel, LicenseType } from "./license";


// src/types/software.ts
export type SoftwareStatus = 'Active' | 'Expired' | 'Expiring';
export type Compliance = 'Compliant' | 'Non-compliant' | 'Pending';
export type PolicyCompliance = 'Allowed' | 'Not Allowed';
export type SoftwareType = 'Standard' | 'Special' | 'Exception';

export type ClientServer = 'Client' | 'Server';



export type SoftwareFilters = {
  manufacturer?: string;
  status?: SoftwareStatus;
};

// src/types/software.ts
export type ItemsQuery<S extends string = SoftwareStatus, T extends string = SoftwareType> = {
  page: number; // 1-based
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: S;
  typeFilter?: T;
  manufacturerFilter?: string;
  searchText?: string;
};


export type SoftwareItem = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  expiryDate?: string | null; // ISO date string, optional
  status: SoftwareStatus;
  licenseModel: LicenseModel;
  compliance: Compliance;
  policyCompliance: PolicyCompliance;
  softwareType: SoftwareType;
  clientServer: ClientServer;
  licenseType: LicenseType;
}

export type InstallationRow = {
  id: string;
  device: string;
  user: string;
  date: string;
  version: string;
};

export type HistoryEvent = {
  id: string;
  title: string;
  actor: string;
  date: string;
};

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
