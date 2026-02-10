// src/components/ui/MultiSelectField.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

type Option = { label: string; value: string };

type MultiSelectFieldProps = {
  label?: string;
  srOnlyLabel?: boolean;

  value: string[];                       // ⭐ controlled multi
  options: Option[];
  onChange: (next: string[]) => void;

  placeholder?: string;                  // ข้อความตอนยังไม่เลือก เช่น "All Departments"
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;

  showSelectAll?: boolean;               // แถว "Select all"
  disabled?: boolean;
  size?: number;                         // ไม่จำเป็น (เผื่ออยาก fix สูงสุด)
};

export function MultiSelectField({
  label,
  srOnlyLabel,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className,
  buttonClassName,
  menuClassName,
  showSelectAll = true,
  disabled = false,
}: MultiSelectFieldProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกนอก
  React.useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggle = (val: string) => {
    const next = new Set(selectedSet);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(Array.from(next));
  };

  const allSelected = value.length > 0 && value.length === options.length;
  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  const summaryLabel = React.useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length <= 2) {
      const firstTwo = options
        .filter((o) => selectedSet.has(o.value))
        .map((o) => o.label)
        .slice(0, 2)
        .join(", ");
      return value.length > 2 ? `${firstTwo} +${value.length - 2}` : firstTwo;
    }
    return `${value.length} selected`;
  }, [value.length, placeholder, options, selectedSet]);

  return (
    <div className={cn("inline-flex items-center", className)} ref={ref}>
      {label && (
        <label
          htmlFor={id}
          className={cn("mr-2 text-sm text-slate-600", srOnlyLabel && "sr-only")}
        >
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        className={cn(
          "relative inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm",
          "hover:bg-slate-50",
          disabled && "opacity-60 cursor-not-allowed",
          buttonClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={cn(value.length === 0 && "text-slate-500")}>
          {summaryLabel}
        </span>
        <svg
          className="ml-2 h-4 w-4 text-slate-500"
          fill="none"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className={cn(
            "absolute z-50 mt-1 w-[280px] rounded-md border border-slate-200 bg-white shadow-lg",
            "max-h-64 overflow-auto p-1",
            menuClassName
          )}
        >
          {showSelectAll && (
            <div
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-50"
              )}
              onClick={handleSelectAll}
              role="menuitemcheckbox"
              aria-checked={allSelected}
            >
              <input type="checkbox" checked={allSelected} readOnly />
              <span>{allSelected ? "Unselect all" : "Select all"}</span>
            </div>
          )}

          {options.map((opt) => {
            const checked = selectedSet.has(opt.value);
            return (
              <div
                key={opt.value}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-50"
                )}
                onClick={() => toggle(opt.value)}
                role="menuitemcheckbox"
                aria-checked={checked}
              >
                <input type="checkbox" checked={checked} readOnly />
                <span>{opt.label}</span>
              </div>
            );
          })}

          {value.length > 0 && (
            <>
              <div className="my-1 border-t border-slate-200" />
              <div
                className="flex cursor-pointer select-none items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => onChange([])}
                role="menuitem"
              >
                Clear
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}