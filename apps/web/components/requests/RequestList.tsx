// src/components/requests/RequestList.tsx
'use client';

import React from 'react';
import RequestCard from './RequestCard';
import { RequestItem } from '@/types/exception';

type Props = {
  items: RequestItem[];
  onItemClick?: (id: number) => void;
  compact?: boolean;
};

export default function RequestList({
  items,
  onItemClick,
  compact = true,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
        ไม่พบรายการที่ตรงกับเงื่อนไข
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id} className="py-1.5 first:pt-0 last:pb-0">
          <RequestCard
            item={item}
            onClick={onItemClick}
            size={compact ? 'compact' : 'normal'}
          />
        </li>
      ))}
    </ul>
  );
}