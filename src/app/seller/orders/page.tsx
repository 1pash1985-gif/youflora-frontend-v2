'use client'
import Link from 'next/link'
type OrderRow = { id:string; createdAt:string; buyer:string; status:string; sum:string }
export default function SellerOrders(){
  const profile = typeof window!=='undefined' ? JSON.parse(localStorage.getItem('seller_profile') || '{"sellerId":"s-ec"}') : { sellerId: 's-ec' }
  const sellerId = profile.sellerId || 's-ec'
  const all = typeof window!=='undefined' ? JSON.parse(localStorage.getItem('orders_master') || '[]') : []
  const rows: OrderRow[] = all.filter((o:any)=>o.sellerId===sellerId).map((o:any) => ({ id:o.id, createdAt: new Date(o.createdAt).toLocaleString(), buyer:o.buyerCompany, status: mapStatus(o.status), sum: Math.floor(o.sum).toLocaleString()+' ₽' }))
  const save = (items: any[]) => { localStorage.setItem('orders_master', JSON.stringify(items)) }
  const setStatus = (id:string, status:string) => { const next = all.map((o:any)=> o.id===id ? { ...o, status } : o); save(next); location.reload() }
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Заказы</div>
      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Номер</th><th className="px-4 py-3 text-left">Дата</th><th className="px-4 py-3 text-left">Покупатель</th><th className="px-4 py-3 text-left">Статус</th><th className="px-4 py-3 text-left">Действия</th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id} className="border-t"><td className="px-4 py-2"><Link href={`/orders/${r.id}`} className="text-ozon-blue">{r.id}</Link></td><td className="px-4 py-2">{r.createdAt}</td><td className="px-4 py-2">{r.buyer}</td><td className="px-4 py-2">{r.status}</td><td className="px-4 py-2"><div className="flex gap-2"><button className="btn-primary" onClick={()=>setStatus(r.id,'CONFIRMED_BY_SELLER')}>Подтвердить</button><button className="border border-gray-200 rounded-lg px-3" onClick={()=>setStatus(r.id,'REJECTED_BY_SELLER')}>Отклонить</button><button className="border border-gray-200 rounded-lg px-3" onClick={()=>window.alert('Сформированы документы (демо)')}>Документы</button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}
function mapStatus(s: string){ const m: any = { AWAIT_SELLER_CONFIRM: 'Ожидает подтверждения', CONFIRMED_BY_SELLER: 'Подтверждён продавцом', REJECTED_BY_SELLER: 'Отклонён продавцом', AUTO_ACCEPTED: 'Автопринят', AUTO_CANCELLED: 'Автоотменён' }; return m[s] || s }
