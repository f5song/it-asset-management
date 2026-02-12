// src/services/exceptions.service.mock.ts

import {
  ExceptionAssignmentRow,
  ExceptionDefinition,
  PolicyStatus,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
  AssignEmployeeInput,
  AssignOptions,
} from "@/types/exception";

/* ─────────────────────────────────────────────────────────────────────────────
 * Utilities
 * ────────────────────────────────────────────────────────────────────────────*/
const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      };
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function pad(n: number, len = 3) {
  return n.toString().padStart(len, "0");
}
function iso(date: Date) {
  return date.toISOString();
}
function addDays(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Mock Data
 * ────────────────────────────────────────────────────────────────────────────*/
const STATUSES = ["Active", "Inactive"] as const satisfies readonly PolicyStatus[];
const USER_PREFIX = ["jirawee", "qa", "dev", "ops", "hr", "fin"] as const;

const NAMES = [
'AD 90 : Password Policy', 'LINE', 'USB', 'Generative AI'
] as const;

function makeDates(idx: number) {
  const created = addDays(new Date("2025-11-01T08:00:00Z"), idx);
  const lastUpdated = addDays(created, idx % 5);
  const reviewAt = addDays(created, ((idx % 3) + 1) * 30);
  return { createdAt: iso(created), lastUpdated: iso(lastUpdated), reviewAt: iso(reviewAt) };
}

/** แปลง employeeId เป็นชื่อโชว์แบบง่าย ๆ เช่น "dev.012" -> "Dev 012" */
function toDisplayName(employeeId: string): string {
  const [p1, p2] = employeeId.split(".");
  return `${p1?.charAt(0).toUpperCase()}${p1?.slice(1)} ${p2}`;
}

/** Definitions (Catalog) — only 4 items (no loop 24) */
const MOCK_DEFINITIONS: ExceptionDefinition[] = NAMES.map((name, i) => {
  const idNum = i + 1;
  const id = `EXC-${pad(idNum)}`;
  const status = STATUSES[i % STATUSES.length];
  const { createdAt, lastUpdated } = makeDates(i);
  const total = (i % 7) + 3; // หรือจะ fix เลยก็ได้ เช่น total = 5;

  return {
    id,
    name,
    status,
    risk: (["Low", "Medium", "High"] as const)[i % 3],
    createdAt,
    lastUpdated,
    notes: "",
    totalAssignments: total,
  };
});

/** Assignments per definition */
const MOCK_ASSIGNMENTS: Record<string, ExceptionAssignmentRow[]> = {};
for (const def of MOCK_DEFINITIONS) {
  const total = def.totalAssignments ?? 0;
  const rows: ExceptionAssignmentRow[] = [];
  for (let i = 0; i < total; i++) {
    const employeeId = `${USER_PREFIX[i % USER_PREFIX.length]}.${pad((i % 20) + 1)}`;
    const employeeName = toDisplayName(employeeId);
    const assignedAt = addDays(new Date(def.createdAt), i).toISOString();

    rows.push({
      id: `${def.id}-U-${pad(i + 1)}`,
      definitionId: def.id,
      employeeId,
      employeeName,
      department: ["IT", "HR", "FIN", "OPS"][i % 4],
      notes: i % 2 === 0 ? "Demo assignment note" : null,
      // assignedAt: assignedAt, // ถ้า type ของคุณมี field นี้สามารถเติมได้
    });
  }
  MOCK_ASSIGNMENTS[def.id] = rows;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Helpers (internal for assignment ops)
 * ────────────────────────────────────────────────────────────────────────────*/
function getDefinitionByIdLocal(definitionId: string | number): ExceptionDefinition | undefined {
  return MOCK_DEFINITIONS.find((d) => String(d.id) === String(definitionId));
}

function nextAssignmentId(definitionId: string): string {
  const rows = MOCK_ASSIGNMENTS[definitionId] ?? [];
  // หาเลข running สูงสุดที่ท้าย id รูปแบบ "EXC-001-U-005" แล้ว +1
  const maxIdx = rows.reduce((mx, r) => {
    const m = /-U-(\d+)$/.exec(r.id);
    const n = m ? parseInt(m[1], 10) : 0;
    return Math.max(mx, n);
  }, 0);
  return `${definitionId}-U-${pad(maxIdx + 1)}`;
}

function updateDefinitionTotal(definitionId: string) {
  const def = getDefinitionByIdLocal(definitionId);
  if (def) {
    def.totalAssignments = (MOCK_ASSIGNMENTS[definitionId] ?? []).length;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Definitions)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id */
export async function getExceptionDefinitionById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ExceptionDefinition | null> {
  await sleep(80, signal);
  return MOCK_DEFINITIONS.find((e) => String(e.id) === String(id)) ?? null;
}

/** GET /exceptions (paged list with search/filter/sort) */
export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_DEFINITIONS];

  // search
  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (e) =>
        includesCI(e.id, search) ||
        includesCI(e.name, search) ||
        includesCI(String(e.status), search),
    );
  }

  // filters
  if (q.status) {
    const s = ci(q.status);
    filtered = filtered.filter((e) => ci(e.status) === s);
  }

// ----- sort (GLOBAL ก่อน paginate) -----
  if (q.sortBy === "status_priority" && !q.status /* All Status */) {
    // Active -> Inactive -> else
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const pr = new Map<string, number>([
      ["active",   0],
      ["inactive", 1],
    ]);

    filtered.sort((a, b) => {
      const pa = pr.get(String(a.status).toLowerCase()) ?? 999;
      const pb = pr.get(String(b.status).toLowerCase()) ?? 999;
      if (pa !== pb) return (pa - pb) * dir;

      // secondary: name asc ให้ลำดับอ่านง่ายและเสถียร
      return String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  } else if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof ExceptionDefinition;

    filtered.sort((a, b) => {
      const A = (a[key] as any) ?? "";
      const B = (b[key] as any) ?? "";

      // เพิ่มความฉลาดเล็กน้อย: number/date-aware
      if (typeof A === "number" && typeof B === "number") return (A - B) * dir;
      const da = new Date(A as any), db = new Date(B as any);
      const aIsDate = !isNaN(da.valueOf()), bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return (da.getTime() - db.getTime()) * dir;

      return String(A).localeCompare(String(B), undefined, { numeric: true, sensitivity: "base" }) * dir;
    });
  } else {
    // default: name asc (ลดความสับสนจากการ default เป็น createdAt)
    filtered.sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }

  // pagination (OffsetPage<T>)
  const totalCount = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.max(1, Number(q.pageSize ?? 10));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    totalPages,
  };
}

/** alias ให้ฮุค/ส่วนที่เรียกชื่อ listExceptionDefinitions ใช้ต่อได้ */
export async function listExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  return getExceptionDefinitions(q, signal);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Assignments per definition)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id/assignments */
export async function getExceptionAssignmentsByDefinitionId(
  id: string,
  signal?: AbortSignal,
): Promise<ExceptionAssignmentRow[]> {
  await sleep(120, signal);
  return [...(MOCK_ASSIGNMENTS[id] ?? [])];
}

/**
 * POST /exceptions/:definitionId/assign
 * เพิ่ม assignment ให้ definition ตามรายการ employee ที่ส่งมา
 * - กันซ้ำด้วย employeeId
 * - อัปเดต totalAssignments ใน definition
 * - รองรับตัวเลือกการ merge notes / อัปเดตชื่อ‑แผนก
 */
export async function assignExceptionsToEmployees(
  definitionId: string,
  employees: AssignEmployeeInput[],
  options?: AssignOptions,
  signal?: AbortSignal,
): Promise<{
  added: number;
  updated: number;
  skipped: number;
  rows: ExceptionAssignmentRow[];
}> {
  await sleep(150, signal);

  const rows = (MOCK_ASSIGNMENTS[definitionId] ??= []);
  const byEmp = new Map<string, ExceptionAssignmentRow>(rows.map((r) => [r.employeeId, r]));

  const opt: Required<AssignOptions> = {
    skipIfExists: options?.skipIfExists ?? true,
    upsertNameAndDept: options?.upsertNameAndDept ?? true,
    noteStrategy: options?.noteStrategy ?? "keep-existing",
    noteAppendSeparator: options?.noteAppendSeparator ?? " | ",
  };

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const emp of employees) {
    if (!emp?.employeeId) continue;

    const exists = byEmp.get(emp.employeeId);
    if (exists) {
      if (opt.skipIfExists) {
        skipped += 1;
        continue;
      }
      // อัปเดตข้อมูลเดิม
      if (opt.upsertNameAndDept) {
        if (emp.employeeName) exists.employeeName = emp.employeeName;
        if (emp.department) exists.department = emp.department;
      }
      if (emp.notes != null) {
        if (opt.noteStrategy === "replace") {
          exists.notes = emp.notes;
        } else if (opt.noteStrategy === "append") {
          const cur = exists.notes ?? "";
          exists.notes = cur ? `${cur}${opt.noteAppendSeparator}${emp.notes}` : emp.notes;
        }
        // keep-existing -> ไม่ทำอะไร
      }
      updated += 1;
      continue;
    }

    // เพิ่มใหม่
    const id = nextAssignmentId(definitionId);
    const row: ExceptionAssignmentRow = {
      id,
      definitionId,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName ?? toDisplayName(emp.employeeId),
      department: emp.department ?? "-",
      notes: emp.notes ?? null,
    };
    rows.push(row);
    byEmp.set(emp.employeeId, row);
    added += 1;
  }

  // อัปเดต totalAssignments ของ definition นี้
  updateDefinitionTotal(definitionId);

  return {
    added,
    updated,
    skipped,
    rows: [...rows],
  };
}

/**
 * DELETE /exceptions/:definitionId/assign
 * เอา assignment ออกตาม employeeId ที่ระบุ
 * - อัปเดต totalAssignments
 */
export async function unassignExceptionsFromEmployees(
  definitionId: string,
  employeeIds: string[],
  signal?: AbortSignal,
): Promise<{ removed: number; rows: ExceptionAssignmentRow[] }> {
  await sleep(120, signal);

  const before = MOCK_ASSIGNMENTS[definitionId] ?? [];
  const removeSet = new Set(employeeIds.map(String));
  const after = before.filter((r) => !removeSet.has(String(r.employeeId)));

  MOCK_ASSIGNMENTS[definitionId] = after;
  updateDefinitionTotal(definitionId);

  return { removed: before.length - after.length, rows: [...after] };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Extra helper: active definitions for checkbox/list
 * ────────────────────────────────────────────────────────────────────────────*/

/** ดึง ExceptionDefinitions ทั้งหมดที่สถานะ Active (เรียงตามชื่อ) */
export async function getActiveExceptionDefinitions(
  signal?: AbortSignal,
): Promise<ExceptionDefinition[]> {
  await sleep(80, signal); // mock latency

  // กรอง Active แล้วเรียงชื่อ
  const active = MOCK_DEFINITIONS
    .filter((d) => String(d.status).toLowerCase() === "active")
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  // คืนสำเนาเพื่อกัน mutate จากภายนอก
  return active.map((d) => ({ ...d }));
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Wrap สำหรับหน้า Form: assignException({ definitionId, employeeIds, ... })
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * assignException: สำหรับหน้าแบบฟอร์มที่ส่ง definitionId + employeeIds
 * - ไม่แตะ service เดิม แค่ wrap ไปที่ assignExceptionsToEmployees
 * - เก็บ signature effectiveDate/expiresAt ไว้ เผื่อ backend จริงใช้งาน
 */
export async function assignException(
  args: {
    definitionId: string | number;
    employeeIds: string[];
    effectiveDate?: string;
    expiresAt?: string;
    notes?: string;
  },
  signal?: AbortSignal,
): Promise<{
  ok: boolean;
  assignedCount: number; // added + updated
  definitionId: string;
  added: number;
  updated: number;
  skipped: number;
}> {
  const { definitionId, employeeIds, notes } = args ?? {};
  if (!definitionId) throw new Error("definitionId is required");
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    throw new Error("employeeIds is required");
  }

  // map employeeIds -> payload ตาม signature เดิม
  const employeesPayload: AssignEmployeeInput[] = employeeIds.map((id) => ({
    employeeId: String(id),
    notes: (notes?.trim() || null) ?? null,
  }));

  const res = await assignExceptionsToEmployees(
    String(definitionId),
    employeesPayload,
    {
      skipIfExists: true,                        // ถ้ามีแล้วให้ข้าม
      upsertNameAndDept: true,                   // อัปเดตชื่อ/แผนกถ้าส่งมา (ตอนนี้ไม่ได้ส่ง)
      noteStrategy: notes?.trim() ? "append" : "keep-existing",
    },
    signal,
  );

  return {
    ok: true,
    assignedCount: (res.added ?? 0) + (res.updated ?? 0),
    definitionId: String(definitionId),
    added: res.added ?? 0,
    updated: res.updated ?? 0,
    skipped: res.skipped ?? 0,
  };
}