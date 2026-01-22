
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { AssignRow, LicenseAssignFormValues } from "types/license";


export const StepPolicyCheck: React.FC = () => {
  // ✅ ใส่ Generic ให้ RHF รู้ shape ของฟอร์ม
  const { getValues, setValue } = useFormContext<LicenseAssignFormValues>();

  // ✅ mapping มี type แล้ว ไม่ใช่ any
  const mapping: AssignRow[] = getValues().mapping ?? [];

  const toggleException = (empId: string, checked: boolean) => {
    const next = mapping.map((m) =>
      m.employeeId === empId ? { ...m, exception: checked } : m,
    );
    setValue("mapping", next, { shouldDirty: true });
  };

  const onReasonChange = (empId: string, reason: string) => {
    const next = mapping.map((m) =>
      m.employeeId === empId ? { ...m, reason } : m,
    );
    setValue("mapping", next, { shouldDirty: true });
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Policy</th>
              <th className="px-3 py-2 text-left">Exception</th>
              <th className="px-3 py-2 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {mapping.map((m) => (
              <tr key={m.employeeId} className="border-t align-top">
                <td className="px-3 py-2">{m.employeeId}</td>
                <td className="px-3 py-2">
                  {m.decision === "Allowed" && <span className="text-green-700">Allowed</span>}
                  {m.decision === "NeedsReview" && <span className="text-yellow-700">Needs Review</span>}
                  {m.decision === "Restricted" && <span className="text-red-700">Restricted</span>}
                </td>
                <td className="px-3 py-2">
                  {(m.decision === "NeedsReview" || m.decision === "Restricted") ? (
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!m.exception}
                        onChange={(e) => toggleException(m.employeeId, e.target.checked)}
                      />
                      <span>Request Exception</span>
                    </label>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {m.exception ? (
                    <textarea
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-2 py-1"
                      placeholder="ระบุเหตุผล"
                      defaultValue={m.reason ?? ""}
                      onChange={(e) => onReasonChange(m.employeeId, e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600">
        * ผู้ใช้ที่เป็น <b>Restricted</b> จะไม่ถูก Assign โดยอัตโนมัติ
      </p>
    </section>
  );
};
