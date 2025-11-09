'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getAllStocks, getAllWarehouses, updateStatus, StockStatus, STOCK_STATUSES } from '@/lib/store.warehouse'
import { getCatalog } from '@/lib/store'
import type { Product } from '@/lib/types'

const LABEL: Record<StockStatus, string> = { AVAILABLE: 'В наличии', PREORDER: 'Под заказ', IN_TRANSIT: 'В пути' }

type Row = {
  key: string
  product: Product | undefined
  warehouseName: string
  status: StockStatus
  qty: number
  warehouseId: string
  productId: string
}

export default function AdminStockReport() {
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState<StockStatus[]>([])
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  const [toStatus, setToStatus] = useState<StockStatus>('AVAILABLE')

  const refresh = () => {
    const catalog = getCatalog()
    const whById = Object.fromEntries(getAllWarehouses().map(w => [w.id, w]))
    const r: Row[] = getAllStocks().map(s => ({
      key: `${s.warehouseId}_${s.productId}`,
      product: catalog.find(p => p.id === s.productId),
      warehouseName: `${whById[s.warehouseId]?.name || s.warehouseId}`,
      status: s.status,
      qty: s.qty,
      warehouseId: s.warehouseId,
      productId: s.productId,
    }))
    setRows(r)
  }

  useEffect(() => {
    refresh()
    const onStorage = () => refresh()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const shown = useMemo(() => {
    if (filter.length === 0) return rows
    return rows.filter(r => filter.includes(r.status))
  }, [rows, filter])

  const totals = useMemo(() => {
    const t: Record<StockStatus, number> = { AVAILABLE: 0, PREORDER: 0, IN_TRANSIT: 0 }
    rows.forEach(r => { t[r.status] += r.qty })
    return t
  }, [rows])

  const togglePickAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    shown.forEach(r => { next[r.key] = checked })
    setPicked(next)
  }

  const applyMass = () => {
    const sel = shown.filter(r => picked[r.key])
    if (sel.length === 0) return alert('Не выбрано ни одной позиции')
    sel.forEach(r => updateStatus(r.warehouseId, r.productId, toStatus))
    alert(`Статус изменён для ${sel.length} позиций`)
    setPicked({})
    refresh()
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Отчёт: Наличие по статусам</div>

      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="text-sm text-gray-600">Фильтр статуса:</div>
        {STOCK_STATUSES.map(s => (
          <label key={s} className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={filter.includes(s)} onChange={() => setFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
            <span>{LABEL[s]}</span>
          </label>
        ))}
        <div className="ml-auto text-sm text-gray-600">
          Итого: В наличии — {totals.AVAILABLE}, В пути — {totals.IN_TRANSIT}, Под заказ — {totals.PREORDER}
        </div>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <label className="text-sm">Массовая смена статуса выбранным на:</label>
        <select className="input w-[220px]" value={toStatus} onChange={e => setToStatus(e.target.value as StockStatus)}>
          {STOCK_STATUSES.map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
        </select>
        <button className="btn-primary" onClick={applyMass}>Применить</button>
        <div className="ml-auto">
          <button className="border border-gray-200 rounded-lg px-3 py-2 mr-2" onClick={() => togglePickAll(true)}>Выбрать всё</button>
          <button className="border border-gray-200 rounded-lg px-3 py-2" onClick={() => setPicked({})}>Снять выбор</button>
        </div>
      </div>

      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" onChange={e => togglePickAll(e.currentTarget.checked)} /></th>
              <th className="px-4 py-3 text-left">Товар</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Склад</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-left">Кол-во</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(r => (
              <tr key={r.key} className="border-t">
                <td className="px-4 py-2"><input type="checkbox" checked={!!picked[r.key]} onChange={e => setPicked(prev => ({ ...prev, [r.key]: e.currentTarget.checked }))} /></td>
                <td className="px-4 py-2"><Link href={`/product/${r.productId}`} className="underline">{r.product?.name || r.productId}</Link></td>
                <td className="px-4 py-2">{r.product?.sku || '—'}</td>
                <td className="px-4 py-2">{r.warehouseName}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${
                    r.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    r.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>{LABEL[r.status]}</span>
                </td>
                <td className="px-4 py-2">{r.qty}</td>
              </tr>
            ))}
            {shown.length === 0 && (<tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">Позиции не найдены.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
