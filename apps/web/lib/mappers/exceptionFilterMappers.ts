// lib/mappers/exceptionFilterMappers.ts
import type {
  ExceptionDomainFilters,
  ExceptionFilterValues,
  PolicyStatus,
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
  const k = simple.search ?? simple.q;
  if (k) out.search = k;
  return out;
}
