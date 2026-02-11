// src/components/requests/RequestCard.tsx
'use client';

import React from 'react';
import { RequestItem } from '@/types/exception';
import { formatDue } from '@/lib/date';

type Props = {
  item: RequestItem;
  onClick?: (id: number) => void;
  size?: 'normal' | 'compact';
};

function Card({ item, onClick, size = 'compact' }: Props) {
  // Density & Typography
  const pad = size === 'compact' ? 'px-3.5 py-2.5' : 'px-4 py-3.5';
  const titleCls =
    size === 'compact'
      ? 'text-[15px] font-semibold leading-6'
      : 'text-base font-semibold leading-6';
  const metaCls =
    size === 'compact'
      ? 'text-[13px] leading-5'
      : 'text-sm leading-6';

  // Risk badge (ultra subtle)
  const riskTone =
    item.risk === 'High'
      ? 'text-red-700 ring-red-100 bg-red-50'
      : item.risk === 'Medium'
      ? 'text-amber-700 ring-amber-100 bg-amber-50'
      : 'text-green-700 ring-green-100 bg-green-50';

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open request ${item.title}`}
      className={[
        'rounded-md border border-slate-200 bg-white',
        'hover:border-slate-300 hover:shadow-sm',
        'transition-colors',
        pad,
        'cursor-pointer',
      ].join(' ')}
      onClick={() => onClick?.(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(item.id);
      }}
    >
      {/* Row: Title + Badge */}
      <div className="flex items-center gap-3">
        <h3 className={`flex-1 truncate text-slate-900 ${titleCls}`}>
          {item.title}
        </h3>

        <span
          className={[
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
            'shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.3)]',
            riskTone,
          ].join(' ')}
        >
          {item.risk}
        </span>
      </div>

      {/* Meta (single line, wraps when needed) */}
      <div className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 ${metaCls}`}>
        <span className="text-slate-500">Requester</span>
        <span className="font-medium text-slate-800">{item.requester}</span>

        <span className="text-slate-300">•</span>

        <span className="text-slate-500">Dept</span>
        <span className="font-medium text-slate-800">{item.department}</span>

        <span className="text-slate-300">•</span>

        <span className="text-slate-500">Due</span>
        <span className="font-medium text-slate-800">{formatDue(item.dueAt)}</span>

        <span className="text-slate-300">•</span>

        <span className="text-slate-500">Site</span>
        <span className="font-medium text-slate-800">{item.site}</span>

        <span className="text-slate-300">•</span>

        <span className="text-slate-500">Exceptions</span>
        <span className="font-medium text-slate-800">{item.exception}</span>
      </div>
    </article>
  );
}

const RequestCard = React.memo(
  Card,
  (prev, next) =>
    prev.item === next.item &&
    prev.onClick === next.onClick &&
    prev.size === next.size
);

export default RequestCard;