import { AssignRow, ConsumptionUnit, LicenseTerm } from "types";

export function normalizeLicenseModel(model: string): {
  consumptionUnit: "perUser" | "perDevice" | "concurrent";
  term: LicenseTerm;
} {
  const m = (model || "").toLowerCase();

  const consumptionUnit: ConsumptionUnit =
    m.includes("user") ? "perUser" :
    m.includes("device") ? "perDevice" :
    m.includes("concurrent") ? "concurrent" :
    "perUser";

  const term: LicenseTerm =
    m.includes("subscription") ? "subscription" :
    m.includes("perpetual") ? "perpetual" :
    "unknown";

  return { consumptionUnit, term };
}

export function computeRequiredSeats(
  unit: ConsumptionUnit,
  mapping: AssignRow[],
): number {
  if (unit === "perUser") {
    return new Set(mapping.map(m => m.employeeId)).size;
  }
  if (unit === "perDevice") {
    return mapping.reduce((sum, m) => sum + (m.deviceCount ?? 0), 0);
  }
  // concurrent: ให้ server enforce runtime; FE อาจแสดง approximate
  return mapping.length;
}
