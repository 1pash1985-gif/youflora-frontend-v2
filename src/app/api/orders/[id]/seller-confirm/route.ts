import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { releaseStock, whenAllGroupsConfirmedCapture } from '@/lib/orders.server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json()
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { groups: { include: { items: true } }, payment: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const group = order.groups.find(g => g.sellerId === b.sellerId)
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  if (group.status !== 'PENDING') return NextResponse.json({ ok: true })

  if (b.approve) {
    await prisma.orderGroup.update({ where: { id: group.id }, data: { status: 'CONFIRMED' } })
    await whenAllGroupsConfirmedCapture(order.id)
  } else {
    for (const it of group.items) await releaseStock(it.productId, it.qty)
    await prisma.orderGroup.update({ where: { id: group.id }, data: { status: 'REJECTED' } })
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
    if (order.payment && order.payment.status === 'AUTHORIZED') {
      await prisma.payment.update({ where: { id: order.payment.id }, data: { status: 'CANCELED' } })
    }
  }

  return NextResponse.json({ ok: true })
}
