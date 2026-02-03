

// src/services/employees.service.mock.ts
import { Employees, EmployeeStatus } from "types/employees";

// ---- Mock dataset ----------------------------------------------------------
const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Finance",
  "HR",
  "Operations",
  "Sales",
] as const;


const STATUSES: EmployeeStatus[] = [
  EmployeeStatus.Active,
  EmployeeStatus.Inactive,
  EmployeeStatus.Contractor,
  EmployeeStatus.Intern,
];

const MOCK_EMPLOYEES: Employees[] = Array.from({ length: 73 }).map((_, i) => ({
  id: `E-${(i + 1).toString().padStart(3, "0")}`,
  name: `Employee ${i + 1}`,
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  status: STATUSES[i % STATUSES.length],
  jobTitle: `Application Developer Specialist`,
  phone:`${(i + 1).toString().padStart(4, "0")}`,
  email:`puttaraporn.j@becworld.com`,
  device: `LAPTOP-001`,

}));

// ---- Utils -----------------------------------------------------------------
function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    }
  });
}

const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));

// ---- Types (ภายในไฟล์นี้) -------------------------------------------------
export type EmployeeItemsQuery = {
  page?: number;             // 1-based
  limit?: number;
  sortBy?: keyof Employees | string;
  sortOrder?: "asc" | "desc";
  // ฟิลเตอร์
  search?: string;
  statusFilter?: EmployeeStatus | string;
  departmentFilter?: string;
};

export type EmployeeItemsResponse = {
  data: Employees[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ---- Service API -----------------------------------------------------------

/** GET /employees/:id */
export async function getEmployeeById(
  id: string | number,
  signal?: AbortSignal
): Promise<Employees | null> {
  await sleep(80, signal);
  return MOCK_EMPLOYEES.find((e) => String(e.id) === String(id)) ?? null;
}

/** GET /employees (with filters/sort/pagination) */
export async function getEmployees(
  q: EmployeeItemsQuery,
  signal?: AbortSignal
): Promise<EmployeeItemsResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_EMPLOYEES];

  // 1) Search (id/name/department/status)
  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (e) =>
        includesCI(e.id, search) ||
        includesCI(e.name, search) ||
        includesCI(e.department, search) ||
        includesCI(e.status, search)
    );
  }

  // 2) Filters
  if (q.statusFilter) {
    const s = ci(q.statusFilter);
    filtered = filtered.filter((e) => ci(e.status) === s);
  }

  if (q.departmentFilter) {
    const d = ci(q.departmentFilter);
    filtered = filtered.filter((e) => ci(e.department) === d);
  }

  // 3) Sort
  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof Employees;
    filtered.sort((a, b) => {
      const A = (a[key] as any) ?? "";
      const B = (b[key] as any) ?? "";
      return A > B ? dir : A < B ? -dir : 0;
    });
  }

  // 4) Pagination (page/limit)
  const total = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const limit = Math.max(1, Number(q.limit ?? 10));
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}


// ✅ แบบเร็ว: ดึงทีเดียวด้วย limit ใหญ่
export async function getAllEmployeesQuick(signal?: AbortSignal): Promise<Employees[]> {
  const res = await getEmployees({ page: 1, limit: 9999 }, signal);
  return res.data;
}

// ✅ แบบ robust: loop ทีละหน้า
export async function getAllEmployees(signal?: AbortSignal): Promise<Employees[]> {
  const limit = 100;
  let page = 1;
  const out: Employees[] = [];

  // ดึงจนหมดทุกหน้า
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await getEmployees({ page, limit }, signal);
    out.push(...res.data);
    if (page >= res.pagination.totalPages) break;
    page += 1;
  }
  return out;
}
