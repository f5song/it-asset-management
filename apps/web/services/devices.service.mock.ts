
// src/services/devices.service.mock.ts

import type {
  DeviceItem,
  DeviceListQuery,
  DeviceListResponse,
} from "types/device"; // หรือ "types" ตาม alias โปรเจกต์ของคุณ

/** ----------------------------------------------------------------
 *  Mock dataset
 *  ---------------------------------------------------------------- */
const MOCK_DEVICES: DeviceItem[] = Array.from({ length: 57 }).map((_, i) => ({
  id: `D-${i + 1}`,
  name: `Device ${i + 1}`,
  type: i % 2 === 0 ? "Laptop" : "Desktop",
  assignedTo: i % 3 === 0 ? `user${i}` : "", // แนะนำให้เก็บเป็น employeeId จริง ๆ ในระบบคุณ
  os: ["Windows", "macOS", "Linux"][i % 3],
  compliance: i % 2 === 0 ? "Compliant" : "Non-Compliant",
  lastScan: "2026-01-10",
}));

/** ----------------------------------------------------------------
 *  Utils
 *  ---------------------------------------------------------------- */
function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        const err = Object.assign(new Error("Aborted"), { name: "AbortError" });
        reject(err);
      });
    }
  });
}

const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));
const isAssigned = (d: DeviceItem) => !!(d.assignedTo && d.assignedTo.trim().length > 0);
const normOS = (s: string) => (ci(s) === "macos" ? "macos" : ci(s));

/** ----------------------------------------------------------------
 *  Service APIs
 *  ---------------------------------------------------------------- */

/** GET /devices/:id */
export async function getDeviceById(
  id: string | number,
  signal?: AbortSignal
): Promise<DeviceItem | null> {
  await delay(80, signal);
  return MOCK_DEVICES.find((d) => String(d.id) === String(id)) ?? null;
}

/**
 * GET /devices (with filters/sort/pagination)
 * - q: DeviceListQuery
 * - return: DeviceListResponse (OffsetPage)
 */
export async function getDevices(
  q: DeviceListQuery,
  signal?: AbortSignal
): Promise<DeviceListResponse> {
  await delay(150, signal);

  let filtered = [...MOCK_DEVICES];

  // 1) Search (name/id/assignedTo)
  const kw = (q.search ?? "").trim();
  if (kw) {
    filtered = filtered.filter(
      (d) =>
        includesCI(d.name, kw) ||
        includesCI(d.id, kw) ||
        includesCI(d.assignedTo ?? "", kw)
    );
  }

  // 2) Filters
  if (q.deviceGroup) {
    const g = ci(q.deviceGroup);
    if (g === "assigned") filtered = filtered.filter((d) => isAssigned(d));
    else if (g === "unassigned") filtered = filtered.filter((d) => !isAssigned(d));
  }

  if (q.deviceType) {
    const t = ci(q.deviceType);
    filtered = filtered.filter((d) => ci(String(d.type)) === t);
  }

  if (q.os) {
    const os = normOS(q.os);
    filtered = filtered.filter((d) => normOS(String(d.os)) === os);
  }

  // 3) Sort
  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof DeviceItem;

    filtered.sort((a, b) => {
      const A = (a[key] as any) ?? "";
      const B = (b[key] as any) ?? "";

      // number
      if (typeof A === "number" && typeof B === "number") {
        return (A - B) * dir;
      }

      // date (ISO-ish)
      const dA = new Date(A);
      const dB = new Date(B);
      const isDateA = !isNaN(dA.valueOf());
      const isDateB = !isNaN(dB.valueOf());
      if (isDateA && isDateB) {
        return (dA.getTime() - dB.getTime()) * dir;
      }

      // string (numeric-aware)
      return String(A).localeCompare(String(B), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * dir;
    });
  }

  // 4) Pagination (1-based)
  const totalCount = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.max(1, Number(q.pageSize ?? 10));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasNext,
    hasPrev,
    totalPages,
  };
}

/**
 * GET /devices?employeeId=... — ดึงเครื่องของพนักงาน (คืน DeviceItem[])
 * - เปรียบเทียบแบบ case-insensitive/trim เพื่อให้ทนกับ mock data
 */
export async function getDevicesByEmployee(
  employeeId: string,
  signal?: AbortSignal
): Promise<DeviceItem[]> {
  await delay(120, signal);
  const key = String(employeeId).trim().toLowerCase();
  return MOCK_DEVICES.filter(
    (d) => String(d.assignedTo ?? "").trim().toLowerCase() === key
  );
}

/** Utility: นับจำนวนเครื่องของผู้ใช้แต่ละคน (demo 0..2 เครื่อง) */
export async function fetchDeviceCountsByUserIds(
  userIds: string[]
): Promise<Record<string, number>> {
  await delay(60);
  const map: Record<string, number> = {};
  for (const id of userIds) {
    map[id] = Math.floor(Math.random() * 3);
  }
  return map;
}

/** (optional) ช่วยให้ทดสอบง่าย: ผูกเครื่องกับพนักงานใน mock */
export async function assignDeviceToEmployee(
  deviceId: string,
  employeeId: string,
  signal?: AbortSignal
): Promise<DeviceItem | null> {
  await delay(80, signal);
  const idx = MOCK_DEVICES.findIndex((d) => String(d.id) === String(deviceId));
  if (idx < 0) return null;
  const next: DeviceItem = { ...MOCK_DEVICES[idx], assignedTo: employeeId };
  MOCK_DEVICES[idx] = next;
  return next;
}
