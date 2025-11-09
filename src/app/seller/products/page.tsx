'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: string
  sellerId: string
  categoryId: string
  name: string
  sku: string
  description?: string
  pricePerBoxSeller: number
  stemsPerBox: number
  cutLengthCm: number
  color?: string
  country?: string
  photos: string[] | any
  stockStatus?: 'AVAILABLE' | 'PREORDER' | 'IN_TRANSIT'
  sellerDiscountRub?: number
  sellerCashbackRub?: number
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

const API = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'

export default function SellerProductsPage() {
  const [items, setItems]   = useState<Product[]>([])
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState<string | null>(null)

  // определим sellerId из профиля (как было в старом коде)
  const profile = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('seller_profile') || '{"sellerId":"s-ec"}')
    : { sellerId: 's-ec' }
  const sellerId: string = profile?.sellerId || 's-ec'

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoad(true)
        setError(null)
        // Загружаем товары продавца с бэкенда (PostgreSQL)
        const res = await fetch(`${API}/products?sellerId=${encodeURIComponent(sellerId)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const arr: Product[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
        if (alive) setItems(arr)
      } catch (e: any) {
        console.error(e)
        if (alive) setError('Ошибка: Не удалось загрузить товары')
      } finally {
        if (alive) setLoad(false)
      }
    }
    load()
    return () => { alive = false }
  }, [sellerId])

  const count = items.length
  const rows = useMemo(()=> items, [items])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Мои товары</h1>
        <Link href="/seller/products/new" className="btn-primary px-5 py-2 rounded-lg">
          + Добавить товар
        </Link>
      </div>

      {loading && <div className="text-gray-500">Загрузка…</div>}
      {error   && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Фото</th>
                <th className="px-4 py-3 text-left">Название</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Цена, ₽/кор.</th>
                <th className="px-4 py-3 text-left">Стеблей/кор.</th>
                <th className="px-4 py-3 text-left">Длина, см</th>
                <th className="px-4 py-3 text-left">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const firstPhoto =
                  Array.isArray(p.photos) && p.photos.length
                    ? p.photos[0]
                    : '/images/placeholder.png'
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      <img src={firstPhoto} className="w-14 h-14 object-cover rounded border" />
                    </td>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.sku}</td>
                    <td className="px-4 py-2">{p.pricePerBoxSeller}</td>
                    <td className="px-4 py-2">{p.stemsPerBox}</td>
                    <td className="px-4 py-2">{p.cutLengthCm}</td>
                    <td className="px-4 py-2">
                      <span className="badge bg-green-100 text-green-800">
                        {p.stockStatus ?? 'AVAILABLE'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={7}>
                    У вас пока нет опубликованных товаров. Нажмите «Добавить товар».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
