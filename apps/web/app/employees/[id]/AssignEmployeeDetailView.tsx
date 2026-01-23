
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView } from "components/detail/DetailView";
import type { Employees } from "types/employees";
import type { BreadcrumbItem, HistoryEvent } from "types";
import type { LicenseItem } from "types/license";
import type { DeviceItem } from "types/device";

// Services
import { getAvailableLicenses } from "services/licenses.service.mock";
import { getDevicesByEmployee } from "services/devices.service.mock";
import { assignLicense, assignMany } from "services/assign.service.mock";

/* ---------------- Local types ---------------- */
type BulkSelection = { licenseId: string; deviceId?: string };
type AssignManyResult = {
  licenseId: string;
  status: "success" | "error";
  message?: string;
  assignmentId?: string;
};

/* ---------------- Utilities ---------------- */
const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);

/* ---------------- Main ---------------- */
export default function AssignEmployeeDetailView({
  employee,
  breadcrumbs,
}: {
  employee: Employees;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"single" | "bulk">("bulk");
  const [licenses, setLicenses] = React.useState<LicenseItem[]>([]);
  const [devices, setDevices] = React.useState<DeviceItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // --- Single state ---
  const [selectedLicenseId, setSelectedLicenseId] = React.useState("");
  const [selectedDeviceId, setSelectedDeviceId] = React.useState("");

  // --- Bulk state ---
  const [bulkSelected, setBulkSelected] = React.useState<
    Record<string, { checked: boolean; deviceId?: string }>
  >({});
  const [bulkResults, setBulkResults] = React.useState<AssignManyResult[] | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setError(null);

    getAvailableLicenses()
      .then((ls) => mounted && setLicenses(ls))
      .catch((e) => mounted && setError(e?.message || "โหลดข้อมูล License ไม่สำเร็จ"));

    getDevicesByEmployee(employee.id)
      .then((ds) => mounted && setDevices(ds))
      .catch((_e) => mounted && setDevices([]));

    return () => {
      mounted = false;
    };
  }, [employee.id]);

  const selectedLicense = React.useMemo(
    () => licenses.find((l) => l.id === selectedLicenseId),
    [licenses, selectedLicenseId]
  );

  const seatsLeft = React.useMemo(() => {
    if (!selectedLicense) return 0;
    const left = selectedLicense.available ?? (selectedLicense.total - selectedLicense.inUse);
    return Math.max(0, left || 0);
  }, [selectedLicense]);

  /* ---------------- Handlers ---------------- */

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLicenseId) return setError("กรุณาเลือก License");
    if (selectedLicense?.perType === "per_device" && !selectedDeviceId) {
      return setError("License นี้เป็น Per-device กรุณาเลือก Device");
    }
    if (selectedLicense && seatsLeft <= 0) {
      return setError("License นี้ไม่มีที่นั่ง (seat) เหลือ");
    }

    setLoading(true);
    try {
      await assignLicense({
        licenseId: selectedLicenseId,
        employeeId: employee.id,
        deviceId: selectedLicense?.perType === "per_device" ? selectedDeviceId : undefined,
        idempotencyKey:
          (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      });
      router.push(`/employees/${employee.id}`);
      router.refresh?.();
    } catch (e: any) {
      setError(e?.message || "ไม่สามารถ Assign License ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBulkResults(null);

    const items: BulkSelection[] = Object.entries(bulkSelected)
      .filter(([, v]) => v.checked)
      .map(([licenseId, v]) => ({ licenseId, deviceId: v.deviceId }));

    if (items.length === 0) {
      setError("กรุณาเลือกอย่างน้อย 1 License");
      return;
    }

    const perDeviceErrors: string[] = [];
    for (const it of items) {
      const lic = licenses.find((l) => l.id === it.licenseId);
      if (!lic) continue;
      const left = lic.available ?? (lic.total - lic.inUse);
      if (lic.perType === "per_device" && !it.deviceId) {
        perDeviceErrors.push(`${lic.softwareName || it.licenseId}: ยังไม่เลือก Device`);
      }
      if ((left ?? 0) <= 0) {
        perDeviceErrors.push(`${lic.softwareName || it.licenseId}: ไม่มีที่นั่ง (seat) เหลือ`);
      }
    }
    if (perDeviceErrors.length > 0) {
      setError(perDeviceErrors.join(" | "));
      return;
    }

    setLoading(true);
    try {
      const results = await assignMany({
        employeeId: employee.id,
        items: items.map((it) => ({
          licenseId: it.licenseId,
          deviceId: it.deviceId,
          idempotencyKey:
            (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        })),
      });

      setBulkResults(results);

      const allOk = results.every((r) => r.status === "success");
      if (allOk) {
        router.push(`/employees/${employee.id}`);
        router.refresh?.();
      }
    } catch (e: any) {
      setError(e?.message || "ไม่สามารถ Assign แบบกลุ่มได้");
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = (checked: boolean) => {
    const next: typeof bulkSelected = {};
    for (const l of licenses) {
      const left = l.available ?? (l.total - l.inUse);
      const can = (left ?? 0) > 0;
      next[l.id] = { checked: checked && can, deviceId: bulkSelected[l.id]?.deviceId };
    }
    setBulkSelected(next);
  };

  const checkedCount = React.useMemo(
    () => Object.values(bulkSelected).filter((v) => v.checked).length,
    [bulkSelected]
  );

  /* ---------------- Render Section (ส่งเข้า DetailView) ---------------- */

  function AssignSection() {
    return (
      <div className="space-y-6">
        {/* Mode Switch */}
        <div className="flex items-center gap-2">
          <button
            className={`rounded border px-3 py-1.5 text-sm ${
              mode === "single" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"
            }`}
            onClick={() => setMode("single")}
            type="button"
          >
            Single
          </button>
          <button
            className={`rounded border px-3 py-1.5 text-sm ${
              mode === "bulk" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"
            }`}
            onClick={() => setMode("bulk")}
            type="button"
          >
            Bulk
          </button>
        </div>

        {/* Single */}
        {mode === "single" && (
          <form onSubmit={handleSubmitSingle} className="space-y-6">
            <section className="rounded-md border bg-white p-4">
              <h2 className="mb-3 text-base font-semibold">เลือก License</h2>
              <div className="space-y-2">
                <select
                  className="w-full rounded border px-3 py-2"
                  value={selectedLicenseId}
                  onChange={(e) => {
                    setSelectedLicenseId(e.target.value);
                    setSelectedDeviceId("");
                  }}
                >
                  <option value="">— เลือก License —</option>
                  {licenses.map((l) => {
                    const left = l.available ?? (l.total - l.inUse);
                    return (
                      <option key={l.id} value={l.id} disabled={(left ?? 0) <= 0}>
                        {l.softwareName} ({l.sku ?? "—"}) ·{" "}
                        {l.perType === "per_user" ? "Per-user" : "Per-device"} · เหลือ{" "}
                        {Math.max(0, left || 0)}
                      </option>
                    );
                  })}
                </select>

                {selectedLicense && (
                  <p className="text-xs text-gray-500">
                    Vendor: {selectedLicense.manufacturer || "—"} · Seats:{" "}
                    {selectedLicense.inUse}/{selectedLicense.total} (เหลือ {seatsLeft})
                  </p>
                )}
              </div>
            </section>

            {selectedLicense?.perType === "per_device" && (
              <section className="rounded-md border bg-white p-4">
                <h2 className="mb-3 text-base font-semibold">เลือก Device (Per-device)</h2>
                <div className="space-y-2">
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                  >
                    <option value="">— เลือก Device —</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.id}){d.os ? ` · ${d.os}` : ""}
                      </option>
                    ))}
                  </select>
                  {devices.length === 0 && (
                    <p className="text-xs text-amber-600">
                      * ยังไม่พบ Device ของพนักงานคนนี้ คุณสามารถเพิ่ม Device ก่อนแล้วกลับมา Assign ใหม่
                    </p>
                  )}
                </div>
              </section>
            )}

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-2 hover:bg-gray-50"
                onClick={() => router.back()}
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : "Assign"}
              </button>
            </div>
          </form>
        )}

        {/* Bulk */}
        {mode === "bulk" && (
          <form onSubmit={handleSubmitBulk} className="space-y-6">
            <section className="rounded-md border bg-white p-4">
              <h2 className="mb-3 text-base font-semibold">เลือกหลาย License (Bulk)</h2>

              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  เลือกได้หลายรายการ · ที่เลือกอยู่:{" "}
                  <span className="font-medium">
                    {Object.values(bulkSelected).filter((v) => v.checked).length}
                  </span>{" "}
                  รายการ
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
                    onClick={() => toggleAll(true)}
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-sm hover:bg-gray-50"
                    onClick={() => toggleAll(false)}
                  >
                    ยกเลิกทั้งหมด
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="px-3 py-2 w-10"></th>
                      <th className="px-3 py-2">License</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Seats</th>
                      <th className="px-3 py-2">Device (ถ้า Per-device)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((l) => {
                      const left = l.available ?? (l.total - l.inUse);
                      const disabled = (left ?? 0) <= 0;
                      const row = bulkSelected[l.id] || { checked: false, deviceId: "" };
                      const needDevice = l.perType === "per_device" && row.checked;

                      return (
                        <tr key={l.id} className="border-t">
                          <td className="px-3 py-2 align-top">
                            <input
                              type="checkbox"
                              checked={row.checked && !disabled}
                              disabled={disabled}
                              onChange={(e) =>
                                setBulkSelected((prev) => ({
                                  ...prev,
                                  [l.id]: {
                                    checked: e.target.checked && !disabled,
                                    deviceId: prev[l.id]?.deviceId,
                                  },
                                }))
                              }
                            />
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="font-medium">{l.softwareName}</div>
                            <div className="text-xs text-gray-500">
                              Vendor: {l.manufacturer || "—"}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">{l.sku ?? "—"}</td>
                          <td className="px-3 py-2 align-top">
                            {l.perType === "per_user" ? "Per-user" : "Per-device"}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {l.inUse}/{l.total}{" "}
                            <span className={(left ?? 0) <= 0 ? "text-red-600" : "text-gray-600"}>
                              (เหลือ {Math.max(0, left || 0)})
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top">
                            {l.perType === "per_device" ? (
                              <select
                                className="w-full rounded border px-2 py-1"
                                disabled={!needDevice}
                                value={row.deviceId || ""}
                                onChange={(e) =>
                                  setBulkSelected((prev) => ({
                                    ...prev,
                                    [l.id]: {
                                      ...(prev[l.id] || { checked: true }),
                                      deviceId: e.target.value,
                                    },
                                  }))
                                }
                              >
                                <option value="">— เลือก Device —</option>
                                {devices.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} ({d.id}){d.os ? ` · ${d.os}` : ""}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Bulk Results Summary */}
              {bulkResults && (
                <section className="mt-4 rounded-md border bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold">สรุปผลการ Assign (Bulk)</h3>
                  <div className="overflow-hidden rounded border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left">
                          <th className="px-3 py-2">License</th>
                          <th className="px-3 py-2">สถานะ</th>
                          <th className="px-3 py-2">รายละเอียด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResults.map((r) => {
                          const lic = licenses.find((l) => l.id === r.licenseId);
                          return (
                            <tr
                              key={`${r.licenseId}-${r.assignmentId || Math.random()}`}
                              className="border-t"
                            >
                              <td className="px-3 py-2">{lic?.softwareName || r.licenseId}</td>
                              <td className="px-3 py-2">
                                {r.status === "success" ? (
                                  <span className="text-green-700">สำเร็จ</span>
                                ) : (
                                  <span className="text-red-700">ล้มเหลว</span>
                                )}
                              </td>
                              <td className="px-3 py-2">{r.message || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </section>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-2 hover:bg-gray-50"
                onClick={() => router.back()}
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : `Assign ${checkedCount > 0 ? `(${checkedCount})` : ""}`}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  /* ---------------- history (optional/demo) ---------------- */
  const historyData: HistoryEvent[] = []; // ถ้ายังไม่มี ให้เป็น [] (แท็บ History จะยังแสดง)

  return (
    <DetailView
      title={`Assign License • ${employee.name || employee.id}`}
      compliance={undefined}
      installationTabLabel="Assign"
      info={{
        left: [
          { label: "Employee ID", value: show(employee.id) },
          { label: "Email", value: show(employee.email) },
          { label: "Department", value: show(employee.department) },
        ],
        right: [
          { label: "Status", value: show(employee.status) },
          { label: "Job Title", value: show(employee.jobTitle) },
          { label: "Phone", value: show(employee.phone) },
        ],
      }}
      installationSection={<AssignSection />}
      history={historyData}
      onBack={() => router.back()}
      onDelete={undefined}          // หน้านี้โดยทั่วไปไม่ต้องมี delete
      editConfig={undefined}        // หากต้องการแก้ไข employee จากหน้านี้ สามารถใส่ได้
      breadcrumbs={breadcrumbs}
      headerRightExtra={undefined}  // ถ้าต้องการปุ่มเสริมบน header ใส่ตรงนี้
    />
  );
}
