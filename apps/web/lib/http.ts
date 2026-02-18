// utils/http.ts (ของเดิม + ปรับเล็กน้อยให้ใช้ร่วมกับ base URL ได้)
export function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export async function http<T>(
  input: RequestInfo,
  init?: RequestInit & { parse?: 'json' | 'text' | 'void' },
): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include', // ถ้าใช้คุกกี้ข้ามโดเมน อย่าลืมตั้ง CORS ฝั่ง backend ให้ถูกต้อง
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      msg = text || msg;
    } catch {}
    throw new Error(msg);
  }

  const parse = init?.parse ?? 'json';
  if (parse === 'json') return (await res.json()) as T;
  if (parse === 'text') return (await res.text()) as T;
  return undefined as unknown as T;
}