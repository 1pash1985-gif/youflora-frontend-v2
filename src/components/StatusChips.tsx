'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { StockStatus } from '@/lib/store.warehouse'

const LABEL: Record<StockStatus, string> = {
  AVAILABLE: 'В наличии',
  PREORDER: 'Под заказ',
  IN_TRANSIT: 'В пути',
}

export default function StatusChips() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [sel, setSel] = useState<StockStatus[]>([])

  useEffect(() => {
    const raw = sp.get('status'); if (!raw) { setSel([]); return }
    const map: Record<string, StockStatus> = { available: 'AVAILABLE', preorder: 'PREORDER', in_transit: 'IN_TRANSIT' }
    setSel(raw.split(',').map(s => map[s.trim().toLowerCase()]).filter(Boolean) as StockStatus[])
  }, [sp])

  const asParam = (arr: StockStatus[]) => arr.map(s => ({ AVAILABLE: 'available', PREORDER: 'preorder', IN_TRANSIT: 'in_transit' }[s])).join(',')
  const toggle = (s: StockStatus) => {
    const next = sel.includes(s) ? sel.filter(x => x !== s) : [...sel, s]
    const q = new URLSearchParams(sp.toString())
    if (next.length === 0) q.delete('status'); else q.set('status', asParam(next))
    router.push(`${pathname}?${q.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(['AVAILABLE','IN_TRANSIT','PREORDER'] as StockStatus[]).map(s => (
        <button
          key={s}
          className={`rounded-full px-3 py-1 text-sm border ${sel.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
          onClick={() => toggle(s)}
          title={`Фильтр: ${LABEL[s]}`}
        >{LABEL[s]}</button>
      ))}
    </div>
  )
}
