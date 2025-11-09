import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { previewCart, reserveStock } from '@/lib/orders.server'

export async function POST(req: NextRequest) {
  const b = await req.json()
  const buyerId = b.buyerId || 'b-demo'
  const prev = await previewCart(buyerId, b.spendBySeller || {})

  const cart = await prisma.cart.findFirst({ where: { buyerId }, include: { items: { include: { product: { include: { seller: true } } } } } })
  if (!cart || cart.items.length === 0) return NextResponse.json({ ok: false, error: 'Корзина пуста' }, { status: 400 })

  for (const it of cart.items) await reserveStock(it.productId, it.qty)

  const expiresAt = new Date(Date.now() + prev.cfg.confirmHoldMinutes * 60 * 1000)
  const order = await prisma.order.create({
    data: {
      buyerId, status: 'PENDING_SELLER_CONFIRMATION', expiresAt,
      deliveryMethod: b.deliveryMethod || null, paymentMethod: b.paymentMethod || 'card', addressJson: b.address || null,
      subtotal: prev.totals.subtotal, cashbackGlobalApplied: 0,
      cashbackSellerApplied: prev.totals.cashbackAppliedSeller, cashbackEarnedGlobal: prev.totals.cashbackEarnedGlobal, cashbackEarnedSeller: prev.totals.cashbackEarnedSeller,
    }
  })

  for (const g of prev.groups) {
    const og = await prisma.orderGroup.create({
      data: { orderId: order.id, sellerId: g.sellerId, status: 'PENDING', subtotal: g.subtotal, commissionPct: g.commissionPct, cashbackApplied: g.applyCashback, cashbackEarned: g.sellerCashbackEarned }
    })
    for (const it of g.items) {
      await prisma.orderItem.create({
        data: { groupId: og.id, productId: it.productId, qty: it.qty, stemsPerBox: null, pricePerBoxSeller: 0, discountRub: 0, commissionPct: g.commissionPct, unitPrice: it.unitPrice }
      })
    }
  }

  await prisma.payment.create({ data: { orderId: order.id, amount: prev.totals.payable, status: 'AUTHORIZED', provider: 'mock' } })
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  return NextResponse.json({ ok: true, orderId: order.id, expiresAt })
}
