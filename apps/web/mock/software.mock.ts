
// src/mocks/data/software.mock.ts

import { SoftwareItem } from "types";

export const MOCK_ITEMS: SoftwareItem[] = Array.from({ length: 123 }).map((_, i) => {
  const idx = i + 1;
  const mf = ['Microsoft', 'Adobe', 'Autodesk', 'Google'][idx % 4];
  const types = ['Standard', 'Special', 'Exception'] as const;
  const statuses = ['Active', 'Expired', 'Expiring'] as const;
  return {
    id: `SW-${idx}`,
    softwareName: `Software ${idx}`,
    manufacturer: mf,
    version: `${Math.floor(1 + (idx % 25))}.${idx % 10}`,
    category: idx % 2 === 0 ? 'Productivity' : 'Design',
    policyCompliance: idx % 3 === 0 ? 'Compliant' : 'Non-Compliant',
    expiryDate: `2026-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`,
    status: statuses[idx % statuses.length],
    softwareType: types[idx % types.length],
    licenseModel: idx % 2 === 0 ? 'Subscription' : 'Perpetual',
    clientServer: idx % 2 === 0 ? 'Client' : 'Server',
  };
});
