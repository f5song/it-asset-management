'use client'
import React from "react";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { TabList, TabTrigger, TabPanel } from "@/components/ui/Tabs";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DetailInfoGrid } from "@/components/detail/DetailInfo";
import { HistoryList } from "@/components/detail/HistoryList";
import type { Compliance, HistoryEvent } from "@/types";

export type DetailInfoProps = {
  left: Array<{ label: string; value?: React.ReactNode }>;
  right: Array<{ label: string; value?: React.ReactNode }>;
};

export function DetailView({
  title,
  compliance,
  info,
  installationSection, // React node รวม Toolbar+Table
  history,
  onBack,
  onEdit,
  onDelete,
}: {
  title: string;
  compliance?: Compliance;
  info: DetailInfoProps;
  installationSection: React.ReactNode;
  history: HistoryEvent[];
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [tab, setTab] = React.useState<"detail" | "installation" | "history">("detail");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <main className="p-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <DetailHeader
          title={title}
          compliance={compliance}
          onBack={onBack}
          onEdit={onEdit}
          onDeleteClick={onDelete ? () => setConfirmOpen(true) : undefined}
        />

        <TabList>
          <TabTrigger active={tab === "detail"} onClick={() => setTab("detail")}>
            Software Detail
          </TabTrigger>
          <TabTrigger active={tab === "installation"} onClick={() => setTab("installation")}>
            Installation
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
    </main>
  );
}
