
"use client";

import React from "react";
import type { Employees } from "types/employees";
import type { EmployeeItemsQuery, EmployeeItemsResponse } from "services/employees.service.mock";

import type { AppColumnDef } from "types/table";
import { DataTable } from "components/table";

type Props = {
  onSelected: (emps: Employees[]) => void;
  fetchEmployees: (q: EmployeeItemsQuery) => Promise<EmployeeItemsResponse>;
};

export const StepSelectEmployees: React.FC<Props> = ({ onSelected, fetchEmployees }) => {
  const [searchText, setSearchText] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [rows, setRows] = React.useState<Employees[]>([]);
  const [total, setTotal] = React.useState(0);

  // ✅ เก็บ selection ข้ามหน้า
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());
  const [selectedMap, setSelectedMap] = React.useState<Record<string, Employees>>({});

  React.useEffect(() => {
    (async () => {
      const res = await fetchEmployees({ searchText, page, limit });
      setRows(res.data);
      setTotal(res.pagination.total);
    })();
  }, [fetchEmployees, searchText, page, limit]);

  const columns = React.useMemo<AppColumnDef<Employees>[]>(() => [
    { id: "name", header: "Name", accessorKey: "name", width: 160 },
    { id: "email", header: "Email", accessorKey: "email", width: 200 },
    { id: "department", header: "Department", accessorKey: "department", width: 140 },
    { id: "status", header: "Status", accessorKey: "status", width: 120 },
  ], []);

  // ✅ เมื่อมีการเปลี่ยน selectedIds — อัปเดต selectedMap ให้ตรง (เฉพาะรายการบนหน้าปัจจุบัน)
  const onSelectionChange = React.useCallback((next: Set<string | number>) => {
    setSelectedIds(next);
    setSelectedMap((prev) => {
      const copy = { ...prev };
      rows.forEach((r) => {
        const id = r.id;
        if (!id) return;
        if (next.has(id)) copy[id] = r;
        else delete copy[id];
      });
      return copy;
    });
  }, [rows]);

  const pagination = {
    pageIndex: page - 1,
    pageSize: limit,
  };

  const onPaginationChange = (p: { pageIndex: number; pageSize: number }) => {
    setPage(p.pageIndex + 1);
    setLimit(p.pageSize);
  };

  return (
    <section className="grid gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="ค้นหาพนักงาน (ชื่อ/อีเมล/แผนก)"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-2"
          onClick={() => { setPage(1); }}
        >
          Search
        </button>
      </div>

      {/* Table with selection + pagination */}
      <DataTable<Employees>
        columns={columns}
        rows={rows}
        totalRows={total}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={[]}
        onSortingChange={() => {}}
        isLoading={false}
        isError={false}
        variant="default"
        size="xs"

        selectable
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        getRowId={(r) => r.id!}
        selectionScope="page"
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Selected: <b>{Object.keys(selectedMap).length}</b> users
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={Object.keys(selectedMap).length === 0}
            onClick={() => onSelected(Object.values(selectedMap))}
          >
            Use Selected
          </button>
        </div>
      </div>
    </section>
  );
};
