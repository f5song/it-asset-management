import { RequestListResponse, RequestQuery } from '@/types/exception';
import type { ExportFormat } from 'types';

export interface RequestsService {
  list(query: RequestQuery): Promise<RequestListResponse>;
  export(format: ExportFormat, query: Omit<RequestQuery, 'pageIndex' | 'pageSize'>): Promise<Blob>;
}

export type CreateRequestsServiceArgs = {
  impl?: 'mock'; // เผื่อสลับเป็น 'http' ภายหลัง
};

export function createRequestsService(_: CreateRequestsServiceArgs = { impl: 'mock' }): RequestsService {
  const { mockRequestsService } = require('./requests.service.mock');
  return mockRequestsService();
}