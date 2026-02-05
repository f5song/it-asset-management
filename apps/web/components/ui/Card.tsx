// components/ui/Card.tsx
"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type Tone = "blue" | "green" | "slate" | "amber" | "red" | "violet";

export type CardProps = {
  title: string;
  count: number | string;
  href?: string;
  compact?: boolean;
  loading?: boolean;
  className?: string;
  hideFooter?: boolean;
  icon?: React.ReactNode;
  tone?: Tone;
};

const toneBg = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-50 text-slate-700",
} as const;

export const Card: React.FC<CardProps> = ({
  title,
  count,
  href,
  compact = false,
  loading = false,
  className,
  hideFooter = true,
  icon,
  tone = "slate",
}) => {
  const Container: any = href ? Link : "div";
  const showIcon = Boolean(icon);

  return (
    <Container
      href={href}
      className={cn(
        "block rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all",
        compact ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showIcon && (
          <div className={cn("w-10 h-10 flex items-center justify-center rounded-lg", toneBg[tone])}>
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* ปรับให้ไม่ตัดเร็ว: แค่ md ขึ้นไปค่อย truncate */}
          <div className="text-[13px] text-slate-600 md:truncate">{title}</div>
          <div className="text-[22px] font-semibold text-slate-900 mt-0.5 leading-tight">
            {loading ? "…" : typeof count === "number" ? count.toLocaleString() : count}
          </div>
        </div>
      </div>

      {!hideFooter && <div className="mt-2 text-[11px] text-slate-400">View all</div>}
    </Container>
  );
};
