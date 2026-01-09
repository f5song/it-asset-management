
// src/components/detail/DetailInfo.tsx
"use client";
import React from "react";

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value ?? "-"}</dd>
    </>
  );
}

export function DetailInfoGrid({
  left,
  right,
}: {
  left: Array<{ label: string; value?: React.ReactNode }>;
  right: Array<{ label: string; value?: React.ReactNode }>;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        {left.map((r, i) => (
          <InfoRow key={i} label={r.label} value={r.value} />
        ))}
      </dl>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        {right.map((r, i) => (
          <InfoRow key={i} label={r.label} value={r.value} />
        ))}
      </dl>
    </div>
  );
}
