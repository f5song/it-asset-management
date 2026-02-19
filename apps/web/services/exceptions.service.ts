// src/services/exceptions.service.ts
// Frontend service (Next.js) เรียก Backend Express ตามเส้นทางจริง (ผ่าน base URL จาก ENV)

import { buildUrl } from "@/config/config";
import { http, qs } from "@/lib/http";
import {
  ExceptionAssignmentRow,
  ExceptionDefinitionRow,      // 👈 ใช้ Row (มี id)
  PolicyStatus,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse, // 👈 ตรวจว่าใน type นี้ items เป็น Row[]
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
  risk_level: string; // "Low" | "Medium" | "High" | "Critical"
  category_id?: string | null;
  status: string;     // "Active" | "Inactive" | "1"/"0" | "true"/"false"
  created_at: string; // ISO
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  assignees_active?: string | number | null; // "3"
  last_assigned_at?: string | null;
  tickets_count?: string | number | null;
};

export function toPolicyStatus(s: string): PolicyStatus {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "active") return "Active";
  if (v === "inactive") return "Inactive";
  if (v === "1" || v === "true" || v === "yes" || v === "y") return "Active";
  if (v === "0" || v === "false" || v === "no" || v === "n") return "Inactive";
  throw new Error(`Invalid PolicyStatus: ${s}`);
}

export function toRiskLevel(s: string): RiskLevel {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "low") return "Low";
  if (v === "medium") return "Medium";
  if (v === "high") return "High";
  throw new Error(`Invalid RiskLevel: ${s}`);
}

function toNumberOrZero(v: unknown): number {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** ✅ mapper คืน ExceptionDefinitionRow (มี id) */
function mapBackendDefinition(row: BackendExceptionDefinition): ExceptionDefinitionRow {
  return {
    // RowBase
    id: String(row.exception_id),

    // Domain fields (เก็บ exception_id ไว้แสดงคอลัมน์ด้วย)
    exception_id: String(row.exception_id),
    name: row.name ?? "",
    status: toPolicyStatus(row.status),
    risk: toRiskLevel(row.risk_level),
    createdAt: row.created_at ?? "",
    lastUpdated: row.updated_at ?? null,
    description: row.description ?? undefined,
    totalAssignments: toNumberOrZero(row.assignees_active),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Definitions)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id  → คืน Row หรือ null */
export async function getExceptionDefinitionById(
  id: string,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionRow | null> {
  const url = buildUrl(`/exceptions/${encodeURIComponent(String(id))}`);
  console.log("[getExceptionDefinitionById] URL =", url); // ✅ ควรเห็น :8000

  const res = await fetch(url, { signal, cache: "no-store" }); // ถ้า http() ห่อ fetch อยู่ ให้ log ข้างในด้วย
  console.log("[getExceptionDefinitionById] status =", res.status);

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Backend failed ${res.status}`);
  }

  const raw = await res.json();
  const row: BackendExceptionDefinition | null = raw?.item ?? raw?.data ?? raw ?? null;
  if (!row) return null;
  return mapBackendDefinition(row);
}


/**
 * GET /exceptions (paged list with search/filter/sort)
 * - Backend ใช้ 1-based: pageIndex, pageSize
 * - sort ตัวอย่าง: ?sort=exception_id:desc
 * - isActive=true/false
 * ✅ คืน ExceptionDefinitionListResponse ที่ items: ExceptionDefinitionRow[]
 */
export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  // FE → BE query (1-based)
  const query = {
    pageIndex: q.page ?? 1,
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

  const rows: BackendExceptionDefinition[] = res?.items ?? res?.data ?? [];
  const items: ExceptionDefinitionRow[] = rows.map(mapBackendDefinition);

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
    items,        // 👈 Row[]
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
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
  return Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
}

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

/* ─────────────────────────────────────────────────────────────────────────────
 * Extra helper: active definitions for checkbox/list
 * ────────────────────────────────────────────────────────────────────────────*/

/** ✅ คืน Row[] (มี id) */
export async function getActiveExceptionDefinitions(
  signal?: AbortSignal,
): Promise<ExceptionDefinitionRow[]> {
  const res = await getExceptionDefinitions(
    {
      page: 1,
      pageSize: 1000,
      status: "Active" as PolicyStatus,
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
 * Wrapper (Form): assignException
 * ────────────────────────────────────────────────────────────────────────────*/

export async function assignException(
  args: {
    definitionId: string | number;
    employeeIds: string[];
    assignedBy?: string;
    effectiveDate?: string; // (unused)
    expiresAt?: string;     // (unused)
    notes?: string;         // (unused)
  },
  signal?: AbortSignal,
): Promise<{
  ok: boolean;
  assignedCount: number; // inserted + reactivated
  definitionId: string;
  added: number;         // alias inserted
  updated: number;       // alias reactivated
  skipped: number;       // fixed 0
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

/**
 * POST /exceptions/:exceptionId/assign
 * Backend payload: { empCodes: string[], assignedBy?: string }
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