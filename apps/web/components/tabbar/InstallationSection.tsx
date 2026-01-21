
// InstallationSection.tsx (เวอร์ชัน generalized)
"use client";

import React, { useState, useEffect } from "react";
import { InstallationTable, AppColumnDef, InstallationFilters } from "./InstallationTable";

type Props<R> = {
  rows: R[];
  columns: AppColumnDef<R>[];
  resetKey?: string;
  initialPage?: number;
  pageSize?: number;
};

export function InstallationSection<R extends { id?: string | number; } >({
  rows,
  columns,
  resetKey,
  initialPage = 1,
  pageSize = 10,
}: Props<R>) {
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<InstallationFilters>({ query: "" });

  // เมื่อ resetKey หรือ initialPage เปลี่ยน ให้รีเซ็ตหน้าและคำค้นหา
  useEffect(() => {
    setPage(initialPage);
    setFilters({ query: "" });
  }, [resetKey, initialPage]);

  return (
    <>
      {/* search bar (optional) */}
      <div className="mb-3">
        <input
          className="border px-2 py-1 rounded w-full max-w-sm"
          placeholder="Search..."
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
        />
      </div>

      <InstallationTable
        rows={rows}
        columns={columns}
        filters={filters}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </>
  );
}
