import type { FilterValues } from "types";
import type { EmployeesFilters, EmployeeStatus } from "types/employees";
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
  df: EmployeesFilters
): FilterValues<EmployeeStatus, string> {
  return {
    status: toUndef(df.status as EmployeeStatus | ""),
    type: toUndef(df.department as string | ""),
    manufacturer: undefined, // ไม่ใช้ในหน้านี้
    search: df.search ?? "",
  };
}

// Simple -> Domain
export function toDomainFilters(
  sf?: FilterValues<EmployeeStatus, string>
): EmployeesFilters {
  if (!sf) return {};
  return {
    status: toUndef(sf.status as EmployeeStatus),
    department: toUndef(sf.type as string),
    search: sf.search ?? "",
  };
}

// Simple -> Service
export function toServiceFilters(
  sf: FilterValues<EmployeeStatus, string>
) {
  return {
    status: normStatus(sf.status as string | undefined),
    department: normalizeDepartment(sf.type as string | undefined),
    search: sf.search ?? "",
  };
}