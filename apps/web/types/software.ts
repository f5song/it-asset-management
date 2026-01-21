import type { LicenseModel } from "./license";

export type SoftwareStatus = 'Active' | 'Expired' | 'Expiring';
export type Compliance = 'Compliant' | 'Non-Compliant' | 'Pending';
export type SoftwareType = 'Standard' | 'Special' | 'Exception';
export type ClientServer = 'Client' | 'Server';

// ✅ ให้ SoftwareFilters สอดคล้องกับการใช้งานจริงในเพจ/ฮุค
export type SoftwareFilters = {
  manufacturer?: string;
  status?: string;
  type?: string;
  search?: string;
};

export type SoftwareItem = {
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
  licenseModel: LicenseModel;
};

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
