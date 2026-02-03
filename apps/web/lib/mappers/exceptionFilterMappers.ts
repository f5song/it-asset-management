// lib/mappers/exceptionFilterMappers.ts
import type {
  ExceptionDomainFilters,
  ExceptionFilterValues,
  PolicyStatus,
  ExceptionCategory,
} from "types/exception";

/**
 * Simple -> Domain
 * - simple.status -> status
 * - simple.type -> category
 * - simple.q/search -> search
 */
export function toDomainFilters(
  simple?: Partial<ExceptionFilterValues & { q?: string; search?: string }>
): ExceptionDomainFilters {
  const s = simple ?? {};
  return {
    status: s.status as PolicyStatus | undefined,
    category: s.type as ExceptionCategory | undefined,
    search: s.search ?? s.q ?? "",
  };
}

/**
 * Domain -> Simple
 */
export function toSimpleFilters(
  domain: ExceptionDomainFilters
): ExceptionFilterValues & { q?: string; search?: string } {
  const q = domain.search && domain.search.trim() ? domain.search.trim() : undefined;
  return {
    status: domain.status as PolicyStatus | undefined,
    type: domain.category as ExceptionCategory | undefined,
    q,
    search: q,
  };
}

/**
 * Simple -> Service-ready canonical filters
 * - ใช้คีย์กลาง: { status, category, search }
 */
export function toServiceFilters(simple: ExceptionFilterValues & { q?: string; search?: string }) {
  const out: Record<string, string> = {};
  if (simple.status) out.status = String(simple.status);
  if (simple.type) out.category = String(simple.type);
  const k = simple.search ?? simple.q;
  if (k) out.search = k;
  return out;
}
