import { useMemo } from "react";
import type { ExceptionDefinition } from "@/types/exception";

export function useExceptionsMetrics(exceptions: ExceptionDefinition[]) {
  return useMemo(() => {
    const total = exceptions.length;
    const active = exceptions.filter(e => e.status === "Active").length;
    const inactive = total - active;

    const byRisk = {
      High: exceptions.filter(e => e.risk === "High").length,
      Medium: exceptions.filter(e => e.risk === "Medium").length,
      Low: exceptions.filter(e => e.risk === "Low").length,
    };

    const byStatus = { Active: active, Inactive: inactive };

    const recentCreated = [...exceptions]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5);

    return { total, active, inactive, byRisk, byStatus, recentCreated };
  }, [exceptions]);
}