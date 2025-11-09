'use client'
import { useState } from 'react'
type Row = { id:string; login:string; email:string; phone:string; fio:string; inn:string; sellerId:string; registered:string; lastLogin?:string }
export default function AdminSellers(){
  const [rows, setRows] = useState<Row[]>(()=>{
    if(typeof window!=='undefined'){const raw=localStorage.getItem('admin_sellers'); if(raw) return JSON.parse(raw)}
    return [{ id:'s1', login:'seller1', email:'seller@youflora', phone:'+7 900 000-00-01', fio:'Поставщик А', inn:'7700000000', sellerId:'SEL-001', registered:new Date().toLocaleDateString() }]
  })
  const [draft, setDraft] = useState<Row>({ id:'', login:'', email:'', phone:'', fio:'', inn:'', sellerId:'', registered:new Date().toLocaleDateString() })
  const save=(items:Row[])=>{ setRows(items); localStorage.setItem('admin_sellers', JSON.stringify(items)) }
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Продавцы</div>
      <div className="card p-4 grid md:grid-cols-7 gap-2">
        <input className="input" placeholder="Логин" value={draft.login} onChange={e=>setDraft({...draft, login:e.target.value})}/>
        <input className="input" placeholder="Email" value={draft.email} onChange={e=>setDraft({...draft, email:e.target.value})}/>
        <input className="input" placeholder="Телефон" value={draft.phone} onChange={e=>setDraft({...draft, phone:e.target.value})}/>
        <input className="input" placeholder="ФИО" value={draft.fio} onChange={e=>setDraft({...draft, fio:e.target.value})}/>
        <input className="input" placeholder="ИНН" value={draft.inn} onChange={e=>setDraft({...draft, inn:e.target.value})}/>
        <input className="input" placeholder="ID продавца" value={draft.sellerId} onChange={e=>setDraft({...draft, sellerId:e.target.value})}/>
        <button className="btn-primary" onClick={()=>{ if(!draft.login) return; const it={...draft, id:String(Date.now())}; save([it, ...rows]); setDraft({ id:'', login:'', email:'', phone:'', fio:'', inn:'', sellerId:'', registered:new Date().toLocaleDateString() }) }}>Добавить</button>
      </div>
      <div className="grid gap-2">
        {rows.map(r => (
          <div key={r.id} className="card p-4 flex items-center justify-between">
            <div><div className="font-medium">{r.login} — {r.sellerId}</div><div className="text-sm text-gray-600">{r.email} · {r.phone} · {r.fio} · ИНН {r.inn}</div></div>
            <button className="border border-gray-200 rounded-lg px-4" onClick={()=>save(rows.filter(x=>x.id!==r.id))}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
