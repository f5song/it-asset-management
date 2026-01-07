// src/types/software.ts
export type PolicyCompliance = 'Allowed' | 'Not Allowed' | 'Requires' | 'N/A';
export type SoftwareStatus = 'Active' | 'Expired' | 'Expiring';

export interface SoftwareItem {
  id: string;
  name: string;
  manufacturer: string;
  version: string;
  category: string;
  policyCompliance: PolicyCompliance;
  expiryDate?: string; // ISO date string, optional
  status: SoftwareStatus;
}
