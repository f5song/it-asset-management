// src/services/exceptions.service.ts
// Service จริง: เรียก Express API ตาม routes ที่ให้มา

import {
  ExceptionAssignmentRow,
  ExceptionDefinition,
  PolicyStatus,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
  AssignEmployeeInput,
  AssignOptions,
} from "@/types/exception";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

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
  init?: RequestInit & { parse?: "json" | "text" | "void" }
): Promise<T> {
  const res = await fetch(input, {
    credentials: "include", // ถ้ามี session/cookie ให้คงไว้
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    // พยายามดึงข้อความผิดพลาดเพื่อ debuggable
    let msg = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      msg = text || msg;
    } catch {}
    throw new Error(msg);
  }
  const parse = init?.parse ?? "json";
  if (parse === "json") return (res.json() as unknown) as T;
  if (parse === "text") return (res.text() as unknown) as T;
  return undefined as unknown as T;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Definitions)
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /exceptions/:id */
export async function getExceptionDefinitionById(
  id: string | number,
  signal?: AbortSignal
): Promise<ExceptionDefinition | null> {
  const url = `${API_BASE_URL}/exceptions/${encodeURIComponent(String(id))}`;
  const data = await http<ExceptionDefinition>(url, { signal });
  return data ?? null;
}

/**
 * GET /exceptions (paged list with search/filter/sort)
 * - รับ query เดียวกับ mock: page(1-based), pageSize, sortBy, sortOrder, search, status
 * - รองรับ response ได้หลายรูปแบบ (items/data + totalCount/total/pagination.total)
 */

export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal
): Promise<ExceptionDefinitionListResponse> {
  // 🔁 Map เป็น query ที่ backend ต้องการจริง
  const query = {
    pageIndex: Math.max(0, (q.page ?? 1) - 1),                // 0-based
    pageSize: q.pageSize ?? 10,
    sort: q.sortBy ? `${q.sortBy}:${q.sortOrder ?? "asc"}` : undefined,
    isActive:
      typeof q.status === "string"
        ? String(q.status).toLowerCase() === "active"
        : undefined,
    search: q.search,
  };

  const url = `${API_BASE_URL}/exceptions${qs(query)}`;
  const res = await http<any>(url, { signal });

  // 🌐 Map กลับเป็น format เดิมที่ Hook ใช้ได้
  const items: ExceptionDefinition[] = res.items ?? res.data ?? [];
  const totalCount =
    res.totalCount ?? res.pagination?.total ?? res.total ?? items.length;

  const page = (res.pageIndex ?? query.pageIndex ?? 0) + 1; // convert กลับเป็น 1-based
  const pageSize = res.pageSize ?? query.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(Number(totalCount) / Number(pageSize)));

  return {
    items,
    totalCount: Number(totalCount),
    page: Number(page),
    pageSize: Number(pageSize),
    hasNext: page < totalPages,
    hasPrev: page > 1,
    totalPages,
  };
}


/** alias (คงไว้ให้ส่วนอื่นที่เรียกชื่อ list... ใช้ต่อได้) */
export async function listExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal
): Promise<ExceptionDefinitionListResponse> {
  return getExceptionDefinitions(q, signal);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs (Assignments / Assignees)
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * GET /exceptions/:id/assignees
 * หมายเหตุ: mock ใช้คำว่า "assignments" แต่ backend ใช้ "assignees"
 */
export async function getExceptionAssignmentsByDefinitionId(
  id: string,
  signal?: AbortSignal
): Promise<ExceptionAssignmentRow[]> {
  const url = `${API_BASE_URL}/exceptions/${encodeURIComponent(id)}/assignees`;
  const res = await http<any>(url, { signal });
  // รองรับทั้ง array ตรง ๆ หรือ { data: [...] }
  return Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
}

/**
 * POST /exceptions/:definitionId/assign
 * @payload รูปแบบที่แนะนำให้ backend รองรับ:
 *   { employees: AssignEmployeeInput[], options?: AssignOptions }
 * - ถ้า backend ใช้ชื่อ field ต่างกัน ให้ปรับ map ตรงนี้
 */
export async function assignExceptionsToEmployees(
  definitionId: string,
  employees: AssignEmployeeInput[],
  options?: AssignOptions,
  signal?: AbortSignal
): Promise<{
  added: number;
  updated: number;
  skipped: number;
  rows: ExceptionAssignmentRow[];
}> {
  const url = `${API_BASE_URL}/exceptions/${encodeURIComponent(definitionId)}/assign`;
  const body = JSON.stringify({ employees, options });
  const res = await http<any>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  // ปรับ map เผื่อ backend คืนโครงต่างกัน
  return {
    added: Number(res?.added ?? 0),
    updated: Number(res?.updated ?? 0),
    skipped: Number(res?.skipped ?? 0),
    rows: (res?.rows as ExceptionAssignmentRow[]) ?? [],
  };
}

/**
 * POST /exceptions/:definitionId/revoke
 * @payload ที่แนะนำ: { employeeIds: string[] }
 */
export async function unassignExceptionsFromEmployees(
  definitionId: string,
  employeeIds: string[],
  signal?: AbortSignal
): Promise<{ removed: number; rows: ExceptionAssignmentRow[] }> {
  const url = `${API_BASE_URL}/exceptions/${encodeURIComponent(definitionId)}/revoke`;
  const body = JSON.stringify({ employeeIds });
  const res = await http<any>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  return {
    removed: Number(res?.removed ?? 0),
    rows: (res?.rows as ExceptionAssignmentRow[]) ?? [],
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Extra helper: active definitions for checkbox/list
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * ดึง ExceptionDefinitions ที่สถานะ Active (เรียงตามชื่อ)
 * - ไม่มี endpoint เฉพาะ จึงเรียก /exceptions ด้วย status=Active & pageSize ใหญ่ ๆ
 * - ถ้า backend มี /exceptions/simple ก็สามารถเปลี่ยนมาเรียกตรงนั้นได้
 */
export async function getActiveExceptionDefinitions(
  signal?: AbortSignal
): Promise<ExceptionDefinition[]> {
  const res = await getExceptionDefinitions(
    {
      page: 1,
      pageSize: 1000,
      status: "Active" as PolicyStatus,
      sortBy: "name",
      sortOrder: "asc",
    },
    signal
  );

  // sort name asc เพื่อความชัดเจน (เผื่อฝั่ง backend ไม่เรียง)
  const items = (res.items ?? []).slice().sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, {
      sensitivity: "base",
      numeric: true,
    })
  );
  return items;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Wrap สำหรับหน้า Form: assignException({ definitionId, employeeIds, ... })
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * assignException: สำหรับหน้าแบบฟอร์มที่ส่ง definitionId + employeeIds
 * - map ไปเป็น payload ของ assignExceptionsToEmployees
 * - notes จะ append ตาม options ในฝั่ง backend ถ้ามี
 */
export async function assignException(
  args: {
    definitionId: string | number;
    employeeIds: string[];
    effectiveDate?: string;
    expiresAt?: string;
    notes?: string;
  },
  signal?: AbortSignal
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

  const employeesPayload: AssignEmployeeInput[] = employeeIds.map((id) => ({
    employeeId: String(id),
    // ส่ง notes เข้าไปที่แต่ละคน (ถ้า backend รองรับ)
    notes: (notes?.trim() || null) ?? null,
  }));

  const res = await assignExceptionsToEmployees(
    String(definitionId),
    employeesPayload,
    // ส่ง options ให้ backend ถ้ารองรับ (คุณปรับที่ controller ได้)
    {
      skipIfExists: true,
      upsertNameAndDept: true,
      noteStrategy: notes?.trim() ? "append" : "keep-existing",
      noteAppendSeparator: " | ",
    },
    signal
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