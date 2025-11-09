'use client'
import { useEffect, useState } from 'react'

type Banner = {
  id: string; title: string; imageUrl: string; linkUrl?: string|null;
  isActive: boolean; sortOrder: number
}

export default function AdminBannersPage() {
  const [list, setList] = useState<Banner[]>([])
  const [error, setError] = useState<string|null>(null)
  const [creating, setCreating] = useState(false)

  async function load() {
    setError(null)
    try {
      const res = await fetch('/api/v1/admin/banners', { cache: 'no-store' })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      setList(j.items || [])
    } catch (e:any) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  async function upload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/upload?folder=banners', { method: 'POST', body: fd })
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`)
    return j.url as string
  }

  async function addBanner(f: File, title: string, linkUrl?: string) {
    setCreating(true)
    try {
      const imageUrl = await upload(f)
      const res = await fetch('/api/v1/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, imageUrl, linkUrl, isActive: true, sortOrder: 0 })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      await load()
    } catch (e:any) { setError(e.message) } finally { setCreating(false) }
  }

  async function updateBanner(id: string, data: Partial<Banner>) {
    const res = await fetch(`/api/v1/admin/banners/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const j = await res.json()
    if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
    await load()
  }

  async function removeBanner(id: string) {
    const res = await fetch(`/api/v1/admin/banners/${id}`, { method: 'DELETE' })
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j?.error || `HTTP ${res.status}`) }
    await load()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Баннеры</h1>
      {!!error && <div className="text-red-600">Ошибка: {error}</div>}

      <div className="rounded border p-4 space-y-2">
        <h2 className="font-medium">Добавить баннер</h2>
        <BannerUpload onSubmit={addBanner} disabled={creating} />
      </div>

      <div className="rounded border p-4">
        <table className="w-full text-sm">
          <thead><tr><th>Превью</th><th>Заголовок</th><th>Ссылка</th><th>Активен</th><th /></tr></thead>
          <tbody>
          {list.map(b => (
            <tr key={b.id} className="border-t">
              <td className="p-2"><img src={b.imageUrl} alt="" className="h-16 object-cover rounded" /></td>
              <td className="p-2">{b.title}</td>
              <td className="p-2 text-xs text-blue-600">{b.linkUrl || '-'}</td>
              <td className="p-2">
                <input type="checkbox" checked={b.isActive} onChange={e => updateBanner(b.id, { isActive: e.target.checked })} />
              </td>
              <td className="p-2 text-right">
                <button className="btn btn-outline" onClick={() => removeBanner(b.id)}>Удалить</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Нет баннеров</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BannerUpload({ onSubmit, disabled }:{ onSubmit:(f:File,title:string,linkUrl?:string)=>void; disabled?:boolean }) {
  const [file, setFile] = useState<File|null>(null)
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  return (
    <div className="flex flex-col md:flex-row gap-3 items-start">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <input className="input" placeholder="Заголовок" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="input" placeholder="Ссылка (необязательно)" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} />
      <button className="btn btn-primary" disabled={!file || !title || disabled} onClick={()=> file && onSubmit(file, title, linkUrl || undefined)}>Добавить</button>
    </div>
  )
}
