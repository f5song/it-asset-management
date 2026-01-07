
// lib/api.ts
export type FetchParams = {
  endpoint: string;
  query?: Record<string, any>;
};

export const buildUrl = ({ endpoint, query }: FetchParams) => {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
};

export async function fetchJson<T>(params: FetchParams, signal?: AbortSignal): Promise<T> {
  const res = await fetch(buildUrl(params), { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
