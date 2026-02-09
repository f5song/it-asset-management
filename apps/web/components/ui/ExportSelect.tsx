
// src/components/installation/ExportSelect.tsx
"use client";
import React from "react";
import { ExportFormat } from "types";


export function ExportSelect({ onExport }: { onExport: (format: ExportFormat) => void }) {
  const id = React.useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        Export As
      </label>
      <select
        id={id}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        defaultValue=""
        onChange={(e) => {
          const fmt = e.target.value as ExportFormat;
          if (fmt) onExport(fmt);
          e.currentTarget.selectedIndex = 0; // reset
        }}
      >
        <option value="">Export As</option>
        <option value="csv">CSV</option>
        <option value="xlsx">Excel (.xlsx)</option>
        <option value="pdf">PDF</option>
      </select>
    </>
  );
}

