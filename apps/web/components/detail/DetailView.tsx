// components/detail/DetailView.tsx
"use client";

import { BreadcrumbItem, Compliance, HistoryEvent } from "@/types";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

// ✅ ใช้ imports เดิมทั้งหมด
import type { FormField } from "types/forms";
import { DetailHeader } from "./DetailHeader";
import { TabList, TabPanel, TabTrigger } from "../ui/Tabs";
import { DetailInfoGrid } from "./DetailInfo";
import { HistoryList } from "./HistoryList";
import { ConfirmModal } from "../modals/ConfirmModal";
import { EditModal } from "../modals/EditModal";

/* ---------------- Types เดิม ---------------- */

export type DetailInfoProps = {
  left: Array<{ label: string; value?: React.ReactNode }>;
  right: Array<{ label: string; value?: React.ReactNode }>;
};

/** ฟอร์มแก้ไขแบบ config ได้ (ใช้กับ License/Software/Device ได้หมด) */
export type EditConfig<TValues extends Record<string, any>> = {
  title: string;
  fields: ReadonlyArray<FormField<keyof TValues & string>>;
  initialValues: TValues;
  onSubmit: (values: TValues) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
};

/** ควบคุม layout/overlay ของ EditModal จากภายนอก (ออปชัน) */
export type EditModalForwardProps = {
  /** 'adaptive' | 'scroll' | 'fit' ; default = 'adaptive' */
  heightMode?: "adaptive" | "scroll" | "fit";
  /** ตัวเลข px หรือ string '90vh' | 'calc(...)' ; default = '90vh' */
  maxHeight?: number | string;
  /** โปร่งแสงของ overlay 10/20/30/40/50/60 ; default = 20 */
  overlayOpacity?: 10 | 20 | 30 | 40 | 50 | 60;
};

/**
 * DetailView แบบยืดหยุ่น:
 * - ถ้ามี props.tabs ⇒ ใช้แท็บตามที่ส่งมา
 * - ถ้าไม่มี props.tabs ⇒ ใช้รูปแบบเดิม (Detail | Installations | History)
 * - สไตล์ทั้งหมดยังอิงคอมโพเนนต์เดิม (TabList/TabTrigger/TabPanel/DetailHeader)
 */
export function DetailView<TValues extends Record<string, any>>({
  // Header
  title,
  compliance,
  breadcrumbs,
  headerRightExtra,

  // ⭐️ Tabs (ใหม่)
  tabs,
  defaultTabKey,

  // Legacy (ยังรองรับเพื่อความเข้ากันได้กับหน้าเดิม)
  info,
  installationSection,
  history,

  // Actions / Modals
  onBack,
  onEdit,
  onDelete,
  editConfig,
  modalProps,
}: {
  /** Header */
  title: string;
  compliance?: Compliance;
  breadcrumbs?: BreadcrumbItem[];
  headerRightExtra?: React.ReactNode;

  /** ⭐️ ส่งแท็บมาเองแบบยืดหยุ่น */
  tabs?: Array<{
    key: string;
    label: React.ReactNode;
    content: React.ReactNode | (() => React.ReactNode);
    disabled?: boolean;
    hidden?: boolean;
    badge?: React.ReactNode;
  }>;
  defaultTabKey?: string;

  /** Legacy props (ไม่ต้องใช้ถ้าส่ง tabs แล้ว) */
  info?: DetailInfoProps;
  installationSection?: ReactNode;
  history?: HistoryEvent[];

  /** Common actions / modals */
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editConfig?: EditConfig<TValues>;
  modalProps?: EditModalForwardProps;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenEdit = () => {
    onEdit?.();
    setOpen(true);
  };

  // ---- สร้างรายการแท็บที่จะใช้จริง (ถ้ามี tabs ให้ใช้ตามนั้น, ถ้าไม่มีก็ประกอบจาก props เดิม) ----
  const computedTabs = useMemo(() => {
    if (tabs && tabs.length > 0) {
      return tabs.filter((t) => !t.hidden);
    }

    // ถ้าไม่ส่ง tabs มา: ประกอบรูปแบบเดิมให้ (Detail | Installations | History)
    const base: Array<{
      key: string;
      label: React.ReactNode;
      content: React.ReactNode;
      disabled?: boolean;
      badge?: React.ReactNode;
    }> = [];

    if (info) {
      base.push({
        key: "detail",
        label: "Detail",
        content: <DetailInfoGrid left={info.left} right={info.right} />,
      });
    }

    if (installationSection) {
      base.push({
        key: "installation",
        label: "Installations",
        content: installationSection,
      });
    }

    if (history) {
      base.push({
        key: "history",
        label: "History",
        content: <HistoryList history={history} />,
      });
    }

    // ป้องกันเคสไม่มีอะไรเลย
    return base.length > 0
      ? base
      : [
          {
            key: "detail",
            label: "Detail",
            content: info ? (
              <DetailInfoGrid left={info.left} right={info.right} />
            ) : (
              <div className="text-sm text-slate-500">No content</div>
            ),
          },
        ];
  }, [tabs, info, installationSection, history]);

  // ---- จัดการ active tab (คง behavior เดิม: local state) ----
  const keys = computedTabs.map((t) => t.key);
  const firstKey = keys[0];
  const initialKey =
    defaultTabKey && keys.includes(defaultTabKey) ? defaultTabKey : firstKey;

  const [activeKey, setActiveKey] = useState<string>(initialKey);

  // ถ้าโครงแท็บเปลี่ยน และ key ปัจจุบันไม่อยู่แล้ว ให้สลับไปแท็บแรก
  useEffect(() => {
    if (!keys.includes(activeKey)) {
      setActiveKey(keys[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join("|")]);

  // (ออปชัน) ถ้าอยากให้ defaultTabKey ที่เปลี่ยนภายหลังมีผล ให้เปิด block นี้
  // useEffect(() => {
  //   if (defaultTabKey && keys.includes(defaultTabKey)) {
  //     setActiveKey(defaultTabKey);
  //   }
  // }, [defaultTabKey, keys.join("|")]);

  return (
    <main aria-labelledby="detail-view-title">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <DetailHeader
          title={title}
          compliance={compliance}
          onBack={onBack}
          onEdit={handleOpenEdit}
          onDeleteClick={onDelete ? () => setConfirmOpen(true) : undefined}
          breadcrumbs={breadcrumbs}
          rightExtra={headerRightExtra}
        />

        {/* ---- Tab headers (สไตล์เดิม) ---- */}
        <TabList>
          {computedTabs.map((t) => (
            <TabTrigger
              key={t.key}
              active={activeKey === t.key}
              onClick={() =>
                // ✅ type guard ป้องกัน union ที่บางสมาชิกอาจไม่มี disabled
                !("disabled" in t && t.disabled) && setActiveKey(t.key)
              }
              aria-disabled={"disabled" in t ? t.disabled : undefined}
            >
              <span className={"disabled" in t && t.disabled ? "opacity-50" : ""}>
                {t.label}
              </span>
              {/* ✅ guard badge เช่นกัน */}
              {"badge" in t && t.badge ? (
                <span className="ml-2">{t.badge}</span>
              ) : null}
            </TabTrigger>
          ))}
        </TabList>

        {/* ---- Tab content (lazy render แบบเดิม: render เฉพาะแท็บที่เลือก) ---- */}
        {computedTabs.map((t) =>
          activeKey === t.key ? (
            <TabPanel key={t.key}>
              {typeof t.content === "function"
                ? (t.content as () => React.ReactNode)()
                : t.content}
            </TabPanel>
          ) : null
        )}
      </section>

      {/* Confirm delete (สไตล์/พฤติกรรมเดิม) */}
      <ConfirmModal
        open={confirmOpen}
        title={`Delete “${title}”?`}
        description="This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete?.();
        }}
      />

      {/* EditModal (สไตล์/พฤติกรรมเดิม) */}
      {editConfig && (
        <EditModal
          title={editConfig.title}
          open={open}
          fields={editConfig.fields}
          initialValues={editConfig.initialValues}
          submitting={editConfig.submitting}
          submitLabel={editConfig.submitLabel ?? "Save"}
          cancelLabel={editConfig.cancelLabel ?? "Cancel"}
          onSubmit={async (formValues) => {
            await editConfig.onSubmit(formValues);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          {...modalProps}
        />
      )}
    </main>
  );
}