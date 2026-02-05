
// components/detail/DetailView.tsx
"use client";

import { BreadcrumbItem, Compliance, HistoryEvent } from "@/types";
import React, { ReactNode, useState } from "react";


// ✅ นำเข้า FormField แทน EditField
import type { FormField } from "types/forms";
import { DetailHeader } from "./DetailHeader";
import { TabList, TabPanel, TabTrigger } from "../ui/Tabs";
import { DetailInfoGrid } from "./DetailInfo";
import { HistoryList } from "./HistoryList";
import { ConfirmModal } from "../modals/ConfirmModal";
import { EditModal } from "../modals/EditModal";

/* ---------------- Types ---------------- */

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

export function DetailView<TValues extends Record<string, any>>({
  title,
  compliance,
  info,
  installationSection,
  history,
  onBack,
  onEdit,
  onDelete,
  editConfig,
  modalProps,
  installationTabLabel = "Installations",
  breadcrumbs,
  headerRightExtra,
}: {
  title: string;
  compliance?: Compliance;
  info: DetailInfoProps;
  installationSection: ReactNode;
  history: HistoryEvent[];
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editConfig?: EditConfig<TValues>;
  modalProps?: EditModalForwardProps;
  installationTabLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerRightExtra?: React.ReactNode;
}) {
  const [tab, setTab] = useState<"detail" | "installation" | "history">("detail");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenEdit = () => {
    onEdit?.();
    setOpen(true);
  };

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

        <TabList>
          <TabTrigger active={tab === "detail"} onClick={() => setTab("detail")}>
            Detail
          </TabTrigger>
          <TabTrigger active={tab === "installation"} onClick={() => setTab("installation")}>
            {installationTabLabel}
          </TabTrigger>
          <TabTrigger active={tab === "history"} onClick={() => setTab("history")}>
            History
          </TabTrigger>
        </TabList>

        {tab === "detail" && (
          <TabPanel>
            <DetailInfoGrid left={info.left} right={info.right} />
          </TabPanel>
        )}

        {tab === "installation" && <TabPanel>{installationSection}</TabPanel>}

        {tab === "history" && (
          <TabPanel>
            <HistoryList history={history} />
          </TabPanel>
        )}
      </section>

      {/* Confirm delete */}
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

      {/* EditModal */}
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
