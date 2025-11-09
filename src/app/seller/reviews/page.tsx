'use client'
import { useState } from 'react'
type Review = { id:string; product:string; rating:number; text:string; reply?:string }
export default function SellerReviews(){
  const [rows, setRows] = useState<Review[]>(()=>{
    if(typeof window!=='undefined'){ const raw=localStorage.getItem('seller_reviews'); if(raw) return JSON.parse(raw) }
    return [{ id:'r1', product:'Роза Freedom 60см', rating:5, text:'Отличное качество!' }]
  })
  const save=(items:Review[])=>{ setRows(items); localStorage.setItem('seller_reviews', JSON.stringify(items))}
  const setReply=(id:string, reply:string)=> save(rows.map(r=> r.id===id ? {...r, reply } : r))
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Отзывы на товары</div>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.id} className="card p-4 space-y-2">
            <div className="font-medium">{r.product} — {'★'.repeat(r.rating)}</div>
            <div>{r.text}</div>
            <div className="grid md:grid-cols-[1fr_auto] gap-2">
              <input className="input" placeholder="Ответ продавца" value={r.reply ?? ''} onChange={e=>setReply(r.id, e.target.value)} />
              <button className="btn-primary" onClick={()=>alert('Ответ опубликован (демо)')}>Опубликовать</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
