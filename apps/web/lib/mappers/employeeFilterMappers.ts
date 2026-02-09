import type { FilterValues } from "types";
import type { EmployeeDomainFilters, EmployeesFilterValues, EmployeesListQuery, EmployeeStatus } from "types/employees";
import { toUndef, normalizeByMap } from "lib/filters";

// เผื่อรองรับพิมพ์เล็กจาก input ภายนอก/บริการอื่น
const normStatus = normalizeByMap({
  Active: "Active",
  Inactive: "Inactive",
  Contractor: "Contractor",
  Intern: "Intern",
  active: "Active",
  inactive: "Inactive",
  contractor: "Contractor",
  intern: "Intern",
});

const normalizeDepartment = (d?: string): string => (d ? d.trim() : "");

// Domain -> Simple

export function toSimpleFilters(
  df: EmployeeDomainFilters,
): EmployeesFilterValues {
  return {
    department: df.department ?? undefined,
    status: df.status ?? undefined,
    search: df.search ?? undefined,
  };
}


// Simple -> Domain

export function toDomainFilters(
  sf?: Partial<EmployeesFilterValues>,
): EmployeeDomainFilters {
  return {
    department: sf?.department ?? undefined,
    status: sf?.status ?? undefined,
    search: sf?.search ?? undefined,
  };
}


// Simple -> Service

// สมมติชนิด orderBy ที่ service/DB เข้าใจ (คุณอาจมี type ของคุณเองอยู่แล้ว)
type OrderBy = { field?: string; raw?: string; desc?: boolean };

export function toServiceFilters(
  sf: EmployeesFilterValues,
  sorting?: { id: string; desc: boolean }[],
): Partial<EmployeesListQuery> {
  const params: Partial<EmployeesListQuery> = {
    status: sf.status,
    department: sf.department,
    q: sf.search?.trim() || undefined,
  };

  if (sorting?.length) {
    const orderBy: OrderBy[] = sorting.map((s) => {
      if (s.id === "status_priority") {
        // ✅ ให้ service ใช้ CASE ครอบเพื่อ Active -> Resigned -> อื่น ๆ
        return {
          raw: `CASE status
                  WHEN 'Active'   THEN 0
                  WHEN 'Resigned' THEN 1
                  ELSE 999
                END ${s.desc ? "DESC" : "ASC"}`,
        };
      }
      // กรณี field ปกติ
      return { field: s.id, desc: s.desc };
    });
    (params as any).orderBy = orderBy;
  }

  return params;
}
