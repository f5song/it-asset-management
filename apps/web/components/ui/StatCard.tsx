
'use client';

import React from 'react';

export type StatHighlight = 'default' | 'good' | 'warning' | 'danger';

export type StatCardProps = {
  title: string;
  value: number | string;
  className?: string;
  onClick?: () => void;
  highlight?: StatHighlight;
  loading?: boolean;
};

export default function StatCard({
  title,
  value,
  className,
  onClick,
  highlight = 'default',
  loading = false,
}: StatCardProps) {
  const base = 'rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-colors';
  const clickable = onClick ? 'cursor-pointer hover:bg-slate-50' : '';
  const colorByState: Record<StatHighlight, string> = {
    default: 'text-slate-900',
    good: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-rose-700',
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${base} ${clickable} ${className || ''}`}
    >
      <div className="text-sm text-slate-500">{title}</div>

      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200" />
      ) : (
        <div className={`mt-2 text-3xl font-semibold ${colorByState[highlight]}`}>
          {value}
        </div>
      )}
    </div>
  );
}
