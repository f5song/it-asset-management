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
  sortBy?: keyof SoftwareItem;
  sortOrder?: "asc" | "desc";
  statusFilter?: SoftwareStatus;
  typeFilter?: SoftwareType;
  manufacturerFilter?: string;
  searchText?: string;
};