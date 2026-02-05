
// src/components/toolbar/Toolbar.tsx
'use client';

import { ToolbarControl } from '@/types/toolbar';
import { cn } from "@/lib/cn";

/** props หลักของ Toolbar */
export type ToolbarProps = {
  /** รายการคอนโทรลที่จะเรนเดอร์ทางซ้าย และปุ่มทางขวา (เฉพาะ kind === 'button') */
  controls: ToolbarControl[];
  /** className เพิ่มเติมของ wrapper */
  className?: string;
};

export function Toolbar({ controls, className }: ToolbarProps) {
  return (
    <div className={cn('flex flex-col gap-3 md:flex-row md:items-center md:justify-between', className)}>
      <div className="flex flex-wrap gap-2">
        {controls.map((c) => {
          if (c.kind === 'select') {
            return (
              <label key={c.id} className="inline-flex items-center gap-2">
                {c.label && <span className="text-sm text-gray-600">{c.label}</span>}
                <select
                  value={c.value}
                  onChange={(e) => c.onChange(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {c.options.map((opt) => (
                    <option key={`${c.id}-${opt}`}>{opt}</option>
                  ))}
                </select>
              </label>
            );
          }
          if (c.kind === 'search') {
            return (
              <div key={c.id} className="relative">
                <input
                  type="search"
                  placeholder={c.placeholder ?? 'Search'}
                  value={c.value}
                  onChange={(e) => c.onChange(e.target.value)}
                  className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm pl-9"
                />
                <span className="pointer-events-none absolute left-2 top-2.5 text-gray-400">🔍</span>
              </div>
            );
          }
          if (c.kind === 'button') {
            const base = 'rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset';
            const style =
              c.variant === 'primary'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-indigo-600'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-200';
            return (
              <button key={c.id} className={cn(base, style)} onClick={c.onClick}>
                {c.label}
              </button>
            );
          }
          return null;
        })}
      </div>

      {/* ปุ่มฝั่งขวาสามารถส่งผ่าน controls เป็น button ได้เช่นกัน */}
      <div className="hidden md:flex md:items-center md:gap-2">
        {controls
          .filter((c) => c.kind === 'button')
          .map((c) => {
            const base = 'rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset';
            const style =
              c.variant === 'primary'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-indigo-600'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-200';
            return (
              <button key={c.id} className={cn(base, style)} onClick={(c as any).onClick}>
                {(c as any).label}
              </button>
            );
          })}
      </div>
    </div>
  );
}
