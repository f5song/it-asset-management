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
 * - simple.q/searchText -> searchText
 */
export function toDomainFilters(
  simple?: Partial<ExceptionFilterValues & { q?: string; searchText?: string }>
): ExceptionDomainFilters {
  const s = simple ?? {};
  return {
    status: s.status as PolicyStatus | undefined,
    category: s.type as ExceptionCategory | undefined,
    searchText: s.searchText ?? s.q ?? "",
  };
}

/**
 * Domain -> Simple
 */
export function toSimpleFilters(
  domain: ExceptionDomainFilters
): ExceptionFilterValues & { q?: string; searchText?: string } {
  const q = domain.searchText && domain.searchText.trim() ? domain.searchText.trim() : undefined;
  return {
    status: domain.status as PolicyStatus | undefined,
    type: domain.category as ExceptionCategory | undefined,
    q,
    searchText: q,
  };
}

/**
 * Simple -> Service-ready canonical filters
 * - ใช้คีย์กลาง: { status, category, searchText }
 */
export function toServiceFilters(simple: ExceptionFilterValues & { q?: string; searchText?: string }) {
  const out: Record<string, string> = {};
  if (simple.status) out.status = String(simple.status);
  if (simple.type) out.category = String(simple.type);
  const k = simple.searchText ?? simple.q;
  if (k) out.searchText = k;
  return out;
}
