'use client'
// src/app/seller/support/page.tsx
import { useEffect, useState } from 'react'

export default function SellerSupportListPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requesterId, setRequesterId] = useState('s-ec')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('seller_profile')
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.id) setRequesterId(String(p.id))
      }
    } catch {}
  }, [])

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/v1/support/tickets?requesterId=${encodeURIComponent(requesterId)}`)
      const j = await res.json()
      setItems(Array.isArray(j.items) ? j.items : [])
    } catch (e: any) {
      setError(e?.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [requesterId])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Мои обращения</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-2 text-left">Тема</th>
            <th className="p-2">Статус</th>
            <th className="p-2">Обновлён</th>
          </tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.subject}</td>
                <td className="p-2 text-center">{it.status}</td>
                <td className="p-2 text-center">{new Date(it.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {!items.length && !loading && <tr><td colSpan={3} className="p-3 text-gray-500">Пусто</td></tr>}
            {loading && <tr><td colSpan={3} className="p-3">Загрузка…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
