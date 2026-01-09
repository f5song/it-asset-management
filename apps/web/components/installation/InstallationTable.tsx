// src/components/installation/InstallationTable.tsx
"use client";
import React, { useMemo } from "react";
import { Pagination } from "../pagination/Pagination";

// ✅ ใช้ชนิดสำหรับการแสดงผลตามภาพ
export type InstallationDisplayRow = {
  id: string;
  deviceName: string;
  workStation: string;
  user: string;
  licenseKey: string;
  licenseStatus: "Active" | "Expiring Soon" | "Expired";
  scannedLicenseKey: string;
};

function StatusBadge({
  label,
}: {
  label: InstallationDisplayRow["licenseStatus"];
}) {
  const map: Record<InstallationDisplayRow["licenseStatus"], string> = {
    Active: "text-green-700 bg-green-100",
    "Expiring Soon": "text-amber-700 bg-amber-100",
    Expired: "text-red-700 bg-red-100",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${map[label]}`}
    >
      {label}
    </span>
  );
}

export type InstallationFilters = {
  user: string | "ALL";
  device: string | "ALL";
  status: "Active" | "Expiring Soon" | "Expired" | "ALL";
  query: string;
};

export function InstallationTable({
  rows, // ✅ รับเป็น Display rows ตรง ๆ
  filters,
  page,
  pageSize,
  onPageChange,
}: {
  rows: InstallationDisplayRow[];
  filters: InstallationFilters;
  page: number;
  pageSize: number;
  onPageChange: (next: number) => void;
}) {
  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return rows.filter((r) => {
      const passUser = filters.user === "ALL" || r.user === filters.user;
      const passDevice =
        filters.device === "ALL" || r.deviceName === filters.device;
      const passStatus =
        filters.status === "ALL" || r.licenseStatus === filters.status;
      const passQuery =
        q.length === 0 ||
        [r.deviceName, r.workStation, r.user, r.licenseKey, r.scannedLicenseKey]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return passUser && passDevice && passStatus && passQuery;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-3 py-2 text-sm font-medium text-slate-600">
                Device Name
              </th>
              <th className="px-3 py-2 text-sm font-medium text-slate-600">
                Work Station
              </th>
              <th className="px-3 py-2 text-sm font-medium text-slate-600">
                User
              </th>
              <th className="px-3 py-2 text-sm font-medium text-slate-600">
                License Key
              </th>
              <th className="px-3 py-2 text-sm font-medium text-slate-600">
                License Status
              </th>
              <th className="px-3 py-2 text-sm font-medium text-slate-600">
                Scanned License Key
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {pageRows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-sm text-slate-500" colSpan={6}>
                  No installations found.
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-sm text-slate-900">
                    {r.deviceName}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-900">
                    {r.workStation}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-900">{r.user}</td>
                  <td className="px-3 py-2 text-sm text-slate-900">
                    {r.licenseKey}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <StatusBadge label={r.licenseStatus} />
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-900">
                    {r.scannedLicenseKey}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-3 pb-3">
        <Pagination
          currentPage={safePage} // ✅ ใช้ currentPage
          pageSize={pageSize}
          totalCount={total}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}
