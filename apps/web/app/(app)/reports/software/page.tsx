// src/app/reports/software/page.tsx
"use client";

import * as React from "react";
import { InventoryPageShell } from "@/components/inventory/InventoryPageShell";
import { Card } from "@/components/ui/Card";

import type {
  SoftwareItem,
  SoftwareDomainFilters,
  SoftwareFilterValues,
  SoftwareReportSummary,
} from "@/types/software";

import { listSoftwares, getSoftwareReportSummary } from "@/services/software.service.mock";
import { useServerTableController } from "@/hooks/useServerTableController";
import { FilterBar } from "@/components/ui/FilterBar";

// ===== Columns (inline เพื่อลดไฟล์) =====
import type { AppColumnDef } from "types/ui-table";

export const softwareColumns: AppColumnDef<SoftwareItem>[] = [
  {
    id: "application",
    header: "Application",
    accessorKey: "softwareName", // ให้ตารางรู้ว่าคอลัมน์นี้ยึดกับ softwareName
    width: 280,
    cell: (_value, row) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.softwareName}</span>
          <span className="text-xs text-slate-500">{row.version}</span>
        </div>
      );
    },
    getSortValue: (row) => `${row.softwareName ?? ""} ${row.version ?? ""}`.trim(),
  },
  {
    id: "manufacturer",
    header: "Vendor",
    accessorKey: "manufacturer",
    width: 200,
    cellClassName: "whitespace-nowrap",
  },
  {
    id: "seats",
    header: "Seats (Used / Purchased)",
    accessorKey: "seatsUsed", // ตั้งให้มีฐานสำหรับ sort; ค่าจริง render จาก row
    align: "right",
    width: 200,
    cell: (_value, row) => {
      const used = row.seatsUsed ?? "-";
      const purchased = row.seatsPurchased ?? "-";
      return <div className="text-sm tabular-nums">{used} / {purchased}</div>;
    },
    getSortValue: (row) => {
      // ถ้าต้องการ sort โดยใช้ used/purchased รวมกัน
      const used = typeof row.seatsUsed === "number" ? row.seatsUsed : -1;
      const purchased = typeof row.seatsPurchased === "number" ? row.seatsPurchased : -1;
      // ให้ weight กับ used ก่อน
      return used * 1_000_000 + purchased;
    },
  },
  {
    id: "policyCompliance",
    header: "Compliance",
    accessorKey: "policyCompliance",
    width: 160,
    align: "center",
    cell: (_value, row) => {
      const tone =
        row.policyCompliance === "Non-Compliant"
          ? "text-red-600 bg-red-50"
          : "text-emerald-700 bg-emerald-50";
      return (
        <span className={`inline-flex rounded px-2 py-0.5 text-xs ${tone}`}>
          {row.policyCompliance}
        </span>
      );
    },
    getSortValue: (row) => (row.policyCompliance === "Non-Compliant" ? 1 : 0),
  },
  {
    id: "expiryDate",
    header: "Expiry Date",
    accessorKey: "expiryDate",
    width: 150,
    align: "left",
    cell: (value) => {
      const v = (value as string | null | undefined) ?? "";
      return <span className="tabular-nums">{v || "-"}</span>;
    },
    getSortValue: (row) => row.expiryDate ?? "9999-12-31", // null/undefined ไปท้าย
  },
];

// ===== Page =====
export default function SoftwareReportPage() {
  // Domain filters เริ่มต้น
  const [domainFilters, setDomainFilters] = React.useState<SoftwareDomainFilters>({
    // manufacturer: undefined,
    // manufacturers: [],
    // type: undefined,
    // search: "",
    // expiryFrom: undefined,
    // expiryTo: undefined,
  });

  // Controller (pagination/sorting + simple filters)
  const ctl = useServerTableController<
    SoftwareItem,
    SoftwareDomainFilters,
    SoftwareFilterValues
  >({
    pageSize: 10,
    defaultSort: { id: "expiryDate", desc: false }, // รายงาน: อยากเห็นหมดอายุก่อน
    domainFilters,
    setDomainFilters,
    // UI FilterBar ใช้ 'type' เป็น manufacturer (single)
    toSimple: (df) => ({
      type: df.manufacturer ?? undefined, // map manufacturer -> type
      search: df.search ?? "",
    }),
    fromSimple: (sf) => ({
      manufacturer: sf?.type ?? undefined,
      search: sf?.search ?? "",
      // คงค่า multi ผู้ผลิต + ช่วงวันหมดอายุจาก state โดเมน
      manufacturers: domainFilters.manufacturers ?? [],
      expiryFrom: domainFilters.expiryFrom,
      expiryTo: domainFilters.expiryTo,
    }),
    resetDeps: [
      domainFilters.manufacturer,
      domainFilters.search,
      domainFilters.expiryFrom,
      domainFilters.expiryTo,
      domainFilters.manufacturers,
    ],
  });

  // Options (mock)
  const vendorOptions: readonly string[] = [
    "Microsoft", "Adobe", "JetBrains", "Atlassian", "Autodesk", "Zoom", "Slack", "GitHub",
  ];

  // Multi select สำหรับ vendor (ไม่บังคับ ใช้เมื่ออยากเลือกหลาย vendor)
  const [vendorSelected, setVendorSelected] = React.useState<readonly string[]>([]);

  // service query (ประกอบจาก serverQuery + filters)
  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = ctl.serverQuery;
    return {
      page: pageIndex + 1,
      pageSize,
      search: ctl.simpleFilters.search ?? "",
      manufacturer: ctl.simpleFilters.type,                             // single
      manufacturers: vendorSelected.length ? [...vendorSelected] : undefined, // multi
      expiryFrom: domainFilters.expiryFrom,
      expiryTo: domainFilters.expiryTo,
      sortBy,
      sortOrder,
    } as any;
  }, [
    ctl.serverQuery.pageIndex,
    ctl.serverQuery.pageSize,
    ctl.serverQuery.sortBy,
    ctl.serverQuery.sortOrder,
    ctl.simpleFilters.search,
    ctl.simpleFilters.type,
    vendorSelected,
    domainFilters.expiryFrom,
    domainFilters.expiryTo,
  ]);

  // Fetch rows
  const [rows, setRows] = React.useState<SoftwareItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrMsg] = React.useState<string | undefined>();

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrMsg(undefined);
        const res = await listSoftwares(serviceQuery, ac.signal);
        if (!alive) return;
        const items = (res as any).items ?? [];
        const total =
          (res as any).totalCount ??
          (res as any).pagination?.total ??
          (res as any).total ??
          0;

        setRows(items);
        setTotalRows(Number(total));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        setError(true);
        setErrMsg(e?.message ?? "โหลดรายงานไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [serviceQuery]);

  // Summary (metrics)
  const [summary, setSummary] = React.useState<SoftwareReportSummary | null>(null);
  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;
    (async () => {
      try {
        const sum = await getSoftwareReportSummary(serviceQuery, ac.signal);
        if (!alive) return;
        setSummary(sum);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [serviceQuery]);

  // Extra filters: Expiry range
  const [expiryFrom, setExpiryFrom] = React.useState(domainFilters.expiryFrom ?? "");
  const [expiryTo, setExpiryTo] = React.useState(domainFilters.expiryTo ?? "");

  // apply date filter
  const applyExpiry = React.useCallback(() => {
    setDomainFilters((prev) => ({
      ...prev,
      expiryFrom: expiryFrom || undefined,
      expiryTo: expiryTo || undefined,
    }));
    // กลับหน้าแรก
    ctl.setPagination({ pageIndex: 0, pageSize: ctl.pagination.pageSize });
  }, [expiryFrom, expiryTo, setDomainFilters, ctl]);

  // Clear (เคลียร์ multi + date)
  const clearMulti = React.useCallback(() => {
    setVendorSelected([]);
    setExpiryFrom("");
    setExpiryTo("");
    setDomainFilters((prev) => ({ ...prev, expiryFrom: undefined, expiryTo: undefined }));
  }, [setVendorSelected, setDomainFilters]);

  // Summary cards (ใช้ field ตาม SoftwareReportSummary เวอร์ชันใหม่)
  const summaryCards = React.useMemo(() => {
    if (!summary) return [];
    return [
      { id: "softs", title: "Total Softwares", count: summary.totalSoftwares },
      { id: "vendors", title: "Manufacturers", count: summary.totalManufacturers },
      { id: "type-std", title: "Standard", count: summary.totalStandard },
      { id: "type-sp", title: "Special", count: summary.totalSpecial },
      { id: "expiring", title: "Expiring ≤ 30d", count: summary.expiringIn30Days, className: "bg-amber-50" },
      { id: "noncomp", title: "Non-Compliant", count: summary.nonCompliantCount, className: "bg-red-50" },
    ];
  }, [summary]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* หัวรายงาน + KPIs */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold">Software Management — Report</h1>
        <p className="text-sm text-slate-600">ภาพรวมซอฟต์แวร์ ลิขสิทธิ์ การใช้งาน และวันหมดอายุ</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map((c) => (
          <Card key={c.id} title={c.title} count={c.count} compact className={c.className ?? "h-[88px]"} />
        ))}
      </div>

      {/* Filter bar: ใช้เฉพาะ Vendor + Search + Date Range + Multi Vendor */}
      <div className="space-y-3">
        <FilterBar<never, string>
          filters={{
            status: undefined as never, // ❗️ไม่มี status แล้ว
            type: ctl.simpleFilters.type, // manufacturer (single)
            manufacturer: undefined,
            search: ctl.simpleFilters.search ?? "",
          }}
          onFiltersChange={ctl.onSimpleFiltersChange}
          // ไม่มี statusOptions → จะไม่ render dropdown สถานะ
          typeOptions={vendorOptions}
          labels={{
            type: "Vendor",
            allType: "All Vendors",
            searchPlaceholder: "ค้นหา App / Vendor / Version / ID",
            clear: "Clear",
          }}
          // multi vendor
          typeSelected={vendorSelected}
          onTypeSelectedChange={setVendorSelected}
          // ปุ่ม Clear (ของ Shell มีด้วย) — อันนี้เคลียร์เฉพาะ multi/date ก่อน
          onClearFilters={clearMulti}
          // extra: expiry date range
          extraFilters={
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span>Expiry from:</span>
                <input
                  type="date"
                  value={expiryFrom}
                  onChange={(e) => setExpiryFrom(e.target.value)}
                  className="h-9 rounded-md border border-slate-300 px-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span>to:</span>
                <input
                  type="date"
                  value={expiryTo}
                  onChange={(e) => setExpiryTo(e.target.value)}
                  className="h-9 rounded-md border border-slate-300 px-2"
                />
              </label>
              <button
                type="button"
                onClick={applyExpiry}
                className="
                  inline-flex items-center h-9 px-3 rounded-md
                  bg-slate-900 text-white text-sm
                  hover:bg-slate-800 transition-colors
                "
              >
                Apply
              </button>
            </div>
          }
          // ปุ่มขวา (เช่น Export)
          rightExtra={
            <button
              type="button"
              className="
                inline-flex items-center gap-2
                h-9 px-3 rounded-md
                border border-slate-300 bg-white
                text-slate-700 text-sm shadow-sm
                hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300/60
                active:bg-slate-100 transition-colors
              "
              onClick={() => {
                // TODO: export CSV/XLSX
                console.log("Export report with", serviceQuery);
              }}
            >
              Export
            </button>
          }
        />
      </div>

      {/* ตารางหลัก */}
      <InventoryPageShell<SoftwareItem, never, string>
        title="Software Inventory"
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Software", href: "#" }]}
        filters={ctl.simpleFilters}
        onFiltersChange={ctl.onSimpleFiltersChange}
        hasType={true}
        typeOptions={vendorOptions}
        allTypeLabel="All Vendors"
        defaultSort={[{ id: "expiryDate", desc: false }]}
        // ให้ Shell เรียก clear ของเรา (เคลียร์ multi/date) ก่อน แล้ว Shell จะเคลียร์ส่วน UI/sort/page ต่อ
        onClearFilters={clearMulti}
        // ===== DataTable =====
        columns={softwareColumns}
        rows={rows}
        totalRows={totalRows}
        pagination={ctl.pagination}
        onPaginationChange={ctl.setPagination}
        sorting={ctl.sorting}
        onSortingChange={ctl.setSorting}
        rowHref={(row) => `/software/${row.id}`}
        // States
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
    </div>
  );
}