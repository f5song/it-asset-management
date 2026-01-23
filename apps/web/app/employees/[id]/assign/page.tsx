
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";

import type { AppColumnDef } from "types/ui-table";
import type { LicenseItem } from "types/license";
import type { DeviceItem } from "types/device";
import type { Employees } from "types/employees";

// Services
import { getEmployeeById } from "services/employees.service.mock";
import { getAvailableLicenses } from "services/licenses.service.mock";
import { getDevicesByEmployee } from "services/devices.service.mock";
import { assignMany } from "services/assign.service.mock";
import { DataTable } from "components/table";
import { DetailShell } from "components/detail/DetailShell";

export default function AssignEmployeeLicensesPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const employeeId = params?.id;

  // ---- employee ----
  const [employee, setEmployee] = React.useState<Employees | null>(null);

  // ---- table states ----
  const [rows, setRows] = React.useState<LicenseItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean }[]>([]);

  // ---- selection / per-device device mapping ----
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());
  const [devices, setDevices] = React.useState<DeviceItem[]>([]);
  const [deviceFor, setDeviceFor] = React.useState<Record<string, string>>({}); // licenseId -> deviceId

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [bulkResults, setBulkResults] = React.useState<
    { licenseId: string; status: "success" | "error"; message?: string; assignmentId?: string }[] | null
  >(null);

  // ---- load employee + licenses + devices ----
  React.useEffect(() => {
    if (!employeeId) return;
    let mounted = true;

    (async () => {
      try {
        setErrorMsg(null);
        setLoading(true);
        setError(false);

        const [emp, licList, devs] = await Promise.all([
          getEmployeeById(employeeId),
          getAvailableLicenses(),
          getDevicesByEmployee(employeeId),
        ]);

        if (!mounted) return;

        if (!emp) {
          setError(true);
          setErrorMsg("ไม่พบข้อมูลพนักงาน");
          return;
        }

        setEmployee(emp);
        setRows(licList);
        setTotalRows(licList.length);
        setDevices(devs);
      } catch (e: any) {
        if (!mounted) return;
        setError(true);
        setErrorMsg(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [employeeId]);

  // ---- columns ----
  const columns = React.useMemo<AppColumnDef<LicenseItem>[]>(() => {
    return [
      { id: "softwareName", header: "License", accessorKey: "softwareName" },
      { id: "sku", header: "SKU", accessorKey: "sku" },
      {
        id: "perType",
        header: "Type",
        accessorKey: "perType",
        cell: (v) => (v === "per_device" ? "Per-device" : "Per-user"),
      },
      {
        id: "seats",
        header: "Seats",
        accessorKey: "inUse", // ใช้เพื่อ sort
        getSortValue: (row) => row.inUse,
        cell: (_v, row) => {
          const left = row.available ?? (row.total - row.inUse);
          return (
            <span>
              {row.inUse}/{row.total}{" "}
            </span>
          );
        },
      },
      {
        id: "device",
        header: "Device (Per-device)",
        accessorKey: "id",
        cell: (_v, row) => {
          if (row.perType !== "per_device") return <span className="text-gray-400">—</span>;
          const selected = selectedIds.has(row.id);
          const value = deviceFor[String(row.id)] || "";
          return (
            <select
              className="w-full rounded border px-2 py-1"
              disabled={!selected}
              value={value}
              onChange={(e) =>
                setDeviceFor((prev) => ({ ...prev, [String(row.id)]: e.target.value }))
              }
            >
              <option value="">— เลือก Device —</option>
              {devices.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name} ({d.id}){d.os ? ` · ${d.os}` : ""}
                </option>
              ))}
            </select>
          );
        },
      },
    ];
  }, [devices, selectedIds, deviceFor]);

  // ---- client-side sort (optional) ----
  const effectiveRows = React.useMemo(() => {
    if (!sorting?.length) return rows;
    const { id, desc } = sorting[0];
    const col = columns.find((c) => String(c.accessorKey) === id || String(c.id) === id);

    const getValue = (row: LicenseItem) => {
      if (col?.getSortValue) return col.getSortValue(row as any);
      return (row as any)[id];
    };

    const cmp = (a: unknown, b: unknown) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1;
      if (b == null) return 1;
      if (typeof a === "number" && typeof b === "number") return a - b;
      // date?
      const da = new Date(a as any);
      const db = new Date(b as any);
      const aIsDate = !isNaN(da.valueOf());
      const bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return da.getTime() - db.getTime();
      return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
    };

    const arr = [...rows];
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const res = cmp(va, vb);
      return desc ? -res : res;
    });
    return arr;
  }, [rows, sorting, columns]);

  // ---- assign selected ----
  const onAssignSelected = async () => {
    if (!employee) return;
    setErrorMsg(null);
    setBulkResults(null);

    const ids = Array.from(selectedIds).map(String);
    if (ids.length === 0) {
      setErrorMsg("กรุณาเลือกอย่างน้อย 1 License");
      return;
    }

    // validate per-device
    const errors: string[] = [];
    const items = ids.map((id) => {
      const lic = rows.find((l) => String(l.id) === id);
      if (!lic) return null;
      const left = lic.available ?? (lic.total - lic.inUse);
      if ((left ?? 0) <= 0) {
        errors.push(`${lic.softwareName} : ไม่มีที่นั่ง (seat) เหลือ`);
      }
      let deviceId: string | undefined;
      if (lic.perType === "per_device") {
        deviceId = deviceFor[id];
        if (!deviceId) errors.push(`${lic.softwareName} : ยังไม่เลือก Device`);
      }
      return { licenseId: id, deviceId };
    }).filter(Boolean) as { licenseId: string; deviceId?: string }[];

    if (errors.length) {
      setErrorMsg(errors.join(" | "));
      return;
    }

    setSubmitting(true);
    try {
      const results = await assignMany({
        employeeId: employee.id,
        items: items.map((it) => ({
          licenseId: it.licenseId,
          deviceId: it.deviceId,
          idempotencyKey: (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        })),
      });

      setBulkResults(results);
      const allOk = results.every((r) => r.status === "success");
      if (allOk) {
        router.push(`/employees/${employee.id}`);
        router.refresh?.();
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "ไม่สามารถ Assign แบบกลุ่มได้");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DetailShell
      title={`Assign License • ${employee?.name || employeeId || ""}`}
      onBack={() => router.back()}
      breadcrumbs={[
        { label: "Employees", href: "/employees" },
        employee?.name ? { label: employee.name, href: `/employees/${employee.id}` } : { label: String(employeeId) },
        { label: "Assign License" },
      ]}
      contentClassName="space-y-4"
    >

      {/* Table + selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">เลือก License เพื่อ Assign</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
              onClick={() => setSelectedIds(new Set())}
              disabled={submitting}
            >
              ล้างการเลือก
            </button>
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              onClick={onAssignSelected}
              disabled={submitting}
            >
              {submitting ? "กำลัง Assign..." : "Assign Selected"}
            </button>
          </div>
        </div>

        <DataTable<LicenseItem>
          columns={columns}
          rows={effectiveRows}
          totalRows={totalRows}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMsg || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
          emptyMessage="ไม่มี License"
          pagination={{ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }}
          onPaginationChange={(p) => setPagination(p)}
          sorting={sorting}
          onSortingChange={setSorting}
          clientSideSort
          // selection
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          maxBodyHeight={420}
        />

        {/* errors / summary */}
        {errorMsg && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
        {bulkResults && (
          <div className="mt-3 rounded border bg-white p-3">
            <h4 className="mb-2 text-sm font-semibold">สรุปผล</h4>
            <ul className="list-disc pl-5 text-sm">
              {bulkResults.map((r, idx) => (
                <li key={`${r.licenseId}-${idx}`} className={r.status === "success" ? "text-green-700" : "text-red-700"}>
                  {r.licenseId}: {r.status} {r.message ? `— ${r.message}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DetailShell>
  );
}
