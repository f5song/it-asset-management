// src/components/installation/ToolbarSummary.tsx
"use client";
import React from "react";

export function ToolbarSummary({ total }: { total: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
      <span className="text-slate-600">Installation(s) :</span>{" "}
      <span className="text-lg font-bold text-slate-900">{total.toLocaleString()}</span>{" "}
      <span className="text-slate-600">Total</span>
    </div>
  );
}
