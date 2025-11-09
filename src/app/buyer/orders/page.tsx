'use client'
import Link from 'next/link'
import { DataTable } from '@/components/DataTable'
export default function BuyerOrders() {
  const key = 'orders_master'
  const rows = typeof window!=='undefined' ? (JSON.parse(localStorage.getItem(key) || '[]') as any[]).map(o => ({ id: o.id, date: new Date(o.createdAt).toLocaleString(), status: mapStatus(o.status), sum: Math.floor(o.sum).toLocaleString() + ' ₽' })) : []
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Мои заказы</div>
      <DataTable columns={[
        { key:'id', label:'Номер', render:(v)=> <Link className="text-ozon-blue" href={`/orders/${v}`}>{v}</Link> },
        { key:'date', label:'Дата' },
        { key:'status', label:'Статус' },
        { key:'sum', label:'Сумма' },
      ]} rows={rows} />
    </div>
  )
}
function mapStatus(s: string){ const m: any = { AWAIT_SELLER_CONFIRM: 'Ожидает подтверждения', CONFIRMED_BY_SELLER: 'Подтверждён продавцом', REJECTED_BY_SELLER: 'Отклонён продавцом', AUTO_ACCEPTED: 'Автопринят', AUTO_CANCELLED: 'Автоотменён' }; return m[s] || s }
