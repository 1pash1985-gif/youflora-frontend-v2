'use client'
import { useState } from 'react'

export default function NewTicket() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState<string|null>(null)
  const [ok, setOk] = useState<string|null>(null)

  const submit = async () => {
    setErr(null); setOk(null)
    const res = await fetch('/api/v1/support/tickets', {
      method:'POST',
      headers:{ 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: 's-ec', subject, message }) // подставьте реальный sellerId из профиля
    })
    if (!res.ok) { setErr(`HTTP ${res.status}`); return }
    setOk('Отправлено'); setSubject(''); setMessage('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Новое обращение</h1>
      <input className="w-full border rounded px-3 py-2" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Тема *"/>
      <textarea className="w-full border rounded px-3 py-2 h-40" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Сообщение *"/>
      {err && <div className="text-red-600">Не удалось отправить: {err}</div>}
      {ok && <div className="text-green-700">{ok}</div>}
      <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Отправить</button>
    </div>
  )
}
