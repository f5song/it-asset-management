import type { FilterValues } from "types";
import type { LicenseFilters, LicenseStatus, LicenseModel } from "types";
import { toUndef, normalizeByMap } from "lib/filters";

const normStatus = normalizeByMap({
  Active: "Active",
  Expired: "Expired",
  Expiring: "Expiring",
  active: "Active",
  expired: "Expired",
  expiring: "Expiring",
});

const normModel = normalizeByMap({
  "Per-User": "Per-User",
  "Per-Device": "Per-Device",
  Subscription: "Subscription",
  Perpetual: "Perpetual",
  Concurrent: "Concurrent",
  "per-user": "Per-User",
  "per-device": "Per-Device",
  subscription: "Subscription",
  perpetual: "Perpetual",
  concurrent: "Concurrent",
});

// Domain -> Simple
export function toSimpleFilters(
  df: LicenseFilters
): FilterValues<LicenseStatus, LicenseModel> {
  return {
    status: toUndef(df.status as LicenseStatus | ""),
    type: toUndef(df.licenseModel as LicenseModel | ""),
    manufacturer: toUndef(df.manufacturer as string | ""),
    searchText: df.search ?? "",
  };
}

// Simple -> Domain
export function toDomainFilters(
  sf?: FilterValues<LicenseStatus, LicenseModel>
): LicenseFilters {
  if (!sf) return {};
  return {
    status: toUndef(sf.status),
    licenseModel: toUndef(sf.type),
    manufacturer: toUndef(sf.manufacturer),
    search: sf.searchText ?? "",
  };
}

// Simple -> Service
export function toServiceFilters(
  sf: FilterValues<LicenseStatus, LicenseModel>
) {
  return {
    status: normStatus(sf.status as string | undefined),
    licenseModel: normModel(sf.type as string | undefined),
    manufacturer: (sf.manufacturer as string | undefined) ?? "",
    search: sf.searchText ?? "",
  };
}