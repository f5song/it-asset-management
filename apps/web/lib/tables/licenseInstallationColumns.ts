
import { show } from "lib/show";
import type { LicenseInstallationRow } from "types";

export const installationColumns = [
  {
    header: "Device",
    accessor: (r) => show(r.deviceName),
  },
  {
    header: "User",
    accessor: (r) => show(r.userName),
  },
  {
    header: "License Status",
    accessor: (r) => show(r.licenseStatus ?? "Active"),
  },
  {
    header: "License Key",
    accessor: (r) => show(r.licenseKey),
  },
  {
    header: "Scanned License",
    accessor: (r) => show(r.scannedLicenseKey),
  },
  {
    header: "Workstation",
    accessor: (r) => show(r.workStation),
  },
] satisfies {
  header: string;
  accessor: (r: LicenseInstallationRow) => React.ReactNode;
}[];
