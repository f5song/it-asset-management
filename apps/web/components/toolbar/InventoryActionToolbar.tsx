
// src/components/toolbar/InventoryActionToolbar.tsx
"use client";

import * as React from "react";
import { ActionToolbar } from "./ActionToolbar";
import type { ToolbarAction } from "types";
import type { ActionPathBuilder } from "types/actions";

type Entity = "employees" | "licenses" | "devices" | "software" | "devices" | "software";

export type InventoryActionToolbarProps = {
  entity: Entity;
  /** id ที่เลือกจาก DataTable */
  selectedIds: string[];
  /** base path ของโดเมนนี้ เช่น "/employees" หรือ "/software/license-management" */
  basePath: string;
  /** เปิด/ปิด mapping กลาง (ถ้าอยาก override ทีหลังค่อยส่ง to เพิ่มเติม) */
  enableDefaultMapping?: boolean;
  /** mapping เพิ่มเติม/ทับค่าเดิม */
  toOverride?: Partial<Record<ToolbarAction, string | ActionPathBuilder>>;
  /** callback action */
  onAction?: (act: ToolbarAction) => void;
};

export function InventoryActionToolbar({
  entity,
  selectedIds,
  basePath,
  enableDefaultMapping = false,
  toOverride,
  onAction,
}: InventoryActionToolbarProps) {
  // mapping กลางตาม entity
  const defaultTo: Partial<Record<ToolbarAction, string | ActionPathBuilder>> =
    entity === "employees"
      ? {
          add: `${basePath}/add`,
          reassign: ({ selectedIds }) =>
            `${basePath}/reassign?ids=${encodeURIComponent(selectedIds.join(","))}`,
          delete: ({ selectedIds }) =>
            `${basePath}/delete?ids=${encodeURIComponent(selectedIds.join(","))}`,
        }
      : {
          // licenses
          add: `${basePath}/add`,
          reassign: ({ selectedIds }) =>
            `${basePath}/reassign?ids=${encodeURIComponent(selectedIds.join(","))}`,
          delete: ({ selectedIds }) =>
            `${basePath}/delete?ids=${encodeURIComponent(selectedIds.join(","))}`,
        };

  const to = React.useMemo(
    () => ({ ...(enableDefaultMapping ? defaultTo : {}), ...(toOverride ?? {}) }),
    [enableDefaultMapping, defaultTo, toOverride],
  );

  return (
    <ActionToolbar
      selectedIds={selectedIds}
      enableDefaultMapping={false}  // เราคุม mapping เอง
      to={to}
      onAction={onAction}
    />
  );
}
