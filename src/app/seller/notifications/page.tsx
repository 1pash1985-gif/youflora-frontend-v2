'use client'
import { getSellerNotifications, markAllSellerRead } from '@/lib/notify'
export default function SellerNotifications(){
  const profile = typeof window!=='undefined' ? JSON.parse(localStorage.getItem('seller_profile') || '{"sellerId":"s-ec"}') : { sellerId: 's-ec' }
  const sellerId = profile.sellerId || 's-ec'
  const list = typeof window!=='undefined' ? getSellerNotifications(sellerId) : []
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Уведомления</div>
        <button className="border border-gray-200 rounded-lg px-3" onClick={()=>{ markAllSellerRead(sellerId); location.reload() }}>Отметить прочитанными</button>
      </div>
      <div className="grid gap-2">
        {list.length === 0 && <div className="card p-4 text-gray-600">Пока пусто.</div>}
        {list.map(n => (
          <div key={n.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-gray-500">{new Date(n.dt).toLocaleString()}</div>
            </div>
            {n.body && <div className="text-sm mt-1">{n.body}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
