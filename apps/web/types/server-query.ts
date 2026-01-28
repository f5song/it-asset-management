export type ServerQuery = {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;                // column id
  sortOrder?: 'asc' | 'desc';
};

export type ServerSort = { sortBy?: string; sortOrder?: "asc" | "desc" };