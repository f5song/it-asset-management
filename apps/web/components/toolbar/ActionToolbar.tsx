
// components/installation/ActionToolbar.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ActionSelect } from "components/ui/ActionSelect";
import type { ToolbarAction } from "types/tab";

/** ฟังก์ชันคำนวณ path จาก action + selectedIds */
export type ActionPathBuilder = (args: {
  action: ToolbarAction;
  selectedIds: string[];
}) => string | undefined;

/** กำหนดได้ทั้ง string ตายตัว หรือฟังก์ชันคำนวณ path */
export type ActionPathConfig = string | ActionPathBuilder;

export type ActionToolbarProps = {
  selectedIds: string[];
  to?: Partial<Record<ToolbarAction, ActionPathConfig>>;
  onAction?: (action: ToolbarAction) => void;
  openInNewTab?: boolean;
  /** ถ้าอยากให้มี fallback ค่อยตั้งค่าเป็น true ตอนใช้งาน */
  enableDefaultMapping?: boolean;
};

export function ActionToolbar({
  selectedIds,
  to,
  onAction,
  openInNewTab = false,
  enableDefaultMapping = false, // ✅ เปลี่ยนค่าเริ่มต้นเป็น false
}: ActionToolbarProps) {
  const router = useRouter();

  const buildHref = React.useCallback(
    (action: ToolbarAction): string | undefined => {
      // 1) ใช้ config ที่ส่งมาจากหน้าปัจจุบันก่อน
      const conf = to?.[action];
      if (conf) {
        if (typeof conf === "string") return conf;
        if (typeof conf === "function") return conf({ action, selectedIds });
      }

      // 2) (ออปชัน) fallback — ปิดไว้เป็นค่าเริ่มต้น (ไม่มี /installations/)
      if (enableDefaultMapping) {
        const ids = encodeURIComponent(selectedIds.join(","));
        // 👉 ถ้าจำเป็นจริง ๆ ค่อยเติม mapping ชั่วคราวของหน้าปัจจุบันเอง
        // return `/your-default/reassign?ids=${ids}`;
        return undefined;
      }

      // 3) ไม่กำหนด path
      return undefined;
    },
    [to, selectedIds, enableDefaultMapping]
  );

  const handleAction = React.useCallback(
    (act: ToolbarAction) => {
      onAction?.(act);

      const href = buildHref(act);
      if (!href) return;

      if (openInNewTab) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        router.push(href);
      }
    },
    [buildHref, onAction, openInNewTab, router]
  );

  return <ActionSelect onAction={handleAction} />;
}
