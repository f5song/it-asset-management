import type { FilterValues } from "types";
import type { DeviceDomainFilters, DeviceGroup, DeviceType, DeviceOS } from "types/device";
import { toUndef } from "lib/filters";

// Domain -> Simple
export function toSimpleFilters(
  df: DeviceDomainFilters
): FilterValues<DeviceGroup, DeviceType> {
  return {
    status: df.deviceGroup,
    type: df.deviceType,
    manufacturer: df.os,
    searchText: df.search ?? "",
  };
}

// Simple -> Domain
export function toDomainFilters(
  sf?: FilterValues<DeviceGroup, DeviceType>
): DeviceDomainFilters {
  if (!sf) return {};
  return {
    deviceGroup: toUndef(sf.status as DeviceGroup | ""),
    deviceType: toUndef(sf.type as DeviceType | ""),
    os: toUndef(sf.manufacturer as DeviceOS | ""),
    search: sf.searchText ?? "",
  };
}

// Simple -> Service (devices ไม่ได้ normalize เป็นพิเศษในตอนนี้)
export function toServiceFilters(
  sf: FilterValues<DeviceGroup, DeviceType>
) {
  return {
    deviceGroup: (sf.status as DeviceGroup | undefined) ?? "",
    deviceType: (sf.type as DeviceType | undefined) ?? "",
    os: (sf.manufacturer as DeviceOS | undefined) ?? "",
    search: sf.searchText ?? "",
  };
}
