import { SoftwareItem } from "../types";

// src/utils/date.ts
export const formatDate = (iso?: string | null) => {
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

// lib/dateDeterministic.ts
export function formatDateDeterministic(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  // ล็อก locale + timeZone ให้เหมือนกันทุกสภาพแวดล้อม
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateOnlyDeterministic(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC",
  }).format(d);
}
