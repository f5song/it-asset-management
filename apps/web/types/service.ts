import { SoftwareItem, SoftwareStatus, SoftwareType } from "./software";

export type ItemsResponse = {
  data: SoftwareItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ItemsQuery = {
  page: number; // 1-based
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  statusFilter?: string;
  typeFilter?: string;
  manufacturerFilter?: string;
  searchText?: string;
};