'use client'
import { useState } from 'react'
import { useCommission } from '@/providers/CommissionProvider'
import { useSettings } from '@/providers/SettingsProvider'
import { categories, sellers, products } from '@/lib/mockData'
export default function CommissionAdminPage() {
  const { commission, setCommission } = useCommission()
  const { defaultConfirmTimeoutMin, defaultAutoAction, set } = useSettings()
  const [global, setGlobal] = useState(commission.globalPercent)
  const [rounding, setRounding] = useState(commission.roundingStepRub)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Комиссия и подтверждение</h1>
      <section className="card p-4">
        <div className="font-semibold mb-3">Глобальная комиссия</div>
        <div className="flex items-center gap-3">
          <input type="number" className="input w-28" value={global} onChange={e => setGlobal(Number(e.target.value))} /> <span>%</span>
          <label className="ml-6 text-sm text-gray-600">Округление</label>
          <select className="input w-32" value={rounding} onChange={e => setRounding(Number(e.target.value) as any)}>
            <option value={1}>до 1 ₽</option><option value={10}>до 10 ₽</option><option value={0.01}>до 0.01 ₽</option>
          </select>
          <button className="btn-primary ml-auto" onClick={() => setCommission(prev => ({ ...prev, globalPercent: global, roundingStepRub: rounding }))}>Сохранить</button>
        </div>
      </section>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="font-semibold mb-3">По категориям</div>
          <div className="space-y-2">
            {categories.map(c => (<Row key={c.id} label={c.name} value={commission.byCategory[c.id] ?? ''} onChange={(v) => setCommission(prev => ({ ...prev, byCategory: { ...prev.byCategory, [c.id]: v } }))} />))}
          </div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-3">По продавцам</div>
          <div className="space-y-2">
            {sellers.map(s => (<Row key={s.id} label={s.name} value={commission.bySeller[s.id] ?? ''} onChange={(v) => setCommission(prev => ({ ...prev, bySeller: { ...prev.bySeller, [s.id]: v } }))} />))}
          </div>
        </div>
      </section>
      <section className="card p-4">
        <div className="font-semibold mb-3">По товарам (SKU)</div>
        <div className="grid md:grid-cols-2 gap-2">
          {products.map(p => (<Row key={p.id} label={`${p.name} · ${p.sku}`} value={commission.byProduct[p.id] ?? ''} onChange={(v) => setCommission(prev => ({ ...prev, byProduct: { ...prev.byProduct, [p.id]: v } }))} />))}
        </div>
      </section>
      <section className="card p-4">
        <div className="font-semibold mb-3">Подтверждение заказа продавцом</div>
        <div className="flex flex-wrap items-center gap-3">
          <label>Таймер по умолчанию</label>
          <input type="number" className="input w-28" value={defaultConfirmTimeoutMin} onChange={e => set({ defaultConfirmTimeoutMin: Number(e.target.value) })} />
          <span>мин</span>
          <label className="ml-6">Действие по истечении</label>
          <select className="input w-48" value={defaultAutoAction} onChange={e => set({ defaultAutoAction: e.target.value as 'auto_cancel' | 'auto_accept' })}>
            <option value="auto_cancel">Автоотмена</option><option value="auto_accept">Автопринятие</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">Таймаут можно переопределить у конкретного продавца (атрибут продавца).</p>
      </section>
    </div>
  )
}
function Row({ label, value, onChange }: { label: string; value: number | '' ; onChange: (v: number | undefined) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">{label}</div>
      <input type="number" className="input w-28" value={value} placeholder="%" onChange={e => { const v = e.target.value; onChange(v === '' ? undefined : Number(v)) }} />
      <span>%</span>
    </div>
  )
}
