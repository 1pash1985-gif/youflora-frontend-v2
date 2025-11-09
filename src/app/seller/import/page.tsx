'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { loadCatalog, saveCatalog } from '@/lib/catalog'

type ImportRow = { name:string; sku:string; pricePerBoxSeller:number; stemsPerBox:number }

export default function SellerImport(){
  const sellerProfile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('seller_profile') || '{}') : {}
  const sellerId = sellerProfile?.sellerId || 's-ec'
  const [result, setResult] = useState<{added:number; updated:number; errors:number; details:string[]}>()

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
    let added=0, updated=0, errors=0
    const details:string[] = []
    const current: any[] = loadCatalog()
    const bySku = new Map(current.map(x => [x.sku, x]))
    for (const r of rows) {
      try {
        const row: ImportRow = {
          name: String(r.name || r['name'] || r['Название']).trim(),
          sku: String(r.sku || r['sku'] || r['SKU']).trim(),
          pricePerBoxSeller: Number(r.pricePerBoxSeller || r['pricePerBoxSeller'] || r['Цена'] || 0),
          stemsPerBox: Number(r.stemsPerBox || r['stemsPerBox'] || r['Стеблей_в_коробке'] || 300),
        }
        if (!row.sku || !row.name) { errors++; details.push(`Ошибка: пустые name/sku`); continue }
        if (bySku.has(row.sku)) {
          const ex = bySku.get(row.sku); Object.assign(ex, { name: row.name, pricePerBoxSeller: row.pricePerBoxSeller, sellerId, moderation:{ status:'PENDING_REVIEW', updatedAt:new Date().toISOString() } })
          updated++
        } else {
          current.unshift({ id:'imp-'+Date.now()+'-'+Math.random().toString(16).slice(2), name: row.name, sku: row.sku, pricePerBoxSeller: row.pricePerBoxSeller, sellerDiscountRub:0, sellerCashbackRub:0, sellerId, categoryId: 'c-rose', photos:[], description:'', stemsPerBox: row.stemsPerBox || 300, moderation:{ status:'PENDING_REVIEW', updatedAt:new Date().toISOString() } })
          added++
        }
      } catch (e:any) {
        errors++; details.push(`Ошибка строки: ${e?.message || e}`)
      }
    }
    saveCatalog(current)
    setResult({ added, updated, errors, details })
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Импорт товаров (Excel)</div>
      <div className="card p-4 space-y-2">
        <div className="text-sm text-gray-600">Ожидаемые колонки: <code>name</code>, <code>sku</code>, <code>pricePerBoxSeller</code>, <code>stemsPerBox</code>.</div>
        <input type="file" accept=".xlsx,.xls" onChange={e=>{ const f=e.target.files?.[0]; if(f) onFile(f) }} />
      </div>
      {result && (
        <div className="card p-4">
          <div>Импорт завершен. Добавлено: <b>{result.added}</b>, Обновлено: <b>{result.updated}</b>, Ошибок: <b>{result.errors}</b>.</div>
          {result.details.length>0 && <ul className="list-disc pl-6 mt-2">{result.details.map((d,i)=><li key={i}>{d}</li>)}</ul>}
        </div>
      )}
    </div>
  )
}
