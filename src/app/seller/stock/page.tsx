'use client'

import { useEffect, useState } from 'react'
import { getProductCityAvailability, type CityAvailability } from '@/lib/store.warehouse'

type Product = {
  id: string
  name: string
  sku: string
  photos?: string[]
}

export default function SellerStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [byProduct, setByProduct] = useState<Record<string, CityAvailability[]>>({})

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/v1/catalog?mine=1', { cache: 'no-store' })
        if (!res.ok) throw new Error('Не удалось загрузить товары')
        const data = await res.json()
        const list: Product[] = Array.isArray(data) ? data : (data.items ?? [])
        if (mounted) setProducts(list)

        // подгружаем остатки по городам для каждого товара
        await Promise.all(
          list.map(async (p) => {
            const rows = await getProductCityAvailability(p.id).catch(() => [])
            if (mounted) {
              setByProduct((prev) => ({ ...prev, [p.id]: rows }))
            }
          }),
        )
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Ошибка')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="p-4">Загрузка…</div>
  if (error) return <div className="p-4 text-red-600">Ошибка: {error}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Остатки по городам</h1>

      <div className="grid gap-3">
        {products.map((p) => {
          const avail = byProduct[p.id] ?? []
          const photo =
            Array.isArray(p.photos) && p.photos.length ? p.photos[0] : '/images/placeholder.png'

          return (
            <div key={p.id} className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={photo} className="w-14 h-14 object-cover rounded border" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sku}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[520px] text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Город</th>
                      <th className="px-3 py-2 text-left">Доступно, коробок</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avail.length === 0 && (
                      <tr>
                        <td className="px-3 py-2 text-gray-500" colSpan={2}>
                          Нет данных.
                        </td>
                      </tr>
                    )}
                    {avail.map((row) => (
                      <tr key={row.cityId} className="border-t">
                        <td className="px-3 py-2">{row.cityName}</td>
                        <td className="px-3 py-2">{row.qtyBoxes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
