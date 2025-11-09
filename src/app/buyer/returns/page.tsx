'use client'
import { useState } from 'react'
type ReturnItem = { id:string; orderId:string; reason:string; description?:string; photos:string[]; status:'Создана'|'В работе'|'Ожидание решения'|'Завершена' }
export default function BuyerReturns(){
  const [list, setList] = useState<ReturnItem[]>(() => {
    if (typeof window !== 'undefined') { const raw = localStorage.getItem('buyer_returns'); if (raw) return JSON.parse(raw) }
    return []
  })
  const [orderId, setOrderId] = useState('ORD-100500')
  const [reason, setReason] = useState('Некачественный товар')
  const [desc, setDesc] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const save = (items:ReturnItem[]) => { setList(items); localStorage.setItem('buyer_returns', JSON.stringify(items)) }
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Возвраты</div>
      <div className="card p-4 grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="text-sm text-gray-600">Номер заказа</label><input className="input w-full" value={orderId} onChange={e=>setOrderId(e.target.value)} /></div>
          <div><label className="text-sm text-gray-600">Причина</label><select className="input w-full" value={reason} onChange={e=>setReason(e.target.value)}>
            <option>Некачественный товар</option><option>Недостача</option><option>Повреждение при доставке</option><option>Иное</option>
          </select></div>
        </div>
        <div><label className="text-sm text-gray-600">Описание</label><textarea className="input w-full" rows={4} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Опишите проблему и количество коробок / стеблей по рекламации" /></div>
        <div>
          <label className="text-sm text-gray-600">Фото</label>
          <input type="file" multiple onChange={e=>{ const files=e.target.files?Array.from(e.target.files):[]; const urls=files.map(f=>URL.createObjectURL(f)); setPhotos(urls) }} />
          <div className="flex gap-2 mt-2 flex-wrap">{photos.map((src,i)=>(<img key={i} src={src} className="w-24 h-24 object-cover rounded-lg border" />))}</div>
        </div>
        <div><button className="btn-primary" onClick={()=>{ const it:ReturnItem={ id:String(Date.now()), orderId, reason, description:desc, photos, status:'Создана' }; save([it, ...list]); setDesc(''); setPhotos([]) }}>Оформить возврат</button></div>
      </div>
      <div className="space-y-2">
        {list.map(r => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Заявка #{r.id}</div>
              <div className="badge bg-yellow-100 text-yellow-800">{r.status}</div>
            </div>
            <div className="text-sm text-gray-600">Заказ: {r.orderId} · Причина: {r.reason}</div>
            {r.description && <div className="text-sm mt-2">{r.description}</div>}
            {r.photos.length>0 && <div className="flex gap-2 mt-2 flex-wrap">{r.photos.map((src,i)=>(<img key={i} src={src} className="w-16 h-16 object-cover rounded" />))}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
