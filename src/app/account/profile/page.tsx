'use client'
import { useEffect, useState } from 'react'

export default function BuyerProfilePage() {
  const [p, setP] = useState<any>({})
  const [err, setErr] = useState<string|null>(null)
  async function load() {
    const r = await fetch('/api/v1/account/buyer/profile', { cache:'no-store' })
    const j = await r.json()
    setP(j.profile||{})
  }
  useEffect(()=>{ load() }, [])
  async function upload(file: File, field: 'avatarUrl'|'logoUrl') {
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload?folder=avatars', { method:'POST', body: fd })
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`)
    setP((s:any)=>({ ...s, [field]: j.url }))
  }
  async function save() {
    setErr(null)
    const r = await fetch('/api/v1/account/buyer/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p) })
    const j = await r.json(); if(!r.ok) setErr(j?.error||`HTTP ${r.status}`)
  }
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Профиль покупателя</h1>
      {err && <div className="text-red-600">{err}</div>}
      <div className="flex gap-6 items-start">
        <div className="space-y-3">
          <img src={p.avatarUrl || 'https://via.placeholder.com/160x160?text=Avatar'} className="h-40 w-40 object-cover rounded-full border" />
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'avatarUrl')} />
        </div>
        <div className="flex-1 space-y-3">
          <input className="input w-full" placeholder="Имя/контакт" value={p.name||''} onChange={e=>setP({...p, name:e.target.value})}/>
          <input className="input w-full" placeholder="Компания" value={p.companyName||''} onChange={e=>setP({...p, companyName:e.target.value})}/>
          <input className="input w-full" placeholder="Телефон" value={p.phone||''} onChange={e=>setP({...p, phone:e.target.value})}/>
          <button className="btn btn-primary" onClick={save}>Сохранить</button>
        </div>
      </div>
    </div>
  )
}
