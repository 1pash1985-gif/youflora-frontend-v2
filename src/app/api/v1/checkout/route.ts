import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const WINDOW_MIN = Number(process.env.ORDER_CONFIRM_WINDOW_MIN || '120')

export async function POST(req: Request) {
  const buyerId = req.headers.get('x-buyer-id') || 'buyer-demo'
  const cart = await prisma.cart.findFirst({ where: { buyerId } })
  if (!cart) return NextResponse.json({ error: 'cart not found' }, { status: 404 })

  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: true } })
  if (items.length === 0) return NextResponse.json({ error: 'cart empty' }, { status: 400 })

  // группировка по продавцам
  const bySeller = new Map<string, typeof items>()
  for (const it of items) {
    const arr = bySeller.get(it.sellerId) || []
    arr.push(it as any)
    bySeller.set(it.sellerId, arr)
  }

  const confirmBy = new Date(Date.now() + WINDOW_MIN * 60 * 1000)

  const result = await prisma.$transaction(async (tx) => {
    const groupsCreated: any[] = []

    for (const [sellerId, groupItems] of bySeller) {
      const total = groupItems.reduce((s, it) => s + it.qtyBoxes * it.priceRub, 0)

      const group = await tx.orderGroup.create({
        data: {
          buyerId,
          sellerId,
          status: 'PENDING_SELLER_CONFIRMATION',
          confirmBy,
          totalRub: total,
        },
      })
      for (const it of groupItems) {
        await tx.orderItem.create({
          data: {
            orderGroupId: group.id,
            productId: it.productId,
            qtyBoxes: it.qtyBoxes,
            priceRub: it.priceRub,
          },
        })
      }
      groupsCreated.push(group)
    }
    // очистим корзину
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
    return groupsCreated
  })

  return NextResponse.json({ groups: result })
}
