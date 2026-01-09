
// src/features/detail-view/InstallationSection.tsx
"use client";

import React from "react";
import { InstallationRow } from "../../types";
import { InstallationDisplayRow, InstallationFilters, InstallationTable } from "../../components/installation/InstallationTable";
import { InstallationToolbar } from "../../components/installation/InstallationToolbar";

/**
 * แปลงจากชนิดดั้งเดิม (InstallationRow) -> ชนิดสำหรับแสดงผลในตาราง (InstallationDisplayRow)
 * ปรับ mapping ให้ตรงกับฟิลด์จริงในโปรเจกต์ของคุณได้เลย
 */
function mapToDisplayRow(r: InstallationRow): InstallationDisplayRow {
  return {
    id: r.id,
    deviceName: (r as any).deviceName ?? r.device ?? "—",
    workStation: (r as any).workStation ?? (r as any).workstation ?? "—",
    user: r.user ?? "—",
    licenseKey: (r as any).licenseKey ?? "—",
    licenseStatus: ((r as any).licenseStatus ?? "Active") as InstallationDisplayRow["licenseStatus"],
    scannedLicenseKey: (r as any).scannedLicenseKey ?? "—",
  };
}

export function InstallationSection({
  rows,
  users,
  devices,
  total,
}: {
  rows: InstallationRow[];
  users: string[];
  devices: string[];
  total: number; // ถ้าอยากให้ตรงภาพ (เช่น 1250) ส่งค่าคงที่เข้ามา; หรือใช้ rows.length ก็ได้
}) {
  const [filters, setFilters] = React.useState<InstallationFilters>({
    user: "ALL",
    device: "ALL",
    status: "ALL",
    query: "",
  });

  // ตั้งหน้าเริ่มต้นตามภาพ (เช่น 101); ปรับตามจริงได้
  const [page, setPage] = React.useState<number>(101);
  const pageSize = 10;

  // ✅ แปลงชนิดที่นี่ให้ตรงกับตาราง
  const displayRows: InstallationDisplayRow[] = React.useMemo(
    () => rows.map(mapToDisplayRow),
    [rows]
  );

  /**
   * จำนวนรวมที่แสดงบนกล่อง "Installation(s): XXXX Total"
   * - ถ้าต้องการให้ "เหมือนภาพ" (เช่น 1250) ให้ใช้ค่า total ที่ส่งเข้ามา
   * - ถ้าต้องการให้แสดงจำนวนตามผลกรองจริง ให้เปลี่ยนเป็น displayRows.length
   */
  const effectiveTotal = React.useMemo(() => {
    // ใช้คงที่ตามภาพ
    return total;

    // หรือถ้าต้องการตามผลกรองจริง:
    // return displayRows.length;
  }, [total /*, displayRows.length */]);

  return (
    <>
      <InstallationToolbar
        total={effectiveTotal}
        filters={filters}
        users={users}
        devices={devices}
        onFiltersChange={setFilters}
        onExport={(fmt) => {
          // TODO: ใส่ logic export (CSV/XLSX/PDF)
          console.log("Export:", fmt);
        }}
        onAction={(act) => {
          // TODO: ใส่ logic action (delete/reassign/scan)
          console.log("Action:", act);
        }}
      />

      <InstallationTable
        rows={displayRows}      // ✅ ส่งเป็น Display rows เพื่อให้ชนิดตรง
        filters={filters}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </>
  );
}
