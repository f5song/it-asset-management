
// src/components/detail/DetailShell.tsx
"use client";

import * as React from "react";
import { DetailHeader } from "./DetailHeader";
import type { BreadcrumbItem, Compliance } from "types";

export type DetailShellProps = {
  title: string;
  /** ถ้าไม่มี compliance ให้ส่ง undefined ได้ */
  compliance?: Compliance;
  /** เนื้อหาหลักด้านในการ์ด */
  children: React.ReactNode;

  // Header controls
  onBack: () => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void; // เผื่ออยากใส่ปุ่ม Edit ในหัว แต่ไม่บังคับ

  /** แสดง breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];

  /** ช่องทางขวาบนหัวเรื่อง (เช่น ActionToolbar/ปุ่ม Assign) */
  headerRightExtra?: React.ReactNode;

  /** กำหนดคลาสให้เนื้อหา (ในกรอบ) เพิ่มเติมได้ */
  contentClassName?: string;

  /** กำหนดคลาสให้ container การ์ด */
  cardClassName?: string;
};

/**
 * เปลือกหน้าแบบเบา: ใช้หัวเรื่อง DetailHeader + การ์ดคอนเทนต์เดียว
 * ไม่มี Tabs / History / Edit Modal
 */
export function DetailShell({
  title,
  compliance,
  children,
  onBack,
  onDeleteClick,
  onEditClick,
  breadcrumbs,
  headerRightExtra,
  contentClassName,
  cardClassName,
}: DetailShellProps) {
  return (
    <main aria-labelledby="detail-shell-title">
      <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${cardClassName ?? ""}`}>
        <DetailHeader
          title={title}
          compliance={compliance}
          onBack={onBack}
          onEdit={onEditClick}              // ไม่ได้บังคับต้องมี
          onDeleteClick={onDeleteClick}     // ไม่ได้บังคับต้องมี
          breadcrumbs={breadcrumbs}
          rightExtra={headerRightExtra}
        />

        {/* เนื้อหาด้านใน */}
        <div className={contentClassName}>{children}</div>
      </section>
    </main>
  );
}
