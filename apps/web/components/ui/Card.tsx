
import React from "react";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";
import { cn } from "../ui"; // ถ้าไม่มี util cn ให้ลบและรวมคลาสตรงๆ

type CardProps = {
  title: string;
  count: number | string;
  /** ลิงก์ “View all” ด้านขวา; ถ้าไม่ส่งจะแสดงเป็นสเตติกเฉยๆ */
  href?: string;
  /** โหมดเตี้ย/กระชับ */
  compact?: boolean;
  /** ส่งคลาสเพิ่ม (เช่น h-full) เวลาใช้ใน grid */
  className?: string;
};

export const Card: React.FC<CardProps> = ({
  title,
  count,
  href,
  compact = false,
  className,
}) => {
  // ความสูง/ระยะห่างตามโหมด
  const padding = compact ? "p-4 md:p-5" : "p-5 md:p-6";

  return (
    <div
      className={cn(
        "w-full h-full rounded-xl border border-gray-200 bg-white shadow-sm",
        "dark:border-gray-800 dark:bg-white/[0.03]",
        padding,
        className
      )}
      role="group"
      aria-label={typeof title === "string" ? title : "card"}
    >
      <div className="flex h-full items-end justify-between gap-3">
        {/* ซ้าย: title + count */}
        <div className="min-w-0">
          {/* ใช้ clamp ให้ตัวหนังสือยืดหยุ่นตามหน้าจอ */}
          <div className="text-[12px] md:text-sm text-gray-500 dark:text-gray-400 truncate">
            {title}
          </div>
          <div
            className={cn(
              "mt-1 font-bold text-gray-900 dark:text-white/90",
              compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
            )}
          >
            {/* รองรับทั้ง number และ string */}
            {typeof count === "number" ? count.toLocaleString() : count}
          </div>
        </div>

        {/* ขวา: View all (เป็นลิงก์ถ้า href มี) */}
        <div className="flex items-center gap-1 shrink-0">
          {href ? (
            <Link
              href={href}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                "dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10",
                "transition-colors"
              )}
              aria-label={`View all for ${title}`}
            >
              <span className="hidden sm:inline">View all</span>
              <FaAngleRight className="text-gray-500 dark:text-gray-400" />
            </Link>
          ) : (
            <div
              className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 opacity-70"
              aria-hidden
            >
              <span className="hidden sm:inline">View all</span>
              <FaAngleRight />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
