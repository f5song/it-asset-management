"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DetailView } from "components/detail/DetailView";
import { InventoryActionToolbar } from "components/toolbar/InventoryActionToolbar";

import type { BreadcrumbItem, HistoryEvent } from "types";
import type { ExceptionItem } from "types/exception";

import { show } from "lib/show";

/* -------------------------------------------------------
 *  TYPES
 * ------------------------------------------------------- */
type ExceptionsDetailProps = {
  item: ExceptionItem;
  history?: HistoryEvent[];
  breadcrumbs?: BreadcrumbItem[];
};

/* -------------------------------------------------------
 *  HELPERS
 * ------------------------------------------------------- */
function formatDateSafe(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

/* -------------------------------------------------------
 *  COMPONENT
 * ------------------------------------------------------- */
export default function ExceptionsDetail({
  item,
  history,
  breadcrumbs,
}: ExceptionsDetailProps) {
  const router = useRouter();

  // History (ถ้าไม่มีส่งมา → เป็นอาเรย์ว่าง)
  const historyData = React.useMemo<HistoryEvent[]>(
    () => (Array.isArray(history) ? history : []),
    [history]
  );

  // Back/Delete handlers
  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = React.useCallback(() => {
    console.log("Delete exception:", item.id);
    // TODO: call delete service and navigate/show toast
  }, [item.id]);

  // Toolbar
  const toolbar = React.useMemo(
    () => (
      <InventoryActionToolbar
        entity="exceptions"
        selectedIds={[item.id]}
        basePath="/exceptions"
        enableDefaultMapping
        // ใส่เฉพาะ action ที่ต้องการให้แสดง เช่น delete/edit
        visibleActions={["delete"]} // ตัวอย่าง: แสดงปุ่มลบ
        singleSelectionOnly
        toOverride={{
          // ถ้ามีหน้า edit:
          edit: `/exceptions/${item.id}/edit`,
          delete: `/exceptions/${item.id}`,
        }}
        onAction={(act) => {
          if (act === "delete") handleDelete();
        }}
      />
    ),
    [item.id, handleDelete]
  );

  // Panels (ซ้าย/ขวา)
  const infoLeft = React.useMemo(
    () => [
      { label: "Exception ID", value: show(item.id) },
      { label: "Name", value: show(item.name) },
      { label: "Category", value: show(item.category) }, // AI | USBDrive | MessagingApp | ADPasswordPolicy
      { label: "Scope", value: show(item.scope) },       // User | Device | Group | Tenant
      { label: "Target", value: show(item.target) },     // username/device/group/Tenant
    ],
    [item.id, item.name, item.category, item.scope, item.target]
  );

  const infoRight = React.useMemo(
    () => [
      { label: "Status", value: show(item.group) },               // Approved | Pending | Expired | Revoked
      { label: "Owner", value: show(item.owner) },
      { label: "Created At", value: formatDateSafe(item.createdAt) },
      { label: "Expires At", value: formatDateSafe(item.expiresAt) },
    ],
    [item.group, item.owner, item.createdAt, item.expiresAt]
  );

  /**
   * REQUIRED: installationSection
   * - ถ้ายังไม่มีตาราง/ข้อมูลสัมพันธ์ของ Exception: ใส่ placeholder ReactNode ชั่วคราว
   * - ภายหลังคุณสามารถเปลี่ยนเป็น <InstallationSection rows={...} columns={...} ... />
   */
  const installationSection = React.useMemo(
    () => (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground mb-1">Related Items</div>
        <p>No related items for this exception.</p>
        {/* TODO: แทนที่ด้วยตารางจริง เช่น Exception-related targets/approvals */}
      </div>
    ),
    []
  );

  return (
    <DetailView
      title={show(item.name)}
      compliance={undefined}
      // คุณจะเปลี่ยน label นี้ให้เข้ากับคอนเทนต์จริงได้ เช่น "Related"
      installationTabLabel="Related"
      info={{ left: infoLeft, right: infoRight }}
      installationSection={installationSection}
      history={historyData}
      onBack={handleBack}
      onDelete={handleDelete}
      // ถ้ามีฟอร์มแก้ไขค่อยเพิ่ม editConfig ที่นี่
      // editConfig={...}
      breadcrumbs={breadcrumbs}
      headerRightExtra={toolbar}
    />
  );
}
