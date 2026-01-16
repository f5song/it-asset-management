
'use client';

import React from 'react';

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export function Panel({ children, className = "", title }: PanelProps) {
  return (
    <section className={`rounded-md bg-white shadow-sm ${className}`}>
      {title ? (
        <div className="px-3 pt-2 pb-1">
          <h2 className="text-[13px] font-semibold tracking-tight text-slate-700">
            {title}
          </h2>
        </div>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}
