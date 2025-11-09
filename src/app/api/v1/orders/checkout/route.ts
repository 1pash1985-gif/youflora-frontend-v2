import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type ItemIn = { productId: string; qtyBoxes: number }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const buyerId = body?.buyerId || (await prisma.buyer.findFirst({ where:{email:'buyer@demo.local'} }))?.id
    const items: ItemIn[] = Array.isArray(body?.items) ? body.items : []
    if (!buyerId || !items.length) return NextResponse.json({ error: 'buyerId & items required' }, { status: 400 })

    // сгруппируем по продавцу
    const products = await prisma.product.findMany({ where: { id: { in: items.map(i=>i.productId) } } })
    const bySeller = new Map<string, ItemIn[]>()
    for (const it of items) {
      const p = products.find(pp => pp.id === it.productId)
      if (!p) continue
      const arr = bySeller.get(p.sellerId) || []
      arr.push(it)
      bySeller.set(p.sellerId, arr)
    }

    const createdGroups = await prisma.$transaction(async tx => {
      const groups = []
      for (const [sellerId, groupItems] of bySeller.entries()) {
        const prods = products.filter(p => p.sellerId === sellerId)
        const totalRub = groupItems.reduce((sum, gi) => {
          const p = prods.find(pp => pp.id === gi.productId)!
          return sum + gi.qtyBoxes * p.pricePerBoxSeller
        }, 0)
        const confirmBy = new Date(Date.now() + 1000 * 60 * 120) // +120 мин
        const og = await tx.orderGroup.create({
          data: { buyerId, sellerId, totalRub, confirmBy, status: 'PENDING_SELLER_CONFIRMATION' }
        })
        for (const gi of groupItems) {
          const p = prods.find(pp => pp.id === gi.productId)!
          await tx.orderItem.create({
            data: { orderGroupId: og.id, productId: p.id, qtyBoxes: gi.qtyBoxes, priceRub: p.pricePerBoxSeller }
          })
        }
        groups.push(og)
      }
      return groups
    })

    return NextResponse.json({ ok: true, groups: createdGroups })
  } catch (e:any) {
    console.error('checkout failed:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
