
// src/components/table/useSorting.ts
import { useMemo, useState } from 'react';
import { Column } from './types';

export type SortOrder = 'asc' | 'desc' | undefined;

export function useSorting<T>(data: T[], columns: Column<T>[]) {
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<SortOrder>(undefined);

  const sorted = useMemo(() => {
    if (!sortBy || !order) return data;
    const col = columns.find((c) => c.id === sortBy);
    if (!col) return data;

    const compare =
      col.sortCompare ??
      ((a: T, b: T) => {
        const av = String(col.cell(a));
        const bv = String(col.cell(b));
        return av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
      });

    const next = [...data].sort((a, b) => compare(a, b));
    return order === 'asc' ? next : next.reverse();
  }, [data, sortBy, order, columns]);

  const toggleSort = (id: string) => {
    if (sortBy !== id) {
      setSortBy(id);
      setOrder('asc');
    } else {
      setOrder((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? undefined : 'asc'));
      if (order === undefined) setSortBy(undefined);
    }
  };

  return { sorted, sortBy, order, toggleSort };
}
