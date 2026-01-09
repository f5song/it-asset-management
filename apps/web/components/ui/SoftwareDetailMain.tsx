import {
  Compliance,
  HistoryEvent,
  InstallationRow,
  SoftwareItem,
} from "@/types";
import React, { useState } from "react";
import { cn } from ".";
import { ComplianceBadge } from "./ComplianceBadge";


function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value ?? "-"}</dd>
    </>
  );
}

function TabTrigger({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "border-b-2 px-1.5 py-2 text-sm font-semibold",
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ConfirmModal({
  title,
  description,
  open,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function SoftwareDetailMain({
  item,
  installations = [],
  history = [],
  onBack,
  onEdit,
  onDelete,
}: {
  item: SoftwareItem;
  installations?: InstallationRow[];
  history?: HistoryEvent[];
  onBack: () => void;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}) {
  const [tab, setTab] = useState<"detail" | "installation" | "history">(
    "detail"
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <main className="p-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-lg hover:bg-slate-100"
          >
            ←
          </button>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900">{item.softwareName}</h1>
            <div className="mt-1">
              <ComplianceBadge label={item.compliance} />
            </div>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <span aria-hidden>✏️</span> Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-1 rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <span aria-hidden>🗑️</span> Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mt-4 flex gap-4 border-b border-slate-200">
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
        </nav>

        {/* Content */}
        {tab === "detail" && (
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow label="Manufacturer" value={item.manufacturer} />
              <InfoRow label="Version" value={item.version} />
              <InfoRow label="License Type" value={item.licenseModel} />
              <InfoRow label="Policy Compliance" value={item.compliance} />
            </dl>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <InfoRow label="Category" value={item.category} />
              <InfoRow label="Expiry Date" value={item.expiryDate ?? "-"} />
              <InfoRow label="Status" value={item.status} />
            </dl>
          </div>
        )}

        {tab === "installation" && (
          <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-3 py-2 text-sm font-medium text-slate-600">
                    Device
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-slate-600">
                    User
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-slate-600">
                    Installed On
                  </th>
                  <th className="px-3 py-2 text-sm font-medium text-slate-600">
                    Version
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {installations.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-3 text-sm text-slate-500"
                      colSpan={4}
                    >
                      No installations found.
                    </td>
                  </tr>
                ) : (
                  installations.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-sm text-slate-900">
                        {row.device}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-900">
                        {row.user}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-900">
                        {row.date}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-900">
                        {row.version}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "history" && (
          <ul className="mt-4 space-y-3">
            {history.length === 0 ? (
              <li className="text-sm text-slate-500">No history yet.</li>
            ) : (
              history.map((h) => (
                <li key={h.id} className="grid grid-cols-[16px_1fr] gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {h.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {h.actor} • {h.date}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      {/* Confirm Delete */}
      <ConfirmModal
        open={confirmOpen}
        title={`Delete “${item.softwareName}”?`}
        description="This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(item.id);
        }}
      />
    </main>
  );
}
