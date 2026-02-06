import type { EmployeeItem } from "@/types/employees";

export function fullNameTh(e: EmployeeItem) {
  return [e.firstNameTh, e.lastNameTh].filter(Boolean).join(" ").trim();
}

export function fullNameEn(e: EmployeeItem) {
  return [e.firstNameEn, e.lastNameEn].filter(Boolean).join(" ").trim();
}

/** เลือกไทยก่อน ถ้าไม่มี → อังกฤษ → ถ้าไม่มีทั้งคู่ คืน "" */
export function fullName(e: EmployeeItem) {
  const th = fullNameTh(e);
  if (th) return th;
  const en = fullNameEn(e);
  return en || "";
}