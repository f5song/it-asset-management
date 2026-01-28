// lib/mappers/exceptionFilterMappers.ts
import type {
  ExceptionDomainFilters,
  ExceptionFilterValues,
  ExceptionGroup,
  ExceptionCategory,
  ExceptionScope,
} from 'types/exception';

/**
 * Simple -> Domain
 * - simple.status -> group
 * - simple.type -> category
 * - simple.manufacturer -> scope
 * - simple.searchText -> searchText
 */
export function toDomainFilters(
  simple?: Partial<ExceptionFilterValues>,
): ExceptionDomainFilters {
  const s = simple ?? {};
  return {
    group: s.status as ExceptionGroup | undefined,
    category: s.type as ExceptionCategory | undefined,
    scope: s.manufacturer as ExceptionScope | undefined,
    searchText: s.searchText ?? '', // เก็บเป็น string ว่างได้ (UI ชอบใช้)
  };
}

/**
 * Domain -> Simple
 * - group -> simple.status
 * - category -> simple.type
 * - scope -> simple.manufacturer
 * - searchText -> simple.searchText
 */
export function toSimpleFilters(domain: ExceptionDomainFilters): ExceptionFilterValues {
  return {
    status: domain.group as ExceptionGroup | undefined,
    type: domain.category as ExceptionCategory | undefined,
    manufacturer: domain.scope as ExceptionScope | undefined,
    searchText: domain.searchText && domain.searchText.trim() ? domain.searchText.trim() : undefined,
  };
}

/**
 * Simple -> Service-ready *canonical* filters
 * - คืนคีย์กลาง: { group, category, scope, searchText }
 * - ให้ Hook/Service เป็นคนแปลงชื่อคีย์ต่อ (เช่น group -> groupFilter, searchText -> searchText)
 */
export function toServiceFilters(simple: ExceptionFilterValues) {
  const out: Record<string, string> = {};
  if (simple.status) out.group = String(simple.status);
  if (simple.type) out.category = String(simple.type);
  if (simple.manufacturer) out.scope = String(simple.manufacturer);
  if (simple.searchText) out.searchText = simple.searchText;
  return out;
}