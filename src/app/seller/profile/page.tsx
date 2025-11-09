'use client'
import { useEffect, useState } from 'react'

export default function SellerProfilePage() {
  const [p, setP] = useState<any>({})
  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/v1/account/seller/profile', { cache:'no-store' })
    const j = await r.json(); setP(j.profile||{})
  })() }, [])
  async function upload(file: File) {
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload?folder=logos', { method:'POST', body: fd })
    const j = await r.json(); if(!r.ok) throw new Error(j?.error||`HTTP ${r.status}`)
    setP((s:any)=>({ ...s, logoUrl: j.url }))
  }
  async function save() {
    await fetch('/api/v1/account/seller/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p) })
  }
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Профиль продавца</h1>
      <div className="flex items-start gap-6">
        <div className="space-y-3">
          <img src={p.logoUrl || 'https://via.placeholder.com/220x140?text=Logo'} className="h-36 w-56 object-contain border rounded bg-white" />
          <input type="file" accept="image/*" onChange={e=>e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
        <div className="flex-1 space-y-3">
          <input className="input w-full" placeholder="Название" value={p.name||''} onChange={e=>setP({...p, name:e.target.value})} />
          <input className="input w-full" placeholder="ИНН" value={p.taxId||''} onChange={e=>setP({...p, taxId:e.target.value})} />
          <button className="btn btn-primary" onClick={save}>Сохранить</button>
        </div>
      </div>
    </div>
  )
}
