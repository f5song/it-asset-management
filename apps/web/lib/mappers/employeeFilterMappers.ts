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

export function toServiceFilters(
  sf: EmployeesFilterValues,
): Partial<EmployeesListQuery> {
  return {
    department: sf.department ?? undefined,
    status: sf.status ?? undefined,
    search: sf.search ?? undefined,
  };
}
