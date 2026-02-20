// src/services/employees.service.ts
import { buildUrl } from "@/config/config";
import { http, qs } from "@/lib/http";
import type {
  EmployeeItem,
  EmployeeStatus,
  EmployeesListQuery,
  EmployeesListResponse,
} from "@/types/employees";

/**
 * เรียก backend: GET /employees (page 1-based)
 * normalize response -> { items, totalCount, page, pageSize, hasPrev, hasNext }
 */
export async function listEmployees(
  q: EmployeesListQuery,
  signal?: AbortSignal,
): Promise<EmployeesListResponse> {
  // page: รองรับทั้ง page (1-based) และ fallback จาก pageIndex (0-based)
  const page =
    typeof q.page === "number"
      ? Math.max(1, Number(q.page))
      : Math.max(1, Number(q.pageIndex ?? 0) + 1);

  const sortBy = q.sort?.col ?? q.sortBy;
  const sortOrder =
    q.sort?.desc != null ? (q.sort.desc ? "desc" : "asc") : (q.sortOrder ?? "asc");

  // ✅ ดึง exceptionId ที่ต้อง "exclude active assignees" ออกจากลิสต์
  //    - ถ้าได้อัปเดต type EmployeesListQuery แล้ว: q.excludeAssignedForExceptionId
  //    - ถ้ายัง: fallback ใช้ (q as any)
  const excludeAssignedForExceptionId =
    typeof (q as any)?.excludeAssignedForExceptionId === "number"
      ? (q as any).excludeAssignedForExceptionId
      : undefined;

  const query = {
    page,
    pageSize: q.pageSize ?? 10,
    search: q.search || undefined,
    status: q.status || undefined, // "Active" | "Resigned"
    type: q.type || undefined,     // department
    sortBy: sortBy || undefined,
    sortOrder: sortBy ? (sortOrder ?? "asc") : undefined,

    // ✅ แนบไปเมื่อมีค่า (ตัวเลข)
    ...(typeof excludeAssignedForExceptionId === "number"
      ? { excludeAssignedForExceptionId }
      : {}),
  };

  const url = buildUrl(`/employees${qs(query)}`);
  const res = await http<any>(url, { method: "GET", signal });

  const items: EmployeeItem[] = res?.items ?? res?.data ?? [];
  const totalCount = Number(
    res?.totalCount ?? res?.total ?? res?.pagination?.total ?? items.length,
  );
  const pageOut = Number(res?.page ?? page);
  const pageSizeOut = Number(res?.pageSize ?? query.pageSize ?? 10);

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

/**
 * ค้นหาพนักงานแบบเบา ๆ สำหรับ Auto-complete
 * - default: page=1, pageSize=10
 * - ใส่ status=Active ถ้าต้องการจำกัดเฉพาะพนักงานปัจจุบัน
 */
export async function searchEmployees(
  term: string,
  opts?: { limit?: number; status?: EmployeeStatus },
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  const res = await listEmployees(
    {
      page: 1,
      pageSize: opts?.limit ?? 10,
      search: term,
      status: opts?.status,
    },
    signal,
  );
  return res.items ?? [];
}

/** (option) ดึงรายคน */
export async function getEmployeeById(
  id: string,
  signal?: AbortSignal,
): Promise<EmployeeItem | null> {
  const url = buildUrl(`/employees/${encodeURIComponent(id)}`);
  const res = await http<any>(url, { method: "GET", signal });
  const row: EmployeeItem | null = res?.item ?? res?.data ?? res ?? null;
  return row ?? null;
}