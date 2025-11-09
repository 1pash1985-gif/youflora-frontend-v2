'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Msg = { id:string; authorKind:'ADMIN'|'SELLER'|'BUYER'; text:string; createdAt:string }
type Ticket = { id:string; subject:string; status:'NEW'|'IN_PROGRESS'|'CLOSED'; messages:Msg[] }

export default function AdminSupportTicket() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Ticket | null>(null)
  const [text, setText] = useState('')
  const [err, setErr] = useState<string|null>(null)
  const load = async () => {
    const res = await fetch(`/api/v1/admin/support/${id}`, { cache: 'no-store' })
    if (!res.ok) { setErr(`HTTP ${res.status}`); return }
    setData(await res.json())
  }
  useEffect(() => { load() }, [id])

  const send = async () => {
    setErr(null)
    const res = await fetch(`/api/v1/admin/support/${id}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    })
    if (!res.ok) { setErr(`HTTP ${res.status}`); return }
    setText(''); load()
  }

  const setStatus = async (status:'NEW'|'IN_PROGRESS'|'CLOSED') => {
    setErr(null)
    const res = await fetch(`/api/v1/admin/support/${id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status })
    })
    if (!res.ok) { setErr(`HTTP ${res.status}`); return }
    load()
  }

  if (!data) return <div>Загрузка...</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Тикет: {data.subject}</h1>
      <div className="flex gap-2">
        {(['NEW','IN_PROGRESS','CLOSED'] as const).map(s=>(
          <button key={s} onClick={()=>setStatus(s)}
            className={`px-3 py-1 rounded ${data.status===s?'bg-blue-600 text-white':'bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-2 border rounded p-3 bg-white">
        {data.messages.map(m=>(
          <div key={m.id} className="flex gap-3">
            <div className="w-24 text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
            <div className={`px-3 py-2 rounded ${m.authorKind==='ADMIN'?'bg-blue-50':'bg-gray-50'}`}>
              <div className="text-xs text-gray-500">{m.authorKind}</div>
              <div>{m.text}</div>
            </div>
          </div>
        ))}
        {data.messages.length===0 && <div className="text-gray-500">Пока нет сообщений</div>}
      </div>

      {err && <div className="text-red-600">Ошибка: {err}</div>}

      <div className="flex gap-2">
        <input
          value={text} onChange={e=>setText(e.target.value)}
          className="flex-1 border rounded px-3 py-2" placeholder="Ваш ответ" />
        <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">Отправить</button>
      </div>
    </div>
  )
}
