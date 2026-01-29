import type { LicenseSummary } from "hooks/useLicenseSummary";
import type { SummaryCardItem } from "components/inventory/InventoryPageShell";

export function buildLicenseSummaryCards(s?: LicenseSummary | null): SummaryCardItem[] {
  if (!s) return [];
  return [
    { id: "total",   title: "Total Licenses", count: s.total },
    { id: "active",  title: "Active",         count: s.active },
    { id: "inactive",title: "Inactive",       count: s.inactive },
    { id: "expired", title: "Expired",        count: s.expired },
    { id: "warning", title: "Warning",        count: s.warning },
    { id: "seats_used",  title: "Seats Used",      count: s.seatsUsed },
    { id: "seats_total", title: "Seats Total",     count: s.seatsTotal },
    { id: "seats_avail", title: "Seats Available", count: s.seatsAvailable },
  ];
}

export function buildLicenseSummarySkeleton(): SummaryCardItem[] {
  return [
    { id: "total",   title: "Total Licenses", count: "…" },
    { id: "active",  title: "Active",         count: "…" },
    { id: "inactive",title: "Inactive",       count: "…" },
    { id: "expired", title: "Expired",        count: "…" },
  ];
}