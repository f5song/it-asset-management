
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { AssignRow, LicenseAssignFormValues } from "types/license";

export const StepDeviceImpact: React.FC = () => {
  // ✅ บอก shape ของฟอร์มให้ RHF รู้
  const { getValues } = useFormContext<LicenseAssignFormValues>();

  // ✅ ระบุชนิดของ mapping ให้ชัดเจน
  const mapping: AssignRow[] = getValues().mapping ?? [];

  return (
    <section className="grid gap-4">
      <p className="text-sm text-gray-700">
        ระบบคำนวณจำนวนเครื่องต่อผู้ใช้สำหรับ Per-Device แล้ว (แบบอัตโนมัติ)
      </p>
      <div className="rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Device Count</th>
            </tr>
          </thead>
          <tbody>
            {mapping.map((m) => (
              <tr key={m.employeeId} className="border-t">
                <td className="px-3 py-2">{m.employeeId}</td>
                <td className="px-3 py-2">{m.deviceCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
