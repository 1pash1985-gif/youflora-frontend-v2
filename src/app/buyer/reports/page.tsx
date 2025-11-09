'use client'
import { useState } from 'react'
export default function BuyerReports(){
  const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Отчеты покупателя</div>
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <label>Период</label>
        <input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)} />
        <span>—</span>
        <input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn-primary">Сформировать</button>
      </div>
      <div className="card p-6 text-gray-600">Здесь будет таблица заказов/возвратов за период (демо).</div>
    </div>
  )
}
