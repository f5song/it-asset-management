// src/components/toolbar/InventoryActionToolbar.tsx
"use client";

import * as React from "react";
import { ActionToolbar } from "./ActionToolbar";
import type { ToolbarAction, ActionPathConfig } from "types";

type Entity = "employees" | "licenses" | "devices" | "software" | "exceptions";

export type InventoryActionToolbarProps = {
  entity: Entity;
  selectedIds: string[];
  basePath: string;
  visibleActions?: ToolbarAction[];
  requireSelection?: boolean;
  singleSelectionOnly?: boolean;
  enableDefaultMapping?: boolean;
  toOverride?: Partial<Record<ToolbarAction, ActionPathConfig>>;
  onAction?: (act: ToolbarAction) => void;
};

export function InventoryActionToolbar({
  entity,
  selectedIds,
  basePath,
  visibleActions,
  enableDefaultMapping = false,
  toOverride,
  onAction,
}: InventoryActionToolbarProps) {
  const defaultTo: Partial<Record<ToolbarAction, ActionPathConfig>> =
    entity === "employees"
      ? {
          add: `${basePath}/add`,
          edit: ({
            selectedIds,
          }: {
            action: ToolbarAction;
            selectedIds: string[];
          }) =>
            selectedIds.length === 1
              ? `${basePath}/${selectedIds[0]}/edit`
              : undefined,
          delete: ({
            selectedIds,
          }: {
            action: ToolbarAction;
            selectedIds: string[];
          }) =>
            selectedIds.length > 0
              ? `${basePath}/delete?ids=${encodeURIComponent(selectedIds.join(","))}`
              : undefined,
          assignExceptions: ({
            selectedIds,
          }: {
            action: ToolbarAction;
            selectedIds: string[];
          }) =>
            selectedIds.length === 1
              ? `${basePath}/${selectedIds[0]}/assign`
              : undefined,
        }
      : entity === "licenses"
        ? {
            // ✅ licenses: มี assign ได้เช่นกัน
            add: `${basePath}/add`,
            edit: ({
              selectedIds,
            }: {
              action: ToolbarAction;
              selectedIds: string[];
            }) =>
              selectedIds.length === 1
                ? `${basePath}/${selectedIds[0]}/edit`
                : undefined,
            delete: ({
              selectedIds,
            }: {
              action: ToolbarAction;
              selectedIds: string[];
            }) =>
              selectedIds.length > 0
                ? `${basePath}/delete?ids=${encodeURIComponent(selectedIds.join(","))}`
                : undefined,
            assignLicense: ({
              selectedIds,
            }: {
              action: ToolbarAction;
              selectedIds: string[];
            }) =>
              selectedIds.length === 1
                ? `${basePath}/${selectedIds[0]}/assign`
                : undefined,
          }
        : {
            add: `${basePath}/add`,
            edit: ({
              selectedIds,
            }: {
              action: ToolbarAction;
              selectedIds: string[];
            }) =>
              selectedIds.length === 1
                ? `${basePath}/${selectedIds[0]}/edit`
                : undefined,
            delete: ({
              selectedIds,
            }: {
              action: ToolbarAction;
              selectedIds: string[];
            }) =>
              selectedIds.length > 0
                ? `${basePath}/delete?ids=${encodeURIComponent(selectedIds.join(","))}`
                : undefined,
          };

  const merged = React.useMemo(
    () => ({
      ...(enableDefaultMapping ? defaultTo : {}),
      ...(toOverride ?? {}),
    }),
    [enableDefaultMapping, defaultTo, toOverride],
  );

  const to = React.useMemo(() => {
    if (!visibleActions?.length) return merged;
    const out: Partial<Record<ToolbarAction, ActionPathConfig>> = {};
    visibleActions.forEach((a) => {
      if (merged[a]) out[a] = merged[a]!;
    });
    return out;
  }, [merged, visibleActions]);

  return (
    <ActionToolbar
      selectedIds={selectedIds}
      to={to}
      onAction={onAction}
      enableDefaultMapping={false}
      requireSelection={false}
      singleSelectionOnly={true}
      visibleActions={visibleActions} // ✅ ส่งต่อเพื่อไม่ fallback เป็น ["delete","add"]
    />
  );
}
