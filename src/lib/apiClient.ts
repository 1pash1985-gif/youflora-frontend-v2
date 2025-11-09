// src/lib/apiClient.ts
export async function apiGET(url: string) {
  const r = await fetch(url, { cache: 'no-store' })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
export async function apiPOST(url: string, body: any) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
export async function apiPATCH(url: string, body: any) {
  const r = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
export async function apiDELETE(url: string) {
  const r = await fetch(url, { method: 'DELETE' })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
