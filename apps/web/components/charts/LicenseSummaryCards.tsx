// components/charts/LicenseSummaryCards.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { useLicenseSummary } from "@/hooks/useLicenseSummary";
import { cnGrid } from "@/lib/cn";
import { FiDatabase, FiCheckCircle, FiShield, FiClock } from "react-icons/fi";

type Props = {
  manageHref?: string;
  className?: string;
};

export function LicenseSummaryCards({
  manageHref = "/software/license-management",
  className = "",
}: Props) {
  const { summary, isLoading, isError, errorMessage } = useLicenseSummary();

  const total = summary?.total ?? 0;
  const active = summary?.active ?? 0;
  const expiringSoon = summary?.warning ?? 0;
  const available = summary?.available ?? Math.max(total - active, 0);

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        ไม่สามารถโหลดสรุป License ได้ — {errorMessage ?? "unknown error"}
      </div>
    );
  }

  // 2 คอลัมน์บน lg เพื่อไม่ให้เบียด (จอเล็กเป็น 1/2 ตามลำดับ)
  return (
    <div className={cnGrid("grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2", className)}>
      <Card
        title="Total Licenses"
        count={total}
        href={manageHref}
        loading={isLoading}
        compact
        hideFooter
        className="h-[84px]"
        icon={<FiDatabase />} tone="blue"
      />
      <Card
        title="Licenses Active"
        count={active}
        href={`${manageHref}?status=Active`}
        loading={isLoading}
        compact
        hideFooter
        className="h-[84px]"
        icon={<FiCheckCircle />} tone="green"
      />
      <Card
        title="Licenses Available"
        count={available}
        href={`${manageHref}?status=Available`}
        loading={isLoading}
        compact
        hideFooter
        className="h-[84px]"
        icon={<FiShield />} tone="slate"
      />
      <Card
        title="Licenses Expiring Soon"
        count={expiringSoon}
        href={`${manageHref}?filter=expiringSoon`}
        loading={isLoading}
        compact
        hideFooter
        className="h-[84px]"
        icon={<FiClock />} tone="amber"
      />
    </div>
  );
}