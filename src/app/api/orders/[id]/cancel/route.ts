import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { releaseStock } from '@/lib/orders.server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { groups: { include: { items: true } }, payment: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  for (const g of order.groups) for (const it of g.items) await releaseStock(it.productId, it.qty)
  if (order.payment && order.payment.status === 'AUTHORIZED') {
    await prisma.payment.update({ where: { id: order.payment.id }, data: { status: 'CANCELED' } })
  }
  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
  return NextResponse.json({ ok: true })
}
