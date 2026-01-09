
import { SoftwareStatus, SoftwareType } from "@/types";
import React, { useState } from "react";


export type FilterBarProps = {
  // Filters
  statusFilter?: SoftwareStatus;
  setStatusFilter: (s?: SoftwareStatus) => void;

  typeFilter?: SoftwareType;
  setTypeFilter: (t?: SoftwareType) => void;

  manufacturerFilter?: string;
  setManufacturerFilter: (m?: string) => void;

  searchText: string;
  setSearchText: (t: string) => void;

  // Actions
  onExport: (fmt: "CSV" | "XLSX" | "PDF") => void;
  onAddSoftware: () => void;

  // Options (optional; ถ้าไม่ส่งมาจะใช้ค่า default ด้านล่าง)
  statusOptions?: readonly SoftwareStatus[];
  typeOptions?: readonly SoftwareType[];
  manufacturerOptions?: readonly string[];
};

export function FilterBar({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  manufacturerFilter,
  setManufacturerFilter,
  searchText,
  setSearchText,
  onExport,
  onAddSoftware,
  statusOptions = ["Active", "Expired", "Expiring"] as const,
  typeOptions = ["Standard", "Special", "Exception"] as const,
  manufacturerOptions = ["Adobe", "Autodesk", "Microsoft"] as const,
}: FilterBarProps) {
  const [exportOpen, setExportOpen] = useState(false);

  // ----- styles ตามที่คุณให้ + เติมส่วนที่จำเป็น -----
  const styles = {
    barTop: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginBottom: 12,
    },
    select: {
      padding: "8px 10px",
      borderRadius: 6,
      border: "1px solid #D0D5DD",
      background: "#FFFFFF",
      fontSize: 14,
      minWidth: 160,
    },
    btnPrimary: {
      padding: "8px 12px",
      borderRadius: 6,
      background: "#3B82F6",
      color: "#FFFFFF",
      border: "none",
      fontWeight: 600,
      cursor: "pointer",
    },
    btnSecondary: {
      padding: "8px 12px",
      borderRadius: 6,
      background: "#F3F4F6",
      color: "#111827",
      border: "1px solid #D1D5DB",
      fontWeight: 600,
      cursor: "pointer",
    },
    exportWrapper: {
      position: "relative" as const,
      display: "inline-block",
    },
    exportMenu: {
      position: "absolute" as const,
      right: 0,
      marginTop: 6,
      width: 160,
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 8,
      boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
      zIndex: 10,
    },
    exportItem: {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #E5E7EB",
      fontSize: 14,
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      border: "1px solid #D0D5DD",
      borderRadius: 8,
      padding: "8px 10px",
      background: "#FFFFFF",
    },
    searchInput: {
      border: "none",
      outline: "none",
      fontSize: 14,
      width: 240,
    },
  };

  return (
    <div>
      {/* แถวบน: Filters + Export + Add */}
      <div style={styles.barTop}>
        {/* Status */}
        <select
          style={styles.select}
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter(e.target.value ? (e.target.value as SoftwareStatus) : undefined)
          }
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Type (SoftwareType) */}
        <select
          style={styles.select}
          value={typeFilter ?? ""}
          onChange={(e) =>
            setTypeFilter(e.target.value ? (e.target.value as SoftwareType) : undefined)
          }
        >
          <option value="">All Types</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Manufacturer */}
        <select
          style={styles.select}
          value={manufacturerFilter ?? ""}
          onChange={(e) => setManufacturerFilter(e.target.value || undefined)}
        >
          <option value="">All Manufacturers</option>
          {manufacturerOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Export dropdown */}
        <div style={{ ...styles.exportWrapper, marginLeft: "auto" }}>
          <button
            style={styles.btnSecondary}
            onClick={() => setExportOpen((v) => !v)}
            aria-expanded={exportOpen}
          >
            Export As ▾
          </button>
          {exportOpen && (
            <div style={styles.exportMenu} role="menu">
              {(["CSV", "XLSX", "PDF"] as const).map((fmt, idx) => (
                <div
                  key={fmt}
                  style={{
                    ...styles.exportItem,
                    borderBottom:
                      idx === 2 ? "none" : (styles.exportItem as any).borderBottom,
                  }}
                  onClick={() => {
                    onExport(fmt);
                    setExportOpen(false);
                  }}
                >
                  {fmt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Software button */}
        <button style={styles.btnPrimary} onClick={onAddSoftware}>
          Add Software
        </button>
      </div>

      {/* แถวล่าง: Search */}
      <div style={styles.searchBox}>
        {/* ไอคอนค้นหาแบบง่าย ๆ ด้วย emoji */}
        <span role="img" aria-label="search">
          🔎
        </span>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
    </div>
  );
}
