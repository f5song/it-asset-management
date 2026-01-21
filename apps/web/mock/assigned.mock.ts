
import { LicenseStatus } from "../types";

export const ASSIGNED_TO: AssigenedRow[] = [
  {
    employeeId: "1",
    employeeName: "Puttaraporn Jitpranee",
    expiryDate: "2025-01-01",
    AssignedDate: "2025.1",
    softwareId: "SW-3DSMAX",
    softwareName: "3ds Max",
    department: "Information Technology",
    status: LicenseStatus.Active,
  },
  // ... อื่น ๆ
];

export async function getAssignedTo(
  softwareId: string
): Promise<AssigenedRow[]> {
  return ASSIGNED_TO.filter((row) => row.softwareId === softwareId);
}

export async function getAssignedToFilters(softwareId: string): Promise<{
  employees: string[];
  departments: string[];
  statuses: LicenseStatus[];   // ← ใช้ enum ให้ตรงกับ data จริง
  softwareName: string;        // ← ให้เป็น string แน่นอน
}> {
  const scoped = ASSIGNED_TO.filter((row) => row.softwareId === softwareId);

  const employees = Array.from(
    new Set(scoped.map((r) => r.employeeName).filter((v): v is string => typeof v === "string"))
  ).sort();

  const departments = Array.from(
    new Set(scoped.map((r) => r.department).filter((v): v is string => typeof v === "string"))
  ).sort();

  const statuses = Array.from(
    new Set(
      scoped
        .map((r) => r.status)
        .filter((v): v is LicenseStatus => v !== undefined) // narrow เป็น LicenseStatus
    )
  ).sort();

  const names = Array.from(
    new Set(
      scoped
        .map((r) => r.softwareName)
        .filter((v): v is string => typeof v === "string") // narrow เป็น string[]
    )
  ).sort();

  const softwareName = names.length > 0 ? names[0] : "-";

  return { employees, departments, statuses, softwareName };
}
