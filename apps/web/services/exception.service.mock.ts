// src/services/exception.service.mock.ts
"use client";

import type {
  ExceptionDefinition,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
  AssignExceptionsToEmployeesPayload,
  AssignExceptionsToEmployeesResult,
} from "@/types/exception";

/* -------------------------------------------------------------------------- */
/* Mock dataset & utils                                                       */
/* -------------------------------------------------------------------------- */
const NOW = new Date().toISOString();

const MOCK_DEFS: ExceptionDefinition[] = [
  {
    id: "EXC-001",
    name: "Allow LINE on PC",
    status: "Active",
    risk: "Medium",
    createdAt: NOW,
    lastUpdated: NOW,
    notes: "อนุญาตให้ใช้ LINE PC",
    totalAssignments: 25,
  },
  {
    id: "EXC-002",
    name: "Allow USB storage",
    status: "Active",
    risk: "High",
    createdAt: NOW,
    lastUpdated: NOW,
    notes: "อนุญาต USB removable",
    totalAssignments: 40,
  },
  {
    id: "EXC-003",
    name: "Bypass Proxy",
    status: "Inactive",
    risk: "High",
    createdAt: NOW,
    lastUpdated: NOW,
    totalAssignments: 5,
  },
];

const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

/* -------------------------------------------------------------------------- */
/* Definition list                                                            */
/* -------------------------------------------------------------------------- */
export async function listExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  await sleep(120);
  if (signal?.aborted) throw Object.assign(new Error("Aborted"), { name: "AbortError" });

  let filtered = [...MOCK_DEFS];

  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (d) =>
        includesCI(d.id, search) ||
        includesCI(d.name, search) ||
        includesCI(d.status, search) ||
        includesCI(d.notes ?? "", search),
    );
  }
  if (q.status) {
    filtered = filtered.filter((d) => d.status === q.status);
  }

  const page = Math.max(1, Number((q as any).page ?? 1));
  const pageSize = Math.max(1, Number((q as any).pageSize ?? 10));
  const start = (page - 1) * pageSize;

  const totalCount = filtered.length;
  const items = filtered.slice(start, start + pageSize);
  const hasPrev = page > 1;
  const hasNext = start + items.length < totalCount;

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasNext,
    hasPrev,
  };
}

/** ดึง definitions ที่ Active ทั้งหมดสำหรับ checkbox */
export async function getActiveExceptionDefinitions(signal?: AbortSignal) {
  const res = await listExceptionDefinitions(
    { page: 1, pageSize: 999, search: "", status: "Active" } as ExceptionDefinitionListQuery,
    signal,
  );
  return res.items;
}

/* -------------------------------------------------------------------------- */
/* Canonical bulk assign API                                                  */
/* -------------------------------------------------------------------------- */
export async function assignExceptionsToEmployees(
  payload: AssignExceptionsToEmployeesPayload,
  signal?: AbortSignal,
): Promise<AssignExceptionsToEmployeesResult> {
  await sleep(250);
  if (signal?.aborted) throw Object.assign(new Error("Aborted"), { name: "AbortError" });

  // ของจริง: POST ไป backend
  console.log("[mock] assignExceptionsToEmployees", payload);

  return {
    ok: true,
    assignedCount: payload.employeeIds.length,
    definitionIds: payload.definitionIds,
  };
}

/* -------------------------------------------------------------------------- */
/* Convenience wrapper: assignException (2 รูปแบบ)                            */
/*  - ย้าย helper types มาไว้ที่ service (ไม่ปนใน types ของโดเมน)            */
/* -------------------------------------------------------------------------- */
export type AssignExceptionPayload =
  | {
      employeeId: string;
      definitionIds: string[];
      effectiveDate?: string;
      expiresAt?: string;
      notes?: string;
    }
  | {
      employeeIds: string[];
      definitionId: string;
      effectiveDate?: string;
      expiresAt?: string;
      notes?: string;
    };

export type AssignExceptionResult = {
  ok: boolean;
  employeeIds: string[];
  definitionIds: string[];
  assignedCount: number;
};

export async function assignException(
  input: AssignExceptionPayload,
  signal?: AbortSignal,
): Promise<AssignExceptionResult> {
  // normalize payload
  let employeeIds: string[] = [];
  let definitionIds: string[] = [];
  const { effectiveDate, expiresAt, notes } = input as any;

  if ("employeeId" in input) {
    employeeIds = [input.employeeId];
    definitionIds = input.definitionIds ?? [];
  } else if ("definitionId" in input) {
    employeeIds = input.employeeIds ?? [];
    definitionIds = [input.definitionId];
  } else {
    throw new Error("Invalid payload for assignException");
  }

  const res = await assignExceptionsToEmployees(
    { employeeIds, definitionIds, effectiveDate, expiresAt, notes },
    signal,
  );

  return {
    ok: res.ok,
    employeeIds,
    definitionIds,
    assignedCount: res.assignedCount,
  };
}
