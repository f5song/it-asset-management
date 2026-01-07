
// src/hooks/useSoftwareInventory.ts
'use client';

import { useMemo, useState } from 'react';

export type PolicyCompliance = 'Allowed' | 'Not Allowed' | 'Requires' | 'N/A';
export type Status = 'Active' | 'Expired' | 'Expiring';

export interface SoftwareItem {
  id: string;
  name: string;
  manufacturer: string;
  version: string;
  category: string;
  policyCompliance: PolicyCompliance;
  expiryDate?: string; // ISO string
  status: Status;
}

export interface Filters {
  type: string;
  manufacturer: string;
  software: string;
  search: string;
}

const baseItems: SoftwareItem[] = [
  { id: '1', name: 'Microsoft Office 365', manufacturer: 'Microsoft', version: 'v2025', category: 'Utility', policyCompliance: 'Allowed', expiryDate: '2025-11-11', status: 'Active' },
  { id: '2', name: 'Adobe Photoshop', manufacturer: 'Adobe', version: 'v2025', category: 'Design', policyCompliance: 'Not Allowed', expiryDate: '2025-10-10', status: 'Expired' },
  { id: '3', name: 'LINE PC', manufacturer: 'LINE Corp', version: 'v2025', category: 'Utility', policyCompliance: 'Requires', expiryDate: '2025-09-02', status: 'Active' },
  { id: '4', name: 'AutoCAD', manufacturer: 'Autodesk', version: 'v2025', category: 'Productivity', policyCompliance: 'Not Allowed', expiryDate: '2025-02-05', status: 'Expiring' },
  { id: '5', name: 'USB Tools', manufacturer: 'Generic', version: 'v2025', category: 'Utility', policyCompliance: 'Allowed', expiryDate: '2025-12-15', status: 'Active' },
  { id: '6', name: 'Microsoft Office 365', manufacturer: 'Microsoft', version: 'v2409', category: 'Utility', policyCompliance: 'Allowed', expiryDate: '2014-10-10', status: 'Expired' },
  { id: '7', name: 'Adobe Photoshop', manufacturer: 'Adobe', version: 'v2409', category: 'Design', policyCompliance: 'Not Allowed', expiryDate: '2024-10-10', status: 'Active' },
  { id: '8', name: 'LINE PC', manufacturer: 'LINE Corp', version: 'v2409', category: 'Utility', policyCompliance: 'Requires', expiryDate: '2023-09-02', status: 'Active' },
];

function expandDataset(targetCount = 1250): SoftwareItem[] {
  const arr: SoftwareItem[] = [];
  let id = 1;
  while (arr.length < targetCount) {
    for (const b of baseItems) {
      if (arr.length >= targetCount) break;
      arr.push({ ...b, id: String(id++) });
    }
  }
  return arr;
}

const ALL_ITEMS = expandDataset(); // ให้จำนวนมากเพื่อให้หน้าตา pagination เหมือนภาพ

export function useSoftwareInventory(pageSize = 10) {
  const [filters, setFilters] = useState<Filters>({
    type: 'All Type',
    manufacturer: 'All Manufacturer',
    software: 'All Software',
    search: '',
  });

  const setFilter = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const filtered = useMemo(() => {
    let data = [...ALL_ITEMS];

    if (filters.type !== 'All Type') data = data.filter((i) => i.category === filters.type);
    if (filters.manufacturer !== 'All Manufacturer') data = data.filter((i) => i.manufacturer === filters.manufacturer);
    if (filters.software !== 'All Software') data = data.filter((i) => i.name === filters.software);

    if (filters.search.trim().length > 0) {
      const s = filters.search.toLowerCase();
      data = data.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          i.manufacturer.toLowerCase().includes(s) ||
          i.category.toLowerCase().includes(s)
      );
    }
    return data;
  }, [filters]);

  const typeOptions = Array.from(new Set(ALL_ITEMS.map((i) => i.category)));
  const manufacturerOptions = Array.from(new Set(ALL_ITEMS.map((i) => i.manufacturer)));
  const softwareOptions = Array.from(new Set(ALL_ITEMS.map((i) => i.name)));

  return {
    filters,
    setFilter,
    rows: filtered,
    pageSize,
    typeOptions,
    manufacturerOptions,
    softwareOptions,
    total: filtered.length,
  };
}
``
