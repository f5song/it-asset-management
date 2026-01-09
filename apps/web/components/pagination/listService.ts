
// src/pagination/listService.ts
export type FetchOptions = { baseUrl?: string };

const toQueryString = (params: Record<string, any>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.append(k, String(v));
  });
  return qs.toString();
};

export class ListService {
  private baseUrl: string;

  constructor(options?: FetchOptions) {
    this.baseUrl = options?.baseUrl ?? '';
  }

  async listByOffset<T>(
    endpoint: string,
    params: Record<string, any>,
    signal?: AbortSignal
  ): Promise<{
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalPages?: number;
  }> {
    const qs = toQueryString(params);
    const url = `${this.baseUrl}${endpoint}?${qs}`;
    const res = await fetch(url, { signal });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    const json = await res.json();
    if (!Array.isArray(json.items) || typeof json.totalCount !== 'number') {
      throw new Error('Invalid pagination response shape');
    }
    return json;
  }
}
