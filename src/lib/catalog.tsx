'use client'
import { useEffect, useState } from 'react'
import { products as initial } from './mockData'
import type { Product } from './types'

const KEY = 'catalog_products'

function seed(): Product[] {
  const seeded: Product[] = initial.map(p => ({
    ...p,
    moderation: p.moderation ?? { status: 'APPROVED', updatedAt: new Date().toISOString() }
  }))
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(seeded))
  }
  return seeded
}

export function loadCatalog(): Product[] {
  if (typeof window === 'undefined') return initial
  const raw = localStorage.getItem(KEY)
  if (!raw) return seed()
  try {
    const list: Product[] = JSON.parse(raw)
    return list
  } catch {
    return seed()
  }
}

export function saveCatalog(list: Product[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function useCatalogProducts(onlyApproved: boolean = true) {
  const [list, setList] = useState<Product[]>([])
  useEffect(() => {
    const data = loadCatalog()
    setList(onlyApproved ? data.filter(p => (p.moderation?.status ?? 'APPROVED') === 'APPROVED') : data)
  }, [onlyApproved])
  const saveAll = (updater: (all: Product[]) => Product[]) => {
    const nextAll = updater(loadCatalog())
    saveCatalog(nextAll)
    setList(onlyApproved ? nextAll.filter(p => (p.moderation?.status ?? 'APPROVED') === 'APPROVED') : nextAll)
  }
  return { list, saveAll }
}
