
// components/ui/ComplianceBadge.tsx
'use client';
import React from 'react';

import { Compliance } from '@/types';
import { cn } from '@/lib/cn';

const complianceMap: Record<Compliance, string> = {
  'Compliant': 'text-green-700 bg-green-100',
  'Non-Compliant': 'text-red-700 bg-red-100',
};

export function ComplianceBadge({ label }: { label: Compliance }) {
  return (
    <span
      className={cn(
        'inline-block rounded px-2 py-0.5 text-xs font-semibold',
        complianceMap[label]
      )}
    >
      {label}
    </span>
  );
}
