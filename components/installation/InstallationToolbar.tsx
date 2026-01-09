
// src/components/installation/InstallationToolbar.tsx
"use client";
import React from "react";

export type InstallationFilters = {
  user: string | "ALL";
  device: string | "ALL";
  status: "Active" | "Expiring Soon" | "Expired" | "ALL";
  query: string;
};

export function InstallationToolbar({
  total,
  filters,
  users,
  devices,
  statuses = ["Active", "Expiring Soon", "Expired"],
  onFiltersChange,
  onExport,
  onAction,
}: {
  total: number;
  filters: InstallationFilters;
  users: string[];
  devices: string[];
  statuses?: Array<"Active" | "Expiring Soon" | "Expired">;
  onFiltersChange: (next: InstallationFilters) => void;
  onExport?: (format: "csv" | "xlsx" | "pdf") => void;
  onAction?: (action: "delete" | "reassign" | "scan") => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {/* Summary */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
        <span className="text-slate-600">Installation(s) :</span>{" "}
        <span className="text-lg font-bold text-slate-900">{total.toLocaleString()}</span>{" "}
        <span className="text-slate-600">Total</span>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">Filter</span>

        {/* User */}
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={filters.user}
          onChange={(e) => onFiltersChange({ ...filters, user: e.target.value as InstallationFilters["user"] })}
        >
          <option value="ALL">All User</option>
          {users.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        {/* Device */}
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={filters.device}
          onChange={(e) => onFiltersChange({ ...filters, device: e.target.value as InstallationFilters["device"] })}
        >
          <option value="ALL">All Device</option>
          {devices.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* License Status */}
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as InstallationFilters["status"] })}
        >
          <option value="ALL">All License Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Export + Action */}
        <div className="ml-auto flex items-center gap-2">
          {onExport && (
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              defaultValue=""
              onChange={(e) => {
                const fmt = e.target.value as "csv" | "xlsx" | "pdf";
                if (fmt) onExport(fmt);
                e.currentTarget.selectedIndex = 0; // reset
              }}
            >
              <option value="">Export As ▾</option>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pdf">PDF</option>
            </select>
          )}

          {onAction && (
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              defaultValue=""
              onChange={(e) => {
                const act = e.target.value as "delete" | "reassign" | "scan";
                if (act) onAction(act);
                e.currentTarget.selectedIndex = 0; // reset
              }}
            >
              <option value="">Action ▾</option>
              <option value="delete">Delete</option>
              <option value="reassign">Reassign</option>
              <option value="scan">Scan Key</option>
            </select>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="search"
          placeholder="Search"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={filters.query}
          onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
      </div>
    </div>
  );
}
