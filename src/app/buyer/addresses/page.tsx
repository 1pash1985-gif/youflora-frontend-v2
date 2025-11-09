'use client'
import { useState } from 'react'
type Address = { id:string; label:string; city:string; street:string; contact?:string }
export default function BuyerAddresses(){
  const [list, setList] = useState<Address[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('buyer_addresses')
      if (raw) return JSON.parse(raw)
    }
    return []
  })
  const [draft, setDraft] = useState<Address>({ id:'', label:'', city:'', street:''})
  const save = (items:Address[]) => { setList(items); localStorage.setItem('buyer_addresses', JSON.stringify(items)) }
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Адреса доставки</div>
      <div className="card p-4 grid md:grid-cols-4 gap-3">
        <input className="input" placeholder="Название (магазин/склад)" value={draft.label} onChange={e=>setDraft({...draft, label:e.target.value})}/>
        <input className="input" placeholder="Город" value={draft.city} onChange={e=>setDraft({...draft, city:e.target.value})}/>
        <input className="input" placeholder="Улица, дом" value={draft.street} onChange={e=>setDraft({...draft, street:e.target.value})}/>
        <button className="btn-primary" onClick={()=>{ if(!draft.label) return; const it={...draft, id: String(Date.now())}; save([it, ...list]); setDraft({ id:'', label:'', city:'', street:''})}}>Добавить</button>
      </div>
      <div className="grid gap-3">
        {list.map(a => (
          <div key={a.id} className="card p-4 flex items-center justify-between">
            <div><div className="font-medium">{a.label}</div><div className="text-sm text-gray-600">{a.city}, {a.street}</div></div>
            <button className="border border-gray-200 rounded-lg px-4" onClick={()=>save(list.filter(x=>x.id!==a.id))}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
