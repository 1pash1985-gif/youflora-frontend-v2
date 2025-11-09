'use client'
import { useEffect, useMemo, useState } from 'react'
import { getCart, updateCartItem, removeCartItem, clearCart, previewCheckout } from '@/lib/cart.db'

const buyerId = 'b-demo'

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [spend, setSpend] = useState<Record<string, number>>({})

  const refresh = async () => { setCart(await getCart(buyerId)) }
  useEffect(() => { refresh() }, [])

  const [preview, setPreview] = useState<any>(null)
  useEffect(() => { previewCheckout(buyerId, spend).then(setPreview) }, [cart, spend])

  const grouped = useMemo(() => {
    if (!cart?.items) return []
    const map = new Map<string, any[]>()
    cart.items.forEach((it: any) => {
      const s = it.product.sellerId
      const arr = map.get(s) || []
      arr.push(it); map.set(s, arr)
    })
    return Array.from(map.entries())
  }, [cart])

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Корзина</div>

      {!cart?.items?.length && <div className="card p-4 text-gray-600">Корзина пуста</div>}

      {grouped.map(([sellerId, items]) => (
        <div key={sellerId} className="card p-4 space-y-3">
          <div className="font-medium">Продавец: {sellerId}</div>
          {items.map((it:any)=>(
            <div key={it.id} className="flex items-center gap-3">
              <img src={(it.product.photos||['/images/placeholder.png'])[0]} className="w-12 h-12 object-cover rounded border"/>
              <div className="flex-1">
                <div className="font-medium">{it.product.name}</div>
                <div className="text-xs text-gray-500">SKU: {it.product.sku}</div>
              </div>
              <input type="number" className="input w-24" value={it.qty}
                     onChange={e=> updateCartItem(it.id, Number(e.target.value)).then(refresh)} />
              <button className="border border-gray-200 rounded-lg px-3 py-2"
                      onClick={()=> removeCartItem(it.id).then(refresh)}>Удалить</button>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Списать кэшбек (≤25% группы):</label>
            <input type="number" className="input w-32" value={spend[sellerId] || 0}
                   onChange={e=> setSpend(prev=>({ ...prev, [sellerId]: Number(e.target.value) }))} />
          </div>
        </div>
      ))}

      {!!cart?.items?.length && (
        <div className="card p-4 space-y-2">
          <div>Предварительный расчёт</div>
          <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(preview?.totals, null, 2)}</pre>
          <button className="border border-gray-200 rounded-lg px-3 py-2" onClick={()=> clearCart(buyerId).then(()=>{ setSpend({}); refresh() })}>Очистить корзину</button>
        </div>
      )}
    </div>
  )
}
