'use client';
import { LicenseStatus } from '@/types';
import { cn } from '.';

const statusMap: Record<LicenseStatus, string> = {
  'Active': 'text-green-700 bg-green-100',
  'Expiring Soon': 'text-amber-700 bg-amber-100',
  'Expired': 'text-red-700 bg-red-100',
};

export function StatusBadge({ label }: { label: LicenseStatus }) {
  return (
    <span
      className={cn(
        'inline-block rounded px-2 py-0.5 text-xs font-semibold',
        statusMap[label]
      )}
    >
      {label}
    </span>
  );
}
