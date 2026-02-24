// src/hooks/useLicenseSummary.ts
"use client";

import * as React from "react";
import { getLicenseSummary } from "services/licenses.service.mock";
import type { LicenseFilters } from "types";

export type LicenseSummary = Awaited<ReturnType<typeof getLicenseSummary>>;

export function useLicenseSummary(
  filters?: Pick<LicenseFilters, "status" | "licenseModel" | "manufacturer" | "search">
) {
  const [summary, setSummary] = React.useState<LicenseSummary | null>(null);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  // ทำให้ dependency เปลี่ยนเฉพาะเมื่อค่าฟิลเตอร์เปลี่ยนจริง ๆ
  const deps = JSON.stringify(filters ?? {});

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getLicenseSummary(
          {
            status: filters?.status,
            licenseModel: filters?.licenseModel,
            manufacturer: filters?.manufacturer,
            search: filters?.search, //   ใช้ key "search" ตามมาตรฐานใหม่
          },
          ac.signal
        );

        if (!alive) return;
        setSummary(res);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        setError(true);
        setErrorMessage(e?.message ?? "โหลดข้อมูลสรุป License ไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [deps]);

  return { summary, isLoading, isError, errorMessage };
}