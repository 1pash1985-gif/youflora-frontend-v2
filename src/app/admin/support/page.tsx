'use client'
// src/app/admin/support/page.tsx
import { useEffect, useState } from 'react'

type Ticket = {
  id: string
  requesterId: string
  requesterRole: 'SELLER'|'ADMIN'|'MODERATOR'
  subject: string
  topic: string
  status: 'NEW'|'IN_PROGRESS'|'CLOSED'
  updatedAt: string
}

export default function AdminSupportPage() {
  const [status, setStatus] = useState<'ALL'|'NEW'|'IN_PROGRESS'|'CLOSED'>('ALL')
  const [items, setItems] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/v1/support/tickets?status=${status}`)
    const j = await res.json()
    setItems(Array.isArray(j.items) ? j.items : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [status])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Техподдержка</h1>

      <div className="flex gap-2">
        {['ALL','NEW','IN_PROGRESS','CLOSED'].map(s => (
          <button key={s}
            className={`px-3 py-1 rounded border ${status === s ? 'bg-black text-white' : 'bg-white'}`}
            onClick={() => setStatus(s as any)}
          >{s}</button>
        ))}
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-2 text-left">Тема</th>
            <th className="p-2">Заявитель</th>
            <th className="p-2">Статус</th>
            <th className="p-2">Обновлён</th>
          </tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.subject}</td>
                <td className="p-2 text-center font-mono">{it.requesterId}</td>
                <td className="p-2 text-center">{it.status}</td>
                <td className="p-2 text-center">{new Date(it.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {!items.length && !loading && <tr><td className="p-3 text-gray-500" colSpan={4}>Пусто</td></tr>}
            {loading && <tr><td className="p-3" colSpan={4}>Загрузка…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

