
// src/components/installation/SelectField.tsx
"use client";
import React from "react";
import { cn } from "../ui";


type Option = { label: string; value: string };

type SelectFieldProps = {
  label?: string;
  srOnlyLabel?: boolean;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string; // เผื่อไว้ถ้าต้องมี option แรกเป็น placeholder
};

export function SelectField({
  label,
  srOnlyLabel,
  value,
  options,
  onChange,
  className,
  placeholder,
}: SelectFieldProps) {
  const id = React.useId();

  return (
    <div className="inline-flex items-center">
      {/* แยก label ออกมาเป็นพี่–น้อง ไม่ครอบ select */}
      {label && (
        <label
          htmlFor={id}
          className={cn("mr-2 text-sm text-slate-600", srOnlyLabel && "sr-only")}
        >
          {label}
        </label>
      )}

      <select
        id={id}
        className={cn(
          "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
          className
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={srOnlyLabel ? label : undefined} // a11y fallback
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
