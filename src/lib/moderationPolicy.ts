// src/lib/moderationPolicy.ts

export type ModerationPolicy = {
  requireNewProductModeration: boolean
  fields: { description: boolean; photos: boolean }
}

const KEY = 'moderation_policy'

export function getPolicy(): ModerationPolicy {
  if (typeof window === 'undefined')
    return { requireNewProductModeration: true, fields: { description: true, photos: true } }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ModerationPolicy
  } catch {}
  return { requireNewProductModeration: true, fields: { description: true, photos: true } }
}

export function setPolicy(p: ModerationPolicy) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(p))
  window.dispatchEvent(new StorageEvent('storage', { key: KEY } as any))
}
