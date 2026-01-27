"use client";
import * as React from "react";
import type { Employees } from "types/employees";
import { show } from "lib/show";

export default function EmployeeMultiPicker({
  employees,
  selectedIds,
  onToggle,
}: {
  employees: Employees[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return employees;
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(s) ||
        e.email?.toLowerCase().includes(s) ||
        e.department?.toLowerCase().includes(s),
    );
  }, [q, employees]);

  return (
    <section className="rounded-md border border-slate-200 p-4">
      <h3 className="font-semibold mb-3">เลือกพนักงาน</h3>
      <input
        className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm mb-3"
        placeholder="ค้นหา (ชื่อ/อีเมล/แผนก)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="max-h-[320px] overflow-auto rounded border border-slate-100 divide-y">
        {filtered.map((e) => {
          const checked = selectedIds.includes(e.id);
          return (
            <label key={e.id} className="flex items-start gap-3 p-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(ev) => onToggle(e.id, ev.target.checked)}
              />
              <div className="text-sm">
                <div className="font-medium">{show(e.name)}</div>
                <div className="text-slate-600">{show(e.email)} · {show(e.department)}</div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}