// src/services/exceptions.service.ts
// Frontend service (Next.js) เรียก Backend Express ตามเส้นทางจริง

import {
  ExceptionAssignmentRow,
  ExceptionDefinition,
  PolicyStatus,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
  AssignEmployeeInput,
  // AssignOptions, // ไม่ใช้แล้วใน payload ส่งไป backend
} from "@/types/exception";

/**
 * ตั้งค่า base URL ของ API
 * - ใส่ใน .env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
 * - จากนั้นเราจะต่อท้ายด้วย /exceptions เอง
 */

// ✅ ใช้ relative path ภายใต้ prefix ที่ rewrite ไว้
const EXC_BASE = '/backend/exceptions';

// ตัวอย่าง

/* ─────────────────────────────────────────────────────────────────────────────
 * Utilities
 * ────────────────────────────────────────────────────────────────────────────*/
function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function http<T>(
  input: RequestInfo,
  init?: RequestInit & { parse?: "json" | "text" | "void" },
): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      msg = text || msg;
    } catch {}
    throw new Error(msg);
  }
  const parse = init?.parse ?? "json";
  if (parse === "json") return res.json() as unknown as T;
  if (parse === "text") return res.text() as unknown as T;
  return undefined as unknown as T;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Definitions)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id  (รองรับมี/ไม่มี trailing slash) */
export async function getExceptionDefinitionById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ExceptionDefinition | null> {
  const url = `${EXC_BASE}/${encodeURIComponent(String(id))}`;
  const data = await http<ExceptionDefinition>(url, { signal });
  return data ?? null;
}

/**
 * GET /exceptions (paged list with search/filter/sort)
 * - Backend ใช้ 1-based: pageIndex, pageSize
 * - sort ใช้รูปแบบ: ?sort=exception_id:desc
 * - isActive=true/false
 */
export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  // map → query ที่ backend ต้องการ (1‑based)
  const query = {
    pageIndex: q.page ?? 1, // 1-based
    pageSize: q.pageSize ?? 10,
    sort: q.sortBy ? `${q.sortBy}:${q.sortOrder ?? "asc"}` : undefined,
    isActive:
      typeof q.status === "string"
        ? String(q.status).toLowerCase() === "active"
        : undefined,
    search: q.search,
  };

  const url = `${EXC_BASE}${qs(query)}`;
  const res = await http<any>(url, { signal });

  // รองรับ response shape หลายแบบ
  const items: ExceptionDefinition[] = res.items ?? res.data ?? [];
  const totalCount =
    res.total ?? res.totalCount ?? res.pagination?.total ?? items.length;

  // เมทาดาต้า — backend เราส่ง 1‑based กลับมาแล้ว (ถ้ามี)
  const page = Number(res.pageIndex ?? query.pageIndex ?? 1);
  const pageSize = Number(res.pageSize ?? query.pageSize ?? 10);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(totalCount) / Math.max(1, Number(pageSize))),
  );

  return {
    items,
    totalCount: Number(totalCount),
    page,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    totalPages,
  };
}

/** alias (คงชื่อเดิมให้ส่วนอื่นเรียกต่อได้) */
export async function listExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  return getExceptionDefinitions(q, signal);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Assignments / Assignees)
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * GET /exceptions/:id/assignees?pageIndex=1&pageSize=10
 * - Backend คืนแบบ paged ({ items, total, pageIndex, pageSize, ... })
 * - ฟังก์ชันนี้ยังคงคืนเป็น array (backward-compatible)
 * - ถ้าต้องการ metadata ให้ใช้ getExceptionAssignmentsPage ด้านล่างแทน
 */
export async function getExceptionAssignmentsByDefinitionId(
  id: string | number,
  opts?: { page?: number; pageSize?: number },
  signal?: AbortSignal,
): Promise<ExceptionAssignmentRow[]> {
  const query = {
    pageIndex: opts?.page ?? 1,
    pageSize: opts?.pageSize ?? 20,
  };
  const url = `${EXC_BASE}/${encodeURIComponent(String(id))}/assignees${qs(
    query,
  )}`;

  const res = await http<any>(url, { signal });
  // รองรับทั้ง array ตรง ๆ หรือ { items: [...] }
  return Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
}

/** เวอร์ชันที่คืน metadata ครบ */
export async function getExceptionAssignmentsPage(
  id: string | number,
  opts?: { page?: number; pageSize?: number },
  signal?: AbortSignal,
): Promise<{
  items: ExceptionAssignmentRow[];
  total: number;
  page: number; // 1-based
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}> {
  const query = {
    pageIndex: opts?.page ?? 1,
    pageSize: opts?.pageSize ?? 20,
  };
  const url = `${EXC_BASE}/${encodeURIComponent(String(id))}/assignees${qs(
    query,
  )}`;

  const res = await http<any>(url, { signal });
  const items: ExceptionAssignmentRow[] = res.items ?? res.data ?? [];
  const total = Number(res.total ?? items.length);
  const page = Number(res.pageIndex ?? query.pageIndex ?? 1);
  const pageSize = Number(res.pageSize ?? query.pageSize ?? 20);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(total) / Math.max(1, Number(pageSize))),
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * POST /exceptions/:exceptionId/assign
 * Backend payload (ตาม controller ของคุณ): { empCodes: string[], assignedBy?: string }
 * - เปลี่ยนจากของเดิมที่เคยส่ง { employees, options }
 */
export async function assignExceptionsToEmployees(
  exceptionId: string | number,
  empCodes: string[],
  assignedBy?: string,
  signal?: AbortSignal,
): Promise<{
  inserted?: number;
  reactivated?: number;
  assignmentIds?: (number | string)[];
}> {
  if (!Array.isArray(empCodes) || empCodes.length === 0) {
    throw new Error("empCodes is required (non-empty array)");
  }

  const url = `${EXC_BASE}/${encodeURIComponent(String(exceptionId))}/assign`;
  const body = JSON.stringify({ empCodes, assignedBy });

  const res = await http<any>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  // map ผลลัพธ์ตาม backend ของคุณ
  return {
    inserted: Number(res?.inserted ?? 0),
    reactivated: Number(res?.reactivated ?? 0),
    assignmentIds: res?.assignmentIds ?? [],
  };
}

/**
 * POST /exceptions/:exceptionId/revoke
 * Backend payload: { empCodes: string[], revokedBy?: string, reason?: string }
 */
export async function unassignExceptionsFromEmployees(
  exceptionId: string | number,
  empCodes: string[],
  opts?: { revokedBy?: string; reason?: string },
  signal?: AbortSignal,
): Promise<{ removed: number }> {
  if (!Array.isArray(empCodes) || empCodes.length === 0) {
    throw new Error("empCodes is required (non-empty array)");
  }

  const url = `${EXC_BASE}/${encodeURIComponent(String(exceptionId))}/revoke`;
  const body = JSON.stringify({
    empCodes,
    revokedBy: opts?.revokedBy ?? undefined,
    reason: opts?.reason ?? undefined,
  });

  const res = await http<any>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  // backend คืน { updated: number } → map เป็น removed
  return { removed: Number(res?.updated ?? 0) };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Extra helper: active definitions for checkbox/list
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * ดึง ExceptionDefinitions ที่สถานะ Active (เรียงตามชื่อ)
 * - เรียก /exceptions ด้วย isActive=true & pageSize ใหญ่ ๆ
 * - ถ้ามี /exceptions/simple ก็สลับไปใช้ได้
 */
export async function getActiveExceptionDefinitions(
  signal?: AbortSignal,
): Promise<ExceptionDefinition[]> {
  const res = await getExceptionDefinitions(
    {
      page: 1,
      pageSize: 1000,
      status: "Active" as PolicyStatus, // map → isActive=true ภายใน
      sortBy: "name",
      sortOrder: "asc",
    },
    signal,
  );

  const items = (res.items ?? []).slice().sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
      sensitivity: "base",
      numeric: true,
    }),
  );
  return items;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Wrapper (Form): assignException({ definitionId, employeeIds, ... })
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * assignException: สำหรับหน้าแบบฟอร์มที่ส่ง definitionId + employeeIds
 * - map → payload ของ backend: { empCodes }
 */
export async function assignException(
  args: {
    definitionId: string | number;
    employeeIds: string[];
    assignedBy?: string; // เพิ่มช่องทางส่งผู้ทำรายการ
    effectiveDate?: string; // (unused) สำหรับ backend รุ่นถัดไป
    expiresAt?: string; // (unused)
    notes?: string; // (unused)
  },
  signal?: AbortSignal,
): Promise<{
  ok: boolean;
  assignedCount: number; // inserted + reactivated
  definitionId: string;
  added: number; // alias inserted
  updated: number; // alias reactivated
  skipped: number; // 0 (ไม่มีใน backend ปัจจุบัน)
}> {
  const { definitionId, employeeIds, assignedBy } = args ?? {};
  if (!definitionId) throw new Error("definitionId is required");
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    throw new Error("employeeIds is required");
  }

  const empCodes = employeeIds.map((id) => String(id));

  const res = await assignExceptionsToEmployees(
    String(definitionId),
    empCodes,
    assignedBy,
    signal,
  );

  const added = Number(res.inserted ?? 0);
  const updated = Number(res.reactivated ?? 0);

  return {
    ok: true,
    assignedCount: added + updated,
    definitionId: String(definitionId),
    added,
    updated,
    skipped: 0,
  };
}
