// src/app/admin/moderation/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Item = {
  id: string
  type: 'NEW_PRODUCT' | 'EDIT_PRODUCT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  approvedAt?: string | null
  seller: { id: string; name: string }
  productId?: string | null
  name: string
  sku: string
  pricePerBoxSeller: number | null
  stemsPerBox: number | null
  cutLengthCm: number | null
  color: string
  photos: any[]
  fieldsChanged: string[]
  rejectReason?: string | null
}

const TABS = [
  { key: 'PENDING', label: 'PENDING' },
  { key: 'APPROVED', label: 'APPROVED' },
  { key: 'REJECTED', label: 'REJECTED' },
  { key: 'ALL', label: 'ALL' },
] as const
type TabKey = typeof TABS[number]['key']

export default function AdminModerationPage() {
  const [tab, setTab] = useState<TabKey>('PENDING')
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load(current: TabKey = tab) {
    try {
      setError(null)
      setItems([])
      const res = await fetch(`/api/v1/moderations?status=${current}`, { cache: 'no-store' })
      const ctype = res.headers.get('content-type') || ''
      if (!ctype.includes('application/json')) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: not JSON (check API route & path)`)
      }
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      setItems(j.items || [])
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить модерации')
    }
  }

  useEffect(() => {
    load('PENDING')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    load(tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function approve(id: string) {
    try {
      const res = await fetch(`/api/v1/moderations/${id}/approve`, { method: 'PATCH' })
      const ctype = res.headers.get('content-type') || ''
      const j = ctype.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Не удалось подтвердить')
    }
  }

  async function reject(id: string, reason: string) {
    try {
      const res = await fetch(`/api/v1/moderations/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const ctype = res.headers.get('content-type') || ''
      const j = ctype.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      setRejectId(null)
      setRejectReason('')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Не удалось отклонить модерацию')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Модерация товаров</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-3 py-1 rounded border ${tab === t.key ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="text-red-600">Ошибка: {error}</div>}

      {items.length === 0 && !error && <div className="text-gray-500">Ничего нет</div>}

      <div className="grid gap-3">
        {items.map((m) => (
          <div key={m.id} className="rounded border p-4 space-y-2 bg-white">
            <div className="flex items-center gap-3">
              <div className="text-sm px-2 py-0.5 rounded border">{m.type}</div>
              <div className="text-sm px-2 py-0.5 rounded border">{m.status}</div>
              <div className="ml-auto text-sm text-gray-500">
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="font-medium">{m.name}</div>
            <div className="text-sm text-gray-600">SKU: {m.sku || '—'}</div>

            {m.fieldsChanged?.length > 0 && (
              <div className="text-xs text-gray-500">
                Изменены поля: {m.fieldsChanged.join(', ')}
              </div>
            )}

            {m.status === 'PENDING' && (
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => approve(m.id)}>
                  Подтвердить
                </button>
                {rejectId === m.id ? (
                  <>
                    <input
                      className="input"
                      placeholder="Причина отклонения"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button className="btn btn-danger" onClick={() => reject(m.id, rejectReason)}>
                      Отклонить
                    </button>
                    <button className="btn" onClick={() => { setRejectId(null); setRejectReason('') }}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <button className="btn" onClick={() => setRejectId(m.id)}>
                    Отклонить
                  </button>
                )}
              </div>
            )}

            {m.status === 'REJECTED' && m.rejectReason && (
              <div className="text-sm text-red-600">Причина: {m.rejectReason}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
