
// src/services/assignments.service.mock.ts
import { getLicenseById, consumeSeat, releaseSeat } from "./licenses.service.mock";

type AssignmentRecord = {
  id: string;
  licenseId: string;
  employeeId?: string | null;
  deviceId?: string | null;
  status: "active" | "pending" | "revoked" | "failed";
  effectiveAt?: string | null;
  expiresAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
};

const _assignments: AssignmentRecord[] = [];
const _idemSeen = new Set<string>();
const _bulkSeen = new Set<string>(); // idempotency สำหรับ bulk

function asPerType(licenseModel?: string): "per_user" | "per_device" {
  const lm = (licenseModel || "").toLowerCase();
  return lm.includes("device") ? "per_device" : "per_user";
}

function nowIso() {
  return new Date().toISOString();
}

export async function assignLicense(params: {
  licenseId: string;
  employeeId?: string;
  deviceId?: string;
  effectiveAt?: string;
  expiresAt?: string;
  idempotencyKey?: string;
}) {
  await delay(150);

  const { licenseId, employeeId, deviceId, idempotencyKey, effectiveAt, expiresAt } = params;
  if (!licenseId) throw new Error("licenseId is required");
  if (!employeeId) throw new Error("employeeId is required");

  // Idempotency (per-call)
  if (idempotencyKey) {
    if (_idemSeen.has(idempotencyKey)) {
      const last = _assignments
        .slice()
        .reverse()
        .find(
          (a) =>
            a.employeeId === employeeId &&
            a.licenseId === licenseId &&
            a.deviceId === (deviceId || null)
        );
      if (last) return last;
    } else {
      _idemSeen.add(idempotencyKey);
    }
  }

  const license = await getLicenseById(licenseId);
  if (!license) throw new Error("License not found");

  const perType = asPerType(license.licenseModel);
  if (perType === "per_device" && !deviceId) {
    throw new Error("device-required");
  }

  // duplicate
  const dup = _assignments.find(
    (a) =>
      a.licenseId === licenseId &&
      a.employeeId === employeeId &&
      (perType === "per_user" ? true : a.deviceId === (deviceId || null)) &&
      a.status === "active"
  );
  if (dup) {
    return dup; // idempotent-ish
  }

  // seats
  const available = (license.available ?? (license.total - (license.inUse ?? 0)));
  if (available <= 0) {
    throw new Error("Seat ไม่พอ");
  }

  await consumeSeat(licenseId, 1);

  const rec: AssignmentRecord = {
    id: `asg-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    licenseId,
    employeeId,
    deviceId: perType === "per_device" ? (deviceId || null) : null,
    status: "active",
    effectiveAt: effectiveAt || nowIso(),
    expiresAt: expiresAt || null,
    createdAt: nowIso(),
  };

  _assignments.push(rec);
  return rec;
}

/**
 * ✅ Bulk assign แบบ "หนึ่ง license ให้พนักงานหลายคน" (สอดคล้องกับสัญญาที่คุณให้มา)
 * - seatMode:
 *    - "partial" (ค่าเริ่มต้น): best-effort, บางรายการล้มเหลวได้
 *    - "all-or-nothing": ถ้าที่นั่งไม่พอ → ไม่ทำอะไรเลยและคืน failed ทั้งหมด
 * - exception: ถ้ามีจะถือว่า "ข้าม" และคืน failed ตาม reason
 */
export async function assignLicenseBulk(payload: {
  licenseId: string;
  installedOn: string; // effectiveAt
  seatMode: "partial" | "all-or-nothing";
  requestId: string;
  items: { employeeId: string; exception: { reason: string } | null }[];
}): Promise<{ ok: boolean; assigned: number; failed: { employeeId: string; reason: string }[] }> {
  await delay(120);

  const { licenseId, installedOn, seatMode, requestId, items } = payload;
  if (!licenseId) throw new Error("licenseId is required");
  if (!Array.isArray(items)) throw new Error("items is required");

  // Bulk idempotency (อย่างง่าย)
  if (_bulkSeen.has(requestId)) {
    // คืนผลว่าไม่มีการทำซ้ำ (เพื่อไม่กิน seat เพิ่ม)
    return { ok: true, assigned: 0, failed: [] };
  }
  _bulkSeen.add(requestId);

  const license = await getLicenseById(licenseId);
  if (!license) {
    return { ok: false, assigned: 0, failed: items.map((it) => ({ employeeId: it.employeeId, reason: "license-not-found" })) };
  }

  const perType = asPerType(license.licenseModel);
  if (perType === "per_device") {
    // payload นี้ไม่มี deviceId ต่อรายการ → ไม่รองรับ per-device
    // สามารถเปลี่ยนเป็นรองรับได้ถ้าเพิ่มฟิลด์ deviceId ต่อ item
    return {
      ok: false,
      assigned: 0,
      failed: items.map((it) => ({ employeeId: it.employeeId, reason: "device-required" })),
    };
  }

  // เตรียมชุดผู้ที่มีสิทธิ์ (ไม่นับ exception)
  const candidates = items
    .filter((it) => !it.exception)
    .map((it) => it.employeeId);

  // กรอง duplicate ที่มีอยู่แล้ว
  const dedup = candidates.filter((employeeId) => {
    const existed = _assignments.find(
      (a) => a.licenseId === licenseId && a.employeeId === employeeId && a.status === "active"
    );
    return !existed;
  });

  const needSeats = dedup.length;
  const available = (license.available ?? (license.total - (license.inUse ?? 0)));

  // all-or-nothing: ถ้าที่นั่งไม่พอ → fail ทั้งชุด
  if (seatMode === "all-or-nothing" && available < needSeats) {
    const notEnough = dedup.map((employeeId) => ({ employeeId, reason: "seat-insufficient" }));
    const failed = [
      ...items.filter((it) => it.exception).map((it) => ({ employeeId: it.employeeId, reason: it.exception!.reason || "exception" })),
      ...notEnough,
      ...candidates
        .filter((employeeId) => !dedup.includes(employeeId))
        .map((employeeId) => ({ employeeId, reason: "duplicate" })),
    ];
    return { ok: false, assigned: 0, failed };
  }

  // partial (best-effort)
  const failed: { employeeId: string; reason: string }[] = [
    ...items.filter((it) => it.exception).map((it) => ({ employeeId: it.employeeId, reason: it.exception!.reason || "exception" })),
    ...candidates
      .filter((employeeId) => !dedup.includes(employeeId))
      .map((employeeId) => ({ employeeId, reason: "duplicate" })),
  ];

  let assigned = 0;
  const toRollback: AssignmentRecord[] = [];

  for (const employeeId of dedup) {
    try {
      // ตรวจ seat เหลือ ณ ขณะนี้
      const licNow = await getLicenseById(licenseId);
      const availNow = (licNow?.available ?? ((licNow?.total || 0) - (licNow?.inUse || 0)));
      if (availNow <= 0) throw new Error("seat-insufficient");

      await consumeSeat(licenseId, 1);

      const rec: AssignmentRecord = {
        id: `asg-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        licenseId,
        employeeId,
        deviceId: null,
        status: "active",
        effectiveAt: installedOn || nowIso(),
        createdAt: nowIso(),
      };
      _assignments.push(rec);
      toRollback.push(rec);
      assigned += 1;
    } catch (e: any) {
      failed.push({ employeeId, reason: e?.message || "assign-failed" });

      if (seatMode === "all-or-nothing") {
        // rollback ทั้งหมดที่ทำไปแล้ว
        for (const r of toRollback) {
          await releaseSeat(r.licenseId, 1);
          r.status = "revoked";
        }
        return { ok: false, assigned: 0, failed };
      }
    }
  }

  const ok = seatMode === "all-or-nothing" ? failed.length === 0 : true;
  return { ok, assigned, failed };
}

export async function assignMany(params: {
  employeeId: string;
  items: { licenseId: string; deviceId?: string; idempotencyKey?: string }[];
  allOrNothing?: boolean; // default: false (best-effort)
}): Promise<{ licenseId: string; status: "success" | "error"; message?: string; assignmentId?: string }[]> {
  const results: { licenseId: string; status: "success" | "error"; message?: string; assignmentId?: string }[] = [];
  const toRollback: AssignmentRecord[] = [];

  for (const it of params.items) {
    try {
      const rec = await assignLicense({
        licenseId: it.licenseId,
        employeeId: params.employeeId,
        deviceId: it.deviceId,
        idempotencyKey: it.idempotencyKey,
      });
      results.push({ licenseId: it.licenseId, status: "success", assignmentId: rec.id });
      toRollback.push(rec);
    } catch (e: any) {
      results.push({ licenseId: it.licenseId, status: "error", message: e?.message || "assign failed" });
      if (params.allOrNothing) {
        for (const r of toRollback) {
          await rollbackAssignment(r);
        }
        return results;
      }
    }
  }

  return results;
}

export async function unassignLicense(assignmentId: string) {
  await delay(100);
  const idx = _assignments.findIndex((a) => a.id === assignmentId);
  if (idx < 0) return;
  const rec = _assignments[idx];
  if (rec.status !== "active") return;

  await releaseSeat(rec.licenseId, 1);
  _assignments[idx] = { ...rec, status: "revoked" };
}

export async function getAssignmentsByEmployee(employeeId: string) {
  await delay(100);
  return _assignments.filter((a) => a.employeeId === employeeId);
}

async function rollbackAssignment(rec: AssignmentRecord) {
  if (rec.status === "active") {
    await releaseSeat(rec.licenseId, 1);
    rec.status = "revoked";
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}


import { AssignedDisplayRow, LicenseStatus } from "../types";

export const ASSIGNED_TO: AssignedDisplayRow[] = [
  {
    employeeId: "1",
    employeeName: "Puttaraporn Jitpranee",
    expiryDate: "2025-01-01",
    assignedDate: "2025.1",
    softwareId: "SW-3DSMAX",
    softwareName: "3ds Max",
    department: "Information Technology",
    status: "Active",
  },
  // ... อื่น ๆ
];

export async function getAssignedTo(
  softwareId: string
): Promise<AssignedDisplayRow[]> {
  return ASSIGNED_TO.filter((row) => row.softwareId === softwareId);
}

export async function getAssignedToFilters(softwareId: string): Promise<{
  employees: string[];
  departments: string[];
  statuses: LicenseStatus[];   // ← ใช้ enum ให้ตรงกับ data จริง
  softwareName: string;        // ← ให้เป็น string แน่นอน
}> {
  const scoped = ASSIGNED_TO.filter((row) => row.softwareId === softwareId);

  const employees = Array.from(
    new Set(scoped.map((r) => r.employeeName).filter((v): v is string => typeof v === "string"))
  ).sort();

  const departments = Array.from(
    new Set(scoped.map((r) => r.department).filter((v): v is string => typeof v === "string"))
  ).sort();

  const statuses = Array.from(
    new Set(
      scoped
        .map((r) => r.status)
        .filter((v): v is LicenseStatus => v !== undefined) // narrow เป็น LicenseStatus
    )
  ).sort();

  const names = Array.from(
    new Set(
      scoped
        .map((r) => r.softwareName)
        .filter((v): v is string => typeof v === "string") // narrow เป็น string[]
    )
  ).sort();

  const softwareName = names.length > 0 ? names[0] : "-";

  return { employees, departments, statuses, softwareName };
}