
import { show } from "lib/show";
import type { InstallationRow } from "types";

export const softwareInstallationColumns = [
  { header: "Device", accessor: (r) => show(r.deviceName) },
  { header: "User", accessor: (r) => show(r.userName) },
  { header: "License Status", accessor: () => "Active" },
  { header: "License Key", accessor: () => "—" },
  { header: "Scanned License", accessor: () => "—" },
  { header: "Workstation", accessor: () => "—" },
] satisfies {
  header: string;
  accessor: (r: InstallationRow) => React.ReactNode;
}[];
