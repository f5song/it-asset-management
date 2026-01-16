
'use client';

import React from 'react';
import { LicenseActivity } from '../../types';


export function RecentLicenseActivityTable({
  items,
  className,
  maxHeight = 220, // ลดความสูงลงนิดให้ดูแน่นขึ้น (แก้ได้ตอนใช้งาน)
}: {
  items: LicenseActivity[];
  className?: string;
  maxHeight?: number;
}) {
  const formatDate = (d: string | Date) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('th-TH', {
      year: '2-digit',
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <div className={className}>
      <div className="rounded-md border bg-white overflow-hidden">
        {/* scroll ภายใน + จำกัดความสูง */}
        <div
          className="overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          style={{ maxHeight }}
        >
          <table className="min-w-full table-fixed text-xs leading-tight">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-500 border-b">
                {/* กำหนดความกว้างคอลัมน์ให้พอดีการ์ด */}
                <th className="px-2 py-1 text-left font-semibold text-[11px] w-[74px] min-w-[68px]">
                  Date
                </th>
                <th className="px-2 py-1 text-left font-semibold text-[11px] w-[92px] min-w-[88px]">
                  Action
                </th>
                <th className="px-2 py-1 text-left font-semibold text-[11px] w-[140px] min-w-[120px]">
                  Software
                </th>
                <th className="px-2 py-1 text-left font-semibold text-[11px] w-[120px] min-w-[110px]">
                  Employee
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((r, i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? 'bg-slate-50/40' : undefined}
                >
                  <td className="px-2 py-1 text-slate-700 whitespace-nowrap">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-2 py-1 text-slate-700 whitespace-nowrap truncate">
                    {r.action}
                  </td>
                  <td className="px-2 py-1 text-slate-700 whitespace-nowrap truncate">
                    {r.software}
                  </td>
                  <td className="px-2 py-1 text-slate-700 whitespace-nowrap truncate">
                    {r.employee}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td
                    className="px-2 py-4 text-center text-slate-500 text-xs"
                    colSpan={4}
                  >
                    No activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
