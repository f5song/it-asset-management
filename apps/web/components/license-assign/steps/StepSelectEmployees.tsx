
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { Employees } from "types/employees";
import type { EmployeeItemsQuery, EmployeeItemsResponse } from "services/employees.service.mock";

type Props = {
  onSelected: (emps: Employees[]) => void;
  fetchEmployees: (q: EmployeeItemsQuery) => Promise<EmployeeItemsResponse>;
};

export const StepSelectEmployees: React.FC<Props> = ({
  onSelected,
  fetchEmployees,
}) => {
  const [searchText, setSearchText] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState<Employees[]>([]);
  const [selected, setSelected] = React.useState<Record<string, Employees>>({});
  const [totalPages, setTotalPages] = React.useState(1);

  const { /* form context but not needed */ } = useFormContext();

  // โหลด employees จาก service ของคุณโดยตรง
  React.useEffect(() => {
    (async () => {
      const res = await fetchEmployees({
        searchText,
        page,
        limit: 10, // จะ fix หรือเอาจาก props ก็ได้
      });

      setRows(res.data);
      setTotalPages(res.pagination.totalPages);
    })();
  }, [searchText, page, fetchEmployees]);

  const toggle = (emp: Employees) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[emp.id]) delete copy[emp.id];
      else copy[emp.id] = emp;
      return copy;
    });
  };

  return (
    <section className="grid gap-4">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="ค้นหาพนักงาน (ชื่อ/อีเมล/แผนก)"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-2"
          onClick={() => setPage(1)}
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left w-10">#</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Department</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!selected[e.id]}
                    onChange={() => toggle(e)}
                  />
                </td>
                <td className="px-3 py-2">{e.name}</td>
                <td className="px-3 py-2">{e.email}</td>
                <td className="px-3 py-2">{e.department}</td>
                <td className="px-3 py-2">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Selected: <b>{Object.keys(selected).length}</b> users
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-2 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-2 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>

          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={Object.keys(selected).length === 0}
            onClick={() => onSelected(Object.values(selected))}
          >
            Use Selected
          </button>
        </div>
      </div>
    </section>
  );
};
