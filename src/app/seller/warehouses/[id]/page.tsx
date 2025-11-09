'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getCatalog } from '../../../../lib/store.catalog'
import {
  getCity, getStockByWarehouse, getWarehouse, getSellerWarehouses,
  transferStock, setStock
} from '../../../../lib/store.warehouse'
import type { Product } from '@/lib/types'

export default function WarehouseDetail(){
  const whId = typeof window!=='undefined' ? window.location.pathname.split('/').pop()! : ''
  const [catalog, setCatalog] = useState<Product[]>(() => (typeof window!=='undefined'? getCatalog(): []))
  const [stocks, setStocks] = useState(() => (typeof window!=='undefined'? getStockByWarehouse(whId): []))
  const wh = typeof window!=='undefined' ? getWarehouse(whId) : undefined
  const city = wh ? getCity(wh.cityId) : undefined
  const sellerId = city?.sellerId || ''
  const [whs, setWhs] = useState(()=> sellerId? getSellerWarehouses(sellerId) : [])

  useEffect(()=>{
    const handler=(e:StorageEvent)=>{
      if (e.key === 'product_catalog') setCatalog(getCatalog())
      if (e.key?.startsWith('wh_')) {
        setStocks(getStockByWarehouse(whId))
        if (sellerId) setWhs(getSellerWarehouses(sellerId))
      }
    }
    window.addEventListener('storage', handler)
    return ()=> window.removeEventListener('storage', handler)
  }, [whId, sellerId])

  const rows = useMemo(()=> stocks.map(s => ({ ...s, product: catalog.find(p => p.id === s.productId) })).filter(r => r.product), [stocks, catalog])

  const [editQty, setEditQty] = useState<Record<string, number>>({})
  const [moveQty, setMoveQty] = useState<Record<string, number>>({})
  const [moveTo, setMoveTo] = useState<Record<string, string>>({})

  const otherWhs = whs.filter(x => x.id !== whId)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/seller/warehouses" className="text-ozon-blue">← Назад к списку складов</Link>
      </div>
      <div className="text-xl font-semibold">Склад: {wh?.name} — {city?.name}</div>

      {rows.length===0 && <div className="card p-4 text-gray-600">На складе пока нет товаров.</div>}

      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-4 py-3">Товар</th><th className="text-left px-4 py-3">SKU</th><th className="text-left px-4 py-3">Коробок</th><th className="text-left px-4 py-3">Изменить остаток</th><th className="text-left px-4 py-3">Переместить</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.productId} className="border-t align-top">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <img src={r.product!.photos[0] || '/images/placeholder.png'} className="w-12 h-12 object-cover rounded border" />
                    <div className="font-medium">{r.product!.name}</div>
                  </div>
                </td>
                <td className="px-4 py-2">{r.product!.sku}</td>
                <td className="px-4 py-2">{r.boxes}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-28" value={editQty[r.productId] ?? r.boxes} onChange={e=> setEditQty(prev=> ({ ...prev, [r.productId]: Number(e.target.value) }))} />
                    <button className="border border-gray-200 rounded-lg px-3" onClick={()=> setStock(whId, r.productId, Math.max(0, editQty[r.productId] ?? r.boxes))}>Сохранить</button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  {otherWhs.length === 0 ? <div className="text-xs text-gray-500">Нет других складов продавца</div> :
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <select className="input" value={moveTo[r.productId] || ''} onChange={e=> setMoveTo(prev=> ({ ...prev, [r.productId]: e.target.value }))}>
                        <option value="">— Куда переместить —</option>
                        {otherWhs.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
                      </select>
                      <input type="number" className="input" placeholder="Кол-во" value={moveQty[r.productId] || ''} onChange={e=> setMoveQty(prev=> ({ ...prev, [r.productId]: Number(e.target.value) }))} />
                      <button className="btn-primary" onClick={()=>{
                        const to = moveTo[r.productId]; const q = moveQty[r.productId] || 0
                        if (!to) return alert('Выберите склад-получатель')
                        const res = transferStock(whId, to, r.productId, q)
                        if (!res.ok) alert(res.error)
                      }}>Переместить</button>
                    </div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
