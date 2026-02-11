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
  initialPage?: number;
  pageSize?: number;
  /** ปรับ placeholder ของช่องค้นหาได้ */
  searchPlaceholder?: string;
  /** จะ export เฉพาะหน้า หรือทั้งผลลัพธ์ที่ถูกกรอง */
  exportScope?: "page" | "all";
  /** ชื่อไฟล์ฐานตอน export (ไม่รวม .ext) */
  exportFileBaseName?: string;
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
}: Props<R>) {
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<InstallationFilters>({ query: "" });

  // เก็บผลกรองล่าสุดจากตารางไว้สำหรับ export
  const filteredRef = useRef<R[]>([]);
  const pageRowsRef = useRef<R[]>([]);
  const totalRowsRef = useRef<number>(0);

  // reset เมื่อ key/page เปลี่ยน
  useEffect(() => {
    setPage(initialPage);
    setFilters({ query: "" });
  }, [resetKey, initialPage]);

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
    // ต้องการไลบรารีอย่าง SheetJS (xlsx) เพื่อ gen .xlsx จริง
    // ถ้าโปรเจกต์คุณมีแล้ว: import * as XLSX from "xlsx"; แล้วทำตามนี้:
    // const { headers, data } = buildFlatRows(dataset);
    // const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, "Data");
    // XLSX.writeFile(wb, `${filenameBase}.xlsx`);
    console.warn(
      "TODO: โปรดติดตั้งและเชื่อมต่อไลบรารี xlsx ก่อนใช้งาน export เป็น .xlsx"
    );
    // ชั่วคราว: export CSV แทน
    exportCSV(dataset, filenameBase);
  };

  const exportPDF = async (dataset: R[], filenameBase: string) => {
    // ต้องการไลบรารีอย่าง jsPDF/autoTable เพื่อ gen PDF ตาราง
    // ตัวอย่าง:
    // import jsPDF from "jspdf";
    // import autoTable from "jspdf-autotable";
    // const doc = new jsPDF();
    // const { headers, data } = buildFlatRows(dataset);
    // autoTable(doc, { head: [headers], body: data });
    // doc.save(`${filenameBase}.pdf`);
    console.warn(
      "TODO: โปรดเชื่อมต่อ jsPDF + autotable ก่อนใช้งาน export เป็น PDF"
    );
    // ชั่วคราว: export CSV แทน
    exportCSV(dataset, filenameBase);
  };

  const handleExport = async (format: ExportFormat) => {
    const base = exportFileBaseName;
    const dataset =
      exportScope === "page" ? pageRowsRef.current : filteredRef.current;

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

      <InstallationTable
        rows={rows}
        columns={columns}
        filters={filters}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onAfterFilter={({ filteredRows, pageRows, totalRows }) => {
          filteredRef.current = filteredRows;
          pageRowsRef.current = pageRows;
          totalRowsRef.current = totalRows;
        }}
      />
    </>
  );
}