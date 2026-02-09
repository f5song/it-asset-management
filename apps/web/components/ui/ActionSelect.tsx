// src/components/installation/ActionSelect.tsx
"use client";
import React from "react";
import type { ToolbarAction } from "types";

export type ActionOption = {
  value: ToolbarAction;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
};

export type ActionSelectProps = {
  onAction: (action: ToolbarAction) => void;

  /** รายการเมนูที่จะแสดง (แทนการ fix ในคอมโพเนนต์) */
  options: ActionOption[];

  /** ป้ายบรรทัดแรก (placeholder) */
  placeholder?: string;

  /** ปิดปุ่มทั้งชุด (เช่น ขณะกำลังประมวลผล) */
  disabled?: boolean;

  /** เลือกแล้ว reset dropdown กลับค่า placeholder */
  resetAfterSelect?: boolean;

  /** (ออปชัน) ใช้คุมค่าเลือกจากภายนอก */
  value?: "" | ToolbarAction;
  onChangeValue?: (v: "" | ToolbarAction) => void;

  /** className/style เผื่อปรับหน้าตา */
  className?: string;
  selectClassName?: string;
};

export function ActionSelect({
  onAction,
  options,
  placeholder = "Action",
  disabled = false,
  resetAfterSelect = true,
  value,
  onChangeValue,
  className,
  selectClassName,
}: ActionSelectProps) {
  const id = React.useId();

  // ถ้าไม่ได้คุมจากภายนอก → ใช้ internal state
  const [internalValue, setInternalValue] = React.useState<"" | ToolbarAction>("");

  const isControlled = value !== undefined;
  const curValue = isControlled ? value! : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "" | ToolbarAction;

    // แจ้ง state ออกไป (ถ้าเป็น controlled)
    onChangeValue?.(v);

    // ถ้าเลือกเป็น action จริง → ยิง onAction
    if (v) {
      onAction(v);

      // รีเซ็ต dropdown กลับ placeholder ตามสัญญา
      if (resetAfterSelect) {
        if (isControlled) onChangeValue?.("");
        else setInternalValue("");
        return;
      }
    }

    // ถ้าไม่ reset → เก็บค่าล่าสุดไว้
    if (!isControlled) setInternalValue(v);
  };

  const effectiveOptions = options.filter((op) => !op.hidden);

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        Action
      </label>
      <select
        id={id}
        className={
          selectClassName ??
          "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        }
        value={curValue}
        onChange={handleChange}
        disabled={disabled}
      >
        {/* placeholder */}
        <option value="">{placeholder}</option>

        {/* options */}
        {effectiveOptions.map((op) => (
          <option key={op.value} value={op.value} disabled={op.disabled}>
            {op.label}
          </option>
        ))}
      </select>
    </div>
  );
}