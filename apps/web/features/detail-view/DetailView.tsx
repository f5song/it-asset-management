"use client";
import { Compliance, HistoryEvent } from "../../types";
import { DetailHeader } from "../../components/detail/DetailHeader";
import { TabList, TabPanel, TabTrigger } from "../../components/ui/Tabs";
import { HistoryList } from "../../components/detail/HistoryList";
import { DetailInfoGrid } from "../../components/detail/DetailInfo";
import { ConfirmModal } from "../../components/modals/ConfirmModal";
import React, { ReactNode, useState } from "react";
import { EditModal } from "../../components/modals/EditModal";
import { EditField } from "../../types/modal";

const fields: EditField[] = [
  {
    name: "name",
    label: "Software Name",
    required: true,
    placeholder: "e.g. Acme Tool",
  },
  {
    name: "version",
    label: "Version",
    required: true,
    placeholder: "e.g. 2.3.1",
  },
  { name: "vendor", label: "Vendor", placeholder: "e.g. Acme Inc." },
  {
    name: " License Model",
    label: " License Model",
    type: "select",
    required: true,
    options: [
      { label: "Free", value: "free" },
      { label: "Perpetual", value: "perpetual" },
      { label: "Subscription", value: "subscription" },
    ],
    placeholder: "Select license…",
  },
  {
    name: "Category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { label: "Design", value: "commercial" },
      { label: "Utility", value: "oss" },
      { label: "Internal", value: "Internal" },
    ],
    placeholder: "Select license…",
  },
  {
    name: "Software Type",
    label: "Software Type",
    type: "select",
    required: true,
    options: [
      { label: "Standrad", value: "Standrad" },
      { label: "Special", value: "Special" },
    ],
    placeholder: "Select license…",
  },
  {
    name: "Policy Compliance",
    label: "Policy Compliance",
    type: "select",
    required: true,
    options: [
      { label: "Allowed", value: "Allowed" },
      { label: "Restricted", value: "Restricted" },
      { label: "Prohibited", value: "Prohibited" },
    ],
    placeholder: "Select license…",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    name: "client/server",
    label: "Client/Server",
    type: "select",
    options: [
      { label: "Client", value: "client" },
      { label: "Server", value: "server" },
    ],
  },
];

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
  installationSection: ReactNode;
  history: HistoryEvent[];
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [tab, setTab] = useState<"detail" | "installation" | "history">(
    "detail"
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <main>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <DetailHeader
          title={title}
          compliance={compliance}
          onBack={onBack}
          onEdit={() => {
            setOpen(true); // ✅ กด Edit → เปิดโมดอล
          }}
          onDeleteClick={onDelete ? () => setConfirmOpen(true) : undefined}
        />

        <TabList>
          <TabTrigger
            active={tab === "detail"}
            onClick={() => setTab("detail")}
          >
            Software Detail
          </TabTrigger>
          <TabTrigger
            active={tab === "installation"}
            onClick={() => setTab("installation")}
          >
            Installation
          </TabTrigger>
          <TabTrigger
            active={tab === "history"}
            onClick={() => setTab("history")}
          >
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

      <EditModal
        title="Edit Software"
        open={open}
        fields={fields}
        initialValues={{
          name: "Acme Tool",
          version: "1.0",
          vendor: "Acme Inc.",
        }}
        onSubmit={(values) => {
          // TODO: call API / update state ตามที่ต้องการ
          console.log(values.name);
          setOpen(false); // ✅ ปิดหลังบันทึก
        }}
        onClose={() => setOpen(false)} // ✅ ปิดเมื่อกด Cancel/Backdrop
      />
    </main>
  );
}
