import type { FilterValues } from "types";
import type { LicenseFilters, LicenseStatus, LicenseModel } from "types";
import { toUndef } from "lib/filters";

// ---------------------------------------------
// Domain -> Simple
// ---------------------------------------------
export function toSimpleFilters(
  df: LicenseFilters
): FilterValues<LicenseStatus, LicenseModel> {
  return {
    status: toUndef(df.status),
    type: toUndef(df.licenseModel),
    manufacturer: toUndef(df.manufacturer),
    search: df.search ?? "",
  };
}

// ---------------------------------------------
// Simple -> Domain
// ---------------------------------------------
export function toDomainFilters(
  sf?: FilterValues<LicenseStatus, LicenseModel>
): LicenseFilters {
  if (!sf) return {};
  return {
    status: toUndef(sf.status),
    licenseModel: toUndef(sf.type),
    manufacturer: toUndef(sf.manufacturer),
    search: sf.search ?? "",
  };
}

// ---------------------------------------------
// Simple -> Service  (แบบง่ายสุด ถูกสุด ไม่ error)
// ---------------------------------------------
export function toServiceFilters(
  sf: FilterValues<LicenseStatus, LicenseModel>
): Pick<LicenseFilters, "status" | "licenseModel" | "manufacturer" | "search"> {
  return {
    status: toUndef(sf.status),                // LicenseStatus | undefined
    licenseModel: toUndef(sf.type),            // LicenseModel  | undefined
    manufacturer: toUndef(sf.manufacturer),    // string | undefined
    search: sf.search ?? "",               // string
  };
}