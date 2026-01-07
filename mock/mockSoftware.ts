// src/mock/mockSoftware.ts
export type ItemStatus = 'Active' | 'Expired' | 'Expiring';
export type PolicyCompliance = 'Allowed' | 'Not Allowed' | 'Requires';
export type SoftwareType = 'Standard' | 'Special' | 'Exception';
export type LicenseModel = 'Free' | 'Paid' | 'Perpetual' | 'Subscription';
export type ClientServer = 'Client' | 'Server';

export type Item = {
  id: string;
  softwareName: string;
  manufacturer: string;
  version: string;                 // v2409, v2025, ...
  category: 'Design' | 'Productivity' | 'Utility' | 'Productive';
  policyCompliance: PolicyCompliance;
  expiryDate: string;              // 'DD-MM-YYYY' หรือ 'N/A'
  status: ItemStatus;
  softwareType: SoftwareType;      // จากตารางที่สอง
  licenseModel: LicenseModel;      // จากตารางที่สอง
  clientServer: ClientServer;      // จากตารางที่สอง
};

// Mock รายการตามภาพ (สามารถเพิ่มได้)
export const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    softwareName: 'Microsoft Office 365',
    manufacturer: 'Microsoft',
    version: 'v2409',
    category: 'Design',
    policyCompliance: 'Allowed',
    expiryDate: '10-10-2014',
    status: 'Expired',
    softwareType: 'Standard',
    licenseModel: 'Free',
    clientServer: 'Client',
  },
  {
    id: '2',
    softwareName: 'Adobe Photoshop',
    manufacturer: 'Adobe',
    version: 'v2409',
    category: 'Design',
    policyCompliance: 'Not Allowed',
    expiryDate: '10-10-2024',
    status: 'Active',
    softwareType: 'Special',
    licenseModel: 'Perpetual',
    clientServer: 'Client',
  },
  {
    id: '3',
    softwareName: 'LINE PC',
    manufacturer: 'LINE Corp',
    version: 'v2409',
    category: 'Productive',
    policyCompliance: 'Requires',
    expiryDate: '05-08-2023',
    status: 'Expiring',
    softwareType: 'Standard',
    licenseModel: 'Paid',
    clientServer: 'Client',
  },
  {
    id: '4',
    softwareName: 'AutoCAD',
    manufacturer: 'Autodesk',
    version: 'v2409',
    category: 'Productivity',
    policyCompliance: 'Not Allowed',
    expiryDate: '05-02-2023',
    status: 'Expiring',
    softwareType: 'Special',
    licenseModel: 'Subscription',
    clientServer: 'Client',
  },
  {
    id: '5',
    softwareName: 'USB Tools',
    manufacturer: 'Generic',
    version: 'v2409',
    category: 'Utility',
    policyCompliance: 'Allowed',
    expiryDate: '15-12-2023',
    status: 'Active',
    softwareType: 'Standard',
    licenseModel: 'Free',
    clientServer: 'Server',
  },
  {
    id: '6',
    softwareName: 'Microsoft Office 365',
    manufacturer: 'Microsoft',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Not Allowed',
    expiryDate: '11-11-2023',
    status: 'Active',
    softwareType: 'Standard',
    licenseModel: 'Free',
    clientServer: 'Server',
  },
  {
    id: '7',
    softwareName: 'Adobe Photoshop',
    manufacturer: 'Adobe',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Allowed',
    expiryDate: 'N/A',
    status: 'Expired',
    softwareType: 'Standard',
    licenseModel: 'Subscription',
    clientServer: 'Server',
  },
  {
    id: '8',
    softwareName: 'LINE PC',
    manufacturer: 'LINE Corp',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Requires',
    expiryDate: '02-09-2023',
    status: 'Active',
    softwareType: 'Exception',
    licenseModel: 'Paid',
    clientServer: 'Server',
  },
  {
    id: '9',
    softwareName: 'LINE PC',
    manufacturer: 'LINE Corp',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Allowed',
    expiryDate: '02-09-2023',
    status: 'Active',
    softwareType: 'Exception',
    licenseModel: 'Free',
    clientServer: 'Server',
  },
  // เพิ่มให้ยาวขึ้นเพื่อทดสอบ scroll
  {
    id: '10',
    softwareName: 'VS Code',
    manufacturer: 'Microsoft',
    version: 'v1.86',
    category: 'Productivity',
    policyCompliance: 'Allowed',
    expiryDate: '01-01-2025',
    status: 'Active',
    softwareType: 'Standard',
    licenseModel: 'Free',
    clientServer: 'Client',
  },
  {
    id: '11',
    softwareName: 'Figma',
    manufacturer: 'Figma Inc.',
    version: 'v124',
    category: 'Design',
    policyCompliance: 'Requires',
    expiryDate: '15-03-2025',
    status: 'Expiring',
    softwareType: 'Special',
    licenseModel: 'Subscription',
    clientServer: 'Client',
  },
  {
    id: '12',
    softwareName: 'Slack',
    manufacturer: 'Slack',
    version: 'v4.40',
    category: 'Productivity',
    policyCompliance: 'Allowed',
    expiryDate: '11-11-2025',
    status: 'Active',
    softwareType: 'Standard',
    licenseModel: 'Paid',
    clientServer: 'Client',
  },
];
