// components/ui/StatusBadge.tsx
'use client';

import { cn } from "@/lib/cn";


type StatusVariant =
  | 'neutral'
  | 'license'        // สำหรับ Active/Expired
  | 'compliance'     // Compliant/Non-compliant/Unknown
  | 'exception'      // Approved/Pending/Expired/Revoked
  | 'severity';      // Low/Medium/High

const defaultMaps: Record<StatusVariant, Record<string, string>> = {
  neutral: {
    default: 'text-gray-700 bg-gray-100',
  },
  license: {
    Active: 'text-green-700 bg-green-100',
    Expired: 'text-red-700 bg-red-100',
  },
  compliance: {
    Compliant: 'text-green-700 bg-green-100',
    'Non-compliant': 'text-red-700 bg-red-100',
    Unknown: 'text-gray-700 bg-gray-100',
  },
  exception: {
    Approved: 'text-green-700 bg-green-100',
    Pending: 'text-amber-800 bg-amber-100',
    Expired: 'text-red-700 bg-red-100',
    Revoked: 'text-red-800 bg-red-100',
  },
  severity: {
    Low: 'text-green-700 bg-green-100',
    Medium: 'text-amber-800 bg-amber-100',
    High: 'text-red-700 bg-red-100',
  },
};

export function StatusBadge({
  label,
  variant = 'neutral',
  map,
  className,
}: {
  label: string;                                // ใช้ string เพื่อความยืดหยุ่นข้าม entity
  variant?: StatusVariant;
  map?: Record<string, string>;                 // override สีเฉพาะกิจได้
  className?: string;
}) {
  const palette = map ?? defaultMaps[variant] ?? defaultMaps.neutral;
  const cls = palette[label] ?? palette.default ?? defaultMaps.neutral.default;

  return (
    <span
      className={cn(
        'inline-block rounded px-2 py-0.5 text-xs font-semibold',
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}
