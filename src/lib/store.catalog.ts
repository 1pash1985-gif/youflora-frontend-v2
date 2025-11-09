'use client'
import type { Product } from './types'

const KEY = 'product_catalog'

function dispatch(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new StorageEvent('storage', { key }))
  }
}

export function getCatalog(): Product[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) as Product[] : []
}

export function setCatalog(items: Product[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(items))
  dispatch(KEY)
}

export function initCatalogIfEmpty(seed: Product[]): void {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(seed))
    dispatch(KEY)
  }
}

export function upsertCatalog(p: Product): void {
  if (typeof window === 'undefined') return
  const items = getCatalog()
  const i = items.findIndex(x => x.id === p.id)
  if (i >= 0) items[i] = { ...items[i], ...p }
  else items.unshift(p)
  setCatalog(items)
}

export function updateCatalogFields(id: string, patch: Partial<Product>): void {
  if (typeof window === 'undefined') return
  const items = getCatalog()
  const i = items.findIndex(x => x.id === id)
  if (i >= 0) {
    items[i] = { ...items[i], ...patch }
    setCatalog(items)
  }
}
