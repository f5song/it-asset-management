
import type { SoftwareItem } from "types";

export function mapSoftwareItemToForm(item: SoftwareItem) {
  return {
    softwareName: item.softwareName ?? "",
    manufacturer: item.manufacturer ?? "",
    version: item.version ?? "",
    category: item.category ?? "",
    licenseModel: item.licenseModel ?? "",
    policyCompliance: item.policyCompliance ?? "",
  };
}
