'use client'
import { useEffect, useState } from 'react'

type Thread = { id: string; subject: string; status: 'OPEN'|'CLOSED' }
type Msg = { id: string; from: 'USER'|'ADMIN'; text: string; createdAt: string }

export default function SupportPage() {
  // На MVP хардкодим userId/role – замените на реальные из auth
  const userId = 'u-demo'
  const userRole = 'BUYER'

  const [threads, setThreads] = useState<Thread[]>([])
  const [current, setCurrent] = useState<string>('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')

  async function loadThreads() {
    const r = await fetch(`/api/v1/support/threads?userId=${userId}`, { cache: 'no-store' })
    const j = await r.json()
    setThreads(Array.isArray(j) ? j : [])
  }

  async function openThread(tid: string) {
    setCurrent(tid)
    const r = await fetch(`/api/v1/support/threads/${tid}/messages`, { cache: 'no-store' })
    setMessages(await r.json())
  }

  useEffect(() => { loadThreads() }, [])

  async function createThread() {
    if (!subject.trim() || !text.trim()) return
    const r = await fetch('/api/v1/support/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userRole, subject, message: text }),
    })
    if (r.ok) {
      setSubject(''); setText('')
      await loadThreads()
    }
  }

  async function sendMessage() {
    if (!current || !text.trim()) return
    const r = await fetch(`/api/v1/support/threads/${current}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'USER', text }),
    })
    if (r.ok) {
      setText('')
      openThread(current)
    }
  }

  return (
    <div className="p-6 grid md:grid-cols-3 gap-6">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Техподдержка</h1>

        <div className="border rounded p-3 space-y-2">
          <div className="font-medium">Новый диалог</div>
          <input className="w-full border rounded px-3 py-2" placeholder="Тема" value={subject} onChange={e => setSubject(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2" placeholder="Сообщение" value={text} onChange={e => setText(e.target.value)} />
          <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={createThread}>Создать</button>
        </div>

        <div className="border rounded p-3 space-y-2">
          <div className="font-medium mb-2">Мои диалоги</div>
          {threads.map(t => (
            <button key={t.id} onClick={() => openThread(t.id)} className="block w-full text-left p-2 rounded hover:bg-gray-50 border">
              {t.subject} — {t.status === 'OPEN' ? 'открыт' : 'закрыт'}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        {!current ? (
          <div className="text-gray-500">Выберите диалог слева</div>
        ) : (
          <div className="border rounded p-3 flex flex-col h-[70vh]">
            <div className="flex-1 overflow-auto space-y-2">
              {messages.map(m => (
                <div key={m.id} className={'max-w-[80%] p-2 rounded ' + (m.from === 'USER' ? 'bg-indigo-50 ml-auto' : 'bg-gray-100')}>
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <input className="flex-1 border rounded px-3 py-2" value={text} onChange={e => setText(e.target.value)} placeholder="Напишите сообщение…" />
              <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={sendMessage}>Отправить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
