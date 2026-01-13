
'use client';

import React from 'react';
import StatCard, { StatCardProps } from './StatCard';

export type StatItem = Omit<StatCardProps, 'className'> & { key: string };

type StatGridProps = {
  items: StatItem[];
  className?: string;
};

export default function StatGrid({ items, className }: StatGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {items.map((it) => (
        <StatCard
          key={it.key}
          title={it.title}
          value={it.value}
          highlight={it.highlight}
          onClick={it.onClick}
          loading={it.loading}
        />
      ))}
    </div>
  );
}
