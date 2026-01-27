// src/components/assign/AssignFormCore.tsx
"use client";

import * as React from "react";

import type {
  AssignMode,
  LicenseAssignFormValues,
  EmployeeAssignFormValues,
  AssignExtras,
  SeatCountUnit,
} from "types/assign";
import type { Employees } from "types/employees";
import type { LicenseItem } from "types";
import type { DeviceItem } from "types/device";

import EmployeeMultiPicker from "./EmployeeMultiPicker";
import LicenseMultiPicker from "./LicenseMultiPicker";
import DeviceChooser from "./DeviceChooser";
import { isPerDevice, sumSeats, trimUnitsToAvailable } from "lib/seat-cal";

type Props = {
  mode: AssignMode;

  license?: LicenseItem; // ต้องส่งเมื่อ mode = licenseToEmployee
  employee?: Employees; // ต้องส่งเมื่อ mode = employeeToLicense

  employees: Employees[]; // candidates
  devices: DeviceItem[]; // candidates
  licenses: LicenseItem[]; // candidates (สำหรับ employee→license)

  onSubmit?: (
    payload: LicenseAssignFormValues | EmployeeAssignFormValues,
    extras?: AssignExtras,
  ) => Promise<void> | void;
};

export default function AssignFormCore({
  mode,
  license,
  employee,
  employees,
  devices,
  licenses,
  onSubmit,
}: Props) {
  const [seatMode, setSeatMode] = React.useState<"partial" | "all-or-nothing">(
    "partial",
  );

  const [installedOn, setInstalledOn] = React.useState(
    new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
  );

  // ------------ state selection ------------
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<
    string[]
  >([]);
  const [selectedLicenseIds, setSelectedLicenseIds] = React.useState<string[]>(
    [],
  );

  // mapping ต่อโหมด:
  // license → employee: employeeId -> deviceIds[]
  const [deviceIdsByEmployee, setDeviceIdsByEmployee] = React.useState<
    Record<string, string[]>
  >({});

  // employee → license: licenseId -> deviceIds[]
  const [deviceIdsByLicense, setDeviceIdsByLicense] = React.useState<
    Record<string, string[]>
  >({});

  // ------------ helper togglers ------------
  const toggleEmployee = (id: string, checked: boolean) => {
    setSelectedEmployeeIds((prev) => {
      const set = new Set(prev);
      if (checked) set.add(id);
      else {
        set.delete(id);
        setDeviceIdsByEmployee((m) => {
          const next = { ...m };
          delete next[id];
          return next;
        });
      }
      return Array.from(set);
    });
  };

  const toggleLicense = (id: string, checked: boolean) => {
    setSelectedLicenseIds((prev) => {
      const set = new Set(prev);
      if (checked) set.add(id);
      else {
        set.delete(id);
        setDeviceIdsByLicense((m) => {
          const next = { ...m };
          delete next[id];
          return next;
        });
      }
      return Array.from(set);
    });
  };

  // ------------ derive seats ------------
  // available/inUse/total (ขึ้นกับโหมดด้วย)
  const { available, total, inUse } = React.useMemo(() => {
    if (mode === "licenseToEmployee" && license) {
      return {
        total: license.total,
        inUse: license.inUse,
        available: license.total - license.inUse,
      };
    }
    // employee→license: รวม availability ของไลเซนส์ที่เลือก “โดยประมาณ”
    const selected = licenses.filter((l) => selectedLicenseIds.includes(l.id));
    const total = selected.reduce((n, l) => n + l.total, 0);
    const inUse = selected.reduce((n, l) => n + l.inUse, 0);
    return { total, inUse, available: Math.max(0, total - inUse) };
  }, [mode, license, licenses, selectedLicenseIds]);

  // สร้าง units (รายการ seat ที่ใช้จริง)
  const units: SeatCountUnit[] = React.useMemo(() => {
    if (mode === "licenseToEmployee" && license) {
      if (!selectedEmployeeIds.length) return [];
      if (!isPerDevice(license)) {
        // per-user: 1 seat ต่อพนักงาน
        return [{ licenseId: license.id, amount: selectedEmployeeIds.length }];
      }
      // per-device: รวมจำนวนเครื่องต่อพนักงานทั้งหมด
      const totalDevices = selectedEmployeeIds.reduce(
        (sum, empId) => sum + (deviceIdsByEmployee[empId] ?? []).length,
        0,
      );
      return [{ licenseId: license.id, amount: totalDevices }];
    }

    // employee → license
    if (mode === "employeeToLicense" && employee) {
      const sel = licenses.filter((l) => selectedLicenseIds.includes(l.id));
      const list: SeatCountUnit[] = [];
      for (const l of sel) {
        if (!isPerDevice(l)) {
          list.push({ licenseId: l.id, amount: 1 });
        } else {
          const c = (deviceIdsByLicense[l.id] ?? []).length;
          list.push({ licenseId: l.id, amount: c });
        }
      }
      return list;
    }
    return [];
  }, [
    mode,
    license,
    employee,
    selectedEmployeeIds,
    deviceIdsByEmployee,
    selectedLicenseIds,
    deviceIdsByLicense,
    licenses,
  ]);

  const newly = sumSeats(units);
  const willExceed = newly > available;

  // ------------- submit -------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "licenseToEmployee" && license) {
      if (!selectedEmployeeIds.length)
        return alert("กรุณาเลือกพนักงานอย่างน้อย 1 คน");
      if (newly === 0) return alert("ยังไม่มี seat ที่จะถูกใช้");

      // partial: ตัดให้พอดีกับ available อย่างง่าย
      let effEmployeeIds = [...selectedEmployeeIds];
      let effMap = { ...deviceIdsByEmployee };

      if (willExceed && seatMode === "partial") {
        if (!isPerDevice(license)) {
          effEmployeeIds = effEmployeeIds.slice(0, available);
        } else {
          let remain = available;
          const trimmed: Record<string, string[]> = {};
          for (const empId of effEmployeeIds) {
            if (remain <= 0) break;
            const list = (effMap[empId] ?? []).slice(0, remain);
            if (list.length) {
              trimmed[empId] = list;
              remain -= list.length;
            }
          }
          effMap = trimmed;
          // ลบ emp ที่ไม่มี device เหลือ
          effEmployeeIds = effEmployeeIds.filter(
            (id) => (effMap[id]?.length ?? 0) > 0 || !isPerDevice(license),
          );
        }
      } else if (willExceed && seatMode === "all-or-nothing") {
        return alert(
          `Seat ไม่พอ (Available: ${available}) — โหมด all-or-nothing ไม่อนุญาตให้เกิน`,
        );
      }

      const mapping = effEmployeeIds.map((empId) => ({
        employeeId: empId,
        ...(isPerDevice(license)
          ? { deviceCount: effMap[empId]?.length ?? 0 }
          : {}),
      }));

      const payload: LicenseAssignFormValues = {
        licenseId: license.id,
        employees: employees.filter((e) => effEmployeeIds.includes(e.id)),
        mapping,
        seatMode,
        installedOn,
      };

      const extras: AssignExtras | undefined = isPerDevice(license)
        ? { deviceIdsByEmployee: effMap }
        : undefined;

      if (onSubmit) await onSubmit(payload, extras);
      else {
        console.log("Assign (license→employee):", payload, extras);
        alert("Assigned (mock) — ดู console");
      }
      return;
    }

    if (mode === "employeeToLicense" && employee) {
      if (!selectedLicenseIds.length)
        return alert("กรุณาเลือกไลเซนส์อย่างน้อย 1 รายการ");
      if (newly === 0) return alert("ยังไม่มี seat ที่จะถูกใช้");

      // partial/all-or-nothing แบบง่าย
      let effUnits = [...units];
      if (willExceed && seatMode === "partial") {
        effUnits = trimUnitsToAvailable(effUnits, available);
      } else if (willExceed && seatMode === "all-or-nothing") {
        return alert(
          `Seat ไม่พอ (Available: ${available}) — โหมด all-or-nothing ไม่อนุญาตให้เกิน`,
        );
      }

      // สร้าง payload: ต่อไลเซนส์
      const licenseMap: EmployeeAssignFormValues["licenses"] = effUnits.map(
        (u) => {
          const l = licenses.find((x) => x.id === u.licenseId)!;
          const deviceIds = (deviceIdsByLicense[l.id] ?? []).slice(0, u.amount); // ตัดให้พอดี
          return {
            item: l,
            map: {
              licenseId: l.id,
              deviceCount: isPerDevice(l) ? u.amount : undefined,
              deviceIds: isPerDevice(l) ? deviceIds : undefined,
            },
          };
        },
      );

      const payload: EmployeeAssignFormValues = {
        employeeId: employee.id,
        licenses: licenseMap,
        seatMode,
        installedOn,
      };

      const extras: AssignExtras | undefined = licenseMap.some(
        (x) => x.map.deviceIds?.length,
      )
        ? { deviceIdsByLicense }
        : undefined;

      if (onSubmit) await onSubmit(payload, extras);
      else {
        console.log("Assign (employee→license):", payload, extras);
        alert("Assigned (mock) — ดู console");
      }
      return;
    }
  };

  // UI per mode
  const InfoPanel = () => (
    <section className="rounded-md border border-slate-200 p-4">
      <h2 className="font-semibold mb-3">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div>
          Total: <b>{total}</b>
        </div>
        <div>
          In Use: <b>{inUse}</b>
        </div>
        <div>
          Available: <b>{available}</b>
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
        <label className="text-sm">
          Seat mode:
          <select
            className="ml-2 rounded border border-slate-300 px-2 py-1"
            value={seatMode}
            onChange={(e) =>
              setSeatMode(e.target.value as "partial" | "all-or-nothing")
            }
          >
            <option value="partial">Partial</option>
            <option value="all-or-nothing">All or Nothing</option>
          </select>
        </label>

        <label className="text-sm">
          Installed on:
          <input
            type="date"
            className="ml-2 rounded border border-slate-300 px-2 py-1"
            value={installedOn}
            onChange={(e) => setInstalledOn(e.target.value)}
          />
        </label>
      </div>

      <p
        className={`mt-3 text-sm ${willExceed ? "text-red-600" : "text-slate-600"}`}
      >
        จะใช้ที่นั่งเพิ่ม: <b>{newly}</b> · หลัง Assign จะเป็น{" "}
        <b>{inUse + newly}</b>/<b>{total}</b>
        {willExceed && " (เกิน seat)"}
      </p>
    </section>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Summary */}
      <InfoPanel />

      {/* Target Pickers */}
      {mode === "licenseToEmployee" && license && (
        <>
          <EmployeeMultiPicker
            employees={employees}
            selectedIds={selectedEmployeeIds}
            onToggle={toggleEmployee}
          />
          {/* per-device: ให้เลือก device ต่อพนักงาน */}
          {isPerDevice(license) && selectedEmployeeIds.length > 0 && (
            <section className="rounded-md border border-slate-200 p-4">
              <h3 className="font-semibold mb-3">
                เลือกเครื่องสำหรับพนักงานที่ถูกเลือก
              </h3>
              {selectedEmployeeIds.map((empId) => (
                <div key={empId} className="mb-4">
                  <div className="text-sm font-medium mb-1">
                    Employee: {empId}
                  </div>
                  <DeviceChooser
                    devices={devices}
                    selected={deviceIdsByEmployee[empId] ?? []}
                    onToggle={(deviceId, checked) =>
                      setDeviceIdsByEmployee((m) => {
                        const cur = m[empId] ?? [];
                        const set = new Set(cur);
                        if (checked) set.add(deviceId);
                        else set.delete(deviceId);
                        return { ...m, [empId]: Array.from(set) };
                      })
                    }
                  />
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {mode === "employeeToLicense" && employee && (
        <>
          <LicenseMultiPicker
            licenses={licenses}
            selectedIds={selectedLicenseIds}
            onToggle={toggleLicense}
          />
          {/* per-device: ให้เลือก device ต่อไลเซนส์ */}
          {selectedLicenseIds.length > 0 && (
            <section className="rounded-md border border-slate-200 p-4">
              <h3 className="font-semibold mb-3">
                เลือกเครื่องสำหรับไลเซนส์ที่ถูกเลือก
              </h3>
              {selectedLicenseIds.map((licId) => {
                const lic = licenses.find((l) => l.id === licId)!;
                if (!isPerDevice(lic)) return null;
                return (
                  <div key={licId} className="mb-4">
                    <div className="text-sm font-medium mb-1">
                      License: {lic.softwareName} ({lic.licenseModel})
                    </div>
                    <DeviceChooser
                      devices={devices}
                      selected={deviceIdsByLicense[licId] ?? []}
                      onToggle={(deviceId, checked) =>
                        setDeviceIdsByLicense((m) => {
                          const cur = m[licId] ?? [];
                          const set = new Set(cur);
                          if (checked) set.add(deviceId);
                          else set.delete(deviceId);
                          return { ...m, [licId]: Array.from(set) };
                        })
                      }
                    />
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-50"
          disabled={
            (mode === "licenseToEmployee" &&
              selectedEmployeeIds.length === 0) ||
            (mode === "employeeToLicense" && selectedLicenseIds.length === 0) ||
            (willExceed && seatMode === "all-or-nothing")
          }
        >
          Confirm Assign
        </button>
        <span className="text-sm text-slate-600">
          {newly > 0 ? `ที่นั่งที่จะใช้: ${newly}` : "ยังไม่มีการเลือก"}
        </span>
      </div>
    </form>
  );
}
