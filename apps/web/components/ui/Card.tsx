
"use client";

import React from "react";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";
import { cn } from "../ui";

type CardProps = {
  title: string;
  count: number | string;
  href?: string;
  compact?: boolean;
  className?: string;
};

export const Card: React.FC<CardProps> = ({
  title,
  count,
  href,
  compact = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full h-full rounded-lg border border-slate-200 bg-white shadow-sm",
        "flex flex-col justify-between",
        "transition-all",
        compact ? "p-4" : "p-5",
        className
      )}
    >
      {/* Title */}
      <div className="text-xs md:text-sm text-slate-500 font-medium truncate">
        {title}
      </div>

      {/* Count */}
      <div
        className={cn(
          "mt-3 font-bold text-slate-900 leading-none tracking-tight",
          compact ? "text-xl md:text-2xl" : "text-2xl md:text-[28px]"
        )}
      >
        {typeof count === "number" ? count.toLocaleString() : count}
      </div>

      {/* Footer: “View all” link */}
      <div className="flex items-center justify-end mt-1">
        {href ? (
          <Link
            href={href}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 hover:underline transition"
          >
            <span className="hidden sm:inline">View all</span>
            <FaAngleRight className="text-[10px]" />
          </Link>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 select-none">
            <span className="hidden sm:inline">View all</span>
            <FaAngleRight className="text-[10px]" />
          </div>
        )}
      </div>
    </div>
  );
};
