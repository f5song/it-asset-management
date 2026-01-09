
// src/components/table/types.ts
export type Accessor<T> = (row: T) => React.ReactNode;

export interface Column<T> {
  id: string;
  header: string;
  cell: Accessor<T>;
  className?: string;
  sortable?: boolean;
  sortCompare?: (a: T, b: T) => number;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  variant?: 'default' | 'bordered' | 'striped';
  emptyMessage?: string;
  initialPage?: number;
}
