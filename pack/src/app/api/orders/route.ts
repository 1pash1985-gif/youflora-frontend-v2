import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sweepExpiredOrders } from '@/lib/orders.server'

export async function GET(req: NextRequest) {
  await sweepExpiredOrders()
  const buyerId = req.nextUrl.searchParams.get('buyerId')
  const sellerId = req.nextUrl.searchParams.get('sellerId')
  const where: any = {}
  if (buyerId) where.buyerId = buyerId
  if (sellerId) where.groups = { some: { sellerId } }
  const list = await prisma.order.findMany({
    where,
    include: { groups: { include: { items: { include: { product: true } } } }, payment: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(list.map(o => ({ ...o, createdAt: o.createdAt.toISOString(), expiresAt: o.expiresAt.toISOString() })))
}
