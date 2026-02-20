// src/services/exceptions.service.ts
// Frontend service (Next.js) เรียก Backend Express ตามเส้นทางจริง (ผ่าน base URL จาก ENV)

import { buildUrl } from "@/config/config";
import { http, qs } from "@/lib/http";

import type {
  ExceptionAssignmentRow,
  ExceptionDefinitionRow,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
} from "@/types/exception";
import type { OffsetPage } from "@/types/common";

/* ─────────────────────────────────────────────────────────────────────────────
 * Backend types (เฉพาะฝั่ง service) + mappers (snake_case → camelCase)
 * ────────────────────────────────────────────────────────────────────────────*/

type BackendExceptionDefinition = {
  exception_id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  risk_level: string;                 // "Low" | "Medium" | "High" | (อาจมี "Critical")
  category_id?: string | null;
  status: string;                     // "Active" | "Inactive" | "1"/"0" | "true"/"false"
  created_at: string;                 // ISO
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  assignees_active?: string | number | null;
  last_assigned_at?: string | null;
  tickets_count?: string | number | null;
};

function toPolicyStatus(s: unknown): "Active" | "Inactive" {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "active") return "Active";
  if (v === "inactive") return "Inactive";
  if (v === "1" || v === "true" || v === "yes" || v === "y") return "Active";
  if (v === "0" || v === "false" || v === "no" || v === "n") return "Inactive";
  // คงความเข้มงวดตามของเดิม: ถ้าอยาก tolerant ไม่ throw ให้ return "Inactive"
  throw new Error(`Invalid PolicyStatus: ${s}`);
}

function toRiskLevel(s: unknown): "Low" | "Medium" | "High" {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "low") return "Low";
  if (v === "medium") return "Medium";
  if (v === "high") return "High";
  // ถ้า backend อาจส่ง "Critical" ให้ตัดสินใจ map เป็น "High" หรือเพิ่มใน type
  throw new Error(`Invalid RiskLevel: ${s}`);
}

function toNumberOrZero(v: unknown): number {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapBackendDefinition(row: BackendExceptionDefinition): ExceptionDefinitionRow {
  return {
    // RowBase
    id: String(row.exception_id),

    // Domain (ใช้ชื่อ field ตาม type เดิม)
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
 * Utilities (normalize pagination result ให้เข้ากับ OffsetPage<T>)
 * ────────────────────────────────────────────────────────────────────────────*/

function pickTotalCount(res: any, fallbackLen = 0): number {
  return Number(
    res?.totalCount ?? res?.total ?? res?.pagination?.total ?? fallbackLen,
  );
}

function normalizePageInfo(
  res: any,
  inPage: number,       // 1-based
  inPageSize: number,
  totalCount: number,
) {
  // รองรับทั้ง pageIndex (1-based) และ page
  const page = Number(res?.pageIndex ?? res?.page ?? inPage ?? 1);
  const pageSize = Number(res?.pageSize ?? inPageSize ?? 10);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalCount) / Math.max(1, pageSize)));
  const hasPrev = typeof res?.hasPrev === "boolean" ? !!res.hasPrev : page > 1;
  const hasNext = typeof res?.hasNext === "boolean" ? !!res.hasNext : page < totalPages;
  return { page, pageSize, totalPages, hasPrev, hasNext };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Definitions)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id → คืน Row หรือ null */
export async function getExceptionDefinitionById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionRow | null> {
  const url = buildUrl(`/exceptions/${encodeURIComponent(String(id))}`);
  const res = await http<any>(url, { method: "GET", signal });
  const raw: BackendExceptionDefinition | null = res?.item ?? res?.data ?? res ?? null;
  return raw ? mapBackendDefinition(raw) : null;
}

/**
 * GET /exceptions (paged list with search/filter/sort)
 * - FE query ใช้ `ExceptionDefinitionListQuery` (extends OffsetPaginationParams & Searchable)
 * - BE รองรับ 1-based: pageIndex/pageSize
 * - sort: ส่งแบบ `sort=field:dir` (หรือปรับให้ตรงกับ backend จริง)
 */
export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  // FE → BE (1-based)
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
  const res = await http<any>(url, { method: "GET", signal });

  const rows: BackendExceptionDefinition[] = res?.items ?? res?.data ?? [];
  const items: ExceptionDefinitionRow[] = rows.map(mapBackendDefinition);

  const totalCount = pickTotalCount(res, items.length);
  const { page, pageSize, hasPrev, hasNext, totalPages } = normalizePageInfo(
    res,
    query.pageIndex ?? 1,
    query.pageSize ?? 10,
    totalCount,
  );

  // ✅ คืนค่าเข้ากับ OffsetPage<ExceptionDefinitionRow>
  return {
    items,
    totalCount,
    page,
    pageSize,
    hasPrev,
    hasNext,
    totalPages,
  };
}

/** alias ให้ส่วนอื่นเรียกต่อได้ (ชื่อเดิม) */
export async function listExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  return getExceptionDefinitions(q, signal);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Assignments / Assignees) — ใช้ pagination แบบ OffsetPage<T>
 * ────────────────────────────────────────────────────────────────────────────*/

export type ExceptionAssigneesPage = OffsetPage<ExceptionAssignmentRow>;


/* ─────────────────────────────────────────────────────────────────────────────
 * Wrapper (Form): assign / unassign
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

/* ─────────────────────────────────────────────────────────────────────────────
 * Extra helper: active definitions (checkbox/list)
 * ────────────────────────────────────────────────────────────────────────────*/

/** คืน Row[] (มี id) */
export async function getActiveExceptionDefinitions(
  signal?: AbortSignal,
): Promise<ExceptionDefinitionRow[]> {
  const res = await getExceptionDefinitions(
    {
      page: 1,
      pageSize: 1000,
      status: "Active",
      sortBy: "name",
      sortOrder: "asc",
    },
    signal,
  );

  // เรียงที่ FE เพื่อความแน่นอนตาม locale
  return (res.items ?? []).slice().sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
      sensitivity: "base",
      numeric: true,
    }),
  );
}


/** =========================
 * Types (FE)
 * ======================= */
export type AssigneesPageQuery = {
  /** 1-based page */
  page: number;
  pageSize: number;
  /** ถ้าไม่ส่ง -> backend interpret เป็น 'all' หรือค่า default */
  status?: "active" | "revoked" | "all";
};

export type AssigneesPageResponse = {
  items: ExceptionAssignmentRow[];
  totalCount: number;
  page: number;     // 1-based
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
};

/** =========================
 * GET /exceptions/:id/assignees (page 1-based)
 * ======================= */
export async function getExceptionAssigneesPage(
  exceptionId: string | number,
  q: AssigneesPageQuery,
  signal?: AbortSignal,
): Promise<AssigneesPageResponse> {
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.max(1, Number(q.pageSize ?? 10));

  const query = {
    page,
    pageSize,
    ...(q.status && q.status !== "all" ? { status: q.status } : {}),
  };

  const url = buildUrl(
    `/exceptions/${encodeURIComponent(String(exceptionId))}/assignees${qs(query)}`
  );
  const res = await http<any>(url, { method: "GET", signal });

  const items: ExceptionAssignmentRow[] = res?.items ?? res?.data ?? [];
  const totalCount = Number(
    res?.totalCount ?? res?.total ?? res?.pagination?.total ?? items.length
  );
  const pageOut = Number(res?.page ?? page);
  const pageSizeOut = Number(res?.pageSize ?? pageSize);

  const hasPrev =
    typeof res?.hasPrev === "boolean" ? !!res.hasPrev : pageOut > 1;
  const hasNext =
    typeof res?.hasNext === "boolean"
      ? !!res.hasNext
      : pageOut * pageSizeOut < totalCount;

  return {
    items,
    totalCount,
    page: pageOut,
    pageSize: pageSizeOut,
    hasPrev,
    hasNext,
  };
}

/** =========================
 * POST /exceptions/:id/revoke
 * Body: { empCodes: string[], actor: string }
 * ======================= */
export async function revokeAssignments(
  exceptionId: string | number,
  empCodes: string[],
  actor: string,
  signal?: AbortSignal,
): Promise<{ updated: number }> {
  const url = buildUrl(
    `/exceptions/${encodeURIComponent(String(exceptionId))}/revoke`
  );

  const body = { empCodes, actor };

  const res = await http<any>(url, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const updated = Number(res?.updated ?? res?.affected ?? 0);
  return { updated };
}