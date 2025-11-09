// src/lib/store.db.ts
import { apiGET, apiPATCH, apiPOST } from '@/lib/apiClient'
import type { Product } from '@/lib/types'

export async function getCatalog(): Promise<Product[]> {
  return apiGET('/api/products')
}
export async function upsertCatalog(p: Product) {
  await apiPATCH(`/api/products/${p.id}`, p)
}

export async function getModerationQueue() {
  return apiGET('/api/moderation')
}
export async function addModeration(item: any) {
  if (item?.draft?.photos) item.draft.photos = []
  return apiPOST('/api/moderation', item)
}
export async function approveModeration(id: string) {
  return apiPOST(`/api/moderation/${id}/approve`, {})
}
export async function rejectModeration(id: string, reason: string) {
  return apiPOST(`/api/moderation/${id}/reject`, { reason })
}
export function initCatalogIfEmpty(_: any[]) { /* not used in API mode */ }
