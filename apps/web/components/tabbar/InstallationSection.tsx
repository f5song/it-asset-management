// components/tabbar/InstallationSection.tsx (generalized)
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  InstallationTable,
  InstallationFilters,
} from "./InstallationTable";

// ✅ ใช้ AppColumnDef ตัวเดียวกับ InstallationTable (จาก ui-table)
import type { AppColumnDef } from "../../types/ui-table";
import type { ExportFormat } from "types";

import { SearchInput } from "../ui/SearchInput";
import { ExportSelect } from "../ui/ExportSelect";

type Props<R extends { id?: string | number }> = {
  rows: R[];
  columns: AppColumnDef<R>[];
  resetKey?: string;

  /** ควบคุมหน้า/ขนาดหน้า (ค่าเริ่มต้น) */
  initialPage?: number;     // 1-based
  pageSize?: number;

  /** ---- UI props ---- */
  searchPlaceholder?: string;
  exportScope?: "page" | "all";
  exportFileBaseName?: string;

  /** ---- Server-side pagination (ถ้าส่งมา = เข้าโหมด server) ---- */
  /** จำนวนแถวทั้งหมดจาก API (ถ้าไม่ส่ง = ใช้ client-side mode) */
  totalRows?: number;
  /** สถานะโหลดจาก API */
  isLoading?: boolean;
  /** ข้อความผิดพลาดจาก API */
  errorMessage?: string;
  /**
   * เรียกเมื่อผู้ใช้เปลี่ยนหน้า/ขนาดหน้า
   * - Parent ควรโหลดข้อมูลใหม่จาก API แล้วส่ง rows/totalRows ใหม่กลับเข้ามา
   * - ถ้าไม่ส่งมา จะเป็น client-side mode ใช้ InstallationTable จัดการเอง
   */
  onPageChange?: (page: number, pageSize?: number) => void;

  /** (ทางเลือก) ความสูง body table */
  maxBodyHeight?: number;
};

export function InstallationSection<R extends { id?: string | number }>({
  rows,
  columns,
  resetKey,
  initialPage = 1,
  pageSize = 10,
  searchPlaceholder = "Search...",
  exportScope = "all",
  exportFileBaseName = "installations",

  // server-side props (optional)
  totalRows,
  isLoading = false,
  errorMessage,
  onPageChange,

  maxBodyHeight = 480,
}: Props<R>) {
  const [page, setPage] = useState(initialPage); // 1-based
  const [size, setSize] = useState(pageSize);
  const [filters, setFilters] = useState<InstallationFilters>({ query: "" });

  // เก็บผลกรองล่าสุดจากตารางไว้สำหรับ export (client-side mode)
  const filteredRef = useRef<R[]>([]);
  const pageRowsRef = useRef<R[]>([]);
  const totalRowsRef = useRef<number>(0);

  const serverMode = typeof totalRows === "number" || typeof onPageChange === "function";

  // reset เมื่อ key/page เปลี่ยน
  useEffect(() => {
    setPage(initialPage);
    setSize(pageSize);
    setFilters({ query: "" });
  }, [resetKey, initialPage, pageSize]);

  // === Export helpers ===
  const nodeToText = (n: React.ReactNode): string => {
    if (n == null || typeof n === "boolean") return "";
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(nodeToText).join(" ");
    // กรณีเป็น React element/fragment: ดึง children เป็นข้อความแบบง่าย ๆ
    // @ts-ignore
    const props = (n as any)?.props;
    if (props?.children) return nodeToText(props.children);
    try {
      return String(n);
    } catch {
      return "";
    }
  };

  /**
   * แปลง dataset ให้เป็น headers + rows (plain text) สำหรับ export
   * รองรับทั้ง 3 รูปแบบของคอลัมน์:
   *  - accessor?: (row) => ReactNode
   *  - cell?: (value, row) => ReactNode
   *  - accessorKey?: string
   */
  const buildFlatRows = (dataset: R[]) => {
    const headers = columns.map((c) => (c as any).header ?? "");

    const data = dataset.map((r) =>
      columns.map((c) => {
        const anyC = c as any;

        // 1) ถ้ามี accessor(row)
        if (typeof anyC.accessor === "function") {
          return nodeToText(anyC.accessor(r));
        }

        // 2) ถ้ามี cell(value, row)
        if (typeof anyC.cell === "function") {
          let value: unknown = undefined;
          if (typeof anyC.accessorKey === "string") {
            const key = anyC.accessorKey as keyof R;
            value = (r as any)?.[key];
          }
          return nodeToText(anyC.cell(value, r));
        }

        // 3) ถ้ามี accessorKey
        if (typeof anyC.accessorKey === "string") {
          const key = anyC.accessorKey as keyof R;
          return nodeToText((r as any)?.[key]);
        }

        // 4) ไม่เข้าเงื่อนไขใด ๆ
        return "";
      })
    );

    return { headers, data };
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = (dataset: R[], filenameBase: string) => {
    const { headers, data } = buildFlatRows(dataset);
    const escapeCSV = (val: string) => {
      const needsQuote = /[",\n]/.test(val);
      const v = val.replace(/"/g, '""');
      return needsQuote ? `"${v}"` : v;
    };
    const lines = [
      headers.map((h) => escapeCSV(String(h))).join(","),
      ...data.map((row) => row.map((v) => escapeCSV(String(v ?? ""))).join(",")),
    ];
    const csv = lines.join("\n");
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `${filenameBase}.csv`
    );
  };

  const exportXLSX = async (dataset: R[], filenameBase: string) => {
    // ถ้ามีไลบรารี xlsx ให้สลับมาใช้ได้
    console.warn(
      "TODO: โปรดติดตั้งและเชื่อมต่อไลบรารี xlsx ก่อนใช้งาน export เป็น .xlsx"
    );
    // ชั่วคราว: export CSV แทน
    exportCSV(dataset, filenameBase);
  };

  const exportPDF = async (dataset: R[], filenameBase: string) => {
    // ถ้ามี jsPDF + autotable ให้สลับมาใช้ได้
    console.warn(
      "TODO: โปรดเชื่อมต่อ jsPDF + autotable ก่อนใช้งาน export เป็น PDF"
    );
    // ชั่วคราว: export CSV แทน
    exportCSV(dataset, filenameBase);
  };

  const handleExport = async (format: ExportFormat) => {
    const base = exportFileBaseName;

    // ใน server mode:
    // - "page" → export เฉพาะ rows ของหน้า
    // - "all" → เตือน เพราะไม่มีข้อมูลทั้งหมดอยู่ในหน้านี้
    if (serverMode) {
      if (exportScope === "all") {
        console.warn(
          "[InstallationSection] Export scope 'all' ใน server-side mode: ไม่สามารถส่งออกทั้งหมดได้จาก component นี้ (มีเฉพาะแถวที่โหลดมาในหน้า). " +
          "แนะนำทำ export ฝั่ง server หรือเปลี่ยน exportScope='page'."
        );
      }
      const dataset = rows ?? [];
      switch (format) {
        case "csv":
          exportCSV(dataset, base);
          break;
        case "xlsx":
          await exportXLSX(dataset, base);
          break;
        case "pdf":
          await exportPDF(dataset, base);
          break;
        default:
          console.warn("Unsupported export format:", format);
      }
      return;
    }

    // client-side mode เดิม:
    const dataset = exportScope === "page" ? pageRowsRef.current : filteredRef.current;

    if (!dataset || dataset.length === 0) {
      console.warn("No data to export.");
      return;
    }

    switch (format) {
      case "csv":
        exportCSV(dataset, base);
        break;
      case "xlsx":
        await exportXLSX(dataset, base);
        break;
      case "pdf":
        await exportPDF(dataset, base);
        break;
      default:
        console.warn("Unsupported export format:", format);
    }
  };

  // ==== Pagination controls ====
  const computedTotalRows = serverMode
    ? Number(totalRows ?? 0)
    : Number(totalRowsRef.current ?? rows.length);

  const totalPages = Math.max(1, Math.ceil(Math.max(0, computedTotalRows) / Math.max(1, size)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goToPage = (nextPage: number, nextSize = size) => {
    setPage(nextPage);
    setSize(nextSize);
    if (serverMode) {
      onPageChange?.(nextPage, nextSize);
    }
  };

  const handlePrev = () => {
    if (!canPrev) return;
    goToPage(page - 1);
  };

  const handleNext = () => {
    if (!canNext) return;
    goToPage(page + 1);
  };

  const handlePageSizeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const nextSize = Number(e.target.value) || 10;
    // เปลี่ยน page size → กลับหน้า 1
    goToPage(1, nextSize);
  };

  return (
    <>
      {/* ✅ Toolbar / Tab Header */}
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        {/* Search ทางซ้าย */}
        <div className="min-w-[240px]">
          <SearchInput
            value={filters.query ?? ""}
            onChange={(q) => setFilters({ query: q })}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* ดัน right tools ไปฝั่งขวา */}
        <div className="ml-auto flex items-center gap-2">
          {/* ปุ่ม Export As */}
          <ExportSelect onExport={handleExport} />
        </div>
      </div>

      {/* สถานะโหลด/ผิดพลาด (server-side UI hint) */}
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="text-slate-600">
          {isLoading
            ? "กำลังโหลด..."
            : errorMessage
              ? <span className="text-red-600">{errorMessage}</span>
              : `ทั้งหมด ${computedTotalRows.toLocaleString()} รายการ`}
        </div>

        {/* Controls: page size + prev/next */}
        <div className="flex items-center gap-2">
          <span>Rows / page:</span>
          <select
            className="border rounded px-2 py-1"
            value={size}
            onChange={handlePageSizeChange}
          >
            {[5, 8, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button
            type="button"
            className="px-2 py-1 rounded border disabled:opacity-50"
            onClick={handlePrev}
            disabled={!canPrev || isLoading}
          >
            Prev
          </button>
          <span className="px-2">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="px-2 py-1 rounded border disabled:opacity-50"
            onClick={handleNext}
            disabled={!canNext || isLoading}
          >
            Next
          </button>
        </div>
      </div>

      {/* ตาราง */}
      <div className="border rounded overflow-auto" style={{ maxHeight: maxBodyHeight }}>
        <InstallationTable
          rows={rows}
          columns={columns}
          filters={filters}
          page={page}
          pageSize={size}
          // client-side mode เท่านั้นที่ให้ table เปลี่ยน page ภายใน
          onPageChange={serverMode ? undefined : setPage}
          onAfterFilter={
            serverMode
              ? undefined // server mode ไม่ใช้ผลกรอง/แบ่งหน้าจาก table
              : ({ filteredRows, pageRows, totalRows }) => {
                  filteredRef.current = filteredRows;
                  pageRowsRef.current = pageRows;
                  totalRowsRef.current = totalRows;
                }
          }
        />
      </div>
    </>
  );
}