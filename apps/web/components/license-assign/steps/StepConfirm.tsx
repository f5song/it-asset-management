
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export const StepConfirm: React.FC<{ required: number }> = ({ required }) => {
  const { register } = useFormContext();

  return (
    <section className="grid gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-800">Installed On</label>
        <input
          type="date"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          {...register("installedOn")}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <div className="font-semibold mb-2">Summary</div>
        <div>รวมที่จะ Assign: <b>{required}</b> seat</div>
        <div className="text-xs text-gray-500 mt-2">
          * ผู้ใช้ที่ถูก mark ว่า Restricted จะไม่ถูก Assign
        </div>
      </div>
    </section>
  );
};
