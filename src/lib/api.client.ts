const BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-buyer-id': 'buyer-demo', // пока так, пока нет auth
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}
