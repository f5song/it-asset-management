
"use client";

import * as React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { useDeviceInventory } from "../../hooks/useDeviceInventory";


import { DeviceTable } from "../../features/devices/DeviceTable";
import type { ExportFormat, ToolbarAction } from "../../types/tab";
import { useDeviceTableController } from "../../hooks/useDeviceTableController";
import { DeviceFilters } from "../../features/devices/DeviceFilters";
import { deviceColumns } from "../../features/devices/columns";

export default function DevicesPage() {
  // 1) ดึงข้อมูล/ฟิลเตอร์จากโดเมน
  const {
    filters,
    setFilter,
    rows,
    pageSize,
    deviceGroupOptions,
    deviceTypeOptions,
    osOptions,
    total,
  } = useDeviceInventory(8);

  // 2) คุม state ตาราง (sorting/pagination + slice)
  const {
    pageRows,
    pagination, setPagination,
    sorting,    setSorting,
    resetPageIndex,
  } = useDeviceTableController(rows, pageSize);

  // รีเซ็ตหน้าเมื่อฟิลเตอร์/ชุดข้อมูลเปลี่ยน
  React.useEffect(() => { resetPageIndex(); }, [filters, rows.length, resetPageIndex]);

  // 3) actions ของ toolbar
  const handleExport = (fmt: ExportFormat) => {
    console.log("Export as:", fmt.toUpperCase());
  };
  const handleAction = (act: ToolbarAction) => {
    console.log("Action:", act);
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader title="Devices" breadcrumbs={[{ label: "Devices", href: "/devices" }]} />

      <DeviceFilters
        filters={filters}
        setFilter={setFilter}
        deviceGroupOptions={deviceGroupOptions}
        deviceTypeOptions={deviceTypeOptions}
        osOptions={osOptions}
        onExport={handleExport}
        onAction={handleAction}
      />

      <DeviceTable
        columns={deviceColumns}
        rows={pageRows}
        totalRows={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
}
