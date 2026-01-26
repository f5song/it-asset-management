import { LicenseItem } from "types";

export function mapLicenseItemToForm(item: LicenseItem) {
  return {
    productName: item.softwareName ?? "",
    licenseModel: item.licenseModel ?? "Per-User",
    total: item.total ?? 0,
    inUse: item.inUse ?? 0,
    expiryDate: item.expiryDate ?? "",
    status: item.status ?? "Active",
    manufacturer: item.manufacturer ?? "",
    licenseCost: item.cost ?? 0,
    maintenanceCost: item.maintenanceCost ?? 0,
    notes: item.notes ?? "",
    licenseKey: item.licenseKey ?? "",
  };
}
