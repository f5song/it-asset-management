
'use client';

import React from 'react';

export type LicenseAction =
  | 'Assign'
  | 'Deallocate'
  | 'Request Approved'
  | 'Request Rejected';

export type LicenseActivity = {
  date: string | Date;
  action: LicenseAction;
  software: string;
  employee: string;
};

export function RecentLicenseActivityTable({
  items,
  className,
  maxHeight = 260,
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
        <div className="max-h-[260px] overflow-auto" style={{ maxHeight }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="text-slate-500">
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
                <th className="px-3 py-2 text-left font-semibold">Software</th>
                <th className="px-3 py-2 text-left font-semibold">Employee</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{formatDate(r.date)}</td>
                  <td className="px-3 py-2">{r.action}</td>
                  <td className="px-3 py-2">{r.software}</td>
                  <td className="px-3 py-2">{r.employee}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
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
