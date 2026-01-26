import { show } from "lib/show";
import { DeviceInstallationRow } from "types";

export const deviceInstallationColumns = [
  { header: "Software", accessor: (r) => show(r.softwareName) },
  { header: "Manufacturer", accessor: (r) => show(r.manufacturer) },
  { header: "Version", accessor: (r) => show(r.version) },
  { header: "Category", accessor: (r) => show(r.category) },
  { header: "Status", accessor: (r) => show(r.status ?? "Active") },
] satisfies {
  header: string;
  accessor: (r: DeviceInstallationRow) => React.ReactNode;
}[];
