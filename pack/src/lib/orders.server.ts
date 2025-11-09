// src/lib/orders.server.ts
import { prisma } from '@/lib/db'
import { StockStatus } from '@prisma/client'

export type SpendBySeller = Record<string, number>

export async function getConfig() {
  const cfg = await prisma.marketplaceConfig.findUnique({ where: { id: 'main' } })
  return {
    globalCommissionPercent: cfg?.globalCommissionPercent ?? 0,
    globalCashbackPercent: cfg?.globalCashbackPercent ?? 1.5,
    confirmHoldMinutes: cfg?.confirmHoldMinutes ?? 120,
  }
}

export function unitPriceWithCommission(p: {
  pricePerBoxSeller: number, sellerDiscountRub: number, seller: { commissionPercent: number | null }
}, gCommission: number) {
  const commissionPct = (p.seller.commissionPercent ?? gCommission) || 0
  const withCommission = Math.round(p.pricePerBoxSeller * (1 + commissionPct / 100))
  const afterDiscount = Math.max(0, withCommission - (p.sellerDiscountRub || 0))
  return { unitPrice: afterDiscount, commissionPct }
}

export async function previewCart(buyerId: string, spend: SpendBySeller = {}) {
  const cfg = await getConfig()
  const cart = await prisma.cart.findFirst({
    where: { buyerId },
    include: { items: { include: { product: { include: { seller: true } } } } }
  })
  if (!cart) return { items: [], groups: [], totals: { subtotal: 0, cashbackEarnedGlobal: 0, cashbackEarnedSeller: 0, payable: 0 }, cfg }

  const bySeller = new Map<string, {
    sellerId: string,
    items: { id: string, productId: string, name: string, sku: string, qty: number, unitPrice: number }[],
    subtotal: number,
    sellerCashbackEarned: number,
    commissionPct: number
  }>()

  for (const it of cart.items) {
    const { unitPrice, commissionPct } = unitPriceWithCommission(
      { pricePerBoxSeller: it.product.pricePerBoxSeller, sellerDiscountRub: it.product.sellerDiscountRub, seller: it.product.seller },
      cfg.globalCommissionPercent
    )
    const group = bySeller.get(it.product.sellerId) || { sellerId: it.product.sellerId, items: [], subtotal: 0, sellerCashbackEarned: 0, commissionPct }
    group.items.push({ id: it.id, productId: it.productId, name: it.product.name, sku: it.product.sku, qty: it.qty, unitPrice })
    group.subtotal += unitPrice * it.qty
    group.sellerCashbackEarned += (it.product.sellerCashbackRub || 0) * it.qty
    bySeller.set(it.product.sellerId, group)
  }

  const groups = Array.from(bySeller.values()).map(g => {
    const maxSpend = Math.floor(g.subtotal * 0.25)
    const applied = Math.min(maxSpend, Math.max(0, spend[g.sellerId] || 0))
    return { ...g, maxSpend, applyCashback: applied, subtotalAfterSpend: g.subtotal - applied }
  })

  const subtotal = groups.reduce((s, g) => s + g.subtotal, 0)
  const cashbackEarnedSeller = groups.reduce((s, g) => s + g.sellerCashbackEarned, 0)
  const cashbackAppliedSeller = groups.reduce((s, g) => s + g.applyCashback, 0)
  const cashbackEarnedGlobal = Math.floor(subtotal * (cfg.globalCashbackPercent / 100))
  const totalPayable = subtotal - cashbackAppliedSeller

  return { cfg, groups, totals: { subtotal, cashbackAppliedSeller, cashbackEarnedSeller, cashbackEarnedGlobal, payable: totalPayable } }
}

export async function reserveStock(productId: string, needQty: number) {
  let left = needQty
  const stocks = await prisma.stock.findMany({
    where: { productId, status: 'AVAILABLE' as StockStatus, qty: { gt: 0 } },
    orderBy: { qty: 'desc' }
  })
  for (const s of stocks) {
    const free = s.qty - s.reserved
    if (free <= 0) continue
    const take = Math.min(free, left)
    if (take > 0) {
      await prisma.stock.update({ where: { id: s.id }, data: { reserved: { increment: take } } })
      left -= take
      if (left <= 0) break
    }
  }
  if (left > 0) throw new Error('Недостаточно доступного остатка для резерва')
}

export async function releaseStock(productId: string, qty: number) {
  let left = qty
  const stocks = await prisma.stock.findMany({ where: { productId, reserved: { gt: 0 } }, orderBy: { reserved: 'desc' } })
  for (const s of stocks) {
    const give = Math.min(s.reserved, left)
    if (give > 0) {
      await prisma.stock.update({ where: { id: s.id }, data: { reserved: { decrement: give } } })
      left -= give
      if (left <= 0) break
    }
  }
}

export async function sweepExpiredOrders() {
  const now = new Date()
  const expired = await prisma.order.findMany({
    where: { status: 'PENDING_SELLER_CONFIRMATION', expiresAt: { lt: now } },
    include: { groups: { include: { items: true } }, payment: true }
  })
  for (const o of expired) {
    for (const g of o.groups) for (const it of g.items) await releaseStock(it.productId, it.qty)
    if (o.payment && o.payment.status === 'AUTHORIZED') {
      await prisma.payment.update({ where: { id: o.payment.id }, data: { status: 'CANCELED' } })
    }
    await prisma.order.update({ where: { id: o.id }, data: { status: 'CANCELLED_EXPIRED' } })
  }
}

export async function whenAllGroupsConfirmedCapture(orderId: string) {
  const o = await prisma.order.findUnique({ where: { id: orderId }, include: { groups: true, payment: true } })
  if (!o) return
  const allOk = o.groups.length > 0 && o.groups.every(g => g.status === 'CONFIRMED')
  if (allOk) {
    await prisma.order.update({ where: { id: o.id }, data: { status: 'SELLER_CONFIRMED' } })
    if (o.payment && o.payment.status === 'AUTHORIZED') {
      await prisma.payment.update({ where: { id: o.payment.id }, data: { status: 'CAPTURED', capturedAt: new Date() } })
      await prisma.order.update({ where: { id: o.id }, data: { status: 'PAID' } })
    }
  }
}
