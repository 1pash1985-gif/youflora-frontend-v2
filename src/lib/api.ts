// src/lib/api.ts
export function asArray<T = any>(maybe: any, key: string = 'items'): T[] {
  if (Array.isArray(maybe)) return maybe as T[];
  if (maybe && Array.isArray(maybe[key])) return maybe[key] as T[];
  return [];
}

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const payload = isJson ? await res.json().catch(() => ({})) : { error: await res.text() };

  if (!res.ok) {
    throw new Error(payload?.error || `HTTP ${res.status}`);
  }
  return payload;
}

export const apiGet = (url: string) => jsonFetch(url, { method: 'GET' });
export const apiPost = (url: string, body?: any) =>
  jsonFetch(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const apiPatch = (url: string, body?: any) =>
  jsonFetch(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
export const apiDelete = (url: string) => jsonFetch(url, { method: 'DELETE' });
