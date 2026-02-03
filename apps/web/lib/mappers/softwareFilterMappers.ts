import type { FilterValues } from "types";
import type { SoftwareFilters, SoftwareStatus, SoftwareType } from "types";
import { toUndef } from "lib/filters";

// ❌ ไม่ต้องมี normalizeByMap ถ้า UI ให้ค่าถูกต้องอยู่แล้ว
// ❌ ไม่ต้องแคสต์เป็น string
// ❌ ไม่ต้อง map lowercase

// ---------------------------------------------
// Domain -> Simple
// ---------------------------------------------
export function toSimpleFilters(
  df: SoftwareFilters
): FilterValues<SoftwareStatus, SoftwareType> {
  return {
    status: toUndef(df.status),
    type: toUndef(df.type),
    manufacturer: toUndef(df.manufacturer),
    search: df.search ?? "",
  };
}

// ---------------------------------------------
// Simple -> Domain
// ---------------------------------------------
export function toDomainFilters(
  sf?: FilterValues<SoftwareStatus, SoftwareType>
): SoftwareFilters {
  if (!sf) return {};
  return {
    status: toUndef(sf.status),
    type: toUndef(sf.type),
    manufacturer: toUndef(sf.manufacturer),
    search: sf.search ?? "",
  };
}

// ---------------------------------------------
// Simple -> Service  (แบบง่ายสุด ถูกต้องสุด)
// ---------------------------------------------
export function toServiceFilters(
  sf: FilterValues<SoftwareStatus, SoftwareType>
): Pick<SoftwareFilters, "status" | "type" | "manufacturer" | "search"> {
  return {
    status: toUndef(sf.status),           // SoftwareStatus | undefined
    type: toUndef(sf.type),               // SoftwareType | undefined
    manufacturer: toUndef(sf.manufacturer),
    search: sf.search ?? "",
  };
}