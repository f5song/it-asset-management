
// src/data/software.mock.ts
import { SoftwareItem } from '@/types/software';

export const SOFTWARE_ITEMS: SoftwareItem[] = [
  {
    id: 'sw-001',
    name: 'Microsoft Office 365',
    manufacturer: 'Microsoft',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Allowed',
    expiryDate: '2025-11-11',
    status: 'Active',
  },
  {
    id: 'sw-002',
    name: 'Adobe Photoshop',
    manufacturer: 'Adobe',
    version: 'v2025',
    category: 'Design',
    policyCompliance: 'Not Allowed',
    expiryDate: '2025-10-10',
    status: 'Expired',
  },
  {
    id: 'sw-003',
    name: 'LINE PC',
    manufacturer: 'LINE Corp',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Requires',
    expiryDate: '2025-09-02',
    status: 'Active',
  },
  {
    id: 'sw-004',
    name: 'AutoCAD',
    manufacturer: 'Autodesk',
    version: 'v2025',
    category: 'Productivity',
    policyCompliance: 'Not Allowed',
    expiryDate: '2025-02-05',
    status: 'Expiring',
  },
  {
    id: 'sw-005',
    name: 'USB Tools',
    manufacturer: 'Generic',
    version: 'v2025',
    category: 'Utility',
    policyCompliance: 'Allowed',
    expiryDate: '2025-12-15',
    status: 'Active',
  },
];
``
