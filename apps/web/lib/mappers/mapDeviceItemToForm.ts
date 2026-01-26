
import type { DeviceItem } from "types";

export function mapDeviceItemToForm(item: DeviceItem) {
  return {
    name: item.name ?? "",
    type: String(item.type ?? "").toLowerCase(),
    assignedTo: item.assignedTo ?? "",
    os: String(item.os ?? "").toLowerCase(),
    compliance: String(item.compliance ?? "").toLowerCase(),
    lastScan: item.lastScan ?? "",
  };
}
