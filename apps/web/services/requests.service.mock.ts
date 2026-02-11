
import { MOCK_REQUESTS } from '@/mock/requests.mock';
import { RequestListResponse, RequestQuery } from '@/types/exception';
import type { ExportFormat } from 'types';
import { RequestsService } from './requests.service';

function fuzzy(q: string, ...fs: string[]) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return fs.some(f => f.toLowerCase().includes(s));
}

export function mockRequestsService(): RequestsService {
  return {
    async list(query: RequestQuery): Promise<RequestListResponse> {
      const { pageIndex, pageSize, filters } = query;

      let data = [...MOCK_REQUESTS];

      if (filters?.site) data = data.filter(r => r.site === filters.site);
      if (filters?.risk) data = data.filter(r => r.risk === filters.risk);
      if (filters?.exception) data = data.filter(r => r.exception === filters.exception);
      if (filters?.search) {
        data = data.filter(r => fuzzy(filters.search!, r.title, r.requester, r.department, r.site, r.exception));
      }

      const total = data.length;
      const start = pageIndex * pageSize;
      const items = data.slice(start, start + pageSize);

      // จำลอง latency
      await new Promise(res => setTimeout(res, 200));
      return { items, total };
    },

    async export(format: ExportFormat, query): Promise<Blob> {
      const { items } = await this.list({ pageIndex: 0, pageSize: 5000, ...query });
      const csv = [
        'id,title,requester,department,site,risk,exception,dueAt',
        ...items.map(r => [r.id, r.title, r.requester, r.department, r.site, r.risk, r.exception, r.dueAt]
          .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      const mime =
        format === 'csv' ? 'text/csv' :
        format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
        'application/pdf';
      return new Blob([csv], { type: mime });
    },
  };
}