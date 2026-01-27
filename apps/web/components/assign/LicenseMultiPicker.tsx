"use client";
import * as React from "react";
import type { LicenseItem } from "types";
import { show } from "lib/show";

export default function LicenseMultiPicker({
  licenses,
  selectedIds,
  onToggle,
}: {
  licenses: LicenseItem[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return licenses;
    return licenses.filter(
      (l) =>
        l.softwareName?.toLowerCase().includes(s) ||
        l.manufacturer?.toLowerCase().includes(s) ||
        l.licenseModel?.toLowerCase?.().includes?.(s),
    );
  }, [q, licenses]);

  return (
    <section className="rounded-md border border-slate-200 p-4">
      <h3 className="font-semibold mb-3">เลือกไลเซนส์</h3>
      <input
        className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm mb-3"
        placeholder="ค้นหา (ชื่อ/ผู้ผลิต/โมเดล)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="max-h-[320px] overflow-auto rounded border border-slate-100 divide-y">
        {filtered.map((l) => {
          const checked = selectedIds.includes(l.id);
          return (
            <label key={l.id} className="flex items-start gap-3 p-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(ev) => onToggle(l.id, ev.target.checked)}
              />
              <div className="text-sm">
                <div className="font-medium">{show(l.softwareName)}</div>
                <div className="text-slate-600">
                  {show(l.manufacturer)} · {show(l.licenseModel)} · Avail {l.available}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
