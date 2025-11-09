'use client'
import { useState } from 'react'
type Row = { id:string; login:string; email:string; phone:string; fio:string; group:'Суперадмин'|'Админ'|'Модератор'; registered:string; lastLogin?:string }
export default function AdminUsers(){
  const [rows, setRows] = useState<Row[]>(()=>{
    if(typeof window!=='undefined'){const raw=localStorage.getItem('admin_users'); if(raw) return JSON.parse(raw)}
    return [{ id:'u1', login:'admin', email:'admin@example.com', phone:'+7 900 000-00-00', fio:'Иванов И.И.', group:'Суперадмин', registered:new Date().toLocaleDateString() }]
  })
  const [draft, setDraft] = useState<Row>({ id:'', login:'', email:'', phone:'', fio:'', group:'Модератор', registered:new Date().toLocaleDateString() })
  const save=(items:Row[])=>{ setRows(items); localStorage.setItem('admin_users', JSON.stringify(items)) }
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Пользователи</div>
      <div className="card p-4 grid md:grid-cols-6 gap-2">
        <input className="input" placeholder="Логин" value={draft.login} onChange={e=>setDraft({...draft, login:e.target.value})}/>
        <input className="input" placeholder="Email" value={draft.email} onChange={e=>setDraft({...draft, email:e.target.value})}/>
        <input className="input" placeholder="Телефон" value={draft.phone} onChange={e=>setDraft({...draft, phone:e.target.value})}/>
        <input className="input" placeholder="ФИО" value={draft.fio} onChange={e=>setDraft({...draft, fio:e.target.value})}/>
        <select className="input" value={draft.group} onChange={e=>setDraft({...draft, group:e.target.value as any})}>
          <option>Суперадмин</option><option>Админ</option><option>Модератор</option>
        </select>
        <button className="btn-primary" onClick={()=>{ if(!draft.login) return; const it={...draft, id:String(Date.now())}; save([it, ...rows]); setDraft({ id:'', login:'', email:'', phone:'', fio:'', group:'Модератор', registered:new Date().toLocaleDateString() }) }}>Добавить</button>
      </div>
      <div className="grid gap-2">
        {rows.map(r => (
          <div key={r.id} className="card p-4 flex items-center justify-between">
            <div><div className="font-medium">{r.login} — {r.group}</div><div className="text-sm text-gray-600">{r.email} · {r.phone} · {r.fio}</div></div>
            <button className="border border-gray-200 rounded-lg px-4" onClick={()=>save(rows.filter(x=>x.id!==r.id))}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
