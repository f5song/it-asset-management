// src/services/exceptions.service.ts
// Frontend service (Next.js) เรียก Backend Express ตามเส้นทางจริง (ผ่าน base URL จาก ENV)

import { buildUrl } from "@/config/config";
import { http, qs } from "@/lib/http";
import {
  ExceptionAssignmentRow,
  ExceptionDefinition,
  PolicyStatus,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
  RiskLevel,
} from "@/types/exception";

/* ─────────────────────────────────────────────────────────────────────────────
 * Mappers: แปลง snake_case (backend) → camelCase (frontend types)
 * ────────────────────────────────────────────────────────────────────────────*/

type BackendExceptionDefinition = {
  exception_id: string; // "1"
  code?: string | null;
  name: string;
  description?: string | null;
  risk_level: string; // "Low" | "Medium" | "High"
  category_id?: string | null;
  status: string; // true/false
  created_at: string; // ISO
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  assignees_active?: string | number | null; // "3"
  last_assigned_at?: string | null;
  tickets_count?: string | number | null;
};

export function toPolicyStatus(s: string): PolicyStatus {
  const v = s.trim().toLowerCase();
  if (v === "active") return "Active";
  if (v === "inactive") return "Inactive";

  // รองรับสตริงตัวแทนทั่วไป
  if (v === "1" || v === "true" || v === "yes" || v === "y") return "Active";
  if (v === "0" || v === "false" || v === "no" || v === "n") return "Inactive";

  throw new Error(`Invalid PolicyStatus: ${s}`);
}

export function toRiskLevel(s: string): RiskLevel {
  const v = s.trim().toLowerCase();
  if (v === "low") return "Low";
  if (v === "medium") return "Medium";
  if (v === "high") return "High";

  // (ถ้าต้องการ) map เพิ่ม เช่น "1"→Low, "2"→Medium, "3"→High
  // if (v === "1") return "Low";
  // if (v === "2") return "Medium";
  // if (v === "3") return "High";

  throw new Error(`Invalid RiskLevel: ${s}`);
}

function toNumberOrZero(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapBackendDefinition(
  row: BackendExceptionDefinition,
): ExceptionDefinition {
  return {
    id: String(row.exception_id),
    name: row.name ?? "",
    status: toPolicyStatus(row.status),
    risk: toRiskLevel(row.risk_level),
    createdAt: row.created_at ?? "",
    lastUpdated: row.updated_at ?? null,
    description: row.description ?? undefined,
    // สำหรับ UI: totalAssignments จาก assignees_active
    totalAssignments: toNumberOrZero(row.assignees_active),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Definitions)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id  (รองรับมี/ไม่มี trailing slash) */
export async function getExceptionDefinitionById(
  id: string,
  signal?: AbortSignal,
): Promise<ExceptionDefinition | null> {
  const url = buildUrl(`/exceptions/${encodeURIComponent(String(id))}`);
  // บาง backend อาจคืนเป็น object โดยตรง หรือห่อใน { item } / { data }
  const raw = await http<any>(url, { signal });
  const row: BackendExceptionDefinition | null =
    raw?.item ?? raw?.data ?? raw ?? null;
  if (!row) return null;
  return mapBackendDefinition(row);
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

  const url = buildUrl(`/exceptions${qs(query)}`);
  const res = await http<any>(url, { signal });

  // รองรับ response shape ของ backend ตามตัวอย่างที่ให้มา
  // {
  //   items: [...], total, pageIndex, pageSize, pageCount, hasPrev, hasNext
  // }
  const rows: BackendExceptionDefinition[] = res?.items ?? res?.data ?? [];
  const items: ExceptionDefinition[] = rows.map(mapBackendDefinition);

  const totalCount = Number(
    res?.total ?? res?.totalCount ?? res?.pagination?.total ?? items.length,
  );

  const page = Number(res?.pageIndex ?? query.pageIndex ?? 1);
  const pageSize = Number(res?.pageSize ?? query.pageSize ?? 10);
  const totalPages =
    Number(res?.pageCount) ||
    Math.max(1, Math.ceil(Number(totalCount) / Math.max(1, Number(pageSize))));
  const hasPrev = typeof res?.hasPrev === "boolean" ? !!res.hasPrev : page > 1;
  const hasNext =
    typeof res?.hasNext === "boolean" ? !!res.hasNext : page < totalPages;

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

  const url = buildUrl(
    `/exceptions/${encodeURIComponent(String(id))}/assignees${qs(query)}`,
  );

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

  const url = buildUrl(
    `/exceptions/${encodeURIComponent(String(id))}/assignees${qs(query)}`,
  );

  const res = await http<any>(url, { signal });
  const items: ExceptionAssignmentRow[] = res?.items ?? res?.data ?? [];
  const total = Number(res?.total ?? items.length);
  const page = Number(res?.pageIndex ?? query.pageIndex ?? 1);
  const pageSize = Number(res?.pageSize ?? query.pageSize ?? 20);
  const totalPages =
    Number(res?.pageCount) ||
    Math.max(1, Math.ceil(Number(total) / Math.max(1, Number(pageSize))));
  const hasPrev = typeof res?.hasPrev === "boolean" ? !!res.hasPrev : page > 1;
  const hasNext =
    typeof res?.hasNext === "boolean" ? !!res.hasNext : page < totalPages;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
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

  const url = buildUrl(
    `/exceptions/${encodeURIComponent(String(exceptionId))}/assign`,
  );
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

  const url = buildUrl(
    `/exceptions/${encodeURIComponent(String(exceptionId))}/revoke`,
  );
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
