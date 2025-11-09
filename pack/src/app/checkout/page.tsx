'use client'
import { useEffect, useState } from 'react'
import { previewCheckout, placeOrder } from '@/lib/cart.db'

const buyerId = 'b-demo'

export default function CheckoutPage(){
  const [spend, setSpend] = useState<Record<string, number>>({})
  const [preview, setPreview] = useState<any>(null)
  useEffect(()=>{ previewCheckout(buyerId, spend).then(setPreview) }, [spend])

  const formPlace = async () => {
    const r = await placeOrder({ buyerId, spendBySeller: spend, deliveryMethod: 'courier', paymentMethod: 'card', address: { city: 'Москва', street: 'Тверская, 1' } })
    alert(r.ok ? `Заказ создан: ${r.orderId}\nПодтверждение до: ${new Date(r.expiresAt).toLocaleString()}` : `Ошибка: ${r.error}`)
  }

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Оформление заказа</div>

      <div className="card p-4 space-y-2">
        <div>Списания кэшбека по продавцам (руб):</div>
        <div className="grid md:grid-cols-2 gap-2">
          {(preview?.groups || []).map((g:any)=>(
            <div key={g.sellerId} className="border rounded p-2">
              <div className="font-medium">Продавец: {g.sellerId}</div>
              <div>Сумма группы: {g.subtotal.toLocaleString()} ₽</div>
              <div>Макс. списать (25%): {g.maxSpend.toLocaleString()} ₽</div>
              <input className="input w-40" type="number" value={spend[g.sellerId] || 0}
                     onChange={e=> setSpend(prev=>({ ...prev, [g.sellerId]: Number(e.target.value) }))} />
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">Глобальный кэшбек (начисление): {preview?.totals?.cashbackEarnedGlobal ?? 0} ₽</div>
        <div className="text-lg">К оплате: {preview?.totals?.payable?.toLocaleString?.() ?? '—'} ₽</div>
        <button className="btn-primary" onClick={formPlace}>Сформировать заказ (предавторизация)</button>
      </div>
    </div>
  )
}
