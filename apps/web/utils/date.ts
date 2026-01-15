import { SoftwareItem } from "../types";

// src/utils/date.ts
export const formatDate = (iso?: string) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};


export const exportToCSV = (rows: SoftwareItem[], filename = 'software_inventory.csv') => {
  const headers = [
    'Software Name',
    'Manufacturer',
    'Version',
    'Category',
    'Policy Compliance',
    'Expiry Date',
    'Status',
  ];
  const csvRows = rows.map((r) =>
    [
      r.softwareName,
      r.manufacturer,
      r.version,
      r.category,
      r.policyCompliance,
      r.expiryDate ?? 'N/A',
      r.status,
    ].join(',')
  );
  const csv = [headers.join(','), ...csvRows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
