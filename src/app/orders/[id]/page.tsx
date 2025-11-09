'use client'
import { useEffect, useMemo, useState } from 'react'
import { products } from '@/lib/mockData'
import { useSettings } from '@/providers/SettingsProvider'
import { Countdown } from '@/components/Countdown'
import { StatusBadge } from '@/components/StatusBadge'
export default function OrderDetail() {
  const [order, setOrder] = useState<any>(null)
  const { defaultAutoAction } = useSettings()
  useEffect(() => { const id = location.pathname.split('/').pop(); const all = JSON.parse(localStorage.getItem('orders_master') || '[]'); const found = all.find((o:any)=> o.id === id) || null; setOrder(found) }, [])
  useEffect(() => { if (order && !order.confirmDeadlineAt) { const deadline = new Date(Date.now() + 120 * 60 * 1000).toISOString(); setOrder((prev:any) => ({ ...prev, confirmDeadlineAt: deadline })) } }, [order?.confirmDeadlineAt])
  const totalBoxes = useMemo(()=> order ? order.productLines.reduce((acc:number, l:any) => acc + l.boxes, 0) : 0, [order])
  if (!order) { return <div className="card p-6">Заказ не найден.</div> }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><h1 className="text-2xl font-bold">Заказ {order.id}</h1><StatusBadge status={order.status} /></div>
      {order.status === 'AWAIT_SELLER_CONFIRM' && order.confirmDeadlineAt && (<div className="card p-4 flex items-center justify-between"><div className="space-y-1"><div className="font-semibold">Ожидаем подтверждение продавца</div><div className="text-sm text-gray-600">После дедлайна будет применено авто‑действие: <b>{defaultAutoAction === 'auto_cancel' ? 'автоотмена' : 'автопринятие'}</b>.</div></div><div className="text-2xl font-bold tabular-nums"><Countdown deadlineIso={order.confirmDeadlineAt} onElapsed={() => { const all = JSON.parse(localStorage.getItem('orders_master') || '[]'); const next = all.map((o:any)=> o.id===order.id ? { ...o, status: defaultAutoAction === 'auto_cancel' ? 'AUTO_CANCELLED' : 'AUTO_ACCEPTED' } : o); localStorage.setItem('orders_master', JSON.stringify(next)); setOrder(next.find((o:any)=>o.id===order.id)) }} /></div></div>)}
      <div className="card p-4"><div className="font-medium mb-2">Состав</div><ul className="list-disc pl-5 space-y-1">{order.productLines.map((l:any) => { const p = products.find(x => x.id === l.productId)!; return <li key={l.productId}>{p.name} — {l.boxes} кор.</li> })}</ul><div className="text-sm text-gray-600 mt-3">Итого коробок: {totalBoxes}</div></div>
      <div className="card p-4 text-sm text-gray-700">
        <div>Сумма: <b>{Math.floor(order.sum).toLocaleString()} ₽</b></div>
        <div>Оплата: {order.payment?.method === 'card_online' ? 'Онлайн (предавторизация)' : order.payment?.method}</div>
        <div>Кэшбек использован: {Math.floor(order.cashbackUsed || 0)} ₽</div>
        <div>Будет начислено: продавца {Math.floor(order.cashbackAccrual?.seller || 0)} ₽, глобальный {Math.floor(order.cashbackAccrual?.global || 0)} ₽</div>
      </div>
      <div className="flex gap-2"><button className="btn-primary">Написать продавцу</button><button className="border border-gray-200 rounded-lg px-4">Отменить заказ</button></div>
    </div>
  )
}
