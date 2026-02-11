// components/installation/ActionToolbar.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ActionPathConfig, ToolbarAction } from "types";
import { ActionOption, ActionSelect } from "components/ui/ActionSelect";

export type ActionToolbarProps = {
  selectedIds: string[];
  to?: Partial<Record<ToolbarAction, ActionPathConfig>>;
  onAction?: (action: ToolbarAction) => void;
  openInNewTab?: boolean;
  enableDefaultMapping?: boolean;

  /** ต้องเลือก ≥1 ไหม */
  requireSelection?: boolean;
  /** ต้องเลือก =1 ไหม (เช่น edit) */
  singleSelectionOnly?: boolean;

  /** จำกัดปุ่มที่แสดง (เช่น ["assign","edit","delete"]) */
  visibleActions?: ToolbarAction[];

  /** ปิดทั้งตัวเลือก (เช่น กำลังโหลด) */
  disabled?: boolean;
};

export function ActionToolbar({
  selectedIds,
  to,
  onAction,
  openInNewTab = false,
  enableDefaultMapping = false,

  requireSelection = false,
  singleSelectionOnly = false,
  visibleActions,

  disabled = false,
}: ActionToolbarProps) {
  const router = useRouter();

  const buildHref = React.useCallback(
    (action: ToolbarAction): string | undefined => {
      const conf = to?.[action];
      if (conf) {
        if (typeof conf === "string") return conf;
        if (typeof conf === "function") return conf({ action, selectedIds });
      }
      if (enableDefaultMapping) {
        const ids = encodeURIComponent(selectedIds.join(","));
        return undefined;
      }
      return undefined;
    },
    [to, selectedIds, enableDefaultMapping],
  );

  const selectionInvalidFor = React.useCallback(
    (action: ToolbarAction) => {
      // กติกาเบื้องต้น (ปรับได้): edit => single-only, delete/reassign => require selection
      if (singleSelectionOnly && action === "Edit") {
        return selectedIds.length !== 1;
      }
      if (requireSelection && (action === "Delete" || action === "Reassign")) {
        return selectedIds.length < 1;
      }
      return false;
    },
    [requireSelection, singleSelectionOnly, selectedIds.length],
  );

  const options = React.useMemo<ActionOption[]>(() => {
    const acts = visibleActions?.length
      ? visibleActions
      : (["Add"] as ToolbarAction[]); // default set (ถ้าหน้าไม่ระบุ)

    return acts.map((a) => ({
      value: a,
      label:
        a === "Reassign"
          ? "Reassign"
          : a === "Edit"
            ? "Edit"
            : a === "Delete"
              ? "Delete"
              : a === "Add"
                ? "Add"
                : a,
      disabled: selectionInvalidFor(a) || !buildHref(a), // disable ถ้าไม่ผ่านกติกา หรือไม่มี path
    }));
  }, [visibleActions, selectionInvalidFor, buildHref]);

  const handleAction = React.useCallback(
    (act: ToolbarAction) => {
      // guard อีกครั้ง
      if (options.find((o) => o.value === act)?.disabled) return;

      onAction?.(act);

      const href = buildHref(act);
      if (!href) return;

      if (openInNewTab) window.open(href, "_blank", "noopener,noreferrer");
      else router.push(href);
    },
    [buildHref, onAction, openInNewTab, router, options],
  );

  return (
    <ActionSelect
      onAction={handleAction}
      options={options}
      placeholder="Action"
      disabled={disabled}
      resetAfterSelect={true} // หรือ false ถ้าอยากโชว์รายการที่เลือกค้างไว้
    />
  );
}
