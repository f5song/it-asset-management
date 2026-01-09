'use client';
import React from 'react';

export function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value ?? '-'}</dd>
    </>
  );
}
``
