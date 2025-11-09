// src/components/SupportChatWidget.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

type Ticket = { id: string; subject: string | null; status: 'OPEN' | 'CLOSED'; createdAt: string }
type Message = { id: string; senderRole: 'SELLER' | 'BUYER' | 'ADMIN'; text: string; createdAt: string }

export default function SupportChatWidget({ role = 'SELLER' as 'SELLER' | 'BUYER' }) {
  const [open, setOpen] = useState(false)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const userId = useMemo(() => {
    if (typeof window === 'undefined') return 'anon'
    const key = role === 'SELLER' ? 'seller_profile' : 'buyer_profile'
    const stored = window.localStorage.getItem(key)
    if (stored) {
      try {
        const p = JSON.parse(stored)
        return p?.sellerId || p?.buyerId || 'anon'
      } catch {}
    }
    return 'anon'
  }, [role])

  useEffect(() => {
    if (!open) return
    ;(async () => {
      const t = await apiPost<Ticket>('/support/tickets', { userId, senderRole: role, subject: null })
      setTicket(t)
      const list = await apiGet<{ items: Message[] }>(`/support/messages?ticketId=${t.id}`)
      setMessages(list.items)
    })()
  }, [open, role, userId])

  useEffect(() => {
    if (!open) return
    const id = setInterval(async () => {
      if (!ticket) return
      const list = await apiGet<{ items: Message[] }>(`/support/messages?ticketId=${ticket.id}`)
      setMessages(list.items)
    }, 3000)
    return () => clearInterval(id)
  }, [open, ticket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim() || !ticket) return
    const msg = await apiPost<Message>('/support/messages', {
      ticketId: ticket.id,
      senderRole: role,
      text: text.trim(),
    })
    setMessages(m => [...m, msg])
    setText('')
  }

  return (
    <>
      <button className="fixed bottom-6 right-6 btn-primary shadow-lg" onClick={() => setOpen(true)} title="Чат с поддержкой">
        Поддержка
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 p-2 sm:p-6">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold">Техподдержка</div>
              <button className="btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="p-3 h-[50vh] overflow-y-auto space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`max-w-[80%] rounded-lg p-2 text-sm ${m.senderRole === role ? 'bg-green-100 ml-auto' : 'bg-gray-100'}`}>
                  <div className="text-[11px] text-gray-500 mb-1">{m.senderRole}</div>
                  <div>{m.text}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                className="input flex-1"
                placeholder="Ваше сообщение…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button className="btn-primary" onClick={send}>Отправить</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
