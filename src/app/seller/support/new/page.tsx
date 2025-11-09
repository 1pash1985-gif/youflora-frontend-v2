'use client'
// src/app/seller/support/new/page.tsx
import { useEffect, useState } from 'react'

export default function SellerSupportNewPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [requesterId, setRequesterId] = useState('s-ec') // дефолт из сидера

  useEffect(() => {
    try {
      const raw = localStorage.getItem('seller_profile')
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.id) setRequesterId(String(p.id))
      }
    } catch {}
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setOk(false)
    try {
      const res = await fetch('/api/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId,
          requesterRole: 'SELLER',
          subject,
          message,
          topic: subject || 'GENERAL',
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      setOk(true); setSubject(''); setMessage('')
    } catch (err: any) {
      setError(err?.message || 'Не удалось отправить')
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Обращение в поддержку</h1>

      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 text-sm text-gray-500">
          Отправитель (продавец): <span className="font-mono">{requesterId}</span>
        </div>

        <form onSubmit={submit} className="max-w-3xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Тема</label>
            <input className="w-full rounded border px-3 py-2"
                   value={subject} onChange={(e) => setSubject(e.target.value)}
                   placeholder="Коротко: в чём вопрос?" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Сообщение</label>
            <textarea className="h-48 w-full rounded border px-3 py-2"
                      value={message} onChange={(e) => setMessage(e.target.value)}
                      placeholder="Опишите проблему подробнее…" />
          </div>

          <button type="submit" className="btn btn-primary">Отправить</button>
          {ok && <div className="mt-3 text-green-600">Обращение создано</div>}
          {error && <div className="mt-3 text-red-600">Не удалось отправить: {error}</div>}
        </form>
      </div>
    </div>
  )
}
