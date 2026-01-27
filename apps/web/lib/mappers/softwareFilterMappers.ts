import type { FilterValues } from "types";
import type { SoftwareFilters, SoftwareStatus, SoftwareType } from "types";
import { toUndef, normalizeByMap } from "lib/filters";

// canonical mapping (เผื่อรับค่าพิมพ์เล็กจาก UI/บริการอื่น)
const normStatus = normalizeByMap({
  Active: "Active",
  Expired: "Expired",
  Expiring: "Expiring",
  active: "Active",
  expired: "Expired",
  expiring: "Expiring",
});

const normType = normalizeByMap({
  Standard: "Standard",
  Special: "Special",
  Exception: "Exception",
  standard: "Standard",
  special: "Special",
  exception: "Exception",
});

// Domain -> Simple
export function toSimpleFilters(
  df: SoftwareFilters
): FilterValues<SoftwareStatus, SoftwareType> {
  return {
    status: toUndef(df.status as SoftwareStatus | ""),
    type: toUndef(df.type as SoftwareType | ""),
    manufacturer: toUndef(df.manufacturer as string | ""),
    searchText: df.search ?? "",
  };
}

// Simple -> Domain
export function toDomainFilters(
  sf?: FilterValues<SoftwareStatus, SoftwareType>
): SoftwareFilters {
  if (!sf) return {};
  return {
    status: toUndef(sf.status as SoftwareStatus),
    type: toUndef(sf.type as SoftwareType),
    manufacturer: toUndef(sf.manufacturer as string | ""),
    search: sf.searchText ?? "",
  };
}

// Simple -> Service (normalize string ล้วน)
export function toServiceFilters(
  sf: FilterValues<SoftwareStatus, SoftwareType>
) {
  return {
    status: normStatus(sf.status as string | undefined),
    type: normType(sf.type as string | undefined),
    manufacturer: (sf.manufacturer as string | undefined) ?? "",
    search: sf.searchText ?? "",
  };
}
